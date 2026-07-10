import { and, asc, eq, getTableColumns, inArray, sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { album, artist, genre, song, songGenre } from '../db/schema.ts'
import { songInLibrary } from './libraryMembership.ts'

type SongRow = InferSelectModel<typeof song>
type NewSong = InferInsertModel<typeof song>

export type { SongRow, NewSong }

export type SongCatalogRow = SongRow & {
  albumName: string | null
  coverImage: string | null
  artistName: string | null
  genres: string[]
}

const genresSubquery = sql<string[]>`COALESCE(ARRAY(
  SELECT ${genre.name} FROM ${songGenre}
  JOIN ${genre} ON ${genre.id} = ${songGenre.genreId}
  WHERE ${songGenre.songId} = ${song.id}
  ORDER BY ${genre.name}
), '{}')`

export interface ISongDao {
  findById(id: string): Promise<SongRow | undefined>
  findAll(userId: string): Promise<SongCatalogRow[]>
  findByAlbumId(userId: string, albumId: string): Promise<SongCatalogRow[]>
  findByArtistId(userId: string, artistId: string): Promise<SongCatalogRow[]>
  findByGenreIds(userId: string, genreIds: string[]): Promise<SongCatalogRow[]>
}

export class SongDao implements ISongDao {
  constructor(private readonly db: Database) {}

  private baseQuery() {
    return this.db
      .select({
        ...getTableColumns(song),
        albumName: album.name,
        coverImage: album.coverImage,
        artistName: artist.name,
        genres: genresSubquery,
      })
      .from(song)
      .leftJoin(album, eq(song.albumId, album.id))
      .leftJoin(artist, eq(song.artistId, artist.id))
  }

  async findById(id: string): Promise<SongRow | undefined> {
    const rows = await this.db.select().from(song).where(eq(song.id, id))
    return rows[0]
  }

  async findAll(userId: string): Promise<SongCatalogRow[]> {
    return this.baseQuery()
      .where(songInLibrary(userId))
      .orderBy(asc(song.name))
  }

  async findByAlbumId(userId: string, albumId: string): Promise<SongCatalogRow[]> {
    return this.baseQuery()
      .where(and(songInLibrary(userId), eq(song.albumId, albumId)))
      .orderBy(asc(album.name), asc(song.discNumber), asc(song.trackNumber))
  }

  async findByArtistId(userId: string, artistId: string): Promise<SongCatalogRow[]> {
    return this.baseQuery()
      .where(and(songInLibrary(userId), eq(song.artistId, artistId)))
      .orderBy(asc(album.name), asc(song.discNumber), asc(song.trackNumber))
  }

  async findByGenreIds(userId: string, genreIds: string[]): Promise<SongCatalogRow[]> {
    if (genreIds.length === 0) return []
    return this.baseQuery()
      .where(
        and(
          songInLibrary(userId),
          sql`EXISTS (
            SELECT 1 FROM ${songGenre}
            WHERE ${songGenre.songId} = ${song.id}
              AND ${inArray(songGenre.genreId, genreIds)}
          )`,
        ),
      )
      .orderBy(asc(album.name), asc(song.discNumber), asc(song.trackNumber))
  }
}
