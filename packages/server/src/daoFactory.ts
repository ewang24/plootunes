import { db } from './db/index.ts'
import type { Database } from './db/index.ts'
import { UsersDao } from './dao/usersDao.ts'
import type { IUsersDao } from './dao/usersDao.ts'
import { UserPreferencesDao } from './dao/userPreferencesDao.ts'
import type { IUserPreferencesDao } from './dao/userPreferencesDao.ts'
import { SongDao } from './dao/songDao.ts'
import type { ISongDao } from './dao/songDao.ts'
import { AlbumDao } from './dao/albumDao.ts'
import type { IAlbumDao } from './dao/albumDao.ts'
import { ArtistDao } from './dao/artistDao.ts'
import type { IArtistDao } from './dao/artistDao.ts'
import { GenreDao } from './dao/genreDao.ts'
import type { IGenreDao } from './dao/genreDao.ts'
import { QueueDao } from './dao/queueDao.ts'
import type { IQueueDao } from './dao/queueDao.ts'
import { PlaybackStateDao } from './dao/playbackStateDao.ts'
import type { IPlaybackStateDao } from './dao/playbackStateDao.ts'
import { UserLibrarySourceDao } from './dao/userLibrarySourceDao.ts'
import type { IUserLibrarySourceDao } from './dao/userLibrarySourceDao.ts'
import { PlayEventDao } from './dao/playEventDao.ts'
import type { IPlayEventDao } from './dao/playEventDao.ts'
import { WidgetDao } from './dao/widgetDao.ts'
import type { IWidgetDao } from './dao/widgetDao.ts'
import { ScanRunDao } from './dao/scanRunDao.ts'
import type { IScanRunDao } from './dao/scanRunDao.ts'
import { SongGenreDao } from './dao/songGenreDao.ts'
import type { ISongGenreDao } from './dao/songGenreDao.ts'

export interface AppDaos {
  usersDao: IUsersDao
  userPreferencesDao: IUserPreferencesDao
  songDao: ISongDao
  albumDao: IAlbumDao
  artistDao: IArtistDao
  genreDao: IGenreDao
  queueDao: IQueueDao
  playbackStateDao: IPlaybackStateDao
  userLibrarySourceDao: IUserLibrarySourceDao
  playEventDao: IPlayEventDao
  widgetDao: IWidgetDao
  scanRunDao: IScanRunDao
  songGenreDao: ISongGenreDao
}

export function createDaosFromDb(database: Database): AppDaos {
  return {
    usersDao: new UsersDao(database),
    userPreferencesDao: new UserPreferencesDao(database),
    songDao: new SongDao(database),
    albumDao: new AlbumDao(database),
    artistDao: new ArtistDao(database),
    genreDao: new GenreDao(database),
    queueDao: new QueueDao(database),
    playbackStateDao: new PlaybackStateDao(database),
    userLibrarySourceDao: new UserLibrarySourceDao(database),
    playEventDao: new PlayEventDao(database),
    widgetDao: new WidgetDao(database),
    scanRunDao: new ScanRunDao(database),
    songGenreDao: new SongGenreDao(database),
  }
}

export function createDaos(): AppDaos {
  return createDaosFromDb(db)
}
