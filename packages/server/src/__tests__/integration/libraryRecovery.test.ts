// Service-level coverage for the admin missing-row recovery surface:
// LibraryService.listMissing/relink/hardRemove — plus removed-row exclusion from
// the catalog browse surfaces that already filter on `missing`.
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, inject } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { eq } from 'drizzle-orm'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedSong,
  seedLibrarySource,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { ScanService } from '../../services/scanService.ts'
import { AudioService } from '../../services/audioService.ts'
import {
  LibraryService,
  SongNotFoundError,
  SongNotRecoverableError,
  RelinkFileNotFoundError,
} from '../../services/libraryService.ts'
import { song, playEvent } from '../../db/schema.ts'

const FIXTURES_DIR = path.resolve(import.meta.dirname, 'fixtures/library')

let ctx: TestDb
let libraryService: LibraryService
let audioService: AudioService
let scanService: ScanService
let mediaRoot: string
let originalMediaRoot: string | undefined

beforeAll(async () => {
  originalMediaRoot = process.env.MEDIA_ROOT

  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  const daos = createDaosFromDb(ctx.db)
  scanService = new ScanService(daos)
  libraryService = new LibraryService(daos, scanService)
  audioService = new AudioService(daos)
})

afterAll(async () => {
  await teardownTestDb(ctx)
  if (originalMediaRoot === undefined) delete process.env.MEDIA_ROOT
  else process.env.MEDIA_ROOT = originalMediaRoot
})

beforeEach(async () => {
  await resetDb(ctx.db)
  await seedUser(ctx.db)

  mediaRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-recovery-media-'))
  process.env.MEDIA_ROOT = mediaRoot
  await seedLibrarySource(ctx.db, SEED_USER_ID, mediaRoot)
})

afterEach(() => {
  fs.rmSync(mediaRoot, { recursive: true, force: true })
})

describe('listMissing', () => {
  it('returns only missing, non-removed rows', async () => {
    await seedSong(ctx.db, { missing: false })
    const missingRow = await seedSong(ctx.db, { missing: true, missingAt: new Date() })
    await seedSong(ctx.db, { missing: true, missingAt: new Date(), removed: true })

    const rows = await libraryService.listMissing()

    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(missingRow.id)
  })
})

describe('relink', () => {
  it('re-points a moved-AND-changed row at a new file and clears missing', async () => {
    const oldPath = path.join(mediaRoot, 'old.mp3')
    fs.copyFileSync(path.join(FIXTURES_DIR, 'basic1.mp3'), oldPath)
    const missingRow = await seedSong(ctx.db, {
      path: oldPath,
      missing: true,
      missingAt: new Date(),
    })

    const newPath = path.join(mediaRoot, 'new.mp3')
    fs.copyFileSync(path.join(FIXTURES_DIR, 'basic2.mp3'), newPath)

    const updated = await libraryService.relink(missingRow.id, newPath)

    expect(updated.id).toBe(missingRow.id)
    expect(updated.missing).toBe(false)
    expect(updated.missingAt).toBeNull()
    expect(updated.name).toBe('Basic Two')
    expect(updated.path).toBe(newPath.normalize('NFC'))
  })

  it('throws SongNotFoundError for an unknown song id', async () => {
    await expect(
      libraryService.relink('00000000-0000-0000-0000-000000000099', '/nonexistent'),
    ).rejects.toThrow(SongNotFoundError)
  })

  it('throws SongNotRecoverableError for a non-missing song', async () => {
    const row = await seedSong(ctx.db, { missing: false })
    await expect(libraryService.relink(row.id, '/nonexistent')).rejects.toThrow(
      SongNotRecoverableError,
    )
  })

  it('throws RelinkFileNotFoundError when the target path does not exist', async () => {
    const row = await seedSong(ctx.db, { missing: true, missingAt: new Date() })
    await expect(
      libraryService.relink(row.id, path.join(mediaRoot, 'does-not-exist.mp3')),
    ).rejects.toThrow(RelinkFileNotFoundError)
  })
})

describe('hardRemove', () => {
  it('deletes a history-free missing row and its song_genre links', async () => {
    const row = await seedSong(ctx.db, { missing: true, missingAt: new Date() })

    const outcome = await libraryService.hardRemove(row.id)

    expect(outcome).toBe('deleted')
    const rows = await ctx.db.select().from(song).where(eq(song.id, row.id))
    expect(rows).toHaveLength(0)
  })

  it('tombstones a history-bearing missing row, retaining the song and play_event', async () => {
    const row = await seedSong(ctx.db, { missing: true, missingAt: new Date() })
    await ctx.db.insert(playEvent).values({
      userId: SEED_USER_ID,
      songId: row.id,
      playedAt: new Date(),
      msPlayed: 1000,
    })

    const outcome = await libraryService.hardRemove(row.id)

    expect(outcome).toBe('tombstoned')
    const [after] = await ctx.db.select().from(song).where(eq(song.id, row.id))
    expect(after.removed).toBe(true)
    const events = await ctx.db.select().from(playEvent).where(eq(playEvent.songId, row.id))
    expect(events).toHaveLength(1)
  })

  it('throws SongNotFoundError for an unknown song id', async () => {
    await expect(libraryService.hardRemove('00000000-0000-0000-0000-000000000099')).rejects.toThrow(
      SongNotFoundError,
    )
  })

  it('throws SongNotRecoverableError for a non-missing song', async () => {
    const row = await seedSong(ctx.db, { missing: false })
    await expect(libraryService.hardRemove(row.id)).rejects.toThrow(SongNotRecoverableError)
  })
})

describe('removed-row exclusion', () => {
  it('excludes a removed song from findAll and audio streaming', async () => {
    const row = await seedSong(ctx.db, {
      missing: true,
      removed: true,
      path: path.join(mediaRoot, 'gone.mp3'),
    })

    const daos = createDaosFromDb(ctx.db)
    const all = await daos.songDao.findAll(SEED_USER_ID)
    expect(all.find((s) => s.id === row.id)).toBeUndefined()

    const streamable = await audioService.getStreamablePath(row.id)
    expect(streamable).toBeNull()
  })
})

describe('undead tombstone recovery', () => {
  it('lifts the tombstone when a file reappears at a removed row\'s exact path', async () => {
    const returnedPath = path.join(mediaRoot, 'returned.mp3')
    const row = await seedSong(ctx.db, {
      path: returnedPath,
      missing: true,
      removed: true,
    })
    await ctx.db.insert(playEvent).values({
      userId: SEED_USER_ID,
      songId: row.id,
      playedAt: new Date(),
      msPlayed: 1000,
    })

    fs.copyFileSync(path.join(FIXTURES_DIR, 'basic1.mp3'), returnedPath)
    await scanService.ingestFile(returnedPath)

    const [after] = await ctx.db.select().from(song).where(eq(song.id, row.id))
    expect(after.missing).toBe(false)
    expect(after.removed).toBe(false)

    const events = await ctx.db.select().from(playEvent).where(eq(playEvent.songId, row.id))
    expect(events).toHaveLength(1)
  })
})
