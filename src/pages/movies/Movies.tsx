// src/pages/movies/Movies.tsx
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { useSearchParams } from 'react-router-dom'
import MovieCard from '../../components/movie/MovieCard'
import '../home/Home.scss'

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

function isMovieArray(x: any): x is RawMovie[] {
    return Array.isArray(x) && (x.length === 0 || typeof x[0]?.title === 'string')
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<RawMovie[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchParams] = useSearchParams()
    const q = (searchParams.get('q') || '').trim()

    useEffect(() => {
        let alive = true
            ; (async () => {
                try {
                    setLoading(true)
                    setError(null)

                    const path = q ? `/movies?q=${encodeURIComponent(q)}` : '/movies'
                    const resp = (await api.get(path)) as any

                    // Backend puede devolver array directo o envolver en { data } o { movies }
                    const data = resp?.movies ?? resp?.data ?? resp

                    if (!alive) return
                    setMovies(isMovieArray(data) ? data : [])
                } catch (err: any) {
                    if (!alive) return
                    setError(err?.message || 'No se pudieron cargar las películas')
                } finally {
                    if (alive) setLoading(false)
                }
            })()

        return () => { alive = false }
    }, [q])

    const hasQuery = q.length > 0

    return (
        <section className="home">
            <h1 className="title">
                {hasQuery ? `Resultados para “${q}”` : 'Películas'}
            </h1>

            {loading && <p style={{ opacity: .8 }}>Cargando…</p>}
            {error && <p style={{ color: 'salmon' }}>{error}</p>}

            {!loading && !error && (
                movies.length > 0 ? (
                    <div className='grid'>
                        {movies.map(m => (
                            <MovieCard key={m._id ?? String(m.id)} movie={m as any} />
                        ))}
                    </div>
                ) : (
                    <p style={{ opacity: .8 }}>
                        {hasQuery ? 'No hay coincidencias.' : 'No hay películas para mostrar.'}
                    </p>
                )
            )}
        </section>
    )
}
