import { apiRequest } from '../../../shared/services/api.ts'
import type { Settings, UpdateSettingsPayload } from '../models/Settings.ts'

export async function updateSettings(payload: UpdateSettingsPayload): Promise<Settings> {
  return apiRequest<Settings>('/settings', { method: 'PUT', body: JSON.stringify(payload) })
}
