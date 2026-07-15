import { Router } from 'express'
import type { AppAdapters } from '../adapterFactory.ts'
import { playbackUpdateSchema } from '@ploot/plootunes-shared'

export function createPlaybackRouter(adapters: AppAdapters): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    res.json(await adapters.playbackAdapter.getPlaybackState(req.userId))
  })

  router.put('/', async (req, res) => {
    const parsed = playbackUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }

    res.json(await adapters.playbackAdapter.updatePlaybackState(req.userId, parsed.data))
  })

  return router
}
