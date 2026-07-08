import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { userPreferences } from '../db/schema.ts'

type UserPreferencesRow = InferSelectModel<typeof userPreferences>
type NewUserPreferences = InferInsertModel<typeof userPreferences>

export type { UserPreferencesRow, NewUserPreferences }

export interface IUserPreferencesDao {
  findByUserId(userId: string): Promise<UserPreferencesRow | undefined>
  ensureDefault(userId: string): Promise<void>
}

export class UserPreferencesDao implements IUserPreferencesDao {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<UserPreferencesRow | undefined> {
    const rows = await this.db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
    return rows[0]
  }

  async ensureDefault(userId: string): Promise<void> {
    await this.db.insert(userPreferences).values({ userId }).onConflictDoNothing()
  }
}
