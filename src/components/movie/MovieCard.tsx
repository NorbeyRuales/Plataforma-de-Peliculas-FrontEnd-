// src/components/movie/MovieCard.tsx
import { Link } from 'react-router-dom'
import { useMemo, useRef, useEffect, useState } from 'react'
import type { Movie } from '../../types'
import './MovieCard.scss'

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

function calcStars(m: any) {
  let r = Number(m?.rating ?? m?.score ?? m?.vote_average ?? 0)
  if (Number.isNaN(r)) r = 0
  if (r > 5) r = r / 2
  r = Math.max(0, Math.min(5, r))
  const full = Math.round(r)
  const stars = '★'.repeat(full) + '☆'.repeat(5 - full)
  const aria = r ? `${r.toFixed(1)} de 5` : 'Sin calificación'
  return { stars, aria }
}

const PRELOAD_MARGIN = '200px'

export default function MovieCard({ movie }: { movie: Movie }) {
  const titleText = (movie?.title ?? '').toString().trim() || 'Película sin título'
  const posterUrl = useMemo(() => guessPoster(movie as any), [movie])
  const { stars, aria } = useMemo(() => calcStars(movie as any), [movie])

  // ID robusto (evita /movie/undefined)
  const movieId =
    (movie as any)._id ??
    (movie as any).id ??
    (movie as any).slug ??
    null

  const to = movieId ? `/movie/${encodeURIComponent(String(movieId))}` : '/movies'

  const [shouldLoad, setShouldLoad] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const posterRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = posterRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          io.disconnect()
        }
      },
      { root: null, rootMargin: PRELOAD_MARGIN, threshold: 0 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const showImage = posterUrl && !imgError && shouldLoad

  return (
    <article className='movie-card'>
      {/* Quitamos aria-label aquí para que el nombre accesible del link sea el contenido (título) */}
      <Link to={to} state={{ breadcrumb: titleText }}>
        <div className='poster' ref={posterRef}>
          {showImage && (
            <img
              src={posterUrl!}
              alt={`Póster de ${titleText}`}
              loading='lazy'
              decoding='async'
              fetchPriority='low'
              width={300}
              height={450}
              onLoad={() => setLoaded(true)}
              onError={() => setImgError(true)}
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                display: loaded ? 'block' : 'none',
              }}
            />
          )}

          {/* Placeholder solo “habla” a lectores cuando realmente NO hay imagen */}
          {(!showImage || !loaded) && (
            <div
              className='poster-placeholder'
              role='img'
              aria-label='Sin póster disponible'
              aria-hidden={Boolean(posterUrl) && !imgError} // oculto mientras solo está cargando
            />
          )}
        </div>

        <div className='info'>
          <h3>{titleText}</h3>
          <p className='meta'>
            {(movie as any).year} • {((movie as any).genres || []).slice(0, 2).join(' / ')}
          </p>

          {/* Estrellas decorativas; el valor real se anuncia via aria-label */}
          <p className='stars' aria-label={`Calificación: ${aria}`}>
            <span aria-hidden='true'>{stars}</span>
          </p>
        </div>
      </Link>
    </article>
  )
}
