import type { AppServices } from '../serviceFactory.ts'
import type { UserLibrarySourceRow } from '../dao/userLibrarySourceDao.ts'
import type { MissingSongRow } from '../dao/songDao.ts'
import type { LibrarySubscriptionDTO, SongDTO, MissingSongDTO, HardRemoveDTO } from '@ploot/plootunes-shared'
import { toSongDto } from './songAdapter.ts'

function toLibrarySubscriptionDto(row: UserLibrarySourceRow): LibrarySubscriptionDTO {
  return {
    id: row.id,
    folderPath: row.folderPath,
  }
}

function toMissingSongDto(row: MissingSongRow): MissingSongDTO {
  return {
    id: row.id,
    path: row.path,
    name: row.name,
    artistName: row.artistName,
    albumName: row.albumName,
    missingAt: row.missingAt?.toISOString() ?? null,
  }
}

export interface ILibraryAdapter {
  listSubscriptions(userId: string): Promise<LibrarySubscriptionDTO[]>
  subscribe(userId: string, folderPath: string): Promise<LibrarySubscriptionDTO>
  uploadTrack(tempPath: string, originalName: string): Promise<SongDTO>
  listMissing(): Promise<MissingSongDTO[]>
  relink(songId: string, path: string): Promise<SongDTO>
  hardRemove(songId: string): Promise<HardRemoveDTO>
}

export class LibraryAdapter implements ILibraryAdapter {
  constructor(private readonly services: AppServices) {}

  async listSubscriptions(userId: string): Promise<LibrarySubscriptionDTO[]> {
    const rows = await this.services.libraryService.listSubscriptions(userId)
    return rows.map(toLibrarySubscriptionDto)
  }

  async subscribe(userId: string, folderPath: string): Promise<LibrarySubscriptionDTO> {
    const row = await this.services.libraryService.subscribe(userId, folderPath)
    return toLibrarySubscriptionDto(row)
  }

  async uploadTrack(tempPath: string, originalName: string): Promise<SongDTO> {
    const row = await this.services.libraryService.ingestUpload(tempPath, originalName)
    return toSongDto(row)
  }

  async listMissing(): Promise<MissingSongDTO[]> {
    const rows = await this.services.libraryService.listMissing()
    return rows.map(toMissingSongDto)
  }

  async relink(songId: string, path: string): Promise<SongDTO> {
    const row = await this.services.libraryService.relink(songId, path)
    return toSongDto(row)
  }

  async hardRemove(songId: string): Promise<HardRemoveDTO> {
    const outcome = await this.services.libraryService.hardRemove(songId)
    return { songId, outcome }
  }
}
