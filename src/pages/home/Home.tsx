import { useEffect, useState } from 'react'
import { api } from '../../services/api'      // 👈 usa tu cliente ya existente
import MovieCard from '../../components/movie/MovieCard'
import './Home.scss'

// Ajusta el tipo mínimo que tu MovieCard necesita
type Movie = {
  _id?: string
  id?: string | number
  title: string
  year?: number | string
  poster_url?: string
  genres?: string[]
}

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          setError(null)

          // 👇 mismo endpoint que usas en /movies
          // si tu API devuelve { data: [...] } ajusto abajo
          const res = await api.get<any>('/movies')

          // Normaliza posibles formas de respuesta (array directo o {data: [...]})
          const raw: Movie[] = Array.isArray(res) ? res : (res?.data ?? [])

          // Asegura que tengamos una key estable para MovieCard
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
      {/* Mantengo tu H2 (por estilos), pero lo declaro como heading nivel 1 para SR
         y lo uso como destino del skip-link */}
      <h2 data-skip-target role="heading" aria-level={1}>Películas</h2>

      {loading && (
        <div className='grid'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div className='movie-card skeleton' key={i} />
          ))}
        </div>
      )}

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
