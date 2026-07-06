import type { AppDaos } from './factory.ts'

// Empty scaffold — services are wired in from T3 onward.
export interface AppServices {}

export function createServices(_daos: AppDaos): AppServices {
  return {}
}
