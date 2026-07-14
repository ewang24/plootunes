import type { AppDaos } from '../daoFactory.ts'
import type { SongCatalogRow } from '../dao/songDao.ts'

export interface ISongService {
  listSongs(userId: string): Promise<SongCatalogRow[]>
  listByAlbum(userId: string, albumId: string): Promise<SongCatalogRow[]>
  listByArtist(userId: string, artistId: string): Promise<SongCatalogRow[]>
  listByGenre(userId: string, genreId: string): Promise<SongCatalogRow[]>
}

export class SongService implements ISongService {
  constructor(private readonly daos: AppDaos) {}

  async listSongs(userId: string): Promise<SongCatalogRow[]> {
    return this.daos.songDao.findAll(userId)
  }

  async listByAlbum(userId: string, albumId: string): Promise<SongCatalogRow[]> {
    return this.daos.songDao.findByAlbumId(userId, albumId)
  }

  async listByArtist(userId: string, artistId: string): Promise<SongCatalogRow[]> {
    return this.daos.songDao.findByArtistId(userId, artistId)
  }

  async listByGenre(userId: string, genreId: string): Promise<SongCatalogRow[]> {
    const genreIds = await this.daos.genreDao.findSubtreeIds(genreId)
    return this.daos.songDao.findByGenreIds(userId, genreIds)
  }
}
