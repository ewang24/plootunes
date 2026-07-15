import type { AppServices } from '../serviceFactory.ts'
import type { PlaybackStateRow } from '../dao/playbackStateDao.ts'
import type { PlaybackStatePatch } from '../dao/playbackStateDao.ts'
import type { PlaybackStateDTO } from '@ploot/plootunes-shared'

function toPlaybackStateDto(row: PlaybackStateRow): PlaybackStateDTO {
  return {
    cursor: row.cursor,
    positionMs: row.positionMs,
    shuffled: row.shuffled,
    repeat: row.repeat,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export interface IPlaybackAdapter {
  getPlaybackState(userId: string): Promise<PlaybackStateDTO>
  updatePlaybackState(userId: string, patch: PlaybackStatePatch): Promise<PlaybackStateDTO>
}

export class PlaybackAdapter implements IPlaybackAdapter {
  constructor(private readonly services: AppServices) {}

  async getPlaybackState(userId: string): Promise<PlaybackStateDTO> {
    const state = await this.services.playbackService.getPlaybackState(userId)
    return toPlaybackStateDto(state)
  }

  async updatePlaybackState(userId: string, patch: PlaybackStatePatch): Promise<PlaybackStateDTO> {
    const state = await this.services.playbackService.updateWithShuffle(userId, patch)
    return toPlaybackStateDto(state)
  }
}
