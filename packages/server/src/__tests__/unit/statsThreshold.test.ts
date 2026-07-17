import { describe, it, expect } from 'vitest'
import { meetsPlayThreshold } from '../../services/statsService.ts'

describe('meetsPlayThreshold', () => {
  it('null duration gates at the 4-minute cap', () => {
    expect(meetsPlayThreshold(239_999, null)).toBe(false)
    expect(meetsPlayThreshold(240_000, null)).toBe(true)
  })

  it('long track (half exceeds the cap) gates at the 4-minute cap', () => {
    expect(meetsPlayThreshold(239_999, 600_000)).toBe(false)
    expect(meetsPlayThreshold(240_000, 600_000)).toBe(true)
  })

  it('short track (half is under the cap) gates at half the track', () => {
    expect(meetsPlayThreshold(89_999, 180_000)).toBe(false)
    expect(meetsPlayThreshold(90_000, 180_000)).toBe(true)
  })
})
