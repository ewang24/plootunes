import { Router } from 'express'
import type { AppServices } from '../serviceFactory.ts'
import type { ArtistCatalogRow } from '../dao/artistDao.ts'
import type { ArtistDTO } from '@ploot/plootunes-shared'

function toArtistDto(row: ArtistCatalogRow): ArtistDTO {
  return {
    id: row.id,
    name: row.name,
    biography: row.biography,
    numAlbums: row.numAlbums,
    numSongs: row.numSongs,
  }
}

export function createArtistsRouter(services: AppServices): Router {
  const router = Router()

  router.get('/', async (req, res) => {
    const artists = await services.artistService.listArtists(req.userId)
    res.json(artists.map(toArtistDto))
  })

  return router
}
