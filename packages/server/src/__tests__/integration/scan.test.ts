// Engine-layer coverage for ScanService.runScan() — drives the real reconcile walk
// (hash + tag parse + DAO upserts) over the testcontainers Postgres, reading and
// mutating real fixture files on disk so move/delete scenarios can be exercised.
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, inject } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { eq } from 'drizzle-orm'
import { createTestDb, teardownTestDb, resetDb, seedUser, SEED_USER_ID, type TestDb } from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { ScanService, ScanAlreadyRunningError } from '../../services/scanService.ts'
import { artist, album, song, genre, songGenre, playEvent, scanRun } from '../../db/schema.ts'

const FIXTURES_DIR = path.resolve(import.meta.dirname, 'fixtures/library')

let ctx: TestDb
let scanService: ScanService
let mediaRoot: string
let coversDir: string
let originalMediaRoot: string | undefined
let originalCoversDir: string | undefined

beforeAll(async () => {
  originalMediaRoot = process.env.MEDIA_ROOT
  originalCoversDir = process.env.COVERS_DIR

  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  scanService = new ScanService(createDaosFromDb(ctx.db))
})

afterAll(async () => {
  await teardownTestDb(ctx)
  if (originalMediaRoot === undefined) delete process.env.MEDIA_ROOT
  else process.env.MEDIA_ROOT = originalMediaRoot
  if (originalCoversDir === undefined) delete process.env.COVERS_DIR
  else process.env.COVERS_DIR = originalCoversDir
})

beforeEach(async () => {
  await resetDb(ctx.db)
  await seedUser(ctx.db)

  mediaRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-scan-media-'))
  coversDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-scan-covers-'))
  process.env.MEDIA_ROOT = mediaRoot
  process.env.COVERS_DIR = coversDir
})

afterEach(() => {
  fs.rmSync(mediaRoot, { recursive: true, force: true })
  fs.rmSync(coversDir, { recursive: true, force: true })
})

function seedMediaFiles(filenames: string[]): void {
  for (const filename of filenames) {
    fs.copyFileSync(path.join(FIXTURES_DIR, filename), path.join(mediaRoot, filename))
  }
}

describe('full scan', () => {
  it('populates artist/album/song with correct tags, duration, hash, mtime', async () => {
    seedMediaFiles(['basic1.mp3'])
    const run = await scanService.runScan()
    expect(run.status).toBe('complete')
    expect(run.newCount).toBe(1)
    expect(run.totalScanned).toBe(1)

    const [row] = await ctx.db.select().from(song)
    expect(row.name).toBe('Basic One')
    expect(row.trackNumber).toBe(1)
    expect(row.contentHash).toMatch(/^[0-9a-f]{64}$/)
    expect(row.durationMs).toBeGreaterThan(0)
    expect(row.mtime).toBeGreaterThan(0)
    expect(row.path).toBe(path.join(mediaRoot, 'basic1.mp3').normalize('NFC'))

    const [artistRow] = await ctx.db.select().from(artist)
    expect(artistRow.name).toBe('Fixture Artist A')
    expect(row.artistId).toBe(artistRow.id)

    const [albumRow] = await ctx.db.select().from(album)
    expect(albumRow.name).toBe('Fixture Album A')
    expect(row.albumId).toBe(albumRow.id)
  })

  it('captures the full genre array as multiple song_genre rows', async () => {
    seedMediaFiles(['multigenre.mp3'])
    await scanService.runScan()

    const [row] = await ctx.db.select().from(song)
    const links = await ctx.db.select().from(songGenre).where(eq(songGenre.songId, row.id))
    expect(links).toHaveLength(3)

    const genreNames = new Set<string>()
    for (const link of links) {
      const [g] = await ctx.db.select().from(genre).where(eq(genre.id, link.genreId))
      genreNames.add(g.name)
    }
    expect(genreNames).toEqual(new Set(['Rock', 'Metal', 'Prog']))
  })

  it('leaves an untagged file with null artist/album and zero genres', async () => {
    seedMediaFiles(['untagged.mp3'])
    await scanService.runScan()

    const [row] = await ctx.db.select().from(song)
    expect(row.artistId).toBeNull()
    expect(row.albumId).toBeNull()

    const links = await ctx.db.select().from(songGenre).where(eq(songGenre.songId, row.id))
    expect(links).toHaveLength(0)
  })
})

