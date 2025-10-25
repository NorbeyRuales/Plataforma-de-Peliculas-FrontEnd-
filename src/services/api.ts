// src/services/api.ts
const BASE = import.meta.env.VITE_API_URL

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function urlJoin(base: string | undefined, path: string) {
  const b = base || ''
  if (!b) return path
  if (b.endsWith('/') && path.startsWith('/')) return b + path.slice(1)
  if (!b.endsWith('/') && !path.startsWith('/')) return b + '/' + path
  return b + path
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase()

  // We only set Content-Type when there is a body (POST/PUT/PATCH)
  const needsJson =
    method === 'POST' || method === 'PUT' || method === 'PATCH' || !!init?.body

  const headers: HeadersInit = {
    ...(needsJson ? { 'Content-Type': 'application/json' } : {}),
    ...authHeaders(),
    ...(init?.headers as HeadersInit),
  }

  const res = await fetch(urlJoin(BASE, path), { ...init, method, headers })

  if (!res.ok) {
    let msg = `HTTP ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.error) msg = typeof body.error === 'string' ? body.error : JSON.stringify(body.error)
      else if (typeof body === 'string') msg = body
    } catch {
      const text = await res.text().catch(() => '')
      if (text) msg = text
    }
    // ❌ We NO longer clean the token here
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(p: string) => request<T>(p, { method: 'GET' }),
  post: <T>(p: string, b?: unknown) => request<T>(p, { method: 'POST', body: b != null ? JSON.stringify(b) : undefined }),
  put: <T>(p: string, b?: unknown) => request<T>(p, { method: 'PUT', body: b != null ? JSON.stringify(b) : undefined }),
  del: <T>(p: string) => request<T>(p, { method: 'DELETE' }),
}
