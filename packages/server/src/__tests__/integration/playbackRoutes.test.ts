// Route-layer (HTTP) coverage for /api/playback and a couple of /api/queue/* flows,
// mirroring catalogRoutes.test.ts — drives the real Express routers + services + DAOs
// over the testcontainers Postgres via supertest.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import type { PlaybackStateDTO, QueuedSongsDTO } from '@ploot/plootunes-shared'
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
import { createServices } from '../../serviceFactory.ts'
import { createAdapters } from '../../adapterFactory.ts'
import { createQueueRouter } from '../../routes/queue.ts'
import { createPlaybackRouter } from '../../routes/playback.ts'

let ctx: TestDb
let app: express.Express

beforeAll(async () => {
  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  const services = createServices(createDaosFromDb(ctx.db))
  const adapters = createAdapters(services)
  app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    req.userId = (req.header('x-test-user') as string) ?? SEED_USER_ID
    req.isAdmin = true
    next()
  })
  app.use('/api/queue', createQueueRouter(adapters, services))
  app.use('/api/playback', createPlaybackRouter(adapters))
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

describe('GET /api/playback', () => {
  it('returns sensible defaults when no row exists yet', async () => {
    await seedUser(ctx.db)

    const res = await request(app).get('/api/playback')
    expect(res.status).toBe(200)
    const body = res.body as PlaybackStateDTO
    expect(body).toMatchObject({
      cursor: null,
      positionMs: null,
      shuffled: false,
      repeat: 'off',
    })
  })
})

describe('PUT /api/playback', () => {
  it('applies a positionMs heartbeat and bumps updatedAt', async () => {
    await seedUser(ctx.db)

    const first = await request(app).put('/api/playback').send({ positionMs: 12345 })
    expect(first.status).toBe(200)
    expect((first.body as PlaybackStateDTO).positionMs).toBe(12345)

    const second = await request(app).put('/api/playback').send({ positionMs: 54321 })
    expect((second.body as PlaybackStateDTO).positionMs).toBe(54321)
    expect(new Date(second.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(first.body.updatedAt).getTime(),
    )
  })

  it('delegates shuffled:true to queueService.setShuffled', async () => {
    const { songs } = await seedLibraryOfSongs(4)
    await request(app).post('/api/queue/queue-all').expect(204)
    await request(app).post('/api/queue/transition').send({ songId: songs[2].id }).expect(204)

    const res = await request(app).put('/api/playback').send({ shuffled: true })
    expect(res.status).toBe(200)
    const body = res.body as PlaybackStateDTO
    expect(body.shuffled).toBe(true)
    expect(body.cursor).toBe(0)

    const queueRes = await request(app).get('/api/queue')
    const queueBody = queueRes.body as QueuedSongsDTO
    expect(queueBody.currentlyPlaying?.id).toBe(songs[2].id)
  })

  it('a combined body applies shuffle after cursor/positionMs, so the pinned cursor wins', async () => {
    const { songs } = await seedLibraryOfSongs(4)
    await request(app).post('/api/queue/queue-all').expect(204)
    await request(app).post('/api/queue/transition').send({ songId: songs[2].id }).expect(204)

    // If cursor/positionMs from this same body were applied after setShuffled, the
    // resulting persisted cursor would be the stale cursor:5 below instead of the
    // shuffle transform's pinned 0 — defeating the "shuffle pins a valid index"
    // invariant. Applying cursor/positionMs first (even to a bogus value) means
    // setShuffled always has the final word on cursor.
    const res = await request(app)
      .put('/api/playback')
      .send({ shuffled: true, cursor: 5, positionMs: 9999 })
    expect(res.status).toBe(200)
    const body = res.body as PlaybackStateDTO
    expect(body.shuffled).toBe(true)
    expect(body.cursor).toBe(0)
  })
})

describe('/api/queue/* flows', () => {
  it('play-song then queue-song builds an unshuffled queue', async () => {
    const { songs } = await seedLibraryOfSongs(3)

    await request(app).post('/api/queue/play-song').send({ songId: songs[0].id }).expect(204)
    await request(app).post('/api/queue/queue-song').send({ songId: songs[1].id }).expect(204)

    const res = await request(app).get('/api/queue')
    const body = res.body as QueuedSongsDTO
    expect(body.songs.map((s) => s.id)).toEqual([songs[0].id, songs[1].id])
    expect(body.currentlyPlaying?.id).toBe(songs[0].id)
  })

  it('GET /api/queue/next and /api/queue/previous return 204 at the bounds', async () => {
    const { songs } = await seedLibraryOfSongs(2)
    await request(app).post('/api/queue/play-song').send({ songId: songs[0].id }).expect(204)
    await request(app).post('/api/queue/queue-song').send({ songId: songs[1].id }).expect(204)

    const prev = await request(app).get('/api/queue/previous')
    expect(prev.status).toBe(204)

    const next = await request(app).get('/api/queue/next')
    expect(next.status).toBe(200)
    expect(next.body.id).toBe(songs[1].id)
  })
})
