import { eq } from 'drizzle-orm'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { Database } from '../db/index.ts'
import { scanRun } from '../db/schema.ts'
import type { ScanStatus } from '@ploot/plootunes-shared'

type ScanRunRow = InferSelectModel<typeof scanRun>
type NewScanRun = InferInsertModel<typeof scanRun>

export type { ScanRunRow, NewScanRun }

export interface ScanRunFinishFields {
  status: ScanStatus
  newCount: number
  movedCount: number
  missingCount: number
  totalScanned: number
}

export interface IScanRunDao {
  create(): Promise<ScanRunRow>
  finish(id: string, fields: ScanRunFinishFields): Promise<ScanRunRow>
}

export class ScanRunDao implements IScanRunDao {
  constructor(private readonly db: Database) {}

  // The partial unique index on scan_run(status) WHERE status = 'running' makes this
  // insert fail atomically if another run is already in progress — the resulting
  // unique-violation is the concurrency guard, not application-level locking.
  async create(): Promise<ScanRunRow> {
    const [row] = await this.db
      .insert(scanRun)
      .values({ status: 'running', startedAt: new Date() })
      .returning()
    return row
  }

  async finish(id: string, fields: ScanRunFinishFields): Promise<ScanRunRow> {
    const [row] = await this.db
      .update(scanRun)
      .set({ ...fields, finishedAt: new Date() })
      .where(eq(scanRun.id, id))
      .returning()
    return row
  }
}
