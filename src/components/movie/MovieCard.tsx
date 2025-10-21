import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
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

export default function MovieCard({ movie }: { movie: Movie }) {
  const posterUrl = useMemo(() => guessPoster(movie as any), [movie])
  const { stars, aria } = useMemo(() => calcStars(movie as any), [movie])

  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <article className='movie-card'>
      <Link to={`/movie/${(movie as any)._id}`} aria-label={`Abrir ${movie.title}`}>
        <div className='poster'>
          {/* Imagen si hay URL y no falló */}
          {posterUrl && !imgError && (
            <img
              src={posterUrl}
              alt={`Póster de ${movie.title}`}
              loading='lazy'
              decoding='async'
              onLoad={() => setLoaded(true)}
              onError={() => setImgError(true)}
              /* estilos mínimos para asegurar recorte correcto sin tocar SCSS */
              style={{
                width: '100%',
                height: 220,
                objectFit: 'cover',
                display: loaded ? 'block' : 'none',
              }}
            />
          )}
          {/* Placeholder visible si no hay imagen, falló o aún no cargó */}
          {(!posterUrl || imgError || !loaded) && (
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
