import { and, asc, eq, getTableColumns, inArray, sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { album, artist, genre, song, songGenre } from '../db/schema.ts'
import { songInLibrary } from './libraryMembership.ts'

type SongRow = InferSelectModel<typeof song>
type NewSong = InferInsertModel<typeof song>

export type { SongRow, NewSong }

export interface SongReconcileRow {
  id: string
  path: string
  mtime: number
  missing: boolean
}

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

export interface MissingSongRow {
  id: string
  path: string
  name: string | null
  artistName: string | null
  albumName: string | null
  missingAt: Date | null
}

export interface SongIngestFields {
  name: string | null
  trackNumber: number | null
  discNumber: number | null
  durationMs: number | null
  artistId: string | null
  albumId: string | null
  contentHash: string
  mtime: number
  path: string
}

export interface ISongDao {
  findById(id: string): Promise<SongRow | undefined>
  findAll(userId: string): Promise<SongCatalogRow[]>
  findByAlbumId(userId: string, albumId: string): Promise<SongCatalogRow[]>
  findByArtistId(userId: string, artistId: string): Promise<SongCatalogRow[]>
  findByGenreIds(userId: string, genreIds: string[]): Promise<SongCatalogRow[]>
  findByIds(ids: string[]): Promise<SongCatalogRow[]>
  findByPath(path: string): Promise<SongRow | undefined>
  relinkByContentHash(contentHash: string, fields: SongIngestFields): Promise<SongRow | undefined>
  findReconcileState(): Promise<SongReconcileRow[]>
  findMissing(): Promise<MissingSongRow[]>
  create(row: NewSong): Promise<SongRow>
  updateIngest(id: string, fields: SongIngestFields): Promise<SongRow>
  markMissing(ids: string[]): Promise<void>
  markRemoved(id: string): Promise<void>
  deleteById(id: string): Promise<void>
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

  async findByIds(ids: string[]): Promise<SongCatalogRow[]> {
    if (ids.length === 0) return []
    return this.baseQuery().where(inArray(song.id, ids))
  }

  async findByPath(path: string): Promise<SongRow | undefined> {
    const rows = await this.db.select().from(song).where(eq(song.path, path))
    return rows[0]
  }

  // Atomically claim one missing row with this content hash and re-point it at the
  // ingested file (a move/rename). FOR UPDATE SKIP LOCKED means two byte-identical
  // files racing in the same scan can't both relink the same row — the second skips
  // the locked row, finds no other missing match, and gets undefined (→ new song).
  async relinkByContentHash(
    contentHash: string,
    fields: SongIngestFields,
  ): Promise<SongRow | undefined> {
    const [relinked] = await this.db
      .update(song)
      .set({ ...fields, missing: false, missingAt: null, updatedAt: new Date() })
      .where(
        eq(
          song.id,
          sql`(SELECT id FROM ${song} WHERE ${song.contentHash} = ${contentHash} AND ${song.missing} = true AND ${song.removed} = false LIMIT 1 FOR UPDATE SKIP LOCKED)`,
        ),
      )
      .returning()
    return relinked
  }

  // Lightweight preload for a scan walk: just enough per-song state (path, mtime,
  // missing) to decide whether a file on disk can skip the hash+parse step.
  async findReconcileState(): Promise<SongReconcileRow[]> {
    return this.db
      .select({ id: song.id, path: song.path, mtime: song.mtime, missing: song.missing })
      .from(song)
  }

  // Rows the scanner couldn't reconcile on its own — surfaced for admin
  // relink/hard-remove. removed rows are tombstones and never resurface here.
  async findMissing(): Promise<MissingSongRow[]> {
    return this.db
      .select({
        id: song.id,
        path: song.path,
        name: song.name,
        artistName: artist.name,
        albumName: album.name,
        missingAt: song.missingAt,
      })
      .from(song)
      .leftJoin(artist, eq(song.artistId, artist.id))
      .leftJoin(album, eq(song.albumId, album.id))
      .where(and(eq(song.missing, true), eq(song.removed, false)))
      .orderBy(asc(song.missingAt))
  }

  async create(row: NewSong): Promise<SongRow> {
    const [created] = await this.db.insert(song).values(row).returning()
    return created
  }

  async updateIngest(id: string, fields: SongIngestFields): Promise<SongRow> {
    const [updated] = await this.db
      .update(song)
      .set({
        ...fields,
        missing: false,
        missingAt: null,
        // A file present at this exact path has returned — even if this row was
        // tombstoned (removed=true), lift the tombstone so it's visible again.
        // No-op for an ordinary row, since those are already removed=false.
        removed: false,
        updatedAt: new Date(),
      })
      .where(eq(song.id, id))
      .returning()
    return updated
  }

  async markMissing(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    await this.db
      .update(song)
      .set({ missing: true, missingAt: new Date() })
      .where(inArray(song.id, ids))
  }

  async markRemoved(id: string): Promise<void> {
    await this.db.update(song).set({ removed: true, updatedAt: new Date() }).where(eq(song.id, id))
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(song).where(eq(song.id, id))
  }
}
