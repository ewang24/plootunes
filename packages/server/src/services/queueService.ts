import type { AppDaos } from '../daoFactory.ts'
import type { SongCatalogRow } from '../dao/songDao.ts'
import type { QueueRow } from '../dao/queueDao.ts'
import type { PlaybackStateRow } from '../dao/playbackStateDao.ts'
import type { RepeatMode } from '@ploot/plootunes-shared'

// Pure helpers — no DB access, unit-testable in isolation.

export function shuffleWithPin(
  pinnedId: string | undefined,
  ids: string[],
  // rng must return a float in [0, 1), like Math.random
  rng: () => number = Math.random,
): string[] {
  const pin = pinnedId !== undefined && ids.includes(pinnedId) ? pinnedId : undefined
  const rest = pin !== undefined ? ids.filter((id) => id !== pin) : ids.slice()

  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]]
  }

  return pin !== undefined ? [pin, ...rest] : rest
}

export function nextCursor(
  cursor: number | null,
  len: number,
  repeat: RepeatMode,
): number | undefined {
  if (len === 0) return undefined
  const current = cursor ?? -1

  if (repeat === 'one') return current === -1 ? 0 : current

  const next = current + 1
  if (repeat === 'all') return ((next % len) + len) % len
  return next < len ? next : undefined
}

export function prevCursor(
  cursor: number | null,
  len: number,
  repeat: RepeatMode,
): number | undefined {
  if (len === 0) return undefined
  const current = cursor ?? 0

  if (repeat === 'one') return current

  const prev = current - 1
  if (repeat === 'all') return ((prev % len) + len) % len
  return prev >= 0 ? prev : undefined
}

const EMPTY_QUEUE: QueueRow = { userId: '', songIds: [], playOrder: null }
const DEFAULT_PLAYBACK: PlaybackStateRow = {
  userId: '',
  cursor: null,
  positionMs: null,
  shuffled: false,
  repeat: 'off',
  updatedAt: new Date(),
}

export interface IQueueService {
  playSong(userId: string, songId: string): Promise<void>
  queueSong(userId: string, songId: string): Promise<void>
  playAlbum(userId: string, albumId: string): Promise<void>
  queueAlbum(userId: string, albumId: string): Promise<void>
  playArtist(userId: string, artistId: string): Promise<void>
  queueArtist(userId: string, artistId: string): Promise<void>
  queueAllSongsAndPlay(userId: string, songId: string): Promise<void>
  queueAllSongsAndPlayFirstSong(userId: string): Promise<SongCatalogRow | null>
  queueAllSongs(userId: string): Promise<void>
  shuffleCurrentQueue(userId: string): Promise<void>
  shuffleAllSongsAndPlay(userId: string): Promise<SongCatalogRow | null>
  setShuffled(userId: string, shuffled: boolean): Promise<void>
  transitionCurrentSong(userId: string, songId: string): Promise<void>
  getCurrentSong(userId: string): Promise<SongCatalogRow | null>
  getNextSongInQueue(userId: string): Promise<SongCatalogRow | null>
  getPreviousSongInQueue(userId: string): Promise<SongCatalogRow | null>
  getAllQueuedSongs(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<{ currentlyPlaying: SongCatalogRow | null; songs: SongCatalogRow[]; total: number }>
  playRandomAlbum(userId: string): Promise<SongCatalogRow | null>
  playRandomArtist(userId: string): Promise<SongCatalogRow | null>
}

export class QueueService implements IQueueService {
  constructor(private readonly daos: AppDaos) {}

  private async loadQueue(userId: string): Promise<QueueRow> {
    const row = await this.daos.queueDao.findByUserId(userId)
    return row ?? { ...EMPTY_QUEUE, userId }
  }

  private async loadPlayback(userId: string): Promise<PlaybackStateRow> {
    const row = await this.daos.playbackStateDao.findByUserId(userId)
    return row ?? { ...DEFAULT_PLAYBACK, userId }
  }

  private activeArray(queueRow: QueueRow): string[] {
    return queueRow.playOrder ?? queueRow.songIds
  }

