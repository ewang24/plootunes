import { Router } from 'express'
import { z } from 'zod'
import type { AppServices } from '../serviceFactory.ts'

export function createAudioRouter(services: AppServices): Router {
  const router = Router()

  router.get('/:songId/stream', async (req, res) => {
    const parsedId = z.string().uuid().safeParse(req.params.songId)
    if (!parsedId.success) {
      res.sendStatus(404)
      return
    }

    const filePath = await services.audioService.getStreamablePath(parsedId.data)
    if (!filePath) {
      res.sendStatus(404)
      return
    }

    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) res.sendStatus(404)
    })
  })

  return router
}
