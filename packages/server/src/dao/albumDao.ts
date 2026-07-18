import { and, asc, eq, getTableColumns, sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { album, artist, song } from '../db/schema.ts'
import { albumInLibrary, pathInUserLibrary } from './libraryMembership.ts'

type AlbumRow = InferSelectModel<typeof album>
type NewAlbum = InferInsertModel<typeof album>

export type { AlbumRow, NewAlbum }

export type AlbumCatalogRow = AlbumRow & {
  albumArtistName: string | null
  songCount: number
}

export interface AlbumUpsertFields {
  isCompilation: boolean
  year: number | null
}

export interface IAlbumDao {
  findById(id: string): Promise<AlbumRow | undefined>
  findAll(userId: string): Promise<AlbumCatalogRow[]>
  findByArtistId(userId: string, artistId: string): Promise<AlbumCatalogRow[]>
  findRandomIdInLibrary(userId: string): Promise<string | undefined>
  upsertByNameAndArtist(
    name: string,
    albumArtistId: string | null,
    fields: AlbumUpsertFields,
  ): Promise<AlbumRow>
  setCoverImage(id: string, filename: string): Promise<void>
}

export class AlbumDao implements IAlbumDao {
  constructor(private readonly db: Database) {}

  private baseQuery(userId: string) {
    const songCount = sql<number>`(
      SELECT COUNT(*) FROM ${song} s
      WHERE s.album_id = ${album.id}
        AND s.missing = false
        AND ${pathInUserLibrary(sql`s.path`, userId)}
    )`

    return this.db
      .select({
        ...getTableColumns(album),
        albumArtistName: artist.name,
        songCount,
      })
      .from(album)
      .leftJoin(artist, eq(album.albumArtistId, artist.id))
  }

  async findById(id: string): Promise<AlbumRow | undefined> {
    const rows = await this.db.select().from(album).where(eq(album.id, id))
    return rows[0]
  }

  async findAll(userId: string): Promise<AlbumCatalogRow[]> {
    const rows = await this.baseQuery(userId)
      .where(albumInLibrary(userId))
      .orderBy(asc(album.name))
    return rows.map((row) => ({ ...row, songCount: Number(row.songCount) }))
  }

  async findByArtistId(userId: string, artistId: string): Promise<AlbumCatalogRow[]> {
    const rows = await this.baseQuery(userId)
      .where(and(albumInLibrary(userId), eq(album.albumArtistId, artistId)))
      .orderBy(asc(album.name))
    return rows.map((row) => ({ ...row, songCount: Number(row.songCount) }))
  }

  async findRandomIdInLibrary(userId: string): Promise<string | undefined> {
    const rows = await this.db
      .select({ id: album.id })
      .from(album)
      .where(albumInLibrary(userId))
      .orderBy(sql`random()`)
      .limit(1)
    return rows[0]?.id
  }

  // DO UPDATE (not DO NOTHING) so RETURNING always yields the row, even on conflict.
  // Targets the (name, albumArtistId) unique constraint, which is NULLS NOT DISTINCT
  // so compilations (albumArtistId null) with the same name also collide and dedup.
  async upsertByNameAndArtist(
    name: string,
    albumArtistId: string | null,
    fields: AlbumUpsertFields,
  ): Promise<AlbumRow> {
    const [row] = await this.db
      .insert(album)
      .values({ name, albumArtistId, ...fields })
      .onConflictDoUpdate({
        target: [album.name, album.albumArtistId],
        set: fields,
      })
      .returning()
    return row
  }

  async setCoverImage(id: string, filename: string): Promise<void> {
    await this.db.update(album).set({ coverImage: filename }).where(eq(album.id, id))
  }
}
