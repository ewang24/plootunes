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

export interface IArtistAdapter {
  listArtists(userId: string): Promise<ArtistDTO[]>
}

export class ArtistAdapter implements IArtistAdapter {
  constructor(private readonly services: AppServices) {}

  async listArtists(userId: string): Promise<ArtistDTO[]> {
    const artists = await this.services.artistService.listArtists(userId)
    return artists.map(toArtistDto)
  }
}
