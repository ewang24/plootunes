// Route-layer (HTTP) coverage for POST /api/stats/play, mirroring
// librarySubscriptions.test.ts — drives the real Express router + service + DAO over
// the testcontainers Postgres via supertest.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import { eq } from 'drizzle-orm'
import { playEvent } from '../../db/schema.ts'
import { createTestDb, teardownTestDb, resetDb, seedUser, seedSong, SEED_USER_ID, type TestDb } from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createStatsRouter } from '../../routes/stats.ts'

const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'

let ctx: TestDb
let app: express.Express

beforeAll(async () => {
  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  const services = createServices(createDaosFromDb(ctx.db))
  app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    req.userId = (req.header('x-test-user') as string) ?? SEED_USER_ID
    req.isAdmin = true
    next()
  })
  app.use('/api/stats', createStatsRouter(services))
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('POST /api/stats/play', () => {
  it('records exactly one play_event row when the threshold is met', async () => {
    await seedUser(ctx.db)
    const song = await seedSong(ctx.db, { durationMs: 200_000 })
    const playedAt = '2026-01-01T12:00:00.000Z'

    const res = await request(app).post('/api/stats/play').send({
      songId: song.id,
      playedAt,
      msPlayed: 200_000,
    })
    expect(res.status).toBe(204)

    const rows = await ctx.db.select().from(playEvent).where(eq(playEvent.userId, SEED_USER_ID))
    expect(rows).toHaveLength(1)
    expect(rows[0].playedAt.toISOString()).toBe(playedAt)
  })

  it('records zero rows when the play is sub-threshold', async () => {
    await seedUser(ctx.db)
    const song = await seedSong(ctx.db, { durationMs: 200_000 })

    const res = await request(app).post('/api/stats/play').send({
      songId: song.id,
      playedAt: '2026-01-01T12:00:00.000Z',
      msPlayed: 1000,
    })
    expect(res.status).toBe(204)

    const rows = await ctx.db.select().from(playEvent).where(eq(playEvent.userId, SEED_USER_ID))
    expect(rows).toHaveLength(0)
  })

  it('scopes rows to the requesting user', async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })
    const song = await seedSong(ctx.db, { durationMs: 200_000 })

    await request(app)
      .post('/api/stats/play')
      .set('x-test-user', OTHER_USER_ID)
      .send({ songId: song.id, playedAt: '2026-01-01T12:00:00.000Z', msPlayed: 200_000 })

    const rows = await ctx.db.select().from(playEvent).where(eq(playEvent.userId, SEED_USER_ID))
    expect(rows).toHaveLength(0)

    const otherRows = await ctx.db
      .select()
      .from(playEvent)
      .where(eq(playEvent.userId, OTHER_USER_ID))
    expect(otherRows).toHaveLength(1)
  })

  it('returns 400 for a malformed body', async () => {
    await seedUser(ctx.db)

    const res = await request(app).post('/api/stats/play').send({
      songId: 'not-a-uuid',
      playedAt: '2026-01-01T12:00:00.000Z',
      msPlayed: 1000,
    })
    expect(res.status).toBe(400)
  })

  it('returns 400 when a required field is missing', async () => {
    await seedUser(ctx.db)

    const res = await request(app).post('/api/stats/play').send({
      playedAt: '2026-01-01T12:00:00.000Z',
      msPlayed: 1000,
    })
    expect(res.status).toBe(400)
  })
})
