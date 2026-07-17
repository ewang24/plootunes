import { Router } from 'express'
import { playEventCreateSchema } from '@ploot/plootunes-shared'
import type { AppServices } from '../serviceFactory.ts'

export function createStatsRouter(services: AppServices): Router {
  const router = Router()

  router.post('/play', async (req, res) => {
    const parsed = playEventCreateSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message })
      return
    }
    await services.statsService.recordPlay(req.userId, parsed.data)
    res.sendStatus(204)
  })

  return router
}
