import type { AlbumDTO } from '@ploot/plootunes-shared'
import { apiFetch } from './api.ts'

export class AlbumService {
  static async getAlbums(): Promise<AlbumDTO[]> {
    const res = await apiFetch('/api/albums')
    if (!res.ok) throw new Error(`Failed to fetch albums: ${res.status}`)
    return res.json()
  }

  static async getAlbumsByArtist(artistId: string): Promise<AlbumDTO[]> {
    const res = await apiFetch(`/api/albums?artistId=${artistId}`)
    if (!res.ok) throw new Error(`Failed to fetch albums: ${res.status}`)
    return res.json()
  }
}
