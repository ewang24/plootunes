import { eq, sql } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { genre } from '../db/schema.ts'

type GenreRow = InferSelectModel<typeof genre>
type NewGenre = InferInsertModel<typeof genre>

export type { GenreRow, NewGenre }

export interface IGenreDao {
  findAll(): Promise<GenreRow[]>
  findById(id: string): Promise<GenreRow | undefined>
  findSubtreeIds(genreId: string): Promise<string[]>
  upsertByName(name: string): Promise<GenreRow>
}

export class GenreDao implements IGenreDao {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<GenreRow[]> {
    return this.db.select().from(genre)
  }

  async findById(id: string): Promise<GenreRow | undefined> {
    const rows = await this.db.select().from(genre).where(eq(genre.id, id))
    return rows[0]
  }

  async findSubtreeIds(genreId: string): Promise<string[]> {
    const result = await this.db.execute<{ id: string }>(sql`
      WITH RECURSIVE subtree(id) AS (
        SELECT ${genreId}::uuid
        UNION
        SELECT ge.child_id
        FROM genre_edge ge
        JOIN subtree ON subtree.id = ge.parent_id
      )
      SELECT id FROM subtree
    `)
    return result.map((row) => row.id)
  }

  async upsertByName(name: string): Promise<GenreRow> {
    const [row] = await this.db
      .insert(genre)
      .values({ name })
      .onConflictDoUpdate({ target: genre.name, set: { name } })
      .returning()
    return row
  }
}
