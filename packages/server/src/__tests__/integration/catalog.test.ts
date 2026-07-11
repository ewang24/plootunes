import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
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
import { SongDao } from '../../dao/songDao.ts'
import { AlbumDao } from '../../dao/albumDao.ts'
import { ArtistDao } from '../../dao/artistDao.ts'
import { GenreDao } from '../../dao/genreDao.ts'

const OTHER_USER_ID = '00000000-0000-0000-0000-000000000002'

let ctx: TestDb
let songDao: SongDao
let albumDao: AlbumDao
let artistDao: ArtistDao
let genreDao: GenreDao

beforeAll(async () => {
  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  songDao = new SongDao(ctx.db)
  albumDao = new AlbumDao(ctx.db)
  artistDao = new ArtistDao(ctx.db)
  genreDao = new GenreDao(ctx.db)
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('membership scoping', () => {
  it('scopes songs to each user by their own library folders', async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib/user1')
    await seedLibrarySource(ctx.db, OTHER_USER_ID, '/lib/user2')

    const songUser1 = await seedSong(ctx.db, { path: '/lib/user1/a.mp3', name: 'A' })
    const songUser2 = await seedSong(ctx.db, { path: '/lib/user2/b.mp3', name: 'B' })

    const forUser1 = await songDao.findAll(SEED_USER_ID)
    const forUser2 = await songDao.findAll(OTHER_USER_ID)

    expect(forUser1.map((s) => s.id)).toEqual([songUser1.id])
    expect(forUser2.map((s) => s.id)).toEqual([songUser2.id])
  })

  it('excludes songs marked missing', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib/user1')
    await seedSong(ctx.db, { path: '/lib/user1/present.mp3', missing: false })
    await seedSong(ctx.db, { path: '/lib/user1/gone.mp3', missing: true })

    const songs = await songDao.findAll(SEED_USER_ID)
    expect(songs).toHaveLength(1)
    expect(songs[0].name).toBeNull()
  })

  it('does not leak into sibling folders that share a name prefix', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib/rock')

    const inside = await seedSong(ctx.db, { path: '/lib/rock/track.mp3', name: 'Inside' })
    // Sibling dir whose name is a prefix-superset of the subscribed folder. The half-open
    // range ends exclusively at '/lib/rock' || '0' = '/lib/rock0', and '-' (0x2D) sorts
    // below '/' (0x2F), so '/lib/rock-and-roll/...' falls below the range's lower bound.
    await seedSong(ctx.db, { path: '/lib/rock-and-roll/track.mp3', name: 'Sibling' })

    const songs = await songDao.findAll(SEED_USER_ID)
    expect(songs.map((s) => s.id)).toEqual([inside.id])
  })
})

describe('findByAlbumId / findByArtistId', () => {
  it('filters songs by album and by artist', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const artistA = await seedArtist(ctx.db)
    const artistB = await seedArtist(ctx.db)
    const albumA = await seedAlbum(ctx.db, { albumArtistId: artistA.id })
    const albumB = await seedAlbum(ctx.db, { albumArtistId: artistB.id })

    const songA = await seedSong(ctx.db, {
      path: '/lib/song-a.mp3',
      albumId: albumA.id,
      artistId: artistA.id,
    })
    const songB = await seedSong(ctx.db, {
      path: '/lib/song-b.mp3',
      albumId: albumB.id,
      artistId: artistB.id,
    })

    const byAlbum = await songDao.findByAlbumId(SEED_USER_ID, albumA.id)
    expect(byAlbum.map((s) => s.id)).toEqual([songA.id])

    const byArtist = await songDao.findByArtistId(SEED_USER_ID, artistB.id)
    expect(byArtist.map((s) => s.id)).toEqual([songB.id])
  })
})

describe('genre subtree', () => {
  it('expands a parent genre to include descendant-tagged songs', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const parent = await seedGenre(ctx.db)
    const child = await seedGenre(ctx.db)
    await seedGenreEdge(ctx.db, parent.id, child.id)

    const song1 = await seedSong(ctx.db, { path: '/lib/tagged.mp3' })
    await seedSongGenre(ctx.db, song1.id, child.id)

    const subtreeIds = await genreDao.findSubtreeIds(parent.id)
    expect(subtreeIds).toEqual(expect.arrayContaining([parent.id, child.id]))

    const songs = await songDao.findByGenreIds(SEED_USER_ID, subtreeIds)
    expect(songs.map((s) => s.id)).toEqual([song1.id])
    expect(songs[0].genres).toEqual([child.name])
  })
})

describe('album songCount and artist numAlbums/numSongs', () => {
  it('counts only in-library, non-missing songs', async () => {
    await seedUser(ctx.db)
    await seedUser(ctx.db, { id: OTHER_USER_ID, username: 'other' })
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    await seedLibrarySource(ctx.db, OTHER_USER_ID, '/other-lib')

    const artistA = await seedArtist(ctx.db)
    const albumOne = await seedAlbum(ctx.db, { albumArtistId: artistA.id })
    const albumTwo = await seedAlbum(ctx.db, { albumArtistId: artistA.id })

    await seedSong(ctx.db, { path: '/lib/1.mp3', albumId: albumOne.id, artistId: artistA.id })
    await seedSong(ctx.db, { path: '/lib/2.mp3', albumId: albumOne.id, artistId: artistA.id })
    await seedSong(ctx.db, {
      path: '/lib/3-missing.mp3',
      albumId: albumOne.id,
      artistId: artistA.id,
      missing: true,
    })
    await seedSong(ctx.db, { path: '/lib/4.mp3', albumId: albumTwo.id, artistId: artistA.id })
    await seedSong(ctx.db, {
      path: '/other-lib/5.mp3',
      albumId: albumTwo.id,
      artistId: artistA.id,
    })

    const albums = await albumDao.findAll(SEED_USER_ID)
    const albumOneRow = albums.find((a) => a.id === albumOne.id)!
    const albumTwoRow = albums.find((a) => a.id === albumTwo.id)!
    expect(albumOneRow.songCount).toBe(2)
    expect(albumTwoRow.songCount).toBe(1)

    const artists = await artistDao.findAll(SEED_USER_ID)
    const artistRow = artists.find((a) => a.id === artistA.id)!
    expect(artistRow.numSongs).toBe(3)
    expect(artistRow.numAlbums).toBe(2)
  })
})

describe('compilation albums and per-track artist', () => {
  it('exposes isCompilation and a per-track artist distinct from the album artist', async () => {
    await seedUser(ctx.db)
    await seedLibrarySource(ctx.db, SEED_USER_ID, '/lib')
    const trackArtist = await seedArtist(ctx.db)
    const compilation = await seedAlbum(ctx.db, {
      albumArtistId: null,
      isCompilation: true,
    })
    await seedSong(ctx.db, {
      path: '/lib/comp-track.mp3',
      albumId: compilation.id,
      artistId: trackArtist.id,
    })

    const albums = await albumDao.findAll(SEED_USER_ID)
    const compilationRow = albums.find((a) => a.id === compilation.id)!
    expect(compilationRow.isCompilation).toBe(true)
    expect(compilationRow.albumArtistName).toBeNull()

    const songs = await songDao.findByAlbumId(SEED_USER_ID, compilation.id)
    expect(songs[0].artistName).toBe(trackArtist.name)
  })
})
