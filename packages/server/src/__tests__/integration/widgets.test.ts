// Route-layer (HTTP) coverage for /api/widgets, mirroring
// librarySubscriptions.test.ts — drives the real Express router + service + DAO over
// the testcontainers Postgres via supertest.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import type { WidgetDTO } from '@ploot/plootunes-shared'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedWidget,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createAdapters } from '../../adapterFactory.ts'
import { createWidgetRouter } from '../../routes/widgets.ts'

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
  app.use('/api/widgets', createWidgetRouter(adapters, services))
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('POST /api/widgets and GET /api/widgets', () => {
  it('creates widgets and lists them, scoped per-user', async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })

    const post1 = await request(app).post('/api/widgets').send({ widgetType: 'now_playing' })
    expect(post1.status).toBe(201)
    const body1 = post1.body as WidgetDTO
    expect(body1.widgetType).toBe('now_playing')
    expect(body1.displayOrder).toBe(0)

    const post2 = await request(app).post('/api/widgets').send({ widgetType: 'recently_played' })
    expect(post2.status).toBe(201)
    const body2 = post2.body as WidgetDTO
    expect(body2.displayOrder).toBe(body1.displayOrder + 1)

    const list = await request(app).get('/api/widgets')
    expect(list.status).toBe(200)
    const dtos = list.body as WidgetDTO[]
    expect(dtos).toHaveLength(2)

    const otherList = await request(app).get('/api/widgets').set('x-test-user', OTHER_USER_ID)
    expect(otherList.status).toBe(200)
    expect(otherList.body).toHaveLength(0)
  })
})

describe('DELETE /api/widgets/:id', () => {
  it('deletes an existing widget', async () => {
    await seedUser(ctx.db)
    const row = await seedWidget(ctx.db, SEED_USER_ID)

    const del = await request(app).delete(`/api/widgets/${row.id}`)
    expect(del.status).toBe(204)

    const list = await request(app).get('/api/widgets')
    expect(list.body).toHaveLength(0)
  })

  it('returns 404 (not a 500) for a malformed id', async () => {
    await seedUser(ctx.db)

    const del = await request(app).delete('/api/widgets/not-a-uuid')
    expect(del.status).toBe(404)
  })

  it("cannot delete another user's widget", async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })
    const row = await seedWidget(ctx.db, SEED_USER_ID)

    const del = await request(app)
      .delete(`/api/widgets/${row.id}`)
      .set('x-test-user', OTHER_USER_ID)
    expect(del.status).toBe(404)

    const list = await request(app).get('/api/widgets')
    expect(list.body).toHaveLength(1)
  })
})
