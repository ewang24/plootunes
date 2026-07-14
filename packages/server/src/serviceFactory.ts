import type { AppDaos } from './factory.ts'
import { SongService } from './services/songService.ts'
import type { ISongService } from './services/songService.ts'
import { AlbumService } from './services/albumService.ts'
import type { IAlbumService } from './services/albumService.ts'
import { ArtistService } from './services/artistService.ts'
import type { IArtistService } from './services/artistService.ts'
import { GenreService } from './services/genreService.ts'
import type { IGenreService } from './services/genreService.ts'
import { QueueService } from './services/queueService.ts'
import type { IQueueService } from './services/queueService.ts'
import { PlaybackService } from './services/playbackService.ts'
import type { IPlaybackService } from './services/playbackService.ts'

export interface AppServices {
  songService: ISongService
  albumService: IAlbumService
  artistService: IArtistService
  genreService: IGenreService
  queueService: IQueueService
  playbackService: IPlaybackService
}

export function createServices(daos: AppDaos): AppServices {
  return {
    songService: new SongService(daos),
    albumService: new AlbumService(daos),
    artistService: new ArtistService(daos),
    genreService: new GenreService(daos),
    queueService: new QueueService(daos),
    playbackService: new PlaybackService(daos),
  }
}
