import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import { eq } from 'drizzle-orm'
import {
  createTestDb,
  teardownTestDb,
  resetDb,
  seedUser,
  seedSong,
  SEED_USER_ID,
  type TestDb,
} from './helpers.ts'
import { users, song } from '../../db/schema.ts'

let ctx: TestDb

beforeAll(async () => {
  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('integration test harness', () => {
  it('seeds a user and reads it back', async () => {
    await seedUser(ctx.db)

    const rows = await ctx.db.select().from(users).where(eq(users.id, SEED_USER_ID))
    expect(rows).toHaveLength(1)
    expect(rows[0].username).toBe('ploot')
  })

  it('resets the database between tests', async () => {
    await seedSong(ctx.db)

    const before = await ctx.db.select().from(song)
    expect(before).toHaveLength(1)

    await resetDb(ctx.db)

    const after = await ctx.db.select().from(song)
    expect(after).toHaveLength(0)
  })
})
