import { Router } from 'express'
import type { AppAdapters } from '../adapterFactory.ts'

export function createSongsRouter(adapters: AppAdapters): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const albumId = req.query.albumId as string | undefined
    const artistId = req.query.artistId as string | undefined
    const genreId = req.query.genreId as string | undefined

    res.json(await adapters.songAdapter.listSongs(req.userId, { albumId, artistId, genreId }))
  })

  return router
}
