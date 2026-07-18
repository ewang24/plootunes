import type { AppServices } from '../serviceFactory.ts'
import type { ScanRunRow } from '../dao/scanRunDao.ts'
import type { ScanRunDTO } from '@ploot/plootunes-shared'

function toScanRunDto(row: ScanRunRow): ScanRunDTO {
  return {
    id: row.id,
    status: row.status,
    startedAt: row.startedAt?.toISOString() ?? null,
    finishedAt: row.finishedAt?.toISOString() ?? null,
    newCount: row.newCount,
    movedCount: row.movedCount,
    missingCount: row.missingCount,
    totalScanned: row.totalScanned,
  }
}

export interface IScanAdapter {
  triggerScan(): Promise<ScanRunDTO>
}

export class ScanAdapter implements IScanAdapter {
  constructor(private readonly services: AppServices) {}

  async triggerScan(): Promise<ScanRunDTO> {
    const row = await this.services.scanService.triggerScan()
    return toScanRunDto(row)
  }
}
