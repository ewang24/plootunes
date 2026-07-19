export class AudioService {
  static streamUrl(songId: string): string {
    return `/api/audio/${songId}/stream`
  }
}
