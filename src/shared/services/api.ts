const apiUrl = import.meta.env.API_URL ?? 'http://localhost:3000/api'
const tokenKey = 'forgefit_access_token'
const sessionKey = 'forgefit_session'

type ApiErrorResponse = { error?: { message?: string; code?: string } }

export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function setAccessToken(token: string) {
  sessionStorage.removeItem(sessionKey)
  localStorage.setItem(tokenKey, token)
}
export function getAccessToken() { return localStorage.getItem(tokenKey) }
export function clearAccessToken() {
  localStorage.removeItem(tokenKey)
  sessionStorage.removeItem(sessionKey)
}

export function readCachedSession<T>(token: string): T | null {
  try {
    const cached = JSON.parse(sessionStorage.getItem(sessionKey) ?? 'null') as { token: string; session: T } | null
    return cached?.token === token ? cached.session : null
  } catch {
    return null
  }
}

export function cacheSession<T>(token: string, session: T) {
  sessionStorage.setItem(sessionKey, JSON.stringify({ token, session }))
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorResponse
    if (response.status === 401 && !path.startsWith('/auth/') && token === getAccessToken()) {
      clearAccessToken()
      window.location.assign('/auth/login')
    }
    throw new ApiError(body.error?.message ?? 'No pudimos completar la solicitud.', response.status, body.error?.code)
  }
  if (response.status === 204) return undefined as T
  const body = await response.json() as { data: T }
  return body.data
}
