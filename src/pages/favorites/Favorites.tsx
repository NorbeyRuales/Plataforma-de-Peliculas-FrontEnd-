/**
 * @file Favorites.tsx
 * @summary Lists the user's favorite movies and allows removing entries.
 * @remarks Normalizes heterogeneous favorite payloads so MovieCard receives a consistent shape.
 */
// src/pages/favorites/Favorites.tsx
import { useEffect, useRef, useState } from 'react'
import MovieCard from '../../components/movie/MovieCard'
import { Favorites as FavService, Favorite } from '../../services/favorites'
import '../home/Home.scss'
import './Favorites.scss'
import { useToast } from '../../components/toast/ToastProvider'

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

  // Toast inline “deshacer”
  const [toast, setToast] = useState<{ text: string; onUndo?: () => void } | null>(null)

  // Timer del toast + commit diferido
  const undoTimer = useRef<number | null>(null)

  // Último removido (para poder restaurarlo o re-commit)
  const lastRemoved = useRef<{ item: FavMovie; index: number } | null>(null)

  // Estado del commit diferido
  const pendingCommit = useRef<{ id: string; committed: boolean } | null>(null)

  const { error: showErrorToast } = useToast()

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
          if (alive) {
            const msg = e?.message || 'No se pudieron cargar tus favoritos'
            setError(msg)
            showErrorToast(msg) // 🔴 toast
          }
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => { alive = false }
  }, [showErrorToast])

  useEffect(() => {
    return () => {
      if (undoTimer.current) window.clearTimeout(undoTimer.current)
    }
  }, [])

  function scheduleCommitRemove(id: string) {
    // Limpia y programa cierre + commit en 6s
    if (undoTimer.current) window.clearTimeout(undoTimer.current)
    pendingCommit.current = { id, committed: false }
    undoTimer.current = window.setTimeout(async () => {
      setToast(null)
      try {
        // Marca que se envió el commit
        if (pendingCommit.current) pendingCommit.current.committed = true
        await FavService.remove(id)
      } catch (e: any) {
        // Si falla el commit, revertimos UI y avisamos
        if (lastRemoved.current) {
          const { item, index } = lastRemoved.current
          setItems(prev => {
            const copy = [...prev]
            copy.splice(index, 0, item)
            return copy
          })
        }
        showErrorToast(e?.message || 'No se pudo quitar de favoritos')
      } finally {
        pendingCommit.current = null
        undoTimer.current = null
      }
    }, 6000)
  }

  function cancelCommit() {
    if (undoTimer.current) window.clearTimeout(undoTimer.current)
    undoTimer.current = null
  }

  async function forceCommitNow() {
    // Llama al commit inmediato (pulsar ✕)
    const id = pendingCommit.current?.id
    cancelCommit()
    setToast(null)
    if (!id) return
    try {
      pendingCommit.current!.committed = true
      await FavService.remove(id)
    } catch (e: any) {
      // revertimos si falla
      if (lastRemoved.current) {
        const { item, index } = lastRemoved.current
        setItems(prev => {
          const copy = [...prev]
          copy.splice(index, 0, item)
          return copy
        })
      }
      showErrorToast(e?.message || 'No se pudo quitar de favoritos')
    } finally {
      pendingCommit.current = null
    }
  }

  async function undoRemove() {
    cancelCommit()
    setToast(null)
    if (!lastRemoved.current) return
    const { item, index } = lastRemoved.current

    // 1) Restaura en UI
    setItems(prev => {
      const copy = [...prev]
      copy.splice(index, 0, item)
      return copy
    })

    // 2) Si el commit YA se había enviado, re-crea en backend
    if (pendingCommit.current?.committed) {
      try {
        const movieId =
          item.id ?? (item as any).movie_id ?? (item as any).movieId
        if (typeof (FavService as any).add === 'function') {
          await (FavService as any).add(movieId)
        } else if (typeof (FavService as any).create === 'function') {
          await (FavService as any).create({
            movieId,
            title: item.title,
            posterUrl: item.posterUrl ?? item.poster,
          })
        }
      } catch (e: any) {
        showErrorToast(e?.message || 'No se pudo deshacer: reintenta')
      }
    }

    pendingCommit.current = null
    lastRemoved.current = null
  }

  async function remove(id: string) {
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) return
    const item = items[idx]

    try {
      setRemoving(id)

      // 1) Actualización optimista en UI
      setItems(prev => prev.filter(m => m.id !== id))
      lastRemoved.current = { item, index: idx }

      // 2) Mostrar toast con opción de "Deshacer"
      setToast({
        text: `"${item.title || 'Elemento'}" se quitó de favoritos.`,
        onUndo: undoRemove,
      })

      // 3) Programar commit diferido (NO llamar remove aún)
      scheduleCommitRemove(id)
    } catch (e: any) {
      // Si algo raro falla antes del schedule, revertimos
      if (lastRemoved.current) {
        const { item, index } = lastRemoved.current
        setItems(prev => {
          const copy = [...prev]
          copy.splice(index, 0, item)
          return copy
        })
      }
      setToast(null)
      showErrorToast(e?.message || 'No se pudo quitar de favoritos')
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
                    className="btn danger fav-remove-btn"
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

      {toast && (
        <div className="toast-inline-layer">
          <div
            className="fav-toast-card"
            role="status"
            aria-live="polite"
            tabIndex={-1}
            onMouseEnter={() => { if (undoTimer.current) { clearTimeout(undoTimer.current); undoTimer.current = null } }}
            onMouseLeave={() => { if (!undoTimer.current && pendingCommit.current) { scheduleCommitRemove(pendingCommit.current.id) } }}
            onFocus={() => { if (undoTimer.current) { clearTimeout(undoTimer.current); undoTimer.current = null } }}
            onBlur={() => { if (!undoTimer.current && pendingCommit.current) { scheduleCommitRemove(pendingCommit.current.id) } }}
          >
            {/* Icono circular */}
            <div className="fav-toast-icon-container" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="fav-toast-icon" aria-hidden="true" focusable="false">
                <circle cx="12" cy="7.5" r="1.2" />
                <rect x="11.1" y="10" width="1.8" height="6" rx=".9" />
              </svg>
            </div>

            <div className="fav-toast-message">
              <p className="fav-toast-title">Info</p>
              <p className="fav-toast-subtext">{toast.text}</p>
            </div>

            {toast.onUndo && (
              <button className="fav-toast-action" onClick={toast.onUndo}>
                Deshacer
              </button>
            )}

            <button className="fav-toast-close" aria-label="Cerrar" onClick={forceCommitNow}>
              <svg viewBox="0 0 15 15" className="fav-toast-cross" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
