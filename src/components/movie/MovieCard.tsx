/**
 * @file MovieCard.tsx
 * @summary Reusable movie card with lazy-loaded posters and accessible rating output.
 * @remarks The link uses the visible title for its accessible name while the numeric rating is surfaced via `aria-label`.
 */

import { Link } from 'react-router-dom'
import { useMemo, useRef, useEffect, useState } from 'react'
import type { Movie } from '../../types'
import './MovieCard.scss'

/**
 * Tries to infer a poster URL from heterogeneous movie objects coming from different APIs.
 * @param m Raw movie object that may include several poster-related keys.
 * @returns Poster URL if one of the known fields is present; otherwise undefined.
 */
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

/**
 * Calculates decorative star glyphs and an accessible label based on rating metadata.
 * Normalizes scales above five (for example, TMDB 0-10) down to the 0-5 range.
 * @param m Raw movie object with optional rating, score, or vote_average fields.
 * @returns Object with the star string and an ARIA label such as "4.0 de 5".
 */
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

/** Root margin used by the IntersectionObserver to preload posters before they appear. */
const PRELOAD_MARGIN = '200px'

/**
 * Movie card component used inside grids and lists with lazy-loaded imagery and accessible metadata.
 * - Lazy-loads the poster once the card approaches the viewport.
 * - Exposes a robust link to the movie detail using the best available identifier.
 * - Keeps placeholders silent for assistive tech while the actual image is loading.
 * @component
 * @param props.movie Movie entity to render, including title, genres, and potential poster URLs.
 * @returns Rendered article element representing the movie card.
 */
export default function MovieCard({ movie }: { movie: Movie }) {
  const titleText = (movie?.title ?? '').toString().trim() || 'Película sin título'
  const posterUrl = useMemo(() => guessPoster(movie as any), [movie])
  const { stars, aria } = useMemo(() => calcStars(movie as any), [movie])

  // Robust ID to avoid /movie/undefined routes
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

  /**
   * Lazy-load poster using IntersectionObserver:
   * once intersecting, mark the image as ready to load and disconnect the observer.
   */
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
      {/* No aria-label on the link: the accessible name is the visible title inside */}
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

          {/* Placeholder only "speaks" when there is truly no image */}
          {(!showImage || !loaded) && (
            <div
              className='poster-placeholder'
              role='img'
              aria-label='Sin póster disponible'
              aria-hidden={Boolean(posterUrl) && !imgError} // hidden while only loading
            />
          )}
        </div>

        <div className='info'>
          <h3>{titleText}</h3>
          <p className='meta'>
            {(movie as any).year} • {((movie as any).genres || []).slice(0, 2).join(' / ')}
          </p>

          {/* Decorative stars; numeric value is announced via aria-label */}
          <p className='stars' aria-label={`Calificación: ${aria}`}>
            <span aria-hidden='true'>{stars}</span>
          </p>
        </div>
      </Link>
    </article>
  )
}
