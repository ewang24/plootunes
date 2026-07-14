import { Router } from 'express'
import type { AppAdapters } from '../adapterFactory.ts'

export function createArtistsRouter(adapters: AppAdapters): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    res.json(await adapters.artistAdapter.listArtists(req.userId))
  })

  return router
}
