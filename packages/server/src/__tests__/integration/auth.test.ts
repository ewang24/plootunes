import { describe, it, expect, beforeAll, afterAll, beforeEach, inject } from 'vitest'
import { createTestDb, teardownTestDb, resetDb, seedUser, SEED_USER_ID, type TestDb } from './helpers.ts'
import { UsersDao } from '../../dao/usersDao.ts'
import { UserPreferencesDao } from '../../dao/userPreferencesDao.ts'

let ctx: TestDb
let usersDao: UsersDao
let userPreferencesDao: UserPreferencesDao

beforeAll(async () => {
  const dbUrl = inject<string>('dbUrl')
  ctx = createTestDb(dbUrl)
  usersDao = new UsersDao(ctx.db)
  userPreferencesDao = new UserPreferencesDao(ctx.db)
})

afterAll(async () => {
  await teardownTestDb(ctx)
})

beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('UsersDao.upsert', () => {
  it('inserts a new user, then refreshes fields on conflict without duplicating', async () => {
    await usersDao.upsert({
      id: SEED_USER_ID,
      username: 'ploot',
      displayName: 'Emperor Evan',
    })

    await usersDao.upsert({
      id: SEED_USER_ID,
      username: 'ploot2',
      displayName: 'Emperor Evan II',
    })

    const all = await usersDao.findAll()
    expect(all).toHaveLength(1)
    expect(all[0].username).toBe('ploot2')
    expect(all[0].displayName).toBe('Emperor Evan II')
  })
})

describe('UserPreferencesDao.ensureDefault', () => {
  it('seeds exactly one row with the default backBehavior, idempotently', async () => {
    await seedUser(ctx.db)

    await userPreferencesDao.ensureDefault(SEED_USER_ID)
    await userPreferencesDao.ensureDefault(SEED_USER_ID)

    const prefs = await userPreferencesDao.findByUserId(SEED_USER_ID)
    expect(prefs).toBeDefined()
    expect(prefs!.backBehavior).toBe('previous_track')
  })
})
