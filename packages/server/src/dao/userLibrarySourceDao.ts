import { and, asc, eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { userLibrarySource } from '../db/schema.ts'

type UserLibrarySourceRow = InferSelectModel<typeof userLibrarySource>
type NewUserLibrarySource = InferInsertModel<typeof userLibrarySource>

export type { UserLibrarySourceRow, NewUserLibrarySource }

export interface IUserLibrarySourceDao {
  findByUserId(userId: string): Promise<UserLibrarySourceRow[]>
  create(userId: string, folderPath: string): Promise<UserLibrarySourceRow>
  delete(userId: string, id: string): Promise<boolean>
}

export class UserLibrarySourceDao implements IUserLibrarySourceDao {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<UserLibrarySourceRow[]> {
    return this.db
      .select()
      .from(userLibrarySource)
      .where(eq(userLibrarySource.userId, userId))
      .orderBy(asc(userLibrarySource.folderPath))
  }

  async create(userId: string, folderPath: string): Promise<UserLibrarySourceRow> {
    const rows = await this.db
      .insert(userLibrarySource)
      .values({ userId, folderPath })
      .returning()
    return rows[0]
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const rows = await this.db
      .delete(userLibrarySource)
      .where(and(eq(userLibrarySource.id, id), eq(userLibrarySource.userId, userId)))
      .returning()
    return rows.length > 0
  }
}
