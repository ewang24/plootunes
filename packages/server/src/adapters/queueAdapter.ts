import type { AppServices } from '../serviceFactory.ts'
import type { SongCatalogRow } from '../dao/songDao.ts'
import type { QueuedSongsDTO, SongDTO } from '@ploot/plootunes-shared'
import { toSongDto } from './songAdapter.ts'

function toQueuedSongsDto(result: {
  currentlyPlaying: SongCatalogRow | null
  songs: SongCatalogRow[]
  total: number
}): QueuedSongsDTO {
  return {
    currentlyPlaying: result.currentlyPlaying ? toSongDto(result.currentlyPlaying) : null,
    songs: result.songs.map(toSongDto),
    total: result.total,
  }
}

export interface IQueueAdapter {
  getQueuedSongs(userId: string, offset: number, limit: number): Promise<QueuedSongsDTO>
  getCurrentSong(userId: string): Promise<SongDTO | null>
  getNextSong(userId: string): Promise<SongDTO | null>
  getPreviousSong(userId: string): Promise<SongDTO | null>
  queueAllSongsAndPlayFirstSong(userId: string): Promise<SongDTO | null>
  shuffleAllSongsAndPlay(userId: string): Promise<SongDTO | null>
  playRandomAlbum(userId: string): Promise<SongDTO | null>
  playRandomArtist(userId: string): Promise<SongDTO | null>
}

export class QueueAdapter implements IQueueAdapter {
  constructor(private readonly services: AppServices) {}

  async getQueuedSongs(userId: string, offset: number, limit: number): Promise<QueuedSongsDTO> {
    const result = await this.services.queueService.getAllQueuedSongs(userId, offset, limit)
    return toQueuedSongsDto(result)
  }

  async getCurrentSong(userId: string): Promise<SongDTO | null> {
    const song = await this.services.queueService.getCurrentSong(userId)
    return song ? toSongDto(song) : null
  }

  async getNextSong(userId: string): Promise<SongDTO | null> {
    const song = await this.services.queueService.getNextSongInQueue(userId)
    return song ? toSongDto(song) : null
  }

  async getPreviousSong(userId: string): Promise<SongDTO | null> {
    const song = await this.services.queueService.getPreviousSongInQueue(userId)
    return song ? toSongDto(song) : null
  }

  async queueAllSongsAndPlayFirstSong(userId: string): Promise<SongDTO | null> {
    const song = await this.services.queueService.queueAllSongsAndPlayFirstSong(userId)
    return song ? toSongDto(song) : null
  }

  async shuffleAllSongsAndPlay(userId: string): Promise<SongDTO | null> {
    const song = await this.services.queueService.shuffleAllSongsAndPlay(userId)
    return song ? toSongDto(song) : null
  }

  async playRandomAlbum(userId: string): Promise<SongDTO | null> {
    const song = await this.services.queueService.playRandomAlbum(userId)
    return song ? toSongDto(song) : null
  }

  async playRandomArtist(userId: string): Promise<SongDTO | null> {
    const song = await this.services.queueService.playRandomArtist(userId)
    return song ? toSongDto(song) : null
  }
}
