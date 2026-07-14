import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { playbackState } from '../db/schema.ts'
import type { RepeatMode } from '@ploot/plootunes-shared'

type PlaybackStateRow = InferSelectModel<typeof playbackState>
type NewPlaybackState = InferInsertModel<typeof playbackState>

export type { PlaybackStateRow, NewPlaybackState }

export type PlaybackStatePatch = Partial<{
  cursor: number | null
  positionMs: number | null
  shuffled: boolean
  repeat: RepeatMode
}>

export interface IPlaybackStateDao {
  findByUserId(userId: string): Promise<PlaybackStateRow | undefined>
  upsert(userId: string, patch: PlaybackStatePatch): Promise<void>
}

export class PlaybackStateDao implements IPlaybackStateDao {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<PlaybackStateRow | undefined> {
    const rows = await this.db
      .select()
      .from(playbackState)
      .where(eq(playbackState.userId, userId))
    return rows[0]
  }

  async upsert(userId: string, patch: PlaybackStatePatch): Promise<void> {
    const now = new Date()
    await this.db
      .insert(playbackState)
      .values({ userId, ...patch, updatedAt: now })
      .onConflictDoUpdate({
        target: playbackState.userId,
        set: { ...patch, updatedAt: now },
      })
  }
}
