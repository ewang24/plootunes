import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { playEvent } from '../db/schema.ts'

type PlayEventRow = InferSelectModel<typeof playEvent>
type NewPlayEvent = InferInsertModel<typeof playEvent>

export type { PlayEventRow, NewPlayEvent }

export interface IPlayEventDao {
  create(input: { userId: string; songId: string; playedAt: Date; msPlayed: number }): Promise<PlayEventRow>
}

export class PlayEventDao implements IPlayEventDao {
  constructor(private readonly db: Database) {}

  async create(input: {
    userId: string
    songId: string
    playedAt: Date
    msPlayed: number
  }): Promise<PlayEventRow> {
    const rows = await this.db.insert(playEvent).values(input).returning()
    return rows[0]
  }
}
