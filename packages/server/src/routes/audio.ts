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

    // sendFile streams the file and transparently handles HTTP Range requests
    // (sets Accept-Ranges and responds 206 Partial Content for a `Range:` header),
    // which is what lets the browser <audio> element seek. Do not swap this for a
    // raw fs stream without reimplementing range handling.
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) res.sendStatus(404)
    })
  })

  return router
}
