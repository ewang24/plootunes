import { z } from 'zod'

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

// Input schemas
