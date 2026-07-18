import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  varchar,
  timestamp,
  customType,
  primaryKey,
  unique,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// C-collated text: byte-ordinal comparison so a UNIQUE btree over song.path doubles
// as the membership-range index (R3/pltun-10). Drizzle has no first-class collation
// API for columns, so we render it through a custom type's dataType().
const cText = customType<{ data: string }>({
  dataType() {
    return 'text collate "C"'
  },
})

// Enums (kept in lockstep with packages/shared/src/enums.ts)
export const backBehaviorEnum = pgEnum('back_behavior', ['restart_track', 'previous_track'])
export const repeatModeEnum = pgEnum('repeat_mode', ['off', 'all', 'one'])
export const scanStatusEnum = pgEnum('scan_status', ['pending', 'running', 'complete', 'failed'])

// ---------------------------------------------------------------------------
// Canonical catalog (shared, file-derived — no userId)
// ---------------------------------------------------------------------------

export const artist = pgTable('artist', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  biography: text('biography'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const album = pgTable(
  'album',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    albumArtistId: uuid('album_artist_id').references(() => artist.id, { onDelete: 'restrict' }),
    isCompilation: boolean('is_compilation').notNull().default(false),
    coverImage: text('cover_image'),
    year: integer('year'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // NULLS NOT DISTINCT so two compilations (albumArtistId NULL) with the same name
  // still collide and dedup — the scanner-dedup key must hold for compilations too.
  (t) => [unique('album_name_album_artist_unique').on(t.name, t.albumArtistId).nullsNotDistinct()],
)

export const song = pgTable(
  'song',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    path: cText('path').notNull().unique(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    mtime: bigint('mtime', { mode: 'number' }).notNull(),
    missing: boolean('missing').notNull().default(false),
    missingAt: timestamp('missing_at', { withTimezone: true }),
    name: text('name'),
    trackNumber: integer('track_number'),
    discNumber: integer('disc_number'),
    durationMs: integer('duration_ms'),
    artistId: uuid('artist_id').references(() => artist.id, { onDelete: 'restrict' }),
    albumId: uuid('album_id').references(() => album.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('song_content_hash_idx').on(t.contentHash)],
)

export const genre = pgTable('genre', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
})

// Full DAG — multi-parent enabled (deliberately no UNIQUE(childId)); cycle guard is
// app-level at edge-assignment time (T7), not a DB constraint.
export const genreEdge = pgTable(
  'genre_edge',
  {
    parentId: uuid('parent_id')
      .notNull()
      .references(() => genre.id, { onDelete: 'cascade' }),
    childId: uuid('child_id')
      .notNull()
      .references(() => genre.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.parentId, t.childId] })],
)

export const songGenre = pgTable(
  'song_genre',
  {
    songId: uuid('song_id')
      .notNull()
      .references(() => song.id, { onDelete: 'cascade' }),
    genreId: uuid('genre_id')
      .notNull()
      .references(() => genre.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.songId, t.genreId] })],
)

// ---------------------------------------------------------------------------
// Per-user overlays
// ---------------------------------------------------------------------------

export const users = pgTable('users', {
  id: text('id').primaryKey(), // OIDC sub
  username: text('username').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const userPreferences = pgTable('user_preferences', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  backBehavior: backBehaviorEnum('back_behavior').notNull().default('previous_track'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const userLibrarySource = pgTable(
  'user_library_source',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    folderPath: text('folder_path').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('user_library_source_user_folder_unique').on(t.userId, t.folderPath)],
)

export const playEvent = pgTable(
  'play_event',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // RESTRICT / tombstone — a song with play history is retained so hard-remove
    // can never destroy listening history (R4/pltun-11).
    songId: uuid('song_id')
      .notNull()
      .references(() => song.id, { onDelete: 'restrict' }),
    playedAt: timestamp('played_at', { withTimezone: true }).notNull(),
    msPlayed: integer('ms_played').notNull(),
  },
  (t) => [
    index('play_event_user_played_at_idx').on(t.userId, t.playedAt),
    index('play_event_user_song_idx').on(t.userId, t.songId),
  ],
)

export const queue = pgTable('queue', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  songIds: uuid('song_ids')
    .array()
    .notNull()
    .default(sql`'{}'::uuid[]`),
  playOrder: uuid('play_order').array(), // NULL = not shuffled
})

export const playbackState = pgTable('playback_state', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  cursor: integer('cursor'),
  positionMs: integer('position_ms'),
  shuffled: boolean('shuffled').notNull().default(false),
  repeat: repeatModeEnum('repeat').notNull().default('off'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const widget = pgTable('widget', {
  id: uuid('id').defaultRandom().primaryKey(),
  widgetType: text('widget_type').notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
})

// ---------------------------------------------------------------------------
// Operational
// ---------------------------------------------------------------------------

export const scanRun = pgTable(
  'scan_run',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    status: scanStatusEnum('status').notNull().default('pending'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    newCount: integer('new_count').notNull().default(0),
    movedCount: integer('moved_count').notNull().default(0),
    missingCount: integer('missing_count').notNull().default(0),
    totalScanned: integer('total_scanned').notNull().default(0),
    // Per-file ingest errors (and, on a failed run, the run-level error) recorded
    // for post-scan diagnostics — a completed run can still carry file-level messages.
    messages: text('messages').array().notNull().default([]),
  },
  // At most one running scan at a time — the DB is the source of truth for this
  // invariant so a concurrent scan trigger fails atomically instead of racing.
  (t) => [
    uniqueIndex('scan_run_single_running_idx')
      .on(t.status)
      .where(sql`status = 'running'`),
  ],
)
