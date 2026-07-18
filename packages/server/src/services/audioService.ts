import type { AppDaos } from '../daoFactory.ts'

export interface IAudioService {
  getStreamablePath(songId: string): Promise<string | null>
}

export class AudioService implements IAudioService {
  constructor(private readonly daos: AppDaos) {}

  async getStreamablePath(songId: string): Promise<string | null> {
    const row = await this.daos.songDao.findById(songId)
    if (!row || row.missing) return null
    return row.path
  }
}