  private async hydrateOne(songId: string | undefined): Promise<SongCatalogRow | null> {
    if (!songId) return null
    const rows = await this.daos.songDao.findByIds([songId])
    return rows[0] ?? null
  }

  private async replaceQueue(userId: string, songIds: string[], cursor: number): Promise<void> {
    await this.daos.queueDao.upsert(userId, songIds, null)
    await this.daos.playbackStateDao.upsert(userId, { cursor, positionMs: 0, shuffled: false })
  }

  private async appendToQueue(userId: string, newIds: string[]): Promise<void> {
    const queueRow = await this.loadQueue(userId)
    const songIds = [...queueRow.songIds, ...newIds]
    const playOrder = queueRow.playOrder ? [...queueRow.playOrder, ...newIds] : null
    await this.daos.queueDao.upsert(userId, songIds, playOrder)
  }

  async playSong(userId: string, songId: string): Promise<void> {
    await this.replaceQueue(userId, [songId], 0)
  }

  async queueSong(userId: string, songId: string): Promise<void> {
    await this.appendToQueue(userId, [songId])
  }

  async playAlbum(userId: string, albumId: string): Promise<void> {
    const songs = await this.daos.songDao.findByAlbumId(userId, albumId)
    if (songs.length === 0) return
    await this.replaceQueue(
      userId,
      songs.map((s) => s.id),
      0,
    )
  }

  async queueAlbum(userId: string, albumId: string): Promise<void> {
    const songs = await this.daos.songDao.findByAlbumId(userId, albumId)
    await this.appendToQueue(
      userId,
      songs.map((s) => s.id),
    )
  }

  async playArtist(userId: string, artistId: string): Promise<void> {
    const songs = await this.daos.songDao.findByArtistId(userId, artistId)
    if (songs.length === 0) return
    await this.replaceQueue(
      userId,
      songs.map((s) => s.id),
      0,
    )
  }

  async queueArtist(userId: string, artistId: string): Promise<void> {
    const songs = await this.daos.songDao.findByArtistId(userId, artistId)
    await this.appendToQueue(
      userId,
      songs.map((s) => s.id),
    )
  }

  async queueAllSongsAndPlay(userId: string, songId: string): Promise<void> {
    const songs = await this.daos.songDao.findAll(userId)
    const songIds = songs.map((s) => s.id)
    const cursor = songIds.indexOf(songId)
    await this.replaceQueue(userId, songIds, cursor === -1 ? 0 : cursor)
  }

  async queueAllSongsAndPlayFirstSong(userId: string): Promise<SongCatalogRow | null> {
    const songs = await this.daos.songDao.findAll(userId)
    if (songs.length === 0) return null
    const songIds = songs.map((s) => s.id)
    await this.replaceQueue(userId, songIds, 0)
    return songs[0]
  }

  async queueAllSongs(userId: string): Promise<void> {
    const songs = await this.daos.songDao.findAll(userId)
    await this.replaceQueue(
      userId,
      songs.map((s) => s.id),
      0,
    )
  }

  async shuffleCurrentQueue(userId: string): Promise<void> {
    await this.setShuffled(userId, true)
  }

  async shuffleAllSongsAndPlay(userId: string): Promise<SongCatalogRow | null> {
    const songs = await this.daos.songDao.findAll(userId)
    const songIds = songs.map((s) => s.id)
    const playOrder = shuffleWithPin(undefined, songIds)
    await this.daos.queueDao.upsert(userId, songIds, playOrder)
    await this.daos.playbackStateDao.upsert(userId, { cursor: 0, positionMs: 0, shuffled: true })
    return this.hydrateOne(playOrder[0])
  }

