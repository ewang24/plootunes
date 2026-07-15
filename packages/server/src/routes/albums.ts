import { Router } from 'express'
import type { AppAdapters } from '../adapterFactory.ts'

export function createAlbumsRouter(adapters: AppAdapters): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const artistId = req.query.artistId as string | undefined
    res.json(await adapters.albumAdapter.listAlbums(req.userId, artistId))
  })

  return router
}
