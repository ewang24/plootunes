import type { SongDTO } from '@ploot/plootunes-shared'
import { apiFetch } from './api.ts'

export class SongService {
  static async getSongs(): Promise<SongDTO[]> {
    const res = await apiFetch('/api/songs')
    if (!res.ok) throw new Error(`Failed to fetch songs: ${res.status}`)
    return res.json()
  }

  static async getSongsByAlbum(albumId: string): Promise<SongDTO[]> {
    const res = await apiFetch(`/api/songs?albumId=${albumId}`)
    if (!res.ok) throw new Error(`Failed to fetch songs: ${res.status}`)
    return res.json()
  }

  static async getSongsByArtist(artistId: string): Promise<SongDTO[]> {
    const res = await apiFetch(`/api/songs?artistId=${artistId}`)
    if (!res.ok) throw new Error(`Failed to fetch songs: ${res.status}`)
    return res.json()
  }
}
