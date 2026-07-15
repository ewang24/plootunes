import type { AppDaos } from '../daoFactory.ts'
import type { PlayEventRow } from '../dao/playEventDao.ts'

// Last.fm scrobble threshold: at least 50% of the track, capped at 4 minutes.
const LASTFM_MAX_MS = 4 * 60 * 1000

export function meetsPlayThreshold(msPlayed: number, durationMs: number | null): boolean {
  const halfTrack = durationMs != null ? durationMs / 2 : Infinity
  return msPlayed >= Math.min(halfTrack, LASTFM_MAX_MS)
}

export interface RecordPlayInput {
  songId: string
  playedAt: string
  msPlayed: number
}

export interface IStatsService {
  recordPlay(userId: string, input: RecordPlayInput): Promise<PlayEventRow | null>
}

export class StatsService implements IStatsService {
  constructor(private readonly daos: AppDaos) {}

  async recordPlay(userId: string, input: RecordPlayInput): Promise<PlayEventRow | null> {
    const song = await this.daos.songDao.findById(input.songId)
    if (!song) return null
    if (!meetsPlayThreshold(input.msPlayed, song.durationMs)) return null

    return this.daos.playEventDao.create({
      userId,
      songId: input.songId,
      playedAt: new Date(input.playedAt),
      msPlayed: input.msPlayed,
    })
  }
}
