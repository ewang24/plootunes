// Route-layer (HTTP) coverage for /api/preferences, mirroring
// playbackRoutes.test.ts — drives the real Express router + service + DAO over the
// testcontainers Postgres via supertest.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import type { UserPreferencesDTO } from '@ploot/plootunes-shared'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedUserPreferences,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createAdapters } from '../../adapterFactory.ts'
import { createPreferencesRouter } from '../../routes/preferences.ts'

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
  app.use('/api/preferences', createPreferencesRouter(adapters))
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('GET /api/preferences', () => {
  it('returns the default fallback when no row exists', async () => {
    await seedUser(ctx.db)

    const res = await request(app).get('/api/preferences')
    expect(res.status).toBe(200)
    const body = res.body as UserPreferencesDTO
    expect(body).toMatchObject({ backBehavior: 'previous_track' })
  })

  it('returns the seeded row after ensureDefault', async () => {
    await seedUser(ctx.db)
    await seedUserPreferences(ctx.db, SEED_USER_ID, { backBehavior: 'restart_track' })

    const res = await request(app).get('/api/preferences')
    expect(res.status).toBe(200)
    const body = res.body as UserPreferencesDTO
    expect(body).toMatchObject({ backBehavior: 'restart_track' })
  })
})

describe('PUT /api/preferences', () => {
  it('updates backBehavior and round-trips via GET', async () => {
    await seedUser(ctx.db)

    const put = await request(app).put('/api/preferences').send({ backBehavior: 'restart_track' })
    expect(put.status).toBe(200)
    expect((put.body as UserPreferencesDTO).backBehavior).toBe('restart_track')

    const get = await request(app).get('/api/preferences')
    expect((get.body as UserPreferencesDTO).backBehavior).toBe('restart_track')
  })

  it('rejects an invalid backBehavior value', async () => {
    await seedUser(ctx.db)

    const res = await request(app).put('/api/preferences').send({ backBehavior: 'not-a-value' })
    expect(res.status).toBe(400)
  })

  it('leaves existing values unchanged on an empty-body no-op update', async () => {
    await seedUser(ctx.db)
    await seedUserPreferences(ctx.db, SEED_USER_ID, { backBehavior: 'restart_track' })

    const put = await request(app).put('/api/preferences').send({})
    expect(put.status).toBe(200)
    expect((put.body as UserPreferencesDTO).backBehavior).toBe('restart_track')

    const get = await request(app).get('/api/preferences')
    expect((get.body as UserPreferencesDTO).backBehavior).toBe('restart_track')
  })
})
