import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api.ts'

export const PAGE_SIZE = 20
export type ListPage<T> = { items: T[]; page: number; limit: number; total: number }

export function usePagedList<T>(path: string | null, query = '') {
  const [request, setRequest] = useState({ path, query, page: 1, revision: 0 })
  if (request.path !== path || request.query !== query) {
    setRequest({ path, query, page: 1, revision: request.revision + 1 })
  }
  const page = request.path === path && request.query === query ? request.page : 1
  const key = JSON.stringify([path, query, page, request.revision])
  const [response, setResponse] = useState<{ key: string; data?: ListPage<T> } | null>(null)

  useEffect(() => {
    if (!path) return
    const endpoint = path
    const controller = new AbortController()
    async function load() {
      let requestedPage = page
      try {
        while (!controller.signal.aborted) {
          const params = new URLSearchParams({ page: String(requestedPage), limit: String(PAGE_SIZE) })
          if (query) params.set('q', query)
          const data = await apiRequest<ListPage<T>>(`${endpoint}?${params}`, { signal: controller.signal })
          if (controller.signal.aborted) return
          const last = Math.max(1, Math.ceil(data.total / data.limit))
          if (requestedPage > last) {
            requestedPage = last
            continue
          }
          setResponse({ key, data })
          return
        }
      } catch {
        if (!controller.signal.aborted) setResponse({ key })
      }
    }
    const timer = window.setTimeout(() => void load(), query ? 250 : 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [key, path, page, query])

  const current = response?.key === key ? response : null
  function setPage(nextPage: number) {
    setRequest(previous => ({ path, query, page: nextPage, revision: previous.revision + 1 }))
  }
  return {
    data: current?.data,
    loading: !!path && !current,
    error: !!current && !current.data,
    setPage,
    reload: () => setPage(current?.data?.page ?? page),
  }
}