describe('compilation handling', () => {
  it('marks a "Various Artists" album as a compilation with no album artist', async () => {
    seedMediaFiles(['compilation-va.mp3'])
    await scanService.runScan()

    const [albumRow] = await ctx.db.select().from(album)
    expect(albumRow.isCompilation).toBe(true)
    expect(albumRow.albumArtistId).toBeNull()

    const [songRow] = await ctx.db.select().from(song)
    const [artistRow] = await ctx.db.select().from(artist)
    expect(artistRow.name).toBe('Fixture Artist C')
    expect(songRow.artistId).toBe(artistRow.id)
  })

  it('marks a TCMP-flagged album as a compilation with no album artist', async () => {
    seedMediaFiles(['compilation-tcmp.mp3'])
    await scanService.runScan()

    const [albumRow] = await ctx.db.select().from(album)
    expect(albumRow.isCompilation).toBe(true)
    expect(albumRow.albumArtistId).toBeNull()
  })

  it('sets albumArtistId for an explicit, non-compilation album artist', async () => {
    seedMediaFiles(['album-artist.mp3'])
    await scanService.runScan()

    const [albumRow] = await ctx.db.select().from(album)
    expect(albumRow.isCompilation).toBe(false)

    const artists = await ctx.db.select().from(artist)
    const albumArtist = artists.find((a) => a.name === 'Fixture Album Artist E')!
    const trackArtist = artists.find((a) => a.name === 'Fixture Track Artist E')!
    expect(albumRow.albumArtistId).toBe(albumArtist.id)

    const [songRow] = await ctx.db.select().from(song)
    expect(songRow.artistId).toBe(trackArtist.id)
  })
})

describe('cover extraction', () => {
  it('writes a full cover and thumbnail and sets album.coverImage', async () => {
    seedMediaFiles(['cover.mp3'])
    await scanService.runScan()

    const [albumRow] = await ctx.db.select().from(album)
    expect(albumRow.coverImage).toMatch(/^[0-9a-f-]{36}\.jpg$/)

    const files = fs.readdirSync(coversDir)
    expect(files).toContain(albumRow.coverImage)
    const basename = albumRow.coverImage!.replace(/\.jpg$/, '')
    expect(files).toContain(`${basename}_thumb.webp`)
  })
})

describe('re-run with no changes', () => {
  it('short-circuits via mtime and reports zero new/moved', async () => {
    seedMediaFiles(['basic1.mp3'])
    await scanService.runScan()
    const [before] = await ctx.db.select().from(song)

    const rerun = await scanService.runScan()
    expect(rerun.newCount).toBe(0)
    expect(rerun.movedCount).toBe(0)

    const rows = await ctx.db.select().from(song)
    expect(rows).toHaveLength(1)
    expect(rows[0].updatedAt).toEqual(before.updatedAt)
  })
})

describe('moved file', () => {
  it('auto-relinks to the same song id by content hash', async () => {
    seedMediaFiles(['basic1.mp3'])
    await scanService.runScan()
    const [before] = await ctx.db.select().from(song)

    fs.renameSync(path.join(mediaRoot, 'basic1.mp3'), path.join(mediaRoot, 'renamed.mp3'))
    const rerun = await scanService.runScan()
    expect(rerun.movedCount).toBe(1)
    expect(rerun.newCount).toBe(0)
    // A pure rename must not inflate missingCount — the old-path row is relinked to
    // the new path within this same scan, not left behind as a genuine miss.
    expect(rerun.missingCount).toBe(0)

    const rows = await ctx.db.select().from(song)
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(before.id)
    expect(rows[0].missing).toBe(false)
    expect(rows[0].path).toBe(path.join(mediaRoot, 'renamed.mp3').normalize('NFC'))
  })
})

describe('deleted file', () => {
  it('marks the song missing without deleting it, preserving play history', async () => {
    seedMediaFiles(['basic1.mp3'])
    await scanService.runScan()
    const [before] = await ctx.db.select().from(song)

    await ctx.db.insert(playEvent).values({
      userId: SEED_USER_ID,
      songId: before.id,
      playedAt: new Date(),
      msPlayed: 1000,
    })

    fs.rmSync(path.join(mediaRoot, 'basic1.mp3'))
    const rerun = await scanService.runScan()
    expect(rerun.missingCount).toBe(1)

    const [after] = await ctx.db.select().from(song).where(eq(song.id, before.id))
    expect(after.missing).toBe(true)
    expect(after.missingAt).not.toBeNull()

    const events = await ctx.db.select().from(playEvent).where(eq(playEvent.songId, before.id))
    expect(events).toHaveLength(1)
  })
})

describe('concurrency guard', () => {
  it('rejects a second scan while one is already running', async () => {
    await ctx.db.insert(scanRun).values({ status: 'running', startedAt: new Date() })

    await expect(scanService.runScan()).rejects.toThrow(ScanAlreadyRunningError)
  })
})
