import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { users } from '../db/schema.ts'

type UserRow = InferSelectModel<typeof users>
type NewUser = InferInsertModel<typeof users>

export type { UserRow, NewUser }

export interface IUsersDao {
  findAll(): Promise<UserRow[]>
  findById(id: string): Promise<UserRow | undefined>
  create(data: NewUser): Promise<UserRow>
  upsert(data: NewUser): Promise<UserRow>
}

export class UsersDao implements IUsersDao {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<UserRow[]> {
    return this.db.select().from(users)
  }

  async findById(id: string): Promise<UserRow | undefined> {
    const rows = await this.db.select().from(users).where(eq(users.id, id))
    return rows[0]
  }

  async create(data: NewUser): Promise<UserRow> {
    const rows = await this.db.insert(users).values(data).returning()
    return rows[0]
  }

  async upsert(data: NewUser): Promise<UserRow> {
    const rows = await this.db
      .insert(users)
      .values(data)
      .onConflictDoUpdate({
        target: users.id,
        set: { username: data.username, displayName: data.displayName },
      })
      .returning()
    return rows[0]
  }
}
