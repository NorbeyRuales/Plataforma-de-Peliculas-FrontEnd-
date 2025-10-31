/**
 * @file favorites.ts
 * @description Client helpers for interacting with the favorites API endpoints.
 */
import { api } from './api'
import { getToken } from './auth'

/**
 * Favorite entry returned by the backend. When favorites are expanded with movie data
 * the optional movie-related properties are populated.
 */
export type Favorite = {
  /** Unique identifier for the favorite. */
  id: string
  /** Identifier for the user that owns the favorite entry. */
  user_id?: string
  /** Identifier for the associated movie. */
  movie_id?: string
  /** ISO timestamp describing when the favorite was created. */
  created_at?: string
  /** Movie title attached to the favorite payload. */
  title?: string
  /** Movie year embedded in the favorite payload. */
  year?: number
  /** Movie genres as returned by the API. */
  genres?: unknown
  /** Optional poster URL included in the payload. */
  poster_url?: string
  /** Optional movie description available in the payload. */
  description?: string
  /** Aggregated rating value returned by the service. */
  avg_rating?: number
}

const MOVIE_KEY = 'movieId' // backend expects movieId in the request body

/**
 * Service layer that wraps the favorites REST endpoints with auth guards.
 */
export const Favorites = {
  /**
   * Adds the provided movie to the authenticated user's favorites.
   * @param movieId - Identifier of the movie to favorite.
   */
  async add(movieId: string) {
    if (!getToken()) throw new Error('No autenticado')
    return api.post<{ ok: boolean }>('/favorites', { [MOVIE_KEY]: movieId })
  },

  /**
   * Removes the provided movie from the authenticated user's favorites.
   * Falls back to a query-string version for legacy backends.
   * @param movieId - Identifier of the movie to remove.
   */
  async remove(movieId: string) {
    if (!getToken()) throw new Error('No autenticado')
    try {
      return await api.del<{ removed: number }>(`/favorites/${movieId}`)
    } catch {
      return api.del<{ removed: number }>(`/favorites?movieId=${encodeURIComponent(movieId)}`)
    }
  },

  /**
   * Determines whether the authenticated user has favorited the provided movie.
   * @param movieId - Identifier of the movie to check.
   * @returns A boolean flag indicating if the favorite exists.
   */
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

  /**
   * Retrieves the favorites collection for the authenticated user.
   * @returns Either the raw favorite array or an object wrapping items, depending on the backend.
   */
  async list() {
    if (!getToken()) return []
    return api.get<Favorite[] | { items: Favorite[] }>('/favorites')
  },
}
