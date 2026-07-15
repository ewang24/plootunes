import { Router } from 'express'
import type { Response } from 'express'
import type { AppAdapters } from '../adapterFactory.ts'
import type { AppServices } from '../serviceFactory.ts'
import type { SongDTO } from '@ploot/plootunes-shared'

function sendSong(res: Response, song: SongDTO | null) {
  if (!song) {
    res.sendStatus(204)
    return
  }
  res.json(song)
}

export function createQueueRouter(adapters: AppAdapters, services: AppServices): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const offset = Number(req.query.offset ?? 0)
    const limit = Number(req.query.limit ?? 50)
    res.json(await adapters.queueAdapter.getQueuedSongs(req.userId, offset, limit))
  })

  router.get('/next', async (req, res) => {
    sendSong(res, await adapters.queueAdapter.getNextSong(req.userId))
  })

  router.get('/previous', async (req, res) => {
    sendSong(res, await adapters.queueAdapter.getPreviousSong(req.userId))
  })

  router.post('/play-song', async (req, res) => {
    await services.queueService.playSong(req.userId, req.body.songId)
    res.sendStatus(204)
  })

  router.post('/queue-song', async (req, res) => {
    await services.queueService.queueSong(req.userId, req.body.songId)
    res.sendStatus(204)
  })

  router.post('/transition', async (req, res) => {
    await services.queueService.transitionCurrentSong(req.userId, req.body.songId)
    res.sendStatus(204)
  })

  router.post('/queue-all-and-play', async (req, res) => {
    await services.queueService.queueAllSongsAndPlay(req.userId, req.body.songId)
    res.sendStatus(204)
  })

  router.post('/play-album', async (req, res) => {
    await services.queueService.playAlbum(req.userId, req.body.albumId)
    res.sendStatus(204)
  })

  router.post('/queue-album', async (req, res) => {
    await services.queueService.queueAlbum(req.userId, req.body.albumId)
    res.sendStatus(204)
  })

  router.post('/play-artist', async (req, res) => {
    await services.queueService.playArtist(req.userId, req.body.artistId)
    res.sendStatus(204)
  })

  router.post('/queue-artist', async (req, res) => {
    await services.queueService.queueArtist(req.userId, req.body.artistId)
    res.sendStatus(204)
  })

  router.post('/queue-all', async (req, res) => {
    await services.queueService.queueAllSongs(req.userId)
    res.sendStatus(204)
  })

  router.post('/queue-all-and-play-first', async (req, res) => {
    sendSong(res, await adapters.queueAdapter.queueAllSongsAndPlayFirstSong(req.userId))
  })

  router.post('/shuffle', async (req, res) => {
    await services.queueService.shuffleCurrentQueue(req.userId)
    res.sendStatus(204)
  })

  router.post('/shuffle-all-and-play', async (req, res) => {
    sendSong(res, await adapters.queueAdapter.shuffleAllSongsAndPlay(req.userId))
  })

  router.post('/play-random-album', async (req, res) => {
    sendSong(res, await adapters.queueAdapter.playRandomAlbum(req.userId))
  })

  router.post('/play-random-artist', async (req, res) => {
    sendSong(res, await adapters.queueAdapter.playRandomArtist(req.userId))
  })

  return router
}
