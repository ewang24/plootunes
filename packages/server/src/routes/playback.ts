import { Router } from 'express'
import type { AppServices } from '../serviceFactory.ts'
import type { PlaybackStateRow } from '../dao/playbackStateDao.ts'
import type { PlaybackStateDTO } from '@ploot/plootunes-shared'
import { playbackUpdateSchema } from '@ploot/plootunes-shared'

function toPlaybackStateDto(row: PlaybackStateRow): PlaybackStateDTO {
  return {
    cursor: row.cursor,
    positionMs: row.positionMs,
    shuffled: row.shuffled,
    repeat: row.repeat,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export function createPlaybackRouter(services: AppServices): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const state = await services.playbackService.getPlaybackState(req.userId)
    res.json(toPlaybackStateDto(state))
  })

  router.put('/', async (req, res) => {
    const parsed = playbackUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }
    const { shuffled, ...rest } = parsed.data

    // Apply cursor/positionMs/repeat first so that, when shuffled is also present,
    // setShuffled's pinned cursor (0) is the one that ends up persisted — not
    // overwritten by a stale cursor from the same request body.
    await services.playbackService.updatePlaybackState(req.userId, rest)
    if (shuffled !== undefined) {
      await services.queueService.setShuffled(req.userId, shuffled)
    }
    const state = await services.playbackService.getPlaybackState(req.userId)
    res.json(toPlaybackStateDto(state))
  })

  return router
}
