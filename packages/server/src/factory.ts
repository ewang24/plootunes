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

export interface AppDaos {
  usersDao: IUsersDao
  userPreferencesDao: IUserPreferencesDao
  songDao: ISongDao
  albumDao: IAlbumDao
  artistDao: IArtistDao
  genreDao: IGenreDao
  queueDao: IQueueDao
  playbackStateDao: IPlaybackStateDao
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
  }
}

export function createDaos(): AppDaos {
  return createDaosFromDb(db)
}
