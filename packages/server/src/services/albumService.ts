import type { AppDaos } from '../daoFactory.ts'
import type { AlbumCatalogRow } from '../dao/albumDao.ts'

export type AlbumSummary = Omit<AlbumCatalogRow, 'albumArtistName'> & {
  artistName: string
}

function toSummary(row: AlbumCatalogRow): AlbumSummary {
  const { albumArtistName, ...rest } = row
  return {
    ...rest,
    artistName: row.isCompilation ? 'Various Artists' : (albumArtistName ?? 'Unknown Artist'),
  }
}

export interface IAlbumService {
  listAlbums(userId: string): Promise<AlbumSummary[]>
  listByArtist(userId: string, artistId: string): Promise<AlbumSummary[]>
}

export class AlbumService implements IAlbumService {
  constructor(private readonly daos: AppDaos) {}

  async listAlbums(userId: string): Promise<AlbumSummary[]> {
    const rows = await this.daos.albumDao.findAll(userId)
    return rows.map(toSummary)
  }

  async listByArtist(userId: string, artistId: string): Promise<AlbumSummary[]> {
    const rows = await this.daos.albumDao.findByArtistId(userId, artistId)
    return rows.map(toSummary)
  }
}
