import { db } from './db/index.ts'
import type { Database } from './db/index.ts'
import { UsersDao } from './dao/usersDao.ts'
import type { IUsersDao } from './dao/usersDao.ts'
import { UserPreferencesDao } from './dao/userPreferencesDao.ts'
import type { IUserPreferencesDao } from './dao/userPreferencesDao.ts'

export interface AppDaos {
  usersDao: IUsersDao
  userPreferencesDao: IUserPreferencesDao
}

export function createDaosFromDb(database: Database): AppDaos {
  return {
    usersDao: new UsersDao(database),
    userPreferencesDao: new UserPreferencesDao(database),
  }
}

export function createDaos(): AppDaos {
  return createDaosFromDb(db)
}
