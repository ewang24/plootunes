import { apiFetch } from './api.ts'

export class StatService {
  static async addSongPlay(songId: string, msPlayed?: number): Promise<void> {
    const res = await apiFetch('/api/stats/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        songId,
        playedAt: new Date().toISOString(),
        msPlayed: msPlayed ?? 0,
      }),
    })
    if (!res.ok) throw new Error(`Failed to record play: ${res.status}`)
  }
}
