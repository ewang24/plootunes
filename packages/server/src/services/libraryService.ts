import type { AppDaos } from '../factory.ts'
import type { UserLibrarySourceRow } from '../dao/userLibrarySourceDao.ts'

// Strip trailing slashes so '/lib/' and '/lib' are treated as the same subscription.
function normalizeFolderPath(p: string): string {
  return p.replace(/\/+$/, '')
}

// Separator-aware overlap check — a === b, a is a parent of b, or b is a parent of a.
// The '+ /' boundary means '/lib' is NOT a parent of '/library' (same family as the
// T4 SQL helper pathInUserLibrary in dao/libraryMembership.ts).
function foldersOverlap(a: string, b: string): boolean {
  return a === b || a.startsWith(b + '/') || b.startsWith(a + '/')
}

export class SubscriptionOverlapError extends Error {}

export interface ILibraryService {
  listSubscriptions(userId: string): Promise<UserLibrarySourceRow[]>
  subscribe(userId: string, folderPath: string): Promise<UserLibrarySourceRow>
  unsubscribe(userId: string, id: string): Promise<boolean>
}

export class LibraryService implements ILibraryService {
  constructor(private readonly daos: AppDaos) {}

  async listSubscriptions(userId: string): Promise<UserLibrarySourceRow[]> {
    return this.daos.userLibrarySourceDao.findByUserId(userId)
  }

  async subscribe(userId: string, folderPath: string): Promise<UserLibrarySourceRow> {
    const normalized = normalizeFolderPath(folderPath)
    const existing = await this.daos.userLibrarySourceDao.findByUserId(userId)
    if (existing.some((row) => foldersOverlap(normalized, row.folderPath))) {
      throw new SubscriptionOverlapError(
        `Folder "${normalized}" overlaps with an existing subscription`,
      )
    }
    return this.daos.userLibrarySourceDao.create(userId, normalized)
  }

  async unsubscribe(userId: string, id: string): Promise<boolean> {
    return this.daos.userLibrarySourceDao.delete(userId, id)
  }
}
