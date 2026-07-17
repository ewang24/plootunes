import { and, asc, eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { widget } from '../db/schema.ts'

type WidgetRow = InferSelectModel<typeof widget>
type NewWidget = InferInsertModel<typeof widget>

export type { WidgetRow, NewWidget }

export interface IWidgetDao {
  findByUserId(userId: string): Promise<WidgetRow[]>
  create(input: { userId: string; widgetType: string; displayOrder: number }): Promise<WidgetRow>
  delete(userId: string, id: string): Promise<boolean>
}

export class WidgetDao implements IWidgetDao {
  constructor(private readonly db: Database) {}

  async findByUserId(userId: string): Promise<WidgetRow[]> {
    return this.db
      .select()
      .from(widget)
      .where(eq(widget.userId, userId))
      .orderBy(asc(widget.displayOrder))
  }

  async create(input: {
    userId: string
    widgetType: string
    displayOrder: number
  }): Promise<WidgetRow> {
    const rows = await this.db.insert(widget).values(input).returning()
    return rows[0]
  }

  async delete(userId: string, id: string): Promise<boolean> {
    const rows = await this.db
      .delete(widget)
      .where(and(eq(widget.id, id), eq(widget.userId, userId)))
      .returning()
    return rows.length > 0
  }
}
