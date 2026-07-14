import { describe, it, expect } from 'vitest'
import { shuffleWithPin, nextCursor, prevCursor } from '../../services/queueService.ts'

describe('shuffleWithPin', () => {
  it('pins the given id at index 0 and shuffles the rest', () => {
    const ids = ['a', 'b', 'c', 'd']
    // Deterministic "rng" so the shuffle is reproducible in the assertion.
    const rng = () => 0
    const result = shuffleWithPin('c', ids, rng)
    expect(result[0]).toBe('c')
    expect(result).toHaveLength(4)
    expect(new Set(result)).toEqual(new Set(ids))
  })

  it('fully shuffles with no pin bias when pinnedId is undefined', () => {
    const ids = ['a', 'b', 'c']
    const result = shuffleWithPin(undefined, ids, () => 0)
    expect(result).toHaveLength(3)
    expect(new Set(result)).toEqual(new Set(ids))
  })

  it('ignores a pinnedId that is not present in ids (falls back to full shuffle)', () => {
    const ids = ['a', 'b', 'c']
    const result = shuffleWithPin('zzz', ids, () => 0)
    expect(result).toHaveLength(3)
    expect(new Set(result)).toEqual(new Set(ids))
  })

  it('is a no-op shape for a single-element array', () => {
    const result = shuffleWithPin('a', ['a'], () => 0)
    expect(result).toEqual(['a'])
  })
})

describe('nextCursor', () => {
  it('returns undefined for an empty queue', () => {
    expect(nextCursor(0, 0, 'off')).toBeUndefined()
  })

  it('repeat off: advances by one, undefined past the end', () => {
    expect(nextCursor(0, 3, 'off')).toBe(1)
    expect(nextCursor(1, 3, 'off')).toBe(2)
    expect(nextCursor(2, 3, 'off')).toBeUndefined()
  })

  it('repeat all: wraps around to 0 at the end', () => {
    expect(nextCursor(0, 3, 'all')).toBe(1)
    expect(nextCursor(2, 3, 'all')).toBe(0)
  })

  it('repeat one: stays on the same index', () => {
    expect(nextCursor(0, 3, 'one')).toBe(0)
    expect(nextCursor(2, 3, 'one')).toBe(2)
  })

  it('treats a null cursor as "before the start"', () => {
    expect(nextCursor(null, 3, 'off')).toBe(0)
    expect(nextCursor(null, 3, 'all')).toBe(0)
    expect(nextCursor(null, 3, 'one')).toBe(0)
  })
})

describe('prevCursor', () => {
  it('returns undefined for an empty queue', () => {
    expect(prevCursor(0, 0, 'off')).toBeUndefined()
  })

  it('repeat off: steps back by one, undefined before the start', () => {
    expect(prevCursor(2, 3, 'off')).toBe(1)
    expect(prevCursor(1, 3, 'off')).toBe(0)
    expect(prevCursor(0, 3, 'off')).toBeUndefined()
  })

  it('repeat all: wraps around to the end at the start', () => {
    expect(prevCursor(1, 3, 'all')).toBe(0)
    expect(prevCursor(0, 3, 'all')).toBe(2)
  })

  it('repeat one: stays on the same index', () => {
    expect(prevCursor(2, 3, 'one')).toBe(2)
    expect(prevCursor(0, 3, 'one')).toBe(0)
  })

  it('treats a null cursor as index 0', () => {
    expect(prevCursor(null, 3, 'off')).toBeUndefined()
    expect(prevCursor(null, 3, 'all')).toBe(2)
  })
})
