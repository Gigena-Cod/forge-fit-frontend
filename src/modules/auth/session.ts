import { createContext, useContext } from 'react'
import { apiRequest, bindSession } from '../../shared/services/api.ts'

export type Role = 'OWNER' | 'ADMIN' | 'RECEPTIONIST'
export type Session = { user: { id: string; fullName: string; email?: string; role: Role } }
export const SessionContext = createContext<Session | null>(null)
export async function verifySession(signal?: AbortSignal) {
  const profile = await apiRequest<Session & { sessionId?: string }>('/auth/me', { signal })
  signal?.throwIfAborted()
  bindSession(profile.sessionId)
  return profile
}
export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('La sesión no está disponible.')
  return session
}
export function canVisit(role: Role, path: string) {
  if (path === '/users' || path === '/reports' || path === '/settings') return role === 'OWNER' || role === 'ADMIN'
  return true
}
