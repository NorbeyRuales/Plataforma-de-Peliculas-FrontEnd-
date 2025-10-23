// src/pages/movies/Movies.tsx
import { useEffect, useState } from 'react'
import { api } from '../../services/api'
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
    stream_url?: string
    url?: string
}

const isMovieArray = (x: unknown): x is RawMovie[] =>
    Array.isArray(x) && x.every(o => o && typeof o === 'object' && 'title' in (o as any))

export default function Movies() {
    const [movies, setMovies] = useState<RawMovie[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let alive = true
            ; (async () => {
                try {
                    setLoading(true)
                    setError(null)

                    const resp = (await api.get('/movies')) as any
                    const data = resp?.data ?? resp

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
    }, [])

    return (
        <section className="home">
            <h1 className="title">Películas</h1>

            {loading && <p style={{ opacity: .8 }}>Cargando…</p>}
            {error && <p style={{ color: 'salmon' }}>{error}</p>}

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
