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

export interface AppAdapters {
  albumAdapter: IAlbumAdapter
  artistAdapter: IArtistAdapter
  songAdapter: ISongAdapter
  queueAdapter: IQueueAdapter
  libraryAdapter: ILibraryAdapter
  playbackAdapter: IPlaybackAdapter
}

export function createAdapters(services: AppServices): AppAdapters {
  return {
    albumAdapter: new AlbumAdapter(services),
    artistAdapter: new ArtistAdapter(services),
    songAdapter: new SongAdapter(services),
    queueAdapter: new QueueAdapter(services),
    libraryAdapter: new LibraryAdapter(services),
    playbackAdapter: new PlaybackAdapter(services),
  }
}
