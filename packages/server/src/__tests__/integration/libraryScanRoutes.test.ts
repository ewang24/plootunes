// Route-layer (HTTP) coverage for POST /api/library/scan — admin gating, the 202
// async-trigger contract, and the 409 concurrency guard — over the real Express
// router + service + DAO stack via supertest.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { scanRunResponseSchema } from '@ploot/plootunes-shared'
import { createTestDb, teardownTestDb, resetDb, seedUser, SEED_USER_ID, type TestDb } from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createAdapters } from '../../adapterFactory.ts'
import { createLibraryRouter } from '../../routes/library.ts'
import { scanRun } from '../../db/schema.ts'

let ctx: TestDb
let app: express.Express
let isAdmin: boolean
let mediaRoot: string
let originalMediaRoot: string | undefined

beforeAll(async () => {
  originalMediaRoot = process.env.MEDIA_ROOT
  mediaRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-scan-route-media-'))
  process.env.MEDIA_ROOT = mediaRoot

  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  const services = createServices(createDaosFromDb(ctx.db))
  const adapters = createAdapters(services)

  app = express()
  app.use(express.json())
  app.use((req, _res, next) => {
    req.userId = SEED_USER_ID
    req.isAdmin = isAdmin
    next()
  })
  app.use('/api/library', createLibraryRouter(adapters, services))
})

afterAll(async () => {
  await teardownTestDb(ctx)
  fs.rmSync(mediaRoot, { recursive: true, force: true })
  if (originalMediaRoot === undefined) delete process.env.MEDIA_ROOT
  else process.env.MEDIA_ROOT = originalMediaRoot
})

beforeEach(async () => {
  await resetDb(ctx.db)
  await seedUser(ctx.db)
  isAdmin = true
})

describe('POST /api/library/scan', () => {
  it('returns 202 with a running scanRun DTO', async () => {
    const res = await request(app).post('/api/library/scan')
    expect(res.status).toBe(202)
    expect(scanRunResponseSchema.parse(res.body).status).toBe('running')
  })

  it('403s for a non-admin caller', async () => {
    isAdmin = false
    const res = await request(app).post('/api/library/scan')
    expect(res.status).toBe(403)
  })

  it('409s a call while a scan is already running', async () => {
    // Insert the running row directly rather than racing two real POSTs — the empty
    // MEDIA_ROOT here makes a real scan finish almost instantly, which would make a
    // two-POST race flaky.
    await ctx.db.insert(scanRun).values({ status: 'running', startedAt: new Date() })

    const res = await request(app).post('/api/library/scan')
    expect(res.status).toBe(409)
  })
})
