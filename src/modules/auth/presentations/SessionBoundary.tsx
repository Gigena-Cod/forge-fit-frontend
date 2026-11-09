import { useEffect, useState, type ReactNode } from 'react'
import { observeSessionChanges } from '../../../shared/services/api.ts'
import { SessionContext, verifySession, type Session } from '../session.ts'
import '../../../shared/styles/operations.css'

export function SessionBoundary({ children, initialSession }: { children: ReactNode; initialSession: Session | null }) {
  const [session, setSession] = useState(initialSession)
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const stopObserving = observeSessionChanges(() => {
      controller.abort()
      window.location.replace('/auth/login')
    })
    if (!initialSession) void verifySession(controller.signal).then(result => {
      if (!controller.signal.aborted) setSession(result)
    }).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => {
      controller.abort()
      stopObserving()
    }
  }, [attempt, initialSession])

  if (!session) return <main className="session-feedback" aria-busy={!error}>
    <h1>ForgeFit</h1>
    {error ? <><p role="alert">No pudimos abrir el panel.</p><button onClick={() => { setError(false); setAttempt(attempt + 1) }}>Reintentar</button></>
      : <div className="session-placeholder" aria-hidden="true"><span /><span /><span /></div>}
  </main>
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
