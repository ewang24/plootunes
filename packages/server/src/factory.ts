import { db } from './db/index.ts'
import type { Database } from './db/index.ts'

// Empty scaffold — DAOs are wired in from T3 onward.
export interface AppDaos {}

export function createDaosFromDb(_database: Database): AppDaos {
  return {}
}

export function createDaos(): AppDaos {
  return createDaosFromDb(db)
}
