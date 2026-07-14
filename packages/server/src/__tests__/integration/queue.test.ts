import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedArtist,
  seedAlbum,
  seedSong,
  seedLibrarySource,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { QueueService } from '../../services/queueService.ts'
import { PlaybackService } from '../../services/playbackService.ts'
import type { AppDaos } from '../../daoFactory.ts'

const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'

let ctx: TestDb
let daos: AppDaos
let queueService: QueueService
let playbackService: PlaybackService

beforeAll(async () => {
  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  daos = createDaosFromDb(ctx.db)
  queueService = new QueueService(daos)
  playbackService = new PlaybackService(daos, queueService)
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

async function seedLibraryOfSongs(count: number) {
  await seedUser(ctx.db)
  await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
  const artist = await seedArtist(ctx.db)
  const album = await seedAlbum(ctx.db, { albumArtistId: artist.id })
  const songs = []
  for (let i = 0; i < count; i++) {
    songs.push(
      await seedSong(ctx.db, {
        path: `/lib/song-${i}.mp3`,
        albumId: album.id,
        artistId: artist.id,
        name: `Song ${i}`,
      }),
    )
  }
  return { artist, album, songs }
}

describe('playSong / queueSong', () => {
  it('playSong replaces the queue with a single song at cursor 0', async () => {
    const { songs } = await seedLibraryOfSongs(3)
    await queueService.playSong(SEED_USER_ID, songs[1].id)

    const queueRow = await daos.queueDao.findByUserId(SEED_USER_ID)
    const playbackRow = await daos.playbackStateDao.findByUserId(SEED_USER_ID)
    expect(queueRow?.songIds).toEqual([songs[1].id])
    expect(queueRow?.playOrder).toBeNull()
    expect(playbackRow?.cursor).toBe(0)
    expect(playbackRow?.shuffled).toBe(false)
  })

  it('queueSong appends without touching cursor when not shuffled', async () => {
    const { songs } = await seedLibraryOfSongs(3)
    await queueService.playSong(SEED_USER_ID, songs[0].id)
    await queueService.queueSong(SEED_USER_ID, songs[1].id)
    await queueService.queueSong(SEED_USER_ID, songs[2].id)

    const queueRow = await daos.queueDao.findByUserId(SEED_USER_ID)
    const playbackRow = await daos.playbackStateDao.findByUserId(SEED_USER_ID)
    expect(queueRow?.songIds).toEqual([songs[0].id, songs[1].id, songs[2].id])
    expect(queueRow?.playOrder).toBeNull()
    expect(playbackRow?.cursor).toBe(0)
  })
})

describe('shuffle on/off keeps your spot', () => {
  it('shuffling pins the current song at index 0 and cursor 0', async () => {
    const { songs } = await seedLibraryOfSongs(5)
    await queueService.queueAllSongs(SEED_USER_ID)
    await queueService.transitionCurrentSong(SEED_USER_ID, songs[2].id)

    await queueService.setShuffled(SEED_USER_ID, true)

    const queueRow = await daos.queueDao.findByUserId(SEED_USER_ID)
    const playbackRow = await daos.playbackStateDao.findByUserId(SEED_USER_ID)
    expect(playbackRow?.cursor).toBe(0)
    expect(playbackRow?.shuffled).toBe(true)
    expect(queueRow?.playOrder?.[0]).toBe(songs[2].id)
    expect(new Set(queueRow?.playOrder)).toEqual(new Set(songs.map((s) => s.id)))
  })

  it('un-shuffling drops playOrder and keeps the same current song via cursor', async () => {
    const { songs } = await seedLibraryOfSongs(5)
    await queueService.queueAllSongs(SEED_USER_ID)
    await queueService.transitionCurrentSong(SEED_USER_ID, songs[3].id)
    await queueService.setShuffled(SEED_USER_ID, true)

    await queueService.setShuffled(SEED_USER_ID, false)

    const queueRow = await daos.queueDao.findByUserId(SEED_USER_ID)
    const playbackRow = await daos.playbackStateDao.findByUserId(SEED_USER_ID)
    expect(queueRow?.playOrder).toBeNull()
    expect(playbackRow?.shuffled).toBe(false)
    expect(queueRow?.songIds[playbackRow!.cursor!]).toBe(songs[3].id)
  })
})

describe('add-to-queue while shuffled', () => {
  it('appends the new id to both songIds and the end of playOrder, moving nothing already queued', async () => {
    const { songs } = await seedLibraryOfSongs(3)
    await queueService.queueAllSongs(SEED_USER_ID)
    await queueService.setShuffled(SEED_USER_ID, true)

    const before = await daos.queueDao.findByUserId(SEED_USER_ID)
    const beforePlayOrder = before!.playOrder!
    const beforeCursor = (await daos.playbackStateDao.findByUserId(SEED_USER_ID))!.cursor

    const extra = await seedSong(ctx.db, { path: '/lib/extra.mp3' })
    await queueService.queueSong(SEED_USER_ID, extra.id)

    const after = await daos.queueDao.findByUserId(SEED_USER_ID)
    const afterPlaybackRow = await daos.playbackStateDao.findByUserId(SEED_USER_ID)
    expect(after?.songIds).toEqual([...songs.map((s) => s.id), extra.id])
    expect(after?.playOrder).toEqual([...beforePlayOrder, extra.id])
    expect(afterPlaybackRow?.cursor).toBe(beforeCursor)
  })
})

describe('next / previous cursor across repeat modes', () => {
  it('repeat off: bounded at the ends (no mutation of cursor)', async () => {
    const { songs } = await seedLibraryOfSongs(3)
    await queueService.queueAllSongs(SEED_USER_ID)
    await queueService.transitionCurrentSong(SEED_USER_ID, songs[2].id)
    await playbackService.updatePlaybackState(SEED_USER_ID, { repeat: 'off' })

    const next = await queueService.getNextSongInQueue(SEED_USER_ID)
    expect(next).toBeNull()

    const playbackRow = await daos.playbackStateDao.findByUserId(SEED_USER_ID)
    expect(playbackRow?.cursor).toBe(2) // read-only, unmutated

    await queueService.transitionCurrentSong(SEED_USER_ID, songs[0].id)
    const prev = await queueService.getPreviousSongInQueue(SEED_USER_ID)
    expect(prev).toBeNull()
  })

  it('repeat all: wraps around', async () => {
    const { songs } = await seedLibraryOfSongs(3)
    await queueService.queueAllSongs(SEED_USER_ID)
    await queueService.transitionCurrentSong(SEED_USER_ID, songs[2].id)
    await playbackService.updatePlaybackState(SEED_USER_ID, { repeat: 'all' })

    const next = await queueService.getNextSongInQueue(SEED_USER_ID)
    expect(next?.id).toBe(songs[0].id)

    await queueService.transitionCurrentSong(SEED_USER_ID, songs[0].id)
    const prev = await queueService.getPreviousSongInQueue(SEED_USER_ID)
    expect(prev?.id).toBe(songs[2].id)
  })

  it('repeat one: returns the same index', async () => {
    const { songs } = await seedLibraryOfSongs(3)
    await queueService.queueAllSongs(SEED_USER_ID)
    await queueService.transitionCurrentSong(SEED_USER_ID, songs[1].id)
    await playbackService.updatePlaybackState(SEED_USER_ID, { repeat: 'one' })

    const next = await queueService.getNextSongInQueue(SEED_USER_ID)
    expect(next?.id).toBe(songs[1].id)
    const prev = await queueService.getPreviousSongInQueue(SEED_USER_ID)
    expect(prev?.id).toBe(songs[1].id)
  })
})

describe('getAllQueuedSongs windowing', () => {
  it('hydrates only the requested slice, in window order, plus currentlyPlaying', async () => {
    const { songs } = await seedLibraryOfSongs(5)
    await queueService.queueAllSongs(SEED_USER_ID)
    await queueService.transitionCurrentSong(SEED_USER_ID, songs[4].id)

    const result = await queueService.getAllQueuedSongs(SEED_USER_ID, 1, 2)
    expect(result.total).toBe(5)
    expect(result.songs.map((s) => s.id)).toEqual([songs[1].id, songs[2].id])
    expect(result.currentlyPlaying?.id).toBe(songs[4].id)
  })
})

describe('playRandomAlbum / playRandomArtist', () => {
  it('replaces the queue with a random in-library album, unshuffled, cursor 0', async () => {
    const { songs } = await seedLibraryOfSongs(3)
    const result = await queueService.playRandomAlbum(SEED_USER_ID)
    expect(result?.id).toBe(songs[0].id)

    const queueRow = await daos.queueDao.findByUserId(SEED_USER_ID)
    const playbackRow = await daos.playbackStateDao.findByUserId(SEED_USER_ID)
    expect(queueRow?.songIds).toEqual(songs.map((s) => s.id))
    expect(queueRow?.playOrder).toBeNull()
    expect(playbackRow?.cursor).toBe(0)
  })

  it('returns null when the library has no albums/artists', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')

    expect(await queueService.playRandomAlbum(SEED_USER_ID)).toBeNull()
    expect(await queueService.playRandomArtist(SEED_USER_ID)).toBeNull()
  })
})

describe('empty-list guards on replace ops', () => {
  it('playAlbum/playArtist no-op (do not write cursor 0) for an album/artist with no in-library songs', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const artist = await seedArtist(ctx.db)
    const album = await seedAlbum(ctx.db, { albumArtistId: artist.id })

    await queueService.playAlbum(SEED_USER_ID, album.id)
    expect(await daos.queueDao.findByUserId(SEED_USER_ID)).toBeUndefined()
    expect(await daos.playbackStateDao.findByUserId(SEED_USER_ID)).toBeUndefined()

    await queueService.playArtist(SEED_USER_ID, artist.id)
    expect(await daos.queueDao.findByUserId(SEED_USER_ID)).toBeUndefined()
    expect(await daos.playbackStateDao.findByUserId(SEED_USER_ID)).toBeUndefined()
  })

  it('queueAllSongsAndPlayFirstSong returns null and does not write for an empty library', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')

    const result = await queueService.queueAllSongsAndPlayFirstSong(SEED_USER_ID)
    expect(result).toBeNull()
    expect(await daos.queueDao.findByUserId(SEED_USER_ID)).toBeUndefined()
    expect(await daos.playbackStateDao.findByUserId(SEED_USER_ID)).toBeUndefined()
  })
})

describe('user scoping', () => {
  it('does not leak one user’s queue into another’s', async () => {
    const { songs } = await seedLibraryOfSongs(2)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })

    await queueService.playSong(SEED_USER_ID, songs[0].id)

    const otherQueue = await daos.queueDao.findByUserId(OTHER_USER_ID)
    expect(otherQueue).toBeUndefined()

    const mine = await queueService.getAllQueuedSongs(SEED_USER_ID, 0, 10)
    expect(mine.songs).toHaveLength(1)
    const theirs = await queueService.getAllQueuedSongs(OTHER_USER_ID, 0, 10)
    expect(theirs.songs).toHaveLength(0)
    expect(theirs.total).toBe(0)
  })
})
