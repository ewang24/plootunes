import type { AppDaos } from '../factory.ts'
import type { AlbumCatalogRow } from '../dao/albumDao.ts'

export interface IAlbumService {
  listAlbums(userId: string): Promise<AlbumCatalogRow[]>
  listByArtist(userId: string, artistId: string): Promise<AlbumCatalogRow[]>
}

export class AlbumService implements IAlbumService {
  constructor(private readonly daos: AppDaos) {}

  async listAlbums(userId: string): Promise<AlbumCatalogRow[]> {
    return this.daos.albumDao.findAll(userId)
  }

  async listByArtist(userId: string, artistId: string): Promise<AlbumCatalogRow[]> {
    return this.daos.albumDao.findByArtistId(userId, artistId)
  }
}
