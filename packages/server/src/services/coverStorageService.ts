import path from 'path'

// Cover storage convention (writer is T7, this file is serve-only config):
// - `COVERS_DIR` (default `<cwd>/covers`) holds the full-resolution cover images and
//   their thumbnails, served statically at `COVERS_PUBLIC_PATH` (default `/covers`).
// - The full cover for an album is stored as `{filename}` and `album.coverImage` holds
//   that filename; the client derives the full-cover URL as `${publicBasePath}/${coverImage}`.
// - The thumbnail is stored alongside it as `{basename}_thumb.webp` (matching primal's
//   `generateCoverThumbnail` output), and the client derives its URL as
//   `${publicBasePath}/${basename}_thumb.webp`.
export interface CoverStorageConfig {
  coversDir: string
  publicBasePath: string
}

export interface CoverStorageConfigProvider {
  getConfig(): CoverStorageConfig
}

export class EnvCoverStorageConfigProvider implements CoverStorageConfigProvider {
  getConfig(): CoverStorageConfig {
    return {
      coversDir: process.env.COVERS_DIR ?? path.join(process.cwd(), 'covers'),
      publicBasePath: process.env.COVERS_PUBLIC_PATH ?? '/covers',
    }
  }
}
