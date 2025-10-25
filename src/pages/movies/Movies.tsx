// src/pages/movies/Movies.tsx
/**
 * @file Movies.tsx
 * @description Movies listing with optional search via ?q=.
 * Accessibility notes:
 * - Keeps a single <h1> per page (WCAG 1.3.1 Info & Relationships).
 * - <h1> is marked with [data-skip-target] so the global skip-link lands here (WCAG 2.4.1 Bypass Blocks).
 * - Clear loading / error / empty states for all users.
 */

import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useSearchParams } from 'react-router-dom'
import MovieCard from '../../components/movie/MovieCard'
import '../home/Home.scss'

/** Shape returned by the API; MovieCard uses a subset of these fields */
type RawMovie = {
    _id?: string
    id?: string | number
    title: string
    year?: number | string
    poster_url?: string
    posterUrl?: string
    genres?: string[]
    description?: string
    streamUrl?: string
}

/**
 * Small type guard:
 * Accepts an empty array or an array whose first element has a string `title`.
 * This avoids crashing if the backend shape varies.
 */
function isMovieArray(x: any): x is RawMovie[] {
    return Array.isArray(x) && (x.length === 0 || typeof x[0]?.title === 'string')
}

export default function MoviesPage() {
    // Page state for list, loading and error
    const [movies, setMovies] = useState<RawMovie[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Read "?q=" from URL so navigation controls the query
    const [searchParams] = useSearchParams()
    const q = (searchParams.get('q') || '').trim()

    // Fetch on mount and whenever `q` changes
    useEffect(() => {
        let alive = true
            ; (async () => {
                try {
                    setLoading(true)
                    setError(null)

                    const path = q ? `/movies?q=${encodeURIComponent(q)}` : '/movies'
                    const resp = (await api.get(path)) as any

                    // Backend may return: array, { data }, or { movies }
                    const data = resp?.movies ?? resp?.data ?? resp

                    if (!alive) return
                    setMovies(isMovieArray(data) ? data : [])
                } catch (err: any) {
                    if (!alive) return
                    // Copy kept in Spanish to match current UI language
                    setError(err?.message || 'No se pudieron cargar las películas')
                } finally {
                    if (alive) setLoading(false)
                }
            })()

        return () => { alive = false }
    }, [q])

    const hasQuery = q.length > 0

    return (
        /**
         * Main content region for this view.
         * Pairs with the global skip-link so keyboard users can jump here quickly.
         */
        <section className="home">
            {/**
       * Single page heading (h1). Marked as the preferred skip target so
       * Enter on the skip-link focuses this element first (WCAG 2.4.1).
       */}
            <h1 className="title" data-skip-target>
                {hasQuery ? `Resultados para “${q}”` : 'Películas'}
            </h1>

            {/* Lightweight loading indicator (could add aria-busy on a wrapper if desired) */}
            {loading && <p style={{ opacity: .8 }}>Cargando…</p>}

            {/* Error message in a distinct color for quick visual scanning */}
            {error && <p style={{ color: 'salmon' }}>{error}</p>}

            {/* Normal / empty rendering once not loading and no error */}
            {!loading && !error && (
                movies.length > 0 ? (
                    /**
                     * Responsive grid of MovieCard articles.
                     * <ul>/<li> would also be valid; cards use <article> semantics internally.
                     */
                    <div className='grid'>
                        {movies.map(m => (
                            <MovieCard key={m._id ?? String(m.id)} movie={m as any} />
                        ))}
                    </div>
                ) : (
                    // Clear empty state, adapted depending on whether a query is active
                    <p style={{ opacity: .8 }}>
                        {hasQuery ? 'No hay coincidencias.' : 'No hay películas para mostrar.'}
                    </p>
                )
            )}
        </section>
    )
}
