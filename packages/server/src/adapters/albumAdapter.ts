import type { AppServices } from '../serviceFactory.ts'
import type { AlbumSummary } from '../services/albumService.ts'
import type { AlbumDTO } from '@ploot/plootunes-shared'

function toAlbumDto(album: AlbumSummary): AlbumDTO {
  return {
    id: album.id,
    name: album.name,
    albumArtistId: album.albumArtistId,
    isCompilation: album.isCompilation,
    coverImage: album.coverImage,
    year: album.year,
    artistName: album.artistName,
    songCount: album.songCount,
  }
}

export interface IAlbumAdapter {
  listAlbums(userId: string, artistId?: string): Promise<AlbumDTO[]>
}

export class AlbumAdapter implements IAlbumAdapter {
  constructor(private readonly services: AppServices) {}

  async listAlbums(userId: string, artistId?: string): Promise<AlbumDTO[]> {
    const albums = artistId
      ? await this.services.albumService.listByArtist(userId, artistId)
      : await this.services.albumService.listAlbums(userId)
    return albums.map(toAlbumDto)
  }
}
