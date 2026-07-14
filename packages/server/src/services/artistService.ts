import type { AppDaos } from '../daoFactory.ts'
import type { ArtistCatalogRow } from '../dao/artistDao.ts'

export interface IArtistService {
  listArtists(userId: string): Promise<ArtistCatalogRow[]>
}

export class ArtistService implements IArtistService {
  constructor(private readonly daos: AppDaos) {}

  async listArtists(userId: string): Promise<ArtistCatalogRow[]> {
    return this.daos.artistDao.findAll(userId)
  }
}
