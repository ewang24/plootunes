import type { AppDaos } from '../daoFactory.ts'
import type { PlaybackStateRow, PlaybackStatePatch } from '../dao/playbackStateDao.ts'
import type { IQueueService } from './queueService.ts'

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
  updateWithShuffle(userId: string, patch: PlaybackStatePatch): Promise<PlaybackStateRow>
}

export class PlaybackService implements IPlaybackService {
  constructor(
    private readonly daos: AppDaos,
    private readonly queueService: IQueueService,
  ) {}

  async getPlaybackState(userId: string): Promise<PlaybackStateRow> {
    const row = await this.daos.playbackStateDao.findByUserId(userId)
    return row ?? { userId, ...DEFAULT_PLAYBACK }
  }

  async updatePlaybackState(userId: string, patch: PlaybackUpdatePatch): Promise<PlaybackStateRow> {
    await this.daos.playbackStateDao.upsert(userId, patch)
    return this.getPlaybackState(userId)
  }

  async updateWithShuffle(userId: string, patch: PlaybackStatePatch): Promise<PlaybackStateRow> {
    const { shuffled, ...rest } = patch

    // Apply cursor/positionMs/repeat first so that, when shuffled is also present,
    // setShuffled's pinned cursor (0) is the one that ends up persisted — not
    // overwritten by a stale cursor from the same request body.
    await this.updatePlaybackState(userId, rest)
    if (shuffled !== undefined) {
      await this.queueService.setShuffled(userId, shuffled)
    }
    return this.getPlaybackState(userId)
  }
}
