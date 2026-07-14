import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { queue } from '../db/schema.ts'

type QueueRow = InferSelectModel<typeof queue>
type NewQueue = InferInsertModel<typeof queue>

export type { QueueRow, NewQueue }

export interface IQueueDao {
  findByUserId(userId: string): Promise<QueueRow | undefined>
  upsert(userId: string, songIds: string[], playOrder: string[] | null): Promise<void>
}

export class QueueDao implements IQueueDao {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<QueueRow | undefined> {
    const rows = await this.db.select().from(queue).where(eq(queue.userId, userId))
    return rows[0]
  }

  async upsert(userId: string, songIds: string[], playOrder: string[] | null): Promise<void> {
    await this.db
      .insert(queue)
      .values({ userId, songIds, playOrder })
      .onConflictDoUpdate({
        target: queue.userId,
        set: { songIds, playOrder },
      })
  }
}
