import { useEffect, useState, type ReactNode } from 'react'
import { apiRequest, ApiError, cacheSession, clearAccessToken, getAccessToken, readCachedSession } from '../../../shared/services/api.ts'
import { SessionContext, type Session } from '../session.ts'
import '../../../shared/styles/operations.css'

function isExpired(token: string) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload)) as { exp?: number }
    return typeof exp === 'number' && Date.now() >= exp * 1000
  } catch {
    return false
  }
}

export function SessionBoundary({ children }: { children: ReactNode }) {
  const [token] = useState(getAccessToken)
  const [session, setSession] = useState(() => token && !isExpired(token) ? readCachedSession<Session>(token) : null)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!token || isExpired(token)) {
      if (token === getAccessToken()) clearAccessToken()
      window.location.replace('/auth/login')
      return
    }
    if (session) return
    const controller = new AbortController()
    apiRequest<Session>('/auth/me', { signal: controller.signal }).then(result => {
      if (controller.signal.aborted || token !== getAccessToken()) return
      cacheSession(token, result)
      setSession(result)
    }).catch((cause: unknown) => {
      if (controller.signal.aborted || token !== getAccessToken()) return
      if (cause instanceof ApiError && cause.status === 401) { clearAccessToken(); window.location.replace('/auth/login') }
      else setError(true)
    })
    return () => controller.abort()
  }, [attempt, session, token])
  if (!session) return <main className="session-feedback" aria-live="polite">{error ? <><p>No pudimos verificar tu sesión.</p><button onClick={() => { setError(false); setAttempt(attempt + 1) }}>Reintentar</button></> : <p>Verificando sesión…</p>}</main>
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
