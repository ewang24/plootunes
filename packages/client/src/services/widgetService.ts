import type { WidgetDTO } from '@ploot/plootunes-shared'
import { apiFetch } from './api.ts'

export class WidgetService {
  static async getWidgets(): Promise<WidgetDTO[]> {
    const res = await apiFetch('/api/widgets')
    if (!res.ok) throw new Error(`Failed to fetch widgets: ${res.status}`)
    return res.json()
  }

  static async addWidget(widgetType: string): Promise<WidgetDTO> {
    const res = await apiFetch('/api/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgetType }),
    })
    if (!res.ok) throw new Error(`Failed to add widget: ${res.status}`)
    return res.json()
  }

  static async removeWidget(id: string): Promise<void> {
    const res = await apiFetch(`/api/widgets/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`Failed to remove widget: ${res.status}`)
  }
}
