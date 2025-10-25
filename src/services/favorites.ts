import { api } from './api'
import { getToken } from './auth'

export type Favorite = {
  id: string
  user_id?: string
  movie_id?: string
  created_at?: string
  // campos de movies si los usas en el listado
  title?: string
  year?: number
  genres?: unknown
  poster_url?: string
  description?: string
  avg_rating?: number
}

const MOVIE_KEY = 'movieId' // backend espera movieId en el body

export const Favorites = {
  async add(movieId: string) {
    if (!getToken()) throw new Error('No autenticado')
    return api.post<{ ok: boolean }>('/favorites', { [MOVIE_KEY]: movieId })
  },

  async remove(movieId: string) {
    if (!getToken()) throw new Error('No autenticado')
    try {
      return await api.del<{ removed: number }>(`/favorites/${movieId}`)
    } catch {
      return api.del<{ removed: number }>(`/favorites?movieId=${encodeURIComponent(movieId)}`)
    }
  },

  async has(movieId: string) {
    if (!getToken()) return false
    try {
      const r = await api.get<{ exists: boolean }>(`/favorites/${movieId}`)
      return !!r.exists
    } catch {
      const list = await api.get<Favorite[] | { items: Favorite[] }>('/favorites')
      const items = Array.isArray(list) ? list : (list.items ?? [])
      return items.some(f =>
        f.id === movieId || (f as any).movie_id === movieId || (f as any).movieId === movieId
      )
    }
  },

  async list() {
    if (!getToken()) return []
    return api.get<Favorite[] | { items: Favorite[] }>('/favorites')
  },
}
