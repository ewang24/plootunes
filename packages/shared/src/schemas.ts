import { z } from 'zod'
import { REPEAT_MODES } from './enums.ts'
import type { RepeatMode } from './enums.ts'

// Response schemas (used for API output validation and DTO type derivation)

export const genreResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
})

export type GenreDTO = z.infer<typeof genreResponseSchema>

export const songResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  trackNumber: z.number().int().nullable(),
  discNumber: z.number().int().nullable(),
  durationMs: z.number().int().nullable(),
  albumId: z.string().uuid().nullable(),
  albumName: z.string().nullable(),
  coverImage: z.string().nullable(),
  artistId: z.string().uuid().nullable(),
  artistName: z.string().nullable(),
  genres: z.array(z.string()),
})

export type SongDTO = z.infer<typeof songResponseSchema>

export const albumResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  albumArtistId: z.string().uuid().nullable(),
  isCompilation: z.boolean(),
  coverImage: z.string().nullable(),
  year: z.number().int().nullable(),
  artistName: z.string(),
  songCount: z.number().int(),
})

export type AlbumDTO = z.infer<typeof albumResponseSchema>

export const artistResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  biography: z.string().nullable(),
  numAlbums: z.number().int(),
  numSongs: z.number().int(),
})

export type ArtistDTO = z.infer<typeof artistResponseSchema>

export const playbackStateResponseSchema = z.object({
  cursor: z.number().int().nullable(),
  positionMs: z.number().int().nullable(),
  shuffled: z.boolean(),
  repeat: z.enum(REPEAT_MODES as [RepeatMode, ...RepeatMode[]]),
  updatedAt: z.string(),
})

export type PlaybackStateDTO = z.infer<typeof playbackStateResponseSchema>

export const queuedSongsResponseSchema = z.object({
  currentlyPlaying: songResponseSchema.nullable(),
  songs: z.array(songResponseSchema),
  total: z.number().int(),
})

export type QueuedSongsDTO = z.infer<typeof queuedSongsResponseSchema>

export const librarySubscriptionResponseSchema = z.object({
  id: z.string().uuid(),
  folderPath: z.string(),
})

export type LibrarySubscriptionDTO = z.infer<typeof librarySubscriptionResponseSchema>

// Input schemas

export const playbackUpdateSchema = z.object({
  cursor: z.number().int().nullable().optional(),
  positionMs: z.number().int().nullable().optional(),
  shuffled: z.boolean().optional(),
  repeat: z.enum(REPEAT_MODES as [RepeatMode, ...RepeatMode[]]).optional(),
})

export const librarySubscriptionCreateSchema = z.object({
  folderPath: z.string().min(1),
})

export const playEventCreateSchema = z.object({
  songId: z.string().uuid(),
  playedAt: z.string().datetime({ offset: true }),
  msPlayed: z.number().int().nonnegative(),
})
