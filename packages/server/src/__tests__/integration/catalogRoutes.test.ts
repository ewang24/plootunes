// Route-layer (HTTP) coverage for the catalog endpoints. Where catalog.test.ts
// exercises the DAOs directly, this test drives the real Express routers + services
// + DAOs over the testcontainers Postgres via supertest — covering the seam the DAO
// tests miss: query-param parsing/precedence, toXDto mapping (esp. "Various Artists"),
// and req.userId scoping.
import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import express from 'express'
import request from 'supertest'
import type { SongDTO, AlbumDTO, ArtistDTO } from '@ploot/plootunes-shared'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedArtist,
  seedAlbum,
  seedSong,
  seedGenre,
  seedGenreEdge,
  seedSongGenre,
  seedLibrarySource,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { createDaosFromDb } from '../../factory.ts'
import { createServices } from '../../serviceFactory.ts'
import { createSongsRouter } from '../../routes/songs.ts'
import { createAlbumsRouter } from '../../routes/albums.ts'
import { createArtistsRouter } from '../../routes/artists.ts'

const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'

let ctx: TestDb
let app: express.Express

beforeAll(async () => {
  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  const services = createServices(createDaosFromDb(ctx.db))
  app = express()
  app.use(express.json())
  // Stand in for the production auth-gate middleware: inject req.userId from a test
  // header so each request can act as a chosen user (defaults to SEED_USER_ID).
  app.use((req, _res, next) => {
    req.userId = (req.header('x-test-user') as string) ?? SEED_USER_ID
    req.isAdmin = true
    next()
  })
  app.use('/api/songs', createSongsRouter(services))
  app.use('/api/albums', createAlbumsRouter(services))
  app.use('/api/artists', createArtistsRouter(services))
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('GET /api/songs', () => {
  it('returns only the requesting user’s in-library songs as SongDTOs', async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib/user1')
    await seedLibrarySource(ctx.db, OTHER_USER_ID, '/lib/user2')
    const mine = await seedSong(ctx.db, { path: '/lib/user1/a.mp3', name: 'Mine' })
    await seedSong(ctx.db, { path: '/lib/user2/b.mp3', name: 'Theirs' })

    const res = await request(app).get('/api/songs')
    expect(res.status).toBe(200)
    const body = res.body as SongDTO[]
    expect(body).toHaveLength(1)
    expect(body[0]).toMatchObject({ id: mine.id, name: 'Mine' })
    expect(body[0]).toHaveProperty('genres')

    const otherRes = await request(app).get('/api/songs').set('x-test-user', OTHER_USER_ID)
    expect((otherRes.body as SongDTO[]).map((s) => s.name)).toEqual(['Theirs'])
  })

  it('applies ?albumId with precedence over ?artistId', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const artistA = await seedArtist(ctx.db)
    const artistB = await seedArtist(ctx.db)
    const albumA = await seedAlbum(ctx.db, { albumArtistId: artistA.id })
    const songA = await seedSong(ctx.db, {
      path: '/lib/a.mp3',
      albumId: albumA.id,
      artistId: artistA.id,
    })
    await seedSong(ctx.db, { path: '/lib/b.mp3', artistId: artistB.id })

    // Both params present → albumId wins, so only album A's track comes back.
    const res = await request(app)
      .get('/api/songs')
      .query({ albumId: albumA.id, artistId: artistB.id })
    expect((res.body as SongDTO[]).map((s) => s.id)).toEqual([songA.id])
  })

  it('expands ?genreId to descendant genres', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const parent = await seedGenre(ctx.db)
    const child = await seedGenre(ctx.db)
    await seedGenreEdge(ctx.db, parent.id, child.id)
    const song = await seedSong(ctx.db, { path: '/lib/x.mp3' })
    await seedSongGenre(ctx.db, song.id, child.id)

    const res = await request(app).get('/api/songs').query({ genreId: parent.id })
    const body = res.body as SongDTO[]
    expect(body.map((s) => s.id)).toEqual([song.id])
    expect(body[0].genres).toEqual([child.name])
  })
})

describe('GET /api/albums', () => {
  it('derives artistName: album artist, Various Artists, or Unknown Artist', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const artist = await seedArtist(ctx.db, { name: 'Real Artist' })
    const credited = await seedAlbum(ctx.db, { name: 'Credited', albumArtistId: artist.id })
    const comp = await seedAlbum(ctx.db, {
      name: 'Comp',
      albumArtistId: null,
      isCompilation: true,
    })
    const orphan = await seedAlbum(ctx.db, {
      name: 'Orphan',
      albumArtistId: null,
      isCompilation: false,
    })
    await seedSong(ctx.db, { path: '/lib/1.mp3', albumId: credited.id, artistId: artist.id })
    await seedSong(ctx.db, { path: '/lib/2.mp3', albumId: comp.id, artistId: artist.id })
    await seedSong(ctx.db, { path: '/lib/3.mp3', albumId: orphan.id, artistId: artist.id })

    const res = await request(app).get('/api/albums')
    expect(res.status).toBe(200)
    const byName = Object.fromEntries((res.body as AlbumDTO[]).map((a) => [a.name, a.artistName]))
    expect(byName['Credited']).toBe('Real Artist')
    expect(byName['Comp']).toBe('Various Artists')
    expect(byName['Orphan']).toBe('Unknown Artist')
  })

  it('filters by ?artistId and reports in-library songCount', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const artistA = await seedArtist(ctx.db)
    const artistB = await seedArtist(ctx.db)
    const albumA = await seedAlbum(ctx.db, { name: 'A', albumArtistId: artistA.id })
    await seedAlbum(ctx.db, { name: 'B', albumArtistId: artistB.id })
    await seedSong(ctx.db, { path: '/lib/1.mp3', albumId: albumA.id, artistId: artistA.id })
    await seedSong(ctx.db, { path: '/lib/2.mp3', albumId: albumA.id, artistId: artistA.id })

    const res = await request(app).get('/api/albums').query({ artistId: artistA.id })
    const body = res.body as AlbumDTO[]
    expect(body.map((a) => a.name)).toEqual(['A'])
    expect(body[0].songCount).toBe(2)
  })
})

describe('GET /api/artists', () => {
  it('returns in-library numAlbums/numSongs as ArtistDTOs', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const artist = await seedArtist(ctx.db)
    const album1 = await seedAlbum(ctx.db, { albumArtistId: artist.id })
    const album2 = await seedAlbum(ctx.db, { albumArtistId: artist.id })
    await seedSong(ctx.db, { path: '/lib/1.mp3', albumId: album1.id, artistId: artist.id })
    await seedSong(ctx.db, { path: '/lib/2.mp3', albumId: album2.id, artistId: artist.id })

    const res = await request(app).get('/api/artists')
    expect(res.status).toBe(200)
    const row = (res.body as ArtistDTO[]).find((a) => a.id === artist.id)
    expect(row).toMatchObject({ numAlbums: 2, numSongs: 2 })
  })
})
