import { Router } from 'express'
import type { AppServices } from '../serviceFactory.ts'
import type { SongCatalogRow } from '../dao/songDao.ts'
import type { SongDTO } from '@ploot/plootunes-shared'

function toSongDto(row: SongCatalogRow): SongDTO {
  return {
    id: row.id,
    name: row.name,
    trackNumber: row.trackNumber,
    discNumber: row.discNumber,
    durationMs: row.durationMs,
    albumId: row.albumId,
    albumName: row.albumName,
    coverImage: row.coverImage,
    artistId: row.artistId,
    artistName: row.artistName,
    genres: row.genres,
  }
}

export function createSongsRouter(services: AppServices): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const albumId = req.query.albumId as string | undefined
    const artistId = req.query.artistId as string | undefined
    const genreId = req.query.genreId as string | undefined

    let songs: SongCatalogRow[]
    if (albumId) {
      songs = await services.songService.listByAlbum(req.userId, albumId)
    } else if (artistId) {
      songs = await services.songService.listByArtist(req.userId, artistId)
    } else if (genreId) {
      songs = await services.songService.listByGenre(req.userId, genreId)
    } else {
      songs = await services.songService.listSongs(req.userId)
    }

    res.json(songs.map(toSongDto))
  })

  return router
}
