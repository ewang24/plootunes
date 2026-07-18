import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import pLimit from 'p-limit'
import sharp from 'sharp'
import { parseFile } from 'music-metadata'
import type { AppDaos } from '../daoFactory.ts'
import type { ScanRunRow } from '../dao/scanRunDao.ts'
import { EnvCoverStorageConfigProvider } from './coverStorageService.ts'

const SUPPORTED_EXTENSIONS = new Set(['mp3', 'm4a', 'wav', 'flac'])
// Bounds concurrent per-file work (hashing, tag parsing, cover writes) during a walk.
const SCAN_CONCURRENCY = 16
const THUMB_SIZE_PX = 256

const PICTURE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff',
  'image/webp': 'webp',
}

export class ScanAlreadyRunningError extends Error {
  constructor() {
    super('A library scan is already running')
    this.name = 'ScanAlreadyRunningError'
  }
}

export type IngestClassification = 'new' | 'moved' | 'updated'

export interface IngestResult {
  songId: string
  classification: IngestClassification
}

function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505'
}

export interface IScanService {
  ingestFile(absPath: string): Promise<IngestResult>
  triggerScan(): Promise<ScanRunRow>
  runScan(): Promise<ScanRunRow>
}

export class ScanService implements IScanService {
  // Constructed once; getConfig() still reads env per call, so covers-dir overrides
  // (e.g. tests) are honored without rebuilding the provider on every cover write.
  private readonly coverConfig = new EnvCoverStorageConfigProvider()

  constructor(private readonly daos: AppDaos) {}

  // Reusable ingest core for a single file already known to exist on disk — the
  // library walk and the upload path (T8) both funnel through this.
  async ingestFile(absPath: string): Promise<IngestResult> {
    const nfcPath = absPath.normalize('NFC')
    const [contentHash, stat, metadata] = await Promise.all([
      hashFile(nfcPath),
      fs.promises.stat(nfcPath),
      parseFile(nfcPath, { duration: true }),
    ])
    const mtime = Math.floor(stat.mtimeMs)
    const common = metadata.common

    const artistId = common.artist ? (await this.daos.artistDao.upsertByName(common.artist)).id : null

    let albumId: string | null = null
    if (common.album) {
      const isCompilation = common.albumartist === 'Various Artists' || !!common.compilation
      const albumArtistName = isCompilation ? null : (common.albumartist ?? common.artist ?? null)
      const albumArtistId = albumArtistName
        ? (await this.daos.artistDao.upsertByName(albumArtistName)).id
        : null
      const albumRow = await this.daos.albumDao.upsertByNameAndArtist(common.album, albumArtistId, {
        isCompilation,
        year: common.year ?? null,
      })
      albumId = albumRow.id
      if (!albumRow.coverImage && common.picture?.[0]) {
        await this.writeCover(albumId, common.picture[0])
      }
    }

    const fields = {
      name: common.title ?? null,
      trackNumber: common.track?.no ?? null,
      discNumber: common.disk?.no ?? null,
      durationMs: metadata.format.duration != null ? Math.round(metadata.format.duration * 1000) : null,
      artistId,
      albumId,
      contentHash,
      mtime,
      path: nfcPath,
    }

    let songId: string
    let classification: IngestClassification
    const existing = await this.daos.songDao.findByPath(nfcPath)
    if (existing) {
      await this.daos.songDao.updateIngest(existing.id, fields)
      songId = existing.id
      classification = 'updated'
    } else {
      const relinked = await this.daos.songDao.relinkByContentHash(contentHash, fields)
      if (relinked) {
        songId = relinked.id
        classification = 'moved'
      } else {
        const created = await this.daos.songDao.create(fields)
        songId = created.id
        classification = 'new'
      }
    }

    const genreIds = await Promise.all((common.genre ?? []).map((name) => this.daos.genreDao.upsertByName(name)))
    await this.daos.songGenreDao.setForSong(
      songId,
      genreIds.map((g) => g.id),
    )

    return { songId, classification }
  }

  // One cover per album, written the first time we see an album row without one.
  // Two concurrent new-album ingests racing to write the first cover is a rare,
  // acceptable overwrite — not worth serializing the whole scan to prevent it.
  private async writeCover(albumId: string, picture: { format: string; data: Uint8Array }): Promise<void> {
    const coversDir = this.coverConfig.getConfig().coversDir
    await fs.promises.mkdir(coversDir, { recursive: true })

    const ext = PICTURE_MIME_TO_EXT[picture.format] ?? 'jpg'
    const uuid = crypto.randomUUID()
    const filename = `${uuid}.${ext}`
    const thumbFilename = `${uuid}_thumb.webp`
    const data = Buffer.from(picture.data)

    await fs.promises.writeFile(path.join(coversDir, filename), data)
    await sharp(data)
      .resize(THUMB_SIZE_PX, THUMB_SIZE_PX, { fit: 'inside' })
      .webp()
      .toFile(path.join(coversDir, thumbFilename))

    await this.daos.albumDao.setCoverImage(albumId, filename)
  }

