const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const tokenKey = 'forgefit_access_token'

type ApiErrorResponse = { error?: { message?: string } }

export function setAccessToken(token: string) { localStorage.setItem(tokenKey, token) }
export function getAccessToken() { return localStorage.getItem(tokenKey) }
export function clearAccessToken() { localStorage.removeItem(tokenKey) }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const response = await fetch(`${apiUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorResponse
    throw new Error(body.error?.message ?? 'No pudimos completar la solicitud.')
  }
  if (response.status === 204) return undefined as T
  const body = await response.json() as { data: T }
  return body.data
}
