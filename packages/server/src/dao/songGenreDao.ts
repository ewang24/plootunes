import { eq } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { songGenre } from '../db/schema.ts'

export interface ISongGenreDao {
  setForSong(songId: string, genreIds: string[]): Promise<void>
}

export class SongGenreDao implements ISongGenreDao {
  constructor(private readonly db: Database) {}

  async setForSong(songId: string, genreIds: string[]): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.delete(songGenre).where(eq(songGenre.songId, songId))
      if (genreIds.length === 0) return
      await tx.insert(songGenre).values(genreIds.map((genreId) => ({ songId, genreId })))
    })
  }
}
