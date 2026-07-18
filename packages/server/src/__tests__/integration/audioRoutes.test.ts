// Route-layer (HTTP) coverage for the audio streaming + cover static-serve endpoints,
// exercising real Express router + service + DAO over the testcontainers Postgres via
// supertest, plus a real temp file on disk to prove Range requests are honored.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedSong,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { createDaosFromDb } from '../../daoFactory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createAudioRouter } from '../../routes/audio.ts'
import { EnvCoverStorageConfigProvider } from '../../services/coverStorageService.ts'

let ctx: TestDb
let app: express.Express
let tmpAudioDir: string
let tmpCoversDir: string
let audioFilePath: string
const audioFileContent = Buffer.from('0123456789ABCDEF')
let originalCoversDir: string | undefined

beforeAll(async () => {
  originalCoversDir = process.env.COVERS_DIR

  tmpAudioDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-audio-'))
  audioFilePath = path.join(tmpAudioDir, 'song.mp3')
  fs.writeFileSync(audioFilePath, audioFileContent)

  tmpCoversDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plootunes-covers-'))
  fs.writeFileSync(path.join(tmpCoversDir, 'cover.jpg'), 'fake-jpg-bytes')
  fs.writeFileSync(path.join(tmpCoversDir, 'cover_thumb.webp'), 'fake-webp-bytes')
  process.env.COVERS_DIR = tmpCoversDir

  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  const services = createServices(createDaosFromDb(ctx.db))
  const coverConfig = new EnvCoverStorageConfigProvider().getConfig()

  app = express()
  app.use(express.json())
  app.use(
    coverConfig.publicBasePath,
    express.static(coverConfig.coversDir, { maxAge: '1y', immutable: true }),
  )
  app.use((req, _res, next) => {
    req.userId = SEED_USER_ID
    req.isAdmin = true
    next()
  })
  app.use('/api/audio', createAudioRouter(services))
})

afterAll(async () => {
  await teardownTestDb(ctx)
  fs.rmSync(tmpAudioDir, { recursive: true, force: true })
  fs.rmSync(tmpCoversDir, { recursive: true, force: true })
  if (originalCoversDir === undefined) {
    delete process.env.COVERS_DIR
  } else {
    process.env.COVERS_DIR = originalCoversDir
  }
})

beforeEach(async () => {
  await resetDb(ctx.db)
  await seedUser(ctx.db)
})

describe('GET /api/audio/:songId/stream', () => {
  it('streams a byte range with 206 Partial Content', async () => {
    const song = await seedSong(ctx.db, { path: audioFilePath })

    const res = await request(app)
      .get(`/api/audio/${song.id}/stream`)
      .set('Range', 'bytes=0-3')

    expect(res.status).toBe(206)
    expect(res.headers['accept-ranges']).toBe('bytes')
    expect(res.headers['content-range']).toBe(`bytes 0-3/${audioFileContent.length}`)
    expect(res.headers['content-length']).toBe('4')
    expect(Buffer.from(res.body as Buffer)).toEqual(audioFileContent.subarray(0, 4))
  })

  it('streams the full file with 200 when no Range header is sent', async () => {
    const song = await seedSong(ctx.db, { path: audioFilePath })

    const res = await request(app).get(`/api/audio/${song.id}/stream`)

    expect(res.status).toBe(200)
    expect(Buffer.from(res.body as Buffer)).toEqual(audioFileContent)
  })

  it('404s for a valid-but-unknown uuid', async () => {
    const res = await request(app).get(
      '/api/audio/00000000-0000-0000-0000-000000000099/stream',
    )
    expect(res.status).toBe(404)
  })

  it('404s for a non-uuid songId', async () => {
    const res = await request(app).get('/api/audio/not-a-uuid/stream')
    expect(res.status).toBe(404)
  })

  it('404s for a song marked missing', async () => {
    const song = await seedSong(ctx.db, { path: audioFilePath, missing: true })
    const res = await request(app).get(`/api/audio/${song.id}/stream`)
    expect(res.status).toBe(404)
  })
})

describe('GET /covers/:file', () => {
  it('serves the full cover with a cache-control header', async () => {
    const res = await request(app).get('/covers/cover.jpg')
    expect(res.status).toBe(200)
    expect(res.headers['cache-control']).toBeTruthy()
  })

  it('serves the thumbnail with a cache-control header', async () => {
    const res = await request(app).get('/covers/cover_thumb.webp')
    expect(res.status).toBe(200)
    expect(res.headers['cache-control']).toBeTruthy()
  })
})
