import { Router } from 'express'
import type { Response } from 'express'
import type { AppServices } from '../serviceFactory.ts'
import type { SongCatalogRow } from '../dao/songDao.ts'
import type { QueuedSongsDTO } from '@ploot/plootunes-shared'
import { toSongDto } from './songs.ts'

function sendSong(res: Response, song: SongCatalogRow | null) {
  if (!song) {
    res.sendStatus(204)
    return
  }
  res.json(toSongDto(song))
}

export function createQueueRouter(services: AppServices): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const offset = Number(req.query.offset ?? 0)
    const limit = Number(req.query.limit ?? 50)
    const { currentlyPlaying, songs, total } = await services.queueService.getAllQueuedSongs(
      req.userId,
      offset,
      limit,
    )
    const dto: QueuedSongsDTO = {
      currentlyPlaying: currentlyPlaying ? toSongDto(currentlyPlaying) : null,
      songs: songs.map(toSongDto),
      total,
    }
    res.json(dto)
  })

  router.get('/next', async (req, res) => {
    const song = await services.queueService.getNextSongInQueue(req.userId)
    sendSong(res, song)
  })

  router.get('/previous', async (req, res) => {
    const song = await services.queueService.getPreviousSongInQueue(req.userId)
    sendSong(res, song)
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
    const song = await services.queueService.queueAllSongsAndPlayFirstSong(req.userId)
    sendSong(res, song)
  })

  router.post('/shuffle', async (req, res) => {
    await services.queueService.shuffleCurrentQueue(req.userId)
    res.sendStatus(204)
  })

  router.post('/shuffle-all-and-play', async (req, res) => {
    const song = await services.queueService.shuffleAllSongsAndPlay(req.userId)
    sendSong(res, song)
  })

  router.post('/play-random-album', async (req, res) => {
    const song = await services.queueService.playRandomAlbum(req.userId)
    sendSong(res, song)
  })

  router.post('/play-random-artist', async (req, res) => {
    const song = await services.queueService.playRandomArtist(req.userId)
    sendSong(res, song)
  })

  return router
}
