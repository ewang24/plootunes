import fs from 'fs'
import path from 'path'
import { parseFile } from 'music-metadata'
import type { AppDaos } from '../daoFactory.ts'
import type { UserLibrarySourceRow } from '../dao/userLibrarySourceDao.ts'
import type { SongCatalogRow, MissingSongRow } from '../dao/songDao.ts'
import type { IScanService } from './scanService.ts'
import type { HardRemoveOutcome } from '@ploot/plootunes-shared'

// Strip trailing slashes so '/lib/' and '/lib' are treated as the same subscription.
function normalizeFolderPath(p: string): string {
  return p.replace(/\/+$/, '')
}

// Separator-aware overlap check — a === b, a is a parent of b, or b is a parent of a.
// The '+ /' boundary means '/lib' is NOT a parent of '/library' (same family as the
// T4 SQL helper pathInUserLibrary in dao/libraryMembership.ts).
function foldersOverlap(a: string, b: string): boolean {
  return a === b || a.startsWith(b + '/') || b.startsWith(a + '/')
}

// Strips path separators and control characters out of a tag-derived value before
// it's used as a directory/file name component, so a malicious or malformed tag
// can't escape the upload root or break the filesystem.
function sanitizeComponent(value: string): string {
  return value
    .replace(/[/\\]/g, '')
    .split('')
    .filter((ch) => ch.charCodeAt(0) > 31)
    .join('')
    .replace(/^\.+/, '')
}

function uploadDir(): string {
  return process.env.LIBRARY_UPLOAD_DIR ?? path.join(process.env.MEDIA_ROOT ?? process.cwd(), 'uploads')
}

async function unlinkIfExists(p: string): Promise<void> {
  try {
    await fs.promises.unlink(p)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
}

export class SubscriptionOverlapError extends Error {}

export class SongNotFoundError extends Error {}

export class SongNotRecoverableError extends Error {}

export class RelinkFileNotFoundError extends Error {}

export interface ILibraryService {
  listSubscriptions(userId: string): Promise<UserLibrarySourceRow[]>
  subscribe(userId: string, folderPath: string): Promise<UserLibrarySourceRow>
  unsubscribe(userId: string, id: string): Promise<boolean>
  ingestUpload(tempPath: string, originalName: string): Promise<SongCatalogRow>
  listMissing(): Promise<MissingSongRow[]>
  relink(songId: string, newPath: string): Promise<SongCatalogRow>
  hardRemove(songId: string): Promise<HardRemoveOutcome>
}

export class LibraryService implements ILibraryService {
  constructor(
    private readonly daos: AppDaos,
    private readonly scanService: IScanService,
  ) {}

  async listSubscriptions(userId: string): Promise<UserLibrarySourceRow[]> {
    return this.daos.userLibrarySourceDao.findByUserId(userId)
  }

  async subscribe(userId: string, folderPath: string): Promise<UserLibrarySourceRow> {
    const normalized = normalizeFolderPath(folderPath)
    const existing = await this.daos.userLibrarySourceDao.findByUserId(userId)
    if (existing.some((row) => foldersOverlap(normalized, row.folderPath))) {
      throw new SubscriptionOverlapError(
        `Folder "${normalized}" overlaps with an existing subscription`,
      )
    }
    return this.daos.userLibrarySourceDao.create(userId, normalized)
  }

  async unsubscribe(userId: string, id: string): Promise<boolean> {
    return this.daos.userLibrarySourceDao.delete(userId, id)
  }

  // Streams an uploaded file (already on disk in a temp location, courtesy of
  // multer's disk storage — never buffered in memory) into its tag-derived home
  // under LIBRARY_UPLOAD_DIR, then hands it to the shared ingest core.
  async ingestUpload(tempPath: string, originalName: string): Promise<SongCatalogRow> {
    try {
      const ext = path.extname(originalName)
      const metadata = await parseFile(tempPath, { duration: true })
      const common = metadata.common

      const artistName = sanitizeComponent(common.artist || 'Unknown Artist')
      const albumName = sanitizeComponent(common.album || 'Unknown Album')
      const titleName = sanitizeComponent(
        common.title || path.basename(originalName, path.extname(originalName)),
      )
      const trackPrefix = common.track?.no != null ? `${String(common.track.no).padStart(2, '0')} - ` : ''

      const destDir = path.join(uploadDir(), artistName, albumName)
      await fs.promises.mkdir(destDir, { recursive: true })

      const destPath = await this.resolveCollision(destDir, `${trackPrefix}${titleName}${ext}`)

      await this.moveFile(tempPath, destPath)

      const { songId } = await this.scanService.ingestFile(destPath)
      return (await this.daos.songDao.findByIds([songId]))[0]
    } finally {
      await unlinkIfExists(tempPath)
    }
  }

  // Appends " (n)" before the extension until a non-colliding filename is found.
  private async resolveCollision(destDir: string, filename: string): Promise<string> {
    const ext = path.extname(filename)
    const base = filename.slice(0, filename.length - ext.length)

    let candidate = filename
    let n = 1
    while (
      await fs.promises
        .access(path.join(destDir, candidate))
        .then(() => true)
        .catch(() => false)
    ) {
      candidate = `${base} (${n})${ext}`
      n += 1
    }
    return path.join(destDir, candidate)
  }

  // rename() is O(1) on the same filesystem; EXDEV (crossing a filesystem boundary)
  // falls back to a streamed copy + unlink so a differently-mounted upload dir still works.
  private async moveFile(from: string, to: string): Promise<void> {
    try {
      await fs.promises.rename(from, to)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'EXDEV') throw err
      await fs.promises.copyFile(from, to)
      await fs.promises.unlink(from)
    }
  }

  async listMissing(): Promise<MissingSongRow[]> {
    return this.daos.songDao.findMissing()
  }

  async relink(songId: string, newPath: string): Promise<SongCatalogRow> {
    const existing = await this.daos.songDao.findById(songId)
    if (!existing) throw new SongNotFoundError(`Song ${songId} not found`)
    if (!existing.missing || existing.removed) {
      throw new SongNotRecoverableError(`Song ${songId} is not a recoverable missing row`)
    }

    try {
      await fs.promises.stat(newPath)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new RelinkFileNotFoundError(`No file found at ${newPath}`)
      }
      throw err
    }

    await this.scanService.relinkSong(songId, newPath)
    return (await this.daos.songDao.findByIds([songId]))[0]
  }

  async hardRemove(songId: string): Promise<HardRemoveOutcome> {
    const existing = await this.daos.songDao.findById(songId)
    if (!existing) throw new SongNotFoundError(`Song ${songId} not found`)
    if (!existing.missing || existing.removed) {
      throw new SongNotRecoverableError(`Song ${songId} is not a recoverable missing row`)
    }

    if (await this.daos.playEventDao.hasHistoryForSong(songId)) {
      await this.daos.songDao.markRemoved(songId)
      return 'tombstoned'
    }
    await this.daos.songDao.deleteById(songId)
    return 'deleted'
  }
}
