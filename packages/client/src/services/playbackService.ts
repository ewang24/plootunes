import type { PlaybackStateDTO, RepeatMode } from '@ploot/plootunes-shared'
import { apiFetch } from './api.ts'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export interface PlaybackUpdate {
  cursor?: number | null
  positionMs?: number | null
  shuffled?: boolean
  repeat?: RepeatMode
}

export class PlaybackService {
  static async getPlaybackState(): Promise<PlaybackStateDTO> {
    const res = await apiFetch('/api/playback')
    if (!res.ok) throw new Error(`Failed to fetch playback state: ${res.status}`)
    return res.json()
  }

  static async updatePlaybackState(patch: PlaybackUpdate): Promise<PlaybackStateDTO> {
    const res = await apiFetch('/api/playback', {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(patch),
    })
    if (!res.ok) throw new Error(`Failed to update playback state: ${res.status}`)
    return res.json()
  }
}
