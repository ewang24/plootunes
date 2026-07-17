import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { userPreferences } from '../db/schema.ts'
import type { BackBehavior } from '@ploot/plootunes-shared'

type UserPreferencesRow = InferSelectModel<typeof userPreferences>
type NewUserPreferences = InferInsertModel<typeof userPreferences>

export type { UserPreferencesRow, NewUserPreferences }

export type UserPreferencesPatch = Partial<{
  backBehavior: BackBehavior
}>

export interface IUserPreferencesDao {
  findByUserId(userId: string): Promise<UserPreferencesRow | undefined>
  ensureDefault(userId: string): Promise<void>
  update(userId: string, patch: UserPreferencesPatch): Promise<void>
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

  async update(userId: string, patch: UserPreferencesPatch): Promise<void> {
    const now = new Date()
    await this.db
      .insert(userPreferences)
      .values({ userId, ...patch, updatedAt: now })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...patch, updatedAt: now },
      })
  }
}
