// src/services/api.ts
const BASE = import.meta.env.VITE_API_URL

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(init?.headers as HeadersInit),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (!res.ok) {
    let msg = `HTTP ${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.error) msg = String(body.error)
      else if (typeof body === 'string') msg = body
    } catch {
      const text = await res.text().catch(() => '')
      if (text) msg = text
    }
    throw new Error(msg)
  }

  return res.json() as Promise<T>
}

export const api = {
  get:  <T>(p: string)                 => request<T>(p),
  post: <T>(p: string, b?: unknown)    => request<T>(p, { method: 'POST', body: JSON.stringify(b) }),
  put:  <T>(p: string, b?: unknown)    => request<T>(p, { method: 'PUT',  body: JSON.stringify(b) }),
  del:  <T>(p: string)                 => request<T>(p, { method: 'DELETE' }),
}
