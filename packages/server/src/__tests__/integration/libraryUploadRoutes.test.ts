// Route-layer (HTTP) coverage for the T8 upload + admin recovery endpoints —
// multipart upload, admin gating, and 404s for a nonexistent song id — over the
// real Express router + service + DAO stack via supertest.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { songResponseSchema } from '@ploot/plootunes-shared'
import { createTestDb, teardownTestDb, resetDb, seedUser, SEED_USER_ID, type TestDb } from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createAdapters } from '../../adapterFactory.ts'
import { createLibraryRouter } from '../../routes/library.ts'

const FIXTURES_DIR = path.resolve(import.meta.dirname, 'fixtures/library')

let ctx: TestDb
let app: express.Express
let isAdmin: boolean
let mediaRoot: string
let uploadDir: string
let coversDir: string
let originalMediaRoot: string | undefined
let originalUploadDir: string | undefined
let originalCoversDir: string | undefined

beforeAll(async () => {
  originalMediaRoot = process.env.MEDIA_ROOT
  originalUploadDir = process.env.LIBRARY_UPLOAD_DIR
  originalCoversDir = process.env.COVERS_DIR

  mediaRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-upload-route-media-'))
  uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-upload-route-dest-'))
  coversDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-upload-route-covers-'))
  process.env.MEDIA_ROOT = mediaRoot
  process.env.LIBRARY_UPLOAD_DIR = uploadDir
  process.env.COVERS_DIR = coversDir

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
  fs.rmSync(uploadDir, { recursive: true, force: true })
  fs.rmSync(coversDir, { recursive: true, force: true })
  if (originalMediaRoot === undefined) delete process.env.MEDIA_ROOT
  else process.env.MEDIA_ROOT = originalMediaRoot
  if (originalUploadDir === undefined) delete process.env.LIBRARY_UPLOAD_DIR
  else process.env.LIBRARY_UPLOAD_DIR = originalUploadDir
  if (originalCoversDir === undefined) delete process.env.COVERS_DIR
  else process.env.COVERS_DIR = originalCoversDir
})

beforeEach(async () => {
  await resetDb(ctx.db)
  await seedUser(ctx.db)
  isAdmin = true
})

describe('POST /api/library/upload', () => {
  it('returns 201 with a parseable song DTO for a multipart upload', async () => {
    const res = await request(app)
      .post('/api/library/upload')
      .attach('file', path.join(FIXTURES_DIR, 'basic1.mp3'))
    expect(res.status).toBe(201)
    expect(songResponseSchema.parse(res.body).name).toBe('Basic One')
  })

  it('403s for a non-admin caller', async () => {
    isAdmin = false
    const res = await request(app)
      .post('/api/library/upload')
      .attach('file', path.join(FIXTURES_DIR, 'basic1.mp3'))
    expect(res.status).toBe(403)
  })

  it('400s for an unsupported file extension', async () => {
    const res = await request(app)
      .post('/api/library/upload')
      .attach('file', Buffer.from('not audio'), 'notes.txt')
    expect(res.status).toBe(400)
  })
})

describe('GET /api/library/missing', () => {
  it('403s for a non-admin caller', async () => {
    isAdmin = false
    const res = await request(app).get('/api/library/missing')
    expect(res.status).toBe(403)
  })

  it('200s with an empty list for an admin caller', async () => {
    const res = await request(app).get('/api/library/missing')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('POST /api/library/:songId/relink', () => {
  it('403s for a non-admin caller', async () => {
    isAdmin = false
    const res = await request(app)
      .post('/api/library/00000000-0000-0000-0000-000000000099/relink')
      .send({ path: '/nonexistent' })
    expect(res.status).toBe(403)
  })

  it('404s for a song id that does not exist', async () => {
    const res = await request(app)
      .post('/api/library/00000000-0000-0000-0000-000000000099/relink')
      .send({ path: '/nonexistent' })
    expect(res.status).toBe(404)
  })
})

describe('POST /api/library/:songId/hard-remove', () => {
  it('403s for a non-admin caller', async () => {
    isAdmin = false
    const res = await request(app).post('/api/library/00000000-0000-0000-0000-000000000099/hard-remove')
    expect(res.status).toBe(403)
  })

  it('404s for a song id that does not exist', async () => {
    const res = await request(app).post('/api/library/00000000-0000-0000-0000-000000000099/hard-remove')
    expect(res.status).toBe(404)
  })
})
