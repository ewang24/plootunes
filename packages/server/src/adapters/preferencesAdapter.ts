import type { AppServices } from '../serviceFactory.ts'
import type { UserPreferencesRow, UserPreferencesPatch } from '../dao/userPreferencesDao.ts'
import type { UserPreferencesDTO } from '@ploot/plootunes-shared'

function toUserPreferencesDto(row: UserPreferencesRow): UserPreferencesDTO {
  return {
    backBehavior: row.backBehavior,
  }
}

export interface IPreferencesAdapter {
  getPreferences(userId: string): Promise<UserPreferencesDTO>
  updatePreferences(userId: string, patch: UserPreferencesPatch): Promise<UserPreferencesDTO>
}

export class PreferencesAdapter implements IPreferencesAdapter {
  constructor(private readonly services: AppServices) {}

  async getPreferences(userId: string): Promise<UserPreferencesDTO> {
    const row = await this.services.preferencesService.getPreferences(userId)
    return toUserPreferencesDto(row)
  }

  async updatePreferences(
    userId: string,
    patch: UserPreferencesPatch,
  ): Promise<UserPreferencesDTO> {
    const row = await this.services.preferencesService.updatePreferences(userId, patch)
    return toUserPreferencesDto(row)
  }
}
