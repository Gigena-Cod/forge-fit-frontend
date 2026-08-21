import { useEffect, useState } from 'react'
import { getSettings } from '../../services/getSettings.ts'
import type { Settings } from '../../models/Settings.ts'

export function useGetSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { let isMounted = true; getSettings().then((result) => { if (isMounted) setSettings(result) }).catch(() => { if (isMounted) setError('No pudimos obtener la configuración.') }).finally(() => { if (isMounted) setIsLoading(false) }); return () => { isMounted = false } }, [])
  return { settings, isLoading, error }
}
