/**
 * @file movies.ts
 * @description Client helpers for listing and retrieving movies from the API.
 */
import { api } from './api'
import type { Movie, ID } from '../types'

/**
 * Lightweight wrapper around the movie endpoints.
 */
export const Movies = {
  /**
   * Retrieves the movie catalog. When `q` is provided the result is filtered server-side.
   * @param q - Optional query string used to filter movies.
   * @returns Promise resolving to an array of movies.
   */
  list: (q?: string) => api.get<Movie[]>(`/movies${q ? `?q=${encodeURIComponent(q)}` : ''}`),

  /**
   * Fetches the details for the movie identified by `id`.
   * @param id - Movie identifier.
   * @returns Promise resolving to a single movie payload.
   */
  get: (id: ID) => api.get<Movie>(`/movies/${id}`),
}
