import type { AppDaos } from '../daoFactory.ts'
import type { UserPreferencesRow, UserPreferencesPatch } from '../dao/userPreferencesDao.ts'

const DEFAULT_PREFERENCES: Omit<UserPreferencesRow, 'userId'> = {
  backBehavior: 'previous_track',
  updatedAt: new Date(),
}

export interface IPreferencesService {
  getPreferences(userId: string): Promise<UserPreferencesRow>
  updatePreferences(userId: string, patch: UserPreferencesPatch): Promise<UserPreferencesRow>
}

export class PreferencesService implements IPreferencesService {
  constructor(private readonly daos: AppDaos) {}

  async getPreferences(userId: string): Promise<UserPreferencesRow> {
    const row = await this.daos.userPreferencesDao.findByUserId(userId)
    return row ?? { userId, ...DEFAULT_PREFERENCES }
  }

  async updatePreferences(
    userId: string,
    patch: UserPreferencesPatch,
  ): Promise<UserPreferencesRow> {
    await this.daos.userPreferencesDao.update(userId, patch)
    return this.getPreferences(userId)
  }
}
