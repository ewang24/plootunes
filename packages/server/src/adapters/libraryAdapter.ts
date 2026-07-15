import type { AppServices } from '../serviceFactory.ts'
import type { UserLibrarySourceRow } from '../dao/userLibrarySourceDao.ts'
import type { LibrarySubscriptionDTO } from '@ploot/plootunes-shared'

function toLibrarySubscriptionDto(row: UserLibrarySourceRow): LibrarySubscriptionDTO {
  return {
    id: row.id,
    folderPath: row.folderPath,
  }
}

export interface ILibraryAdapter {
  listSubscriptions(userId: string): Promise<LibrarySubscriptionDTO[]>
  subscribe(userId: string, folderPath: string): Promise<LibrarySubscriptionDTO>
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
}
