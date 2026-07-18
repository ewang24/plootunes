import type { AppServices } from './serviceFactory.ts'
import { AlbumAdapter } from './adapters/albumAdapter.ts'
import type { IAlbumAdapter } from './adapters/albumAdapter.ts'
import { ArtistAdapter } from './adapters/artistAdapter.ts'
import type { IArtistAdapter } from './adapters/artistAdapter.ts'
import { SongAdapter } from './adapters/songAdapter.ts'
import type { ISongAdapter } from './adapters/songAdapter.ts'
import { QueueAdapter } from './adapters/queueAdapter.ts'
import type { IQueueAdapter } from './adapters/queueAdapter.ts'
import { LibraryAdapter } from './adapters/libraryAdapter.ts'
import type { ILibraryAdapter } from './adapters/libraryAdapter.ts'
import { PlaybackAdapter } from './adapters/playbackAdapter.ts'
import type { IPlaybackAdapter } from './adapters/playbackAdapter.ts'
import { WidgetAdapter } from './adapters/widgetAdapter.ts'
import type { IWidgetAdapter } from './adapters/widgetAdapter.ts'
import { PreferencesAdapter } from './adapters/preferencesAdapter.ts'
import type { IPreferencesAdapter } from './adapters/preferencesAdapter.ts'
import { ScanAdapter } from './adapters/scanAdapter.ts'
import type { IScanAdapter } from './adapters/scanAdapter.ts'

export interface AppAdapters {
  albumAdapter: IAlbumAdapter
  artistAdapter: IArtistAdapter
  songAdapter: ISongAdapter
  queueAdapter: IQueueAdapter
  libraryAdapter: ILibraryAdapter
  playbackAdapter: IPlaybackAdapter
  widgetAdapter: IWidgetAdapter
  preferencesAdapter: IPreferencesAdapter
  scanAdapter: IScanAdapter
}

export function createAdapters(services: AppServices): AppAdapters {
  return {
    albumAdapter: new AlbumAdapter(services),
    artistAdapter: new ArtistAdapter(services),
    songAdapter: new SongAdapter(services),
    queueAdapter: new QueueAdapter(services),
    libraryAdapter: new LibraryAdapter(services),
    playbackAdapter: new PlaybackAdapter(services),
    widgetAdapter: new WidgetAdapter(services),
    preferencesAdapter: new PreferencesAdapter(services),
    scanAdapter: new ScanAdapter(services),
  }
}
