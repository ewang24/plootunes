// Kept in lockstep with the PG enums in packages/server/src/db/schema.ts.

export const BackBehavior = {
  RESTART_TRACK: 'restart_track',
  PREVIOUS_TRACK: 'previous_track',
} as const

export type BackBehavior = (typeof BackBehavior)[keyof typeof BackBehavior]

export const BACK_BEHAVIORS = Object.values(BackBehavior)

export const RepeatMode = {
  OFF: 'off',
  ALL: 'all',
  ONE: 'one',
} as const

export type RepeatMode = (typeof RepeatMode)[keyof typeof RepeatMode]

export const REPEAT_MODES = Object.values(RepeatMode)

export const ScanStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETE: 'complete',
  FAILED: 'failed',
} as const

export type ScanStatus = (typeof ScanStatus)[keyof typeof ScanStatus]

export const SCAN_STATUSES = Object.values(ScanStatus)
