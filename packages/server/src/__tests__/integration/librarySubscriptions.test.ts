// Route-layer (HTTP) coverage for /api/library/subscriptions, mirroring
// playbackRoutes.test.ts — drives the real Express router + service + DAO over the
// testcontainers Postgres via supertest.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import type { LibrarySubscriptionDTO } from '@ploot/plootunes-shared'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedLibrarySource,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createAdapters } from '../../adapterFactory.ts'
import { createLibraryRouter } from '../../routes/library.ts'

const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'

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
  app.use('/api/library', createLibraryRouter(adapters, services))
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('POST /api/library/subscriptions and GET /api/library/subscriptions', () => {
  it('creates a subscription and lists it, scoped per-user', async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })

    const post = await request(app).post('/api/library/subscriptions').send({
      folderPath: '/lib/music',
    })
    expect(post.status).toBe(201)
    const body = post.body as LibrarySubscriptionDTO
    expect(body.folderPath).toBe('/lib/music')
    expect(body.id).toBeTruthy()

    const list = await request(app).get('/api/library/subscriptions')
    expect(list.status).toBe(200)
    const dtos = list.body as LibrarySubscriptionDTO[]
    expect(dtos).toHaveLength(1)
    expect(dtos[0].folderPath).toBe('/lib/music')

    const otherList = await request(app)
      .get('/api/library/subscriptions')
      .set('x-test-user', OTHER_USER_ID)
    expect(otherList.status).toBe(200)
    expect(otherList.body).toHaveLength(0)
  })
})

describe('overlap rejection', () => {
  beforeEach(async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib/music')
  })

  it('rejects a parent folder', async () => {
    const res = await request(app).post('/api/library/subscriptions').send({
      folderPath: '/lib',
    })
    expect(res.status).toBe(409)
  })

  it('rejects a child folder', async () => {
    const res = await request(app).post('/api/library/subscriptions').send({
      folderPath: '/lib/music/rock',
    })
    expect(res.status).toBe(409)
  })

  it('rejects an exact duplicate', async () => {
    const res = await request(app).post('/api/library/subscriptions').send({
      folderPath: '/lib/music',
    })
    expect(res.status).toBe(409)
  })

  it('allows a sibling folder', async () => {
    const res = await request(app).post('/api/library/subscriptions').send({
      folderPath: '/lib/podcasts',
    })
    expect(res.status).toBe(201)
  })

  it('allows a separator-aware lookalike folder', async () => {
    const res = await request(app).post('/api/library/subscriptions').send({
      folderPath: '/library',
    })
    expect(res.status).toBe(201)
  })
})

describe('trailing-slash normalization', () => {
  it('treats a trailing slash as the same folder', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')

    const res = await request(app).post('/api/library/subscriptions').send({
      folderPath: '/lib/',
    })
    expect(res.status).toBe(409)
  })
})

describe('DELETE /api/library/subscriptions/:id', () => {
  it('deletes an existing subscription', async () => {
    await seedUser(ctx.db)
    const row = await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib/music')

    const del = await request(app).delete(`/api/library/subscriptions/${row.id}`)
    expect(del.status).toBe(204)

    const list = await request(app).get('/api/library/subscriptions')
    expect(list.body).toHaveLength(0)
  })

  it('returns 404 for a non-existent id', async () => {
    await seedUser(ctx.db)

    const del = await request(app).delete(
      '/api/library/subscriptions/00000000-0000-0000-0000-000000000099',
    )
    expect(del.status).toBe(404)
  })

  it('returns 404 (not a 500) for a malformed id', async () => {
    await seedUser(ctx.db)

    const del = await request(app).delete('/api/library/subscriptions/not-a-uuid')
    expect(del.status).toBe(404)
  })

  it('cannot delete another user\'s subscription', async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })
    const row = await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib/music')

    const del = await request(app)
      .delete(`/api/library/subscriptions/${row.id}`)
      .set('x-test-user', OTHER_USER_ID)
    expect(del.status).toBe(404)

    const list = await request(app).get('/api/library/subscriptions')
    expect(list.body).toHaveLength(1)
  })
})
