// Raw-DB rails + seed/reset utilities for the integration test tier.
// There are no DAOs/services/routes yet (see factory.ts / serviceFactory.ts scaffolds),
// so these helpers talk to the DB directly via Drizzle. Feature tickets should import
// from this file rather than re-implementing seed/reset logic.
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'
import * as schema from '../../db/schema.ts'
import {
  users,
  artist,
  album,
  song,
  genre,
  genreEdge,
  songGenre,
  userLibrarySource,
  queue,
} from '../../db/schema.ts'
import type { Database } from '../../db/index.ts'

export const SEED_USER_ID = '00000000-0000-0000-0000-000000000001'

export interface TestDb {
  db: Database
  client: postgres.Sql
}

export function createTestDb(dbUrl: string): TestDb {
  const client = postgres(dbUrl, { max: 5 })
  const db = drizzle(client, { schema })
  return { db, client }
}

export async function teardownTestDb(ctx: TestDb) {
  await ctx.client.end()
}

export async function resetDb(db: Database) {
  await db.execute(sql`TRUNCATE TABLE
    play_event,
    song_genre,
    genre_edge,
    widget,
    playback_state,
    queue,
    user_library_source,
    user_preferences,
    users,
    song,
    album,
    artist,
    genre,
    scan_run
    RESTART IDENTITY CASCADE`)
}

let seedCounter = 0
function nextSeedCounter() {
  seedCounter += 1
  return seedCounter
}

export async function seedUser(db: Database, overrides: Partial<typeof users.$inferInsert> = {}) {
  const [row] = await db
    .insert(users)
    .values({ id: SEED_USER_ID, username: 'ploot', displayName: 'Emperor Evan', ...overrides })
    .returning()
  return row
}

export async function seedArtist(
  db: Database,
  overrides: Partial<typeof artist.$inferInsert> = {},
) {
  const n = nextSeedCounter()
  const [row] = await db
    .insert(artist)
    .values({ name: `Artist ${n}`, ...overrides })
    .returning()
  return row
}

export async function seedAlbum(db: Database, overrides: Partial<typeof album.$inferInsert> = {}) {
  const n = nextSeedCounter()
  const [row] = await db
    .insert(album)
    .values({ name: `Album ${n}`, ...overrides })
    .returning()
  return row
}

export async function seedSong(db: Database, overrides: Partial<typeof song.$inferInsert> = {}) {
  const n = nextSeedCounter()
  const [row] = await db
    .insert(song)
    .values({
      path: `/tmp/test-library/song-${n}.mp3`,
      contentHash: n.toString(16).padStart(64, '0'),
      mtime: 1700000000 + n,
      ...overrides,
    })
    .returning()
  return row
}

export async function seedGenre(db: Database, overrides: Partial<typeof genre.$inferInsert> = {}) {
  const n = nextSeedCounter()
  const [row] = await db
    .insert(genre)
    .values({ name: `Genre ${n}`, ...overrides })
    .returning()
  return row
}

export async function seedGenreEdge(db: Database, parentId: string, childId: string) {
  const [row] = await db.insert(genreEdge).values({ parentId, childId }).returning()
  return row
}

export async function seedSongGenre(db: Database, songId: string, genreId: string) {
  const [row] = await db.insert(songGenre).values({ songId, genreId }).returning()
  return row
}

export async function seedLibrarySource(db: Database, userId: string, folderPath: string) {
  const [row] = await db
    .insert(userLibrarySource)
    .values({ userId, folderPath })
    .returning()
  return row
}

export async function seedQueue(
  db: Database,
  userId: string,
  songIds: string[],
  playOrder?: string[],
) {
  const [row] = await db
    .insert(queue)
    .values({ userId, songIds, playOrder })
    .returning()
  return row
}