  // The awaitable engine — walks MEDIA_ROOT, reconciles the catalog, and finishes
  // the scan_run row. triggerScan/runScan both go through this after claiming a run.
  private async performScan(scanRunId: string): Promise<ScanRunRow> {
    const startedAtMs = Date.now()
    let newCount = 0
    let movedCount = 0
    let missingCount = 0
    let totalScanned = 0

    try {
      const mediaRoot = process.env.MEDIA_ROOT
      if (!mediaRoot) throw new Error('MEDIA_ROOT is not set')

      const catalogByPath = new Map<string, { id: string; mtime: number; missing: boolean }>()
      for (const row of await this.daos.songDao.findReconcileState()) {
        catalogByPath.set(row.path, row)
      }

      const files = await walkSupportedFiles(mediaRoot)
      const walkedPaths = new Set(files.map((f) => f.normalize('NFC')))

      // Mark missing *before* ingesting, not after: relinkByContentHash (used below to
      // relink a moved file) only matches rows already flagged missing, so a renamed
      // file must see its old-path row flip to missing within this same pass.
      const missingIds = [...catalogByPath.entries()]
        .filter(([path, row]) => !row.missing && !walkedPaths.has(path))
        .map(([, row]) => row.id)
      await this.daos.songDao.markMissing(missingIds)
      // A renamed file relinks to (and un-misses) exactly one row from missingIds
      // within this same scan — track those so the reported missingCount reflects
      // the net-new missing songs, not the transient pre-relink sweep count.
      const missingIdsThisSweep = new Set(missingIds)
      let relinkedFromThisSweep = 0

      const limit = pLimit(SCAN_CONCURRENCY)
      await Promise.all(
        files.map((filePath) =>
          limit(async () => {
            const nfcPath = filePath.normalize('NFC')
            const stat = await fs.promises.stat(nfcPath)
            const mtime = Math.floor(stat.mtimeMs)
            const catalogRow = catalogByPath.get(nfcPath)

            totalScanned += 1

            if (catalogRow && !catalogRow.missing && catalogRow.mtime === mtime) {
              return
            }

            const { songId, classification } = await this.ingestFile(nfcPath)
            if (classification === 'moved' && missingIdsThisSweep.has(songId)) relinkedFromThisSweep += 1
            if (classification === 'new') newCount += 1
            if (classification === 'moved') movedCount += 1
          }),
        ),
      )
      missingCount = missingIds.length - relinkedFromThisSweep

      const finished = await this.daos.scanRunDao.finish(scanRunId, {
        status: 'complete',
        newCount,
        movedCount,
        missingCount,
        totalScanned,
      })
      console.log(`Library scan ${scanRunId} completed in ${Date.now() - startedAtMs}ms`)
      return finished
    } catch (err) {
      const finished = await this.daos.scanRunDao.finish(scanRunId, {
        status: 'failed',
        newCount,
        movedCount,
        missingCount,
        totalScanned,
      })
      console.error(`Library scan ${scanRunId} failed`, err)
      return finished
    }
  }

  private async claimRun(): Promise<ScanRunRow> {
    try {
      return await this.daos.scanRunDao.create()
    } catch (err) {
      if (isUniqueViolation(err)) throw new ScanAlreadyRunningError()
      throw err
    }
  }

  async triggerScan(): Promise<ScanRunRow> {
    const run = await this.claimRun()
    void this.performScan(run.id).catch((err) => console.error(`Library scan ${run.id} failed`, err))
    return run
  }

  async runScan(): Promise<ScanRunRow> {
    const run = await this.claimRun()
    return this.performScan(run.id)
  }
}

async function hashFile(absPath: string): Promise<string> {
  const hash = crypto.createHash('sha256')
  const stream = fs.createReadStream(absPath)
  for await (const chunk of stream) hash.update(chunk as Buffer)
  return hash.digest('hex')
}

async function walkSupportedFiles(dir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walkSupportedFiles(entryPath)))
    } else {
      const ext = path.extname(entry.name).slice(1).toLowerCase()
      if (SUPPORTED_EXTENSIONS.has(ext)) files.push(entryPath)
    }
  }
  return files
}
