import type { AppServices } from '../serviceFactory.ts'
import type { SongCatalogRow } from '../dao/songDao.ts'
import type { SongDTO } from '@ploot/plootunes-shared'

export function toSongDto(row: SongCatalogRow): SongDTO {
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

export interface ISongAdapter {
  listSongs(
    userId: string,
    filters: { albumId?: string; artistId?: string; genreId?: string },
  ): Promise<SongDTO[]>
}

export class SongAdapter implements ISongAdapter {
  constructor(private readonly services: AppServices) {}

  async listSongs(
    userId: string,
    filters: { albumId?: string; artistId?: string; genreId?: string },
  ): Promise<SongDTO[]> {
    const { albumId, artistId, genreId } = filters

    let songs: SongCatalogRow[]
    if (albumId) {
      songs = await this.services.songService.listByAlbum(userId, albumId)
    } else if (artistId) {
      songs = await this.services.songService.listByArtist(userId, artistId)
    } else if (genreId) {
      songs = await this.services.songService.listByGenre(userId, genreId)
    } else {
      songs = await this.services.songService.listSongs(userId)
    }

    return songs.map(toSongDto)
  }
}
