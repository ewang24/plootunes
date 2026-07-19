import type { QueuedSongsDTO, SongDTO } from '@ploot/plootunes-shared'
import { apiFetch } from './api.ts'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function postSongOrNull(url: string, body?: Record<string, unknown>): Promise<SongDTO | null> {
  const res = await apiFetch(url, {
    method: 'POST',
    headers: body ? JSON_HEADERS : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Failed to POST ${url}: ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

async function post(url: string, body?: Record<string, unknown>): Promise<void> {
  const res = await apiFetch(url, {
    method: 'POST',
    headers: body ? JSON_HEADERS : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`Failed to POST ${url}: ${res.status}`)
}

async function getSongOrNull(url: string): Promise<SongDTO | null> {
  const res = await apiFetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export class QueueService {
  static async getNextSongInQueue(): Promise<SongDTO | null> {
    return getSongOrNull('/api/queue/next')
  }

  static async getPreviousSongInQueue(): Promise<SongDTO | null> {
    return getSongOrNull('/api/queue/previous')
  }

  static async transitionCurrentSong(songId: string): Promise<void> {
    return post('/api/queue/transition', { songId })
  }

  static async playSong(songId: string): Promise<void> {
    return post('/api/queue/play-song', { songId })
  }

  static async queueSong(songId: string): Promise<void> {
    return post('/api/queue/queue-song', { songId })
  }

  static async playAlbum(albumId: string): Promise<void> {
    return post('/api/queue/play-album', { albumId })
  }

  static async queueAlbum(albumId: string): Promise<void> {
    return post('/api/queue/queue-album', { albumId })
  }

  static async playArtist(artistId: string): Promise<void> {
    return post('/api/queue/play-artist', { artistId })
  }

  static async queueArtist(artistId: string): Promise<void> {
    return post('/api/queue/queue-artist', { artistId })
  }

  static async queueAllSongsAndPlay(songId: string): Promise<void> {
    return post('/api/queue/queue-all-and-play', { songId })
  }

  static async queueAllSongsAndPlayFirstSong(): Promise<SongDTO | null> {
    return postSongOrNull('/api/queue/queue-all-and-play-first')
  }

  static async shuffleCurrentQueue(): Promise<void> {
    return post('/api/queue/shuffle')
  }

  static async shuffleAllSongsAndPlay(): Promise<SongDTO | null> {
    return postSongOrNull('/api/queue/shuffle-all-and-play')
  }

  static async getAllQueuedSongs(): Promise<QueuedSongsDTO> {
    const res = await apiFetch('/api/queue?offset=0&limit=500')
    if (!res.ok) throw new Error(`Failed to fetch queue: ${res.status}`)
    return res.json()
  }

  static async playRandomAlbum(): Promise<SongDTO | null> {
    return postSongOrNull('/api/queue/play-random-album')
  }

  static async playRandomArtist(): Promise<SongDTO | null> {
    return postSongOrNull('/api/queue/play-random-artist')
  }
}
