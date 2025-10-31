/**
 * @file api.ts
 * @description Thin wrapper around the Fetch API that injects auth headers and JSON helpers.
 */
const BASE = import.meta.env.VITE_API_URL

/**
 * Builds the default Authorization header when a token exists in localStorage.
 * @returns Headers compatible object that may contain the Bearer token.
 */
function authHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Joins the API base URL with the provided path while avoiding duplicated slashes.
 * @param base - The base URL configured through environment variables.
 * @param path - The resource path or route to append.
 * @returns A normalized URL pointing to the desired API resource.
 */
function urlJoin(base: string | undefined, path: string) {
  const b = base || ''
  if (!b) return path
  if (b.endsWith('/') && path.startsWith('/')) return b + path.slice(1)
  if (!b.endsWith('/') && !path.startsWith('/')) return b + '/' + path
  return b + path
}

/**
 * Performs an HTTP request against the backend and returns the parsed JSON payload.
 * @template T
 * @param path - API path to hit (relative to the configured base URL).
 * @param init - Optional RequestInit overrides such as method, headers or body.
 * @throws Error when the response is not successful or the body cannot be parsed.
 * @returns A promise that resolves to the JSON payload typed as `T`.
 */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method || 'GET').toUpperCase()

  // Only include Content-Type when there is a request body (POST/PUT/PATCH).
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
    throw new Error(msg)
  }

  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

/**
 * Convenience helpers for common HTTP verbs returning parsed JSON responses.
 */
export const api = {
  /** Performs a `GET` request. */
  get: <T>(p: string) => request<T>(p, { method: 'GET' }),
  /** Performs a `POST` request with an optional JSON body. */
  post: <T>(p: string, b?: unknown) => request<T>(p, { method: 'POST', body: b != null ? JSON.stringify(b) : undefined }),
  /** Performs a `PUT` request with an optional JSON body. */
  put: <T>(p: string, b?: unknown) => request<T>(p, { method: 'PUT', body: b != null ? JSON.stringify(b) : undefined }),
  /** Performs a `DELETE` request. */
  del: <T>(p: string) => request<T>(p, { method: 'DELETE' }),
}
