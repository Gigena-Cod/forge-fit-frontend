const apiUrl = import.meta.env.API_URL ?? 'http://localhost:3000/api'
const tokenKey = 'forgefit_access_token'

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

export function setAccessToken(token: string) { localStorage.setItem(tokenKey, token) }
export function getAccessToken() { return localStorage.getItem(tokenKey) }
export function clearAccessToken() { localStorage.removeItem(tokenKey) }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorResponse
    if (response.status === 401 && !path.startsWith('/auth/')) {
      clearAccessToken()
      window.location.assign('/auth/login')
    }
    throw new ApiError(body.error?.message ?? 'No pudimos completar la solicitud.', response.status, body.error?.code)
  }
  if (response.status === 204) return undefined as T
  const body = await response.json() as { data: T }
  return body.data
}
