import { useState } from 'react'
import { updateSettings as updateSettingsService } from '../../services/updateSettings.ts'
import type { Settings, UpdateSettingsPayload } from '../../models/Settings.ts'

export function useUpdateSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function updateSettings(payload: UpdateSettingsPayload): Promise<Settings | null> { setIsLoading(true); setError(null); try { return await updateSettingsService(payload) } catch { setError('No pudimos guardar los cambios.'); return null } finally { setIsLoading(false) } }
  return { updateSettings, isLoading, error }
}
