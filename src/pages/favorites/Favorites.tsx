// src/pages/favorites/Favorites.tsx

/**
 * @file Favorites.tsx
 * @summary Lists the user's favorite movies with lazy image rendering and remove actions.
 * @module Pages/Favorites
 * @description
 * - Fetches favorites from the Favorites service on mount.
 * - Normalizes different backend shapes into a compact `FavMovie` model.
 * - Allows removing a favorite inline with optimistic UI update.
 * - A11Y: uses `aria-busy` during async ops and `role="alert"` for error state.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Favorites as FavService, Favorite } from '../../services/favorites'
import './Favorites.scss'

/**
 * Minimal movie shape displayed in the Favorites list.
 */
type FavMovie = {
  id: string
  title: string
  posterUrl?: string
  description?: string
  avgRating?: number
}

/**
 * Favorites page component.
 * @component
 * @description
 * - Loads and renders cards for each favorite item.
 * - Provides a per-item "remove" control with loading feedback.
 */
export default function Favorites() {
  const [items, setItems] = useState<FavMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [removing, setRemoving] = useState<string | null>(null)

  // Load user's favorites on mount. Tolerates multiple API shapes.
  useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const data = await FavService.list()
          const arr = Array.isArray(data) ? data : (data as any)?.items ?? []
          const mapped: FavMovie[] = arr.map((r: Favorite | any) => ({
            id: String((r as any).id ?? (r as any).movie_id ?? (r as any).movieId),
            title: (r as any).title ?? '',
            posterUrl: (r as any).posterUrl ?? (r as any).poster_url ?? undefined,
            description: (r as any).description ?? '',
            avgRating: (r as any).avgRating ?? (r as any).avg_rating ?? undefined,
          }))
          if (alive) setItems(mapped)
        } catch (e: any) {
          if (alive) setError(e?.message || 'No se pudo cargar tus favoritos')
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => { alive = false }
  }, [])

  /**
   * Removes an item from favorites and updates local state optimistically.
   * @param {string} id - Movie ID to remove from favorites.
   * @returns {Promise<void>}
   */
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

  // Loading skeleton state
  if (loading) {
    return (
      <section className="container favorites-page">
        <h1>Favoritos</h1>
        <p aria-busy="true">Cargando…</p>
      </section>
    )
  }

  // Error state with ARIA alert
  if (error) {
    return (
      <section className="container favorites-page">
        <h1>Favoritos</h1>
        <p role="alert" style={{ color: 'salmon' }}>{error}</p>
      </section>
    )
  }

  return (
    <section className="container favorites-page">
      <h1>Favoritos</h1>

      {items.length === 0 ? (
        <p className="muted">
          Aún no tienes favoritos. Ve a una película y pulsa <strong>Añadir a favoritos</strong>.
        </p>
      ) : (
        <div className="cards-grid">
          {items.map(m => (
            <article key={m.id} className="card card-stack">
              <Link to={`/movie/${encodeURIComponent(m.id)}`} className="card__media">
                {m.posterUrl ? (
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    loading="lazy"
                    style={{ width: '100%', height: 'auto', borderRadius: 8, display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: '2 / 3',
                      background: '#e9eef3',
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#8190a5',
                      fontSize: 14,
                    }}
                  >
                    Sin imagen
                  </div>
                )}
              </Link>

              <div className="card__body">
                <h3 className="card__title" title={m.title}>{m.title}</h3>
                {typeof m.avgRating === 'number' && (
                  <small className="muted">⭐ {m.avgRating.toFixed(1)}</small>
                )}
              </div>

              <button
                className="btn danger card-action"
                onClick={() => remove(m.id)}
                disabled={removing === m.id}
                aria-busy={removing === m.id || undefined}
              >
                {removing === m.id ? 'Quitando…' : 'Quitar de favoritos'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
