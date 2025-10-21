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
  // Acepta rating en 0–5 o 0–10 (lo normaliza a 5)
  let r = Number(m?.rating ?? m?.score ?? m?.vote_average ?? 0)
  if (Number.isNaN(r)) r = 0
  if (r > 5) r = r / 2
  r = Math.max(0, Math.min(5, r))
  const full = Math.round(r)
  const stars = '★'.repeat(full) + '☆'.repeat(5 - full)
  const aria = r ? `${r.toFixed(1)} de 5` : 'Sin calificación'
  return { stars, aria }
}

const PRELOAD_MARGIN = '200px' //  Aqui se ajusta que tan pronto empieza a cargar el póster

export default function MovieCard({ movie }: { movie: Movie }) {
  const posterUrl = useMemo(() => guessPoster(movie as any), [movie])
  const { stars, aria } = useMemo(() => calcStars(movie as any), [movie])

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

  return (
    <article className='movie-card'>
      <Link to={`/movie/${(movie as any)._id}`} aria-label={`Abrir ${movie.title}`}>
        <div className='poster' ref={posterRef}>
          {/* Imagen si hay URL y no falló y ya “toca” cargar */}
          {posterUrl && !imgError && shouldLoad && (
            <img
              src={posterUrl}
              alt={`Póster de ${movie.title}`}
              loading='eager'         // el IO decide cuándo empezar
              decoding='async'
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
          {/* Placeholder si no hay imagen, falló o aún no cargó */}
          {(!posterUrl || imgError || !loaded || !shouldLoad) && (
            <div className='poster-placeholder'>
              <span className='sr-only'>Sin póster disponible</span>
            </div>
          )}
        </div>

        <div className='info'>
          <h3>{movie.title}</h3>
          <p className='meta'>
            {(movie as any).year} • {((movie as any).genres || []).slice(0, 2).join(' / ')}
          </p>
          <p className='stars' aria-label={`Rating: ${aria}`}>{stars}</p>
        </div>
      </Link>
    </article>
  )
}
