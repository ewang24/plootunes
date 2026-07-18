import { asc, eq, getTableColumns, sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { artist, song } from '../db/schema.ts'
import { artistInLibrary, pathInUserLibrary } from './libraryMembership.ts'

type ArtistRow = InferSelectModel<typeof artist>
type NewArtist = InferInsertModel<typeof artist>

export type { ArtistRow, NewArtist }

export type ArtistCatalogRow = ArtistRow & {
  numSongs: number
  numAlbums: number
}

export interface IArtistDao {
  findById(id: string): Promise<ArtistRow | undefined>
  findAll(userId: string): Promise<ArtistCatalogRow[]>
  findRandomIdInLibrary(userId: string): Promise<string | undefined>
  upsertByName(name: string): Promise<ArtistRow>
}

export class ArtistDao implements IArtistDao {
  constructor(private readonly db: Database) {}

  private baseQuery(userId: string) {
    const inLibrarySongPredicate = sql`
      s.artist_id = ${artist.id}
        AND s.missing = false
        AND s.removed = false
        AND ${pathInUserLibrary(sql`s.path`, userId)}
    `
    const numSongs = sql<number>`(
      SELECT COUNT(*) FROM ${song} s WHERE ${inLibrarySongPredicate}
    )`
    const numAlbums = sql<number>`(
      SELECT COUNT(DISTINCT s.album_id) FROM ${song} s WHERE ${inLibrarySongPredicate}
    )`

    return this.db
      .select({
        ...getTableColumns(artist),
        numSongs,
        numAlbums,
      })
      .from(artist)
  }

  async findById(id: string): Promise<ArtistRow | undefined> {
    const rows = await this.db.select().from(artist).where(eq(artist.id, id))
    return rows[0]
  }

  async findAll(userId: string): Promise<ArtistCatalogRow[]> {
    const rows = await this.baseQuery(userId)
      .where(artistInLibrary(userId))
      .orderBy(asc(artist.name))
    return rows.map((row) => ({
      ...row,
      numSongs: Number(row.numSongs),
      numAlbums: Number(row.numAlbums),
    }))
  }

  async findRandomIdInLibrary(userId: string): Promise<string | undefined> {
    const rows = await this.db
      .select({ id: artist.id })
      .from(artist)
      .where(artistInLibrary(userId))
      .orderBy(sql`random()`)
      .limit(1)
    return rows[0]?.id
  }

  // DO UPDATE (not DO NOTHING) so RETURNING always yields the row, even on conflict.
  async upsertByName(name: string): Promise<ArtistRow> {
    const [row] = await this.db
      .insert(artist)
      .values({ name })
      .onConflictDoUpdate({ target: artist.name, set: { name } })
      .returning()
    return row
  }
}
