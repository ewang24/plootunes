import type { AppDaos } from '../factory.ts'
import type { PlaybackStateRow, PlaybackStatePatch } from '../dao/playbackStateDao.ts'

const DEFAULT_PLAYBACK: Omit<PlaybackStateRow, 'userId'> = {
  cursor: null,
  positionMs: null,
  shuffled: false,
  repeat: 'off',
  updatedAt: new Date(),
}

export type PlaybackUpdatePatch = Omit<PlaybackStatePatch, 'shuffled'>

export interface IPlaybackService {
  getPlaybackState(userId: string): Promise<PlaybackStateRow>
  updatePlaybackState(userId: string, patch: PlaybackUpdatePatch): Promise<PlaybackStateRow>
}

export class PlaybackService implements IPlaybackService {
  constructor(private readonly daos: AppDaos) {}

  async getPlaybackState(userId: string): Promise<PlaybackStateRow> {
    const row = await this.daos.playbackStateDao.findByUserId(userId)
    return row ?? { userId, ...DEFAULT_PLAYBACK }
  }

  async updatePlaybackState(userId: string, patch: PlaybackUpdatePatch): Promise<PlaybackStateRow> {
    await this.daos.playbackStateDao.upsert(userId, patch)
    return this.getPlaybackState(userId)
  }
}
