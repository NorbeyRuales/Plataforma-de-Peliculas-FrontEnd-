/**
 * @file Favorites.tsx
 * @summary Lists the user's favorite movies and allows removing entries.
 * @remarks Normalizes heterogeneous favorite payloads so MovieCard receives a consistent shape.
 */
// src/pages/favorites/Favorites.tsx
import { useEffect, useState } from 'react'
import MovieCard from '../../components/movie/MovieCard'
import { Favorites as FavService, Favorite } from '../../services/favorites'
import '../home/Home.scss'
import './Favorites.scss'

type FavMovie = {
  id: string
  title: string
  poster?: string
  posterUrl?: string
  year?: number | string
  genres?: string[] | string
  rating?: number
  avgRating?: number
  vote_average?: number
  release_date?: string
  release_year?: string | number
}

function guessPoster(m: any): string | undefined {
  return (
    m?.poster ||
    m?.posterUrl ||
    m?.poster_url ||
    m?.image ||
    m?.cover ||
    m?.thumbnail ||
    m?.images?.poster
  )
}

function normRating(x: any): number {
  let r = Number(x ?? 0)
  if (Number.isNaN(r)) r = 0
  if (r > 5) r = r / 2
  return Math.max(0, Math.min(5, r))
}

function favToMovie(f: FavMovie) {
  const poster = guessPoster(f)
  return {
    id: f.id,
    title: f.title || 'Sin título',
    poster,
    posterUrl: poster,
    rating: normRating(f.rating ?? f.avgRating ?? f.vote_average ?? 0),
    year:
      f.year ??
      f.release_year ??
      (typeof f.release_date === 'string' ? f.release_date.slice(0, 4) : undefined),
    genres: Array.isArray(f.genres) ? f.genres : (f.genres ? [String(f.genres)] : []),
  } as any
}

/**
 * @component
 * @returns Favorites grid with inline actions to remove items from the saved list.
 */
export default function Favorites() {
  const [items, setItems] = useState<FavMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const data = await FavService.list()
          const arr = Array.isArray(data) ? data : (data as any)?.items ?? []
          const mapped: FavMovie[] = arr.map((r: Favorite | any) => ({
            id: String((r as any).id ?? (r as any).movie_id ?? (r as any).movieId),
            title: (r as any).title ?? (r as any).name ?? '',
            poster: guessPoster(r),
            posterUrl: guessPoster(r),
            rating: (r as any).rating,
            avgRating: (r as any).avgRating ?? (r as any).avg_rating,
            vote_average: (r as any).vote_average,
            year: (r as any).year ?? (r as any).release_year,
            release_date: (r as any).release_date,
            genres: (r as any).genres ?? (r as any).genre ?? [],
          }))
          if (alive) setItems(mapped)
        } catch (e: any) {
          if (alive) setError(e?.message || 'No se pudieron cargar tus favoritos')
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => { alive = false }
  }, [])

  async function remove(id: string) {
    try {
      setRemoving(id)
      await FavService.remove(id)
      setItems(prev => prev.filter(m => m.id !== id))
    } catch (e: any) {
      alert(e?.message || 'No se pudo quitar de favoritos')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <section className="home favorites-page">
      <h1 className="title" data-skip-target>Favoritos</h1>

      {loading && <p style={{ opacity: .8 }}>Cargando…</p>}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}

      {!loading && !error && (
        items.length > 0 ? (
          <div className="grid">
            {items.map(f => {
              const movie = favToMovie(f)
              return (
                <div className="favorite-item" key={f.id}>
                  <MovieCard movie={movie as any} />
                  <button
                    className="btn danger"
                    disabled={removing === f.id}
                    onClick={() => remove(f.id)}
                    aria-busy={removing === f.id || undefined}
                  >
                    {removing === f.id ? 'Quitando…' : 'Quitar de favoritos'}
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ opacity: .8 }}>
            Aún no tienes favoritos. Ve a una película y pulsa <strong>Añadir a favoritos</strong>.
          </p>
        )
      )}
    </section>
  )
}
