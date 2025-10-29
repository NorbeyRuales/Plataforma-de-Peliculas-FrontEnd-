/**
 * @file MovieCard.tsx
 * @summary Reusable movie card with lazy-loaded posters and accessible rating output.
 */
import { Link } from 'react-router-dom'
import { useMemo, useEffect, useState } from 'react'
import type { Movie } from '../../types'
import './MovieCard.scss'
import { posterCandidatesFrom } from '../../utils/poster'

function baseUrl() {
  const b = (import.meta as any).env?.BASE_URL || '/'
  return b.endsWith('/') ? b.slice(0, -1) : b
}

function guessPosterFromApi(m: any): string | undefined {
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

export default function MovieCard({ movie }: { movie: Movie }) {
  const titleText = (movie?.title ?? '').toString().trim() || 'Película sin título'
  const { stars, aria } = useMemo(() => calcStars(movie as any), [movie])

  const placeholderSrc = `${baseUrl()}/placeholder-poster.png`

  // Candidatos: API primero; luego locales; prefija BASE_URL si empiezan por "/"
  const candidates = useMemo(() => {
    const fromApi = guessPosterFromApi(movie as any)
    const list = fromApi ? [String(fromApi)] : posterCandidatesFrom(movie)
    return list.map(u => (u.startsWith('/') ? `${baseUrl()}${u}` : u))
  }, [movie])

  // Estado de imagen actual (lazy nativo sin IntersectionObserver)
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setIdx(0)
    setLoaded(false)
  }, [candidates])

  // src actual; si se acaban candidatos → placeholder
  const src = idx < candidates.length ? candidates[idx] : placeholderSrc

  function handleImgError() {
    setLoaded(false)
    setIdx(i => (i < candidates.length ? i + 1 : i))
  }

  const movieId =
    (movie as any)._id ??
    (movie as any).id ??
    (movie as any).slug ??
    null
  const to = movieId ? `/movie/${encodeURIComponent(String(movieId))}` : '/movies'

  return (
    <article className='movie-card'>
      <Link to={to} state={{ breadcrumb: titleText }}>
        <div className='poster'>
          {/* Imagen real: siempre presente (no display:none). Fade-in con opacity. */}
          <img
            src={src}
            alt={`Póster de ${titleText}`}
            loading='lazy'
            decoding='async'
            width={300}
            height={450}
            onLoad={() => setLoaded(true)}
            onError={handleImgError}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: loaded ? 1 : 0,
              transition: 'opacity .25s ease',
              zIndex: 1,
            }}
          />

          {/* Placeholder siempre presente debajo de la imagen */}
          <div
            className='poster-placeholder'
            role='img'
            aria-label='Sin póster disponible'
            aria-hidden={loaded || undefined}
          />
        </div>

        <div className='info'>
          <h3>{titleText}</h3>
          <p className='meta'>
            {(movie as any).year} • {((movie as any).genres || []).slice(0, 2).join(' / ')}
          </p>
          <p className='stars' aria-label={`Calificación: ${aria}`}>
            <span aria-hidden='true'>{stars}</span>
          </p>
        </div>
      </Link>
    </article>
  )
}
