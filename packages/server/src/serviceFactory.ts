import type { AppDaos } from './daoFactory.ts'
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
import { LibraryService } from './services/libraryService.ts'
import type { ILibraryService } from './services/libraryService.ts'
import { StatsService } from './services/statsService.ts'
import type { IStatsService } from './services/statsService.ts'
import { WidgetService } from './services/widgetService.ts'
import type { IWidgetService } from './services/widgetService.ts'
import { PreferencesService } from './services/preferencesService.ts'
import type { IPreferencesService } from './services/preferencesService.ts'
import { AudioService } from './services/audioService.ts'
import type { IAudioService } from './services/audioService.ts'
import { ScanService } from './services/scanService.ts'
import type { IScanService } from './services/scanService.ts'

export interface AppServices {
  songService: ISongService
  albumService: IAlbumService
  artistService: IArtistService
  genreService: IGenreService
  queueService: IQueueService
  playbackService: IPlaybackService
  libraryService: ILibraryService
  statsService: IStatsService
  widgetService: IWidgetService
  preferencesService: IPreferencesService
  audioService: IAudioService
  scanService: IScanService
}

export function createServices(daos: AppDaos): AppServices {
  const queueService = new QueueService(daos)
  return {
    songService: new SongService(daos),
    albumService: new AlbumService(daos),
    artistService: new ArtistService(daos),
    genreService: new GenreService(daos),
    queueService,
    playbackService: new PlaybackService(daos, queueService),
    libraryService: new LibraryService(daos),
    statsService: new StatsService(daos),
    widgetService: new WidgetService(daos),
    preferencesService: new PreferencesService(daos),
    audioService: new AudioService(daos),
    scanService: new ScanService(daos),
  }
}
