import { and, eq, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { album, artist, song, userLibrarySource } from '../db/schema.ts'

// Half-open range EXISTS over user_library_source, keyed off the C-collated
// song.path unique btree (see schema.ts cText notes) instead of LIKE, so the
// index is actually used. This is the single place the folder-range logic
// lives — every other membership predicate composes on top of it.
export function pathInUserLibrary(pathCol: SQL | ReturnType<typeof sql>, userId: string): SQL {
  return sql`EXISTS (
    SELECT 1 FROM ${userLibrarySource} uls
    WHERE uls.user_id = ${userId}
      AND ${pathCol} >= uls.folder_path || '/'
      AND ${pathCol} < uls.folder_path || '0'
  )`
}

export function songInLibrary(userId: string): SQL {
  return and(
    eq(song.missing, false),
    eq(song.removed, false),
    pathInUserLibrary(sql`${song.path}`, userId),
  )!
}

export function albumInLibrary(userId: string): SQL {
  return sql`EXISTS (
    SELECT 1 FROM ${song} s
    WHERE s.album_id = ${album.id}
      AND s.missing = false
      AND s.removed = false
      AND ${pathInUserLibrary(sql`s.path`, userId)}
  )`
}

export function artistInLibrary(userId: string): SQL {
  return sql`EXISTS (
    SELECT 1 FROM ${song} s
    WHERE s.artist_id = ${artist.id}
      AND s.missing = false
      AND s.removed = false
      AND ${pathInUserLibrary(sql`s.path`, userId)}
  )`
}
