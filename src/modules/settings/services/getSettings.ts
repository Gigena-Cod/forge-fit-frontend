import { apiRequest } from '../../../shared/services/api.ts'
import type { Settings } from '../models/Settings.ts'

export async function getSettings(): Promise<Settings> {
  return apiRequest<Settings>('/settings')
}
