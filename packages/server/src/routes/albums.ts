import { Router } from 'express'
import type { AppServices } from '../serviceFactory.ts'
import type { AlbumCatalogRow } from '../dao/albumDao.ts'
import type { AlbumDTO } from '@ploot/plootunes-shared'

function toAlbumDto(row: AlbumCatalogRow): AlbumDTO {
  return {
    id: row.id,
    name: row.name,
    albumArtistId: row.albumArtistId,
    isCompilation: row.isCompilation,
    coverImage: row.coverImage,
    year: row.year,
    artistName: row.isCompilation ? 'Various Artists' : (row.albumArtistName ?? 'Unknown Artist'),
    songCount: row.songCount,
  }
}

export function createAlbumsRouter(services: AppServices): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const artistId = req.query.artistId as string | undefined

    const albums = artistId
      ? await services.albumService.listByArtist(req.userId, artistId)
      : await services.albumService.listAlbums(req.userId)

    res.json(albums.map(toAlbumDto))
  })

  return router
}
