import { useEffect, useState, type ReactNode } from 'react'
import { apiRequest, ApiError, clearAccessToken, getAccessToken } from '../../../shared/services/api.ts'
import { SessionContext, type Session } from '../session.ts'
import '../../../shared/styles/operations.css'

export function SessionBoundary({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!getAccessToken()) { window.location.replace('/auth/login'); return }
    const controller = new AbortController()
    apiRequest<Session>('/auth/me', { signal: controller.signal }).then(setSession).catch((cause: unknown) => {
      if (controller.signal.aborted) return
      if (cause instanceof ApiError && cause.status === 401) { clearAccessToken(); window.location.replace('/auth/login') }
      else setError(true)
    })
    return () => controller.abort()
  }, [attempt])
  if (!session) return <main className="session-feedback" aria-live="polite">{error ? <><p>No pudimos verificar tu sesión.</p><button onClick={() => { setError(false); setAttempt(attempt + 1) }}>Reintentar</button></> : <p>Verificando sesión…</p>}</main>
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
