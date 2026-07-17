import type { AppServices } from '../serviceFactory.ts'
import type { WidgetRow } from '../dao/widgetDao.ts'
import type { WidgetDTO } from '@ploot/plootunes-shared'

function toWidgetDto(row: WidgetRow): WidgetDTO {
  return {
    id: row.id,
    widgetType: row.widgetType,
    displayOrder: row.displayOrder,
  }
}

export interface IWidgetAdapter {
  listWidgets(userId: string): Promise<WidgetDTO[]>
  addWidget(userId: string, widgetType: string): Promise<WidgetDTO>
}

export class WidgetAdapter implements IWidgetAdapter {
  constructor(private readonly services: AppServices) {}

  async listWidgets(userId: string): Promise<WidgetDTO[]> {
    const rows = await this.services.widgetService.listWidgets(userId)
    return rows.map(toWidgetDto)
  }

  async addWidget(userId: string, widgetType: string): Promise<WidgetDTO> {
    const row = await this.services.widgetService.addWidget(userId, widgetType)
    return toWidgetDto(row)
  }
}
