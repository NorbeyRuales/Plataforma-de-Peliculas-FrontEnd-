// src/pages/home/Home.tsx
/**
 * @file Home.tsx
 * @description Landing grid that shows a subset of movies.
 * Accessibility notes:
 * - The visible heading is an <h2> for styling, but we expose it as a level-1
 *   heading to assistive tech via role="heading" aria-level={1}.
 * - The heading is marked with [data-skip-target] so the global skip-link
 *   can land here immediately (WCAG 2.4.1 Bypass Blocks).
 * - Clear loading/error/empty states improve UX for everyone.
 */

import { useEffect, useState } from 'react'
import { api } from '../../services/api'      // reuse your existing API client
import MovieCard from '../../components/movie/MovieCard'
import './Home.scss'

/** Minimal shape required by MovieCard */
type Movie = {
  _id?: string
  id?: string | number
  title: string
  year?: number | string
  poster_url?: string
  genres?: string[]
}

/**
 * @component
 * @returns Landing grid showing a sample of movies plus loading/error states.
 */
export default function Home() {
  // Basic page state
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setError(null)

        // Same endpoint used by /movies; if your API returns { data: [...] },
        // we normalize below to keep a consistent array shape.
        const res = await api.get<any>('/movies')

        // Normalize possible response shapes (array vs { data: [...] })
        const raw: Movie[] = Array.isArray(res) ? res : (res?.data ?? [])

        // Ensure a stable key for MovieCard
        const list = raw.map(m => ({ ...m, _id: m._id ?? (m.id ? String(m.id) : undefined) }))

        if (alive) setMovies(list)
      } catch (e: any) {
        if (alive) setError(e?.message || 'No se pudieron cargar las películas')
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => { alive = false }
  }, [])

  return (
    <section className='container home-page'>
      {/**
       * Visible heading kept as <h2> (to match current styles), but exposed
       * as the main page heading to SR using role/aria-level.
       * Marked as [data-skip-target] so the skip-link focuses here.
       */}
      <h2 data-skip-target role="heading" aria-level={1}>Películas</h2>

      {/* Loading skeletons for perceived performance while fetching */}
      {loading && (
        <div className='grid'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div className='movie-card skeleton' key={i} />
          ))}
        </div>
      )}

      {/* Short error state; message kept in Spanish to match UI language */}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}

      {/* Normal render once loaded and not errored */}
      {!loading && !error && (
        <div className='grid'>
          {movies.map(m => (
            <MovieCard key={m._id ?? String(m.id)} movie={m as any} />
          ))}
        </div>
      )}
    </section>
  )
}
