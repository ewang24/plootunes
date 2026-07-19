import type { ArtistDTO } from '@ploot/plootunes-shared'
import { apiFetch } from './api.ts'

export class ArtistService {
  static async getArtists(): Promise<ArtistDTO[]> {
    const res = await apiFetch('/api/artists')
    if (!res.ok) throw new Error(`Failed to fetch artists: ${res.status}`)
    return res.json()
  }
}