  async setShuffled(userId: string, shuffled: boolean): Promise<void> {
    const queueRow = await this.loadQueue(userId)
    const playbackRow = await this.loadPlayback(userId)
    const activeArray = this.activeArray(queueRow)
    const currentId =
      playbackRow.cursor !== null ? activeArray[playbackRow.cursor] : undefined

    if (shuffled) {
      const playOrder = shuffleWithPin(currentId, queueRow.songIds)
      await this.daos.queueDao.upsert(userId, queueRow.songIds, playOrder)
      await this.daos.playbackStateDao.upsert(userId, { cursor: 0, shuffled: true })
      return
    }

    const cursor = currentId !== undefined ? queueRow.songIds.indexOf(currentId) : null
    await this.daos.queueDao.upsert(userId, queueRow.songIds, null)
    await this.daos.playbackStateDao.upsert(userId, {
      cursor: cursor === -1 ? null : cursor,
      shuffled: false,
    })
  }

  async transitionCurrentSong(userId: string, songId: string): Promise<void> {
    const queueRow = await this.loadQueue(userId)
    const activeArray = this.activeArray(queueRow)
    const cursor = activeArray.indexOf(songId)
    await this.daos.playbackStateDao.upsert(userId, {
      cursor: cursor === -1 ? null : cursor,
      positionMs: 0,
    })
  }

  async getCurrentSong(userId: string): Promise<SongCatalogRow | null> {
    const queueRow = await this.loadQueue(userId)
    const playbackRow = await this.loadPlayback(userId)
    if (playbackRow.cursor === null) return null
    return this.hydrateOne(this.activeArray(queueRow)[playbackRow.cursor])
  }

  async getNextSongInQueue(userId: string): Promise<SongCatalogRow | null> {
    const queueRow = await this.loadQueue(userId)
    const playbackRow = await this.loadPlayback(userId)
    const activeArray = this.activeArray(queueRow)
    const cursor = nextCursor(playbackRow.cursor, activeArray.length, playbackRow.repeat)
    if (cursor === undefined) return null
    return this.hydrateOne(activeArray[cursor])
  }

  async getPreviousSongInQueue(userId: string): Promise<SongCatalogRow | null> {
    const queueRow = await this.loadQueue(userId)
    const playbackRow = await this.loadPlayback(userId)
    const activeArray = this.activeArray(queueRow)
    const cursor = prevCursor(playbackRow.cursor, activeArray.length, playbackRow.repeat)
    if (cursor === undefined) return null
    return this.hydrateOne(activeArray[cursor])
  }

  async getAllQueuedSongs(
    userId: string,
    offset: number,
    limit: number,
  ): Promise<{ currentlyPlaying: SongCatalogRow | null; songs: SongCatalogRow[]; total: number }> {
    const queueRow = await this.loadQueue(userId)
    const playbackRow = await this.loadPlayback(userId)
    const activeArray = this.activeArray(queueRow)
    const windowIds = activeArray.slice(offset, offset + limit)
    const currentSongId =
      playbackRow.cursor !== null ? activeArray[playbackRow.cursor] : undefined

    const idsToHydrate = Array.from(
      new Set(currentSongId ? [...windowIds, currentSongId] : windowIds),
    )
    const rows = await this.daos.songDao.findByIds(idsToHydrate)
    const rowById = new Map(rows.map((row) => [row.id, row]))

    const songs = windowIds
      .map((id) => rowById.get(id))
      .filter((row): row is SongCatalogRow => row !== undefined)

    return {
      currentlyPlaying: currentSongId ? (rowById.get(currentSongId) ?? null) : null,
      songs,
      total: activeArray.length,
    }
  }

  async playRandomAlbum(userId: string): Promise<SongCatalogRow | null> {
    const albumId = await this.daos.albumDao.findRandomIdInLibrary(userId)
    if (!albumId) return null
    const songs = await this.daos.songDao.findByAlbumId(userId, albumId)
    if (songs.length === 0) return null
    await this.replaceQueue(
      userId,
      songs.map((s) => s.id),
      0,
    )
    return songs[0]
  }

  async playRandomArtist(userId: string): Promise<SongCatalogRow | null> {
    const artistId = await this.daos.artistDao.findRandomIdInLibrary(userId)
    if (!artistId) return null
    const songs = await this.daos.songDao.findByArtistId(userId, artistId)
    if (songs.length === 0) return null
    await this.replaceQueue(
      userId,
      songs.map((s) => s.id),
      0,
    )
    return songs[0]
  }
}
