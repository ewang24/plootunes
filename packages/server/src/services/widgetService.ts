import type { AppDaos } from '../daoFactory.ts'
import type { WidgetRow } from '../dao/widgetDao.ts'

export interface IWidgetService {
  listWidgets(userId: string): Promise<WidgetRow[]>
  addWidget(userId: string, widgetType: string): Promise<WidgetRow>
  removeWidget(userId: string, id: string): Promise<boolean>
}

export class WidgetService implements IWidgetService {
  constructor(private readonly daos: AppDaos) {}

  async listWidgets(userId: string): Promise<WidgetRow[]> {
    return this.daos.widgetDao.findByUserId(userId)
  }

  async addWidget(userId: string, widgetType: string): Promise<WidgetRow> {
    const existing = await this.daos.widgetDao.findByUserId(userId)
    const displayOrder =
      existing.length === 0 ? 0 : Math.max(...existing.map((w) => w.displayOrder)) + 1
    return this.daos.widgetDao.create({ userId, widgetType, displayOrder })
  }

  async removeWidget(userId: string, id: string): Promise<boolean> {
    return this.daos.widgetDao.delete(userId, id)
  }
}
