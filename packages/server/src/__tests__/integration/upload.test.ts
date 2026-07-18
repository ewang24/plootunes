// Service-level coverage for LibraryService.ingestUpload() — a streamed upload
// (temp file already on disk, as multer's disk storage would leave it) landing at
// its tag-derived destination under LIBRARY_UPLOAD_DIR and flowing through the
// shared ScanService ingest core.
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, inject } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { eq } from 'drizzle-orm'
import NodeID3 from 'node-id3'
import { createTestDb, teardownTestDb, resetDb, seedUser, type TestDb } from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { ScanService } from '../../services/scanService.ts'
import { LibraryService } from '../../services/libraryService.ts'
import { song, songGenre, genre, album } from '../../db/schema.ts'

const FIXTURES_DIR = path.resolve(import.meta.dirname, 'fixtures/library')

let ctx: TestDb
let libraryService: LibraryService
let uploadDir: string
let coversDir: string
let sourceDir: string
let originalUploadDir: string | undefined
let originalCoversDir: string | undefined

beforeAll(async () => {
  originalUploadDir = process.env.LIBRARY_UPLOAD_DIR
  originalCoversDir = process.env.COVERS_DIR

  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  const daos = createDaosFromDb(ctx.db)
  libraryService = new LibraryService(daos, new ScanService(daos))
})

afterAll(async () => {
  await teardownTestDb(ctx)
  if (originalUploadDir === undefined) delete process.env.LIBRARY_UPLOAD_DIR
  else process.env.LIBRARY_UPLOAD_DIR = originalUploadDir
  if (originalCoversDir === undefined) delete process.env.COVERS_DIR
  else process.env.COVERS_DIR = originalCoversDir
})

beforeEach(async () => {
  await resetDb(ctx.db)
  await seedUser(ctx.db)

  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-upload-dest-'))
  coversDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-upload-covers-'))
  sourceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-upload-source-'))
  process.env.LIBRARY_UPLOAD_DIR = uploadDir
  process.env.COVERS_DIR = coversDir
})

afterEach(() => {
  fs.rmSync(uploadDir, { recursive: true, force: true })
  fs.rmSync(coversDir, { recursive: true, force: true })
  fs.rmSync(sourceDir, { recursive: true, force: true })
})

// Simulates multer's disk storage having already streamed the upload to a temp
// path before the service is invoked.
function stageTempUpload(fixture: string, tempName = fixture): string {
  const tempPath = path.join(sourceDir, tempName)
  fs.copyFileSync(path.join(FIXTURES_DIR, fixture), tempPath)
  return tempPath
}

describe('ingestUpload', () => {
  it('lands a tagged upload at Artist/Album/NN - Title.ext and creates a correct row', async () => {
    const tempPath = stageTempUpload('cover.mp3')

    const row = await libraryService.ingestUpload(tempPath, 'cover.mp3')

    const expectedPath = path.join(uploadDir, 'Fixture Artist F', 'Fixture Album F', '01 - Cover Track.mp3')
    expect(row.path).toBe(expectedPath.normalize('NFC'))
    expect(fs.existsSync(expectedPath)).toBe(true)
    expect(fs.existsSync(tempPath)).toBe(false)

    expect(row.name).toBe('Cover Track')
    expect(row.trackNumber).toBe(1)
    expect(row.artistName).toBe('Fixture Artist F')
    expect(row.albumName).toBe('Fixture Album F')

    const [albumRow] = await ctx.db.select().from(album).where(eq(album.id, row.albumId!))
    expect(albumRow.coverImage).toMatch(/^[0-9a-f-]{36}\.jpg$/)
  })

  it('captures the tagged genre array as song_genre rows', async () => {
    const tempPath = stageTempUpload('multigenre.mp3')

    const row = await libraryService.ingestUpload(tempPath, 'multigenre.mp3')

    const links = await ctx.db.select().from(songGenre).where(eq(songGenre.songId, row.id))
    const genreNames = new Set<string>()
    for (const link of links) {
      const [g] = await ctx.db.select().from(genre).where(eq(genre.id, link.genreId))
      genreNames.add(g.name)
    }
    expect(genreNames).toEqual(new Set(['Rock', 'Metal', 'Prog']))
  })

  it('falls back to Unknown Artist/Unknown Album for an untagged upload', async () => {
    const tempPath = stageTempUpload('untagged.mp3')

    const row = await libraryService.ingestUpload(tempPath, 'untagged.mp3')

    expect(row.artistId).toBeNull()
    expect(row.albumId).toBeNull()
    expect(row.path).toBe(path.join(uploadDir, 'Unknown Artist', 'Unknown Album', 'untagged.mp3').normalize('NFC'))
  })

  it('resolves a filename collision by appending " (n)" before the extension', async () => {
    const first = stageTempUpload('cover.mp3', 'cover-1.mp3')
    await libraryService.ingestUpload(first, 'cover.mp3')

    const second = stageTempUpload('cover.mp3', 'cover-2.mp3')
    const row = await libraryService.ingestUpload(second, 'cover.mp3')

    const expectedPath = path.join(
      uploadDir,
      'Fixture Artist F',
      'Fixture Album F',
      '01 - Cover Track (1).mp3',
    )
    expect(row.path).toBe(expectedPath.normalize('NFC'))

    const rows = await ctx.db.select().from(song)
    expect(rows).toHaveLength(2)
  })

  it('neutralizes hostile tags (embedded slashes, leading dots) into a safe path under LIBRARY_UPLOAD_DIR', async () => {
    const tempPath = stageTempUpload('untagged.mp3', 'hostile.mp3')
    const result = NodeID3.update(
      {
        artist: '../../etc/passwd',
        album: '..\\..\\Windows\\System32',
        title: '.hidden/../escape',
      },
      tempPath,
    )
    expect(result).toBe(true)

    const row = await libraryService.ingestUpload(tempPath, 'hostile.mp3')

    const resolvedUploadDir = fs.realpathSync(uploadDir)
    const resolvedSongPath = path.resolve(row.path)
    // The real security property: the resolved destination never escapes
    // LIBRARY_UPLOAD_DIR, and no path segment is a bare traversal segment (a
    // literal ".." *inside* a filename, e.g. from "hidden/../escape", is inert —
    // it's only dangerous as its own path segment).
    expect(resolvedSongPath.startsWith(resolvedUploadDir + path.sep)).toBe(true)
    expect(row.path.split(path.sep)).not.toContain('..')
    expect(row.path.split(path.sep).some((segment) => segment.startsWith('.'))).toBe(false)
    expect(fs.existsSync(row.path)).toBe(true)
  })
})
