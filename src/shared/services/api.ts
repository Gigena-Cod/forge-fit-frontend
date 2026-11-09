const apiUrl = import.meta.env.API_URL ?? 'http://localhost:3000/api'
const sessionChangeKey = 'forgefit_session_change'
const sessionActions = new Set(['/auth/login', '/auth/register', '/auth/logout'])
let sessionId: string | undefined
let renewal: Promise<void> | undefined
let accessRevision = 0

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

export function bindSession(id?: string) {
  sessionId = id
  localStorage.removeItem('forgefit_access_token')
  sessionStorage.removeItem('forgefit_session')
}

export function observeSessionChanges(onChange: () => void) {
  function handleChange(event: StorageEvent) {
    if (event.key === sessionChangeKey) onChange()
  }
  window.addEventListener('storage', handleChange)
  return () => window.removeEventListener('storage', handleChange)
}

function withSessionLock<T>(action: () => Promise<T>) {
  return navigator.locks ? navigator.locks.request('forgefit-session', action) : action()
}

function send(path: string, options: RequestInit = {}, expectedSession?: string) {
  const headers = new Headers(options.headers)
  if (typeof options.body === 'string') headers.set('Content-Type', 'application/json')
  if (expectedSession) headers.set('X-Session-Id', expectedSession)
  return fetch(`${apiUrl}${path}`, { ...options, headers, credentials: 'include' })
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as ApiErrorResponse
    throw new ApiError(body.error?.message ?? 'No pudimos completar la solicitud.', response.status, body.error?.code)
  }
  if (response.status === 204) return undefined as T
  const body = await response.json() as { data: T }
  return body.data
}

function renew(expectedSession: string | undefined, failedRevision: number, sessionChange: string | null) {
  renewal ??= withSessionLock(async () => {
    if (localStorage.getItem(sessionChangeKey) !== sessionChange) {
      throw new ApiError('Cambió la sesión.', 409, 'SESSION_CHANGED')
    }
    if (accessRevision !== failedRevision) return
    // Otra pestaña puede haber actualizado la cookie mientras esperábamos.
    const profile = await send('/auth/me', {}, expectedSession)
    if (profile.status === 401) {
      await readResponse(await send('/auth/refresh', { method: 'POST' }, expectedSession))
    } else if (!profile.ok) {
      await readResponse(profile)
    }
    accessRevision++
  }).finally(() => { renewal = undefined })
  return renewal
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const expectedSession = sessionId
  const sessionChange = localStorage.getItem(sessionChangeKey)
  if (sessionActions.has(path)) {
    return withSessionLock(async () => {
      if (path === '/auth/logout' && localStorage.getItem(sessionChangeKey) !== sessionChange) {
        throw new ApiError('Cambió la sesión.', 409, 'SESSION_CHANGED')
      }
      const result = await readResponse<T>(await send(path, options, expectedSession))
      bindSession()
      localStorage.setItem(sessionChangeKey, crypto.randomUUID())
      return result
    })
  }

  const failedRevision = accessRevision
  try {
    let response = await send(path, options, expectedSession)
    if (response.status === 401) {
      options.signal?.throwIfAborted()
      if (localStorage.getItem(sessionChangeKey) !== sessionChange) throw new ApiError('Cambió la sesión.', 409, 'SESSION_CHANGED')
      if (failedRevision === accessRevision) await renew(expectedSession, failedRevision, sessionChange)
      options.signal?.throwIfAborted()
      if (localStorage.getItem(sessionChangeKey) !== sessionChange) throw new ApiError('Cambió la sesión.', 409, 'SESSION_CHANGED')
      response = await send(path, options, expectedSession)
    }
    return await readResponse<T>(response)
  } catch (error) {
    if (!options.signal?.aborted && error instanceof ApiError && (error.status === 401 || error.code === 'SESSION_CHANGED')) {
      bindSession()
      window.location.replace('/auth/login')
    }
    throw error
  }
}
