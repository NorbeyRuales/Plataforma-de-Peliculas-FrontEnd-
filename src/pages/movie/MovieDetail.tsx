/**
 * @file MovieDetail.tsx
 * @description Movie detail screen with HTML5 video player, keyboard-accessible
 * controls, and "favorites" toggle. Includes a fallback trailer from Pexels when
 * the movie has no streamUrl. Uses ARIA where appropriate and visible focus styles
 * provided by global CSS.
 *
 * A11y notes:
 * - Buttons and selects are natively focusable (2.1.1 Keyboard).
 * - Focus styles vienen de los estilos globales (2.4.7 Focus Visible).
 * - role="status"/aria-busy/aria-label usados para feedback no intrusivo.
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './MovieDetail.scss'
import { api } from '../../services/api'
import { getRandomPexelsVideo } from '../../services/pexelsServices'
import { Favorites } from '../../services/favorites'
import { getToken } from '../../services/auth'

/**
 * Lightweight movie shape used locally in this view.
 */
type Movie = {
  id: string | number
  title: string
  description?: string
  posterUrl?: string
  streamUrl?: string
}

/**
 * Movie detail page component.
 * Fetches movie data, wires the <video> element with custom controls,
 * and allows adding/removing the movie from favorites.
 */
/**
 * @component
 * @returns Detailed movie view with trailer playback and favorite toggle.
 */
export default function MovieDetail() {
  // ------- Routing / refs -------
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef<HTMLVideoElement>(null)

  // ------- Data / UI state -------
  const [movie, setMovie] = useState<Movie | null>(null)
  const [pexelsVideoUrl, setPexelsVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [added, setAdded] = useState(false)
  const [addedMsg, setAddedMsg] = useState('')

  // Favorites state (null while loading)
  const [isFav, setIsFav] = useState<boolean | null>(null)
  const [favBusy, setFavBusy] = useState(false)

  // Player controls state (mirrors <video> props)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [loop, setLoop] = useState(false)

  /**
   * Guard against invalid route id.
   */
  useEffect(() => {
    if (!id || id === 'undefined') setError('ID de película inválido')
  }, [id])

  /**
   * Fetch movie by id from backend.
   * Accepts either `{ movie }` or the movie object directly.
   */
  useEffect(() => {
    if (!id || id === 'undefined') return
    ;(async () => {
      setLoading(true)
      setError(undefined)
      try {
        const resp = await api.get<Movie | { movie: Movie }>(`/movies/${encodeURIComponent(id)}`)
        const m = (resp as any)?.movie ?? resp
        setMovie(m as Movie)
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar la película')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  /**
   * If no streamUrl in the movie, try finding a relevant stock video on Pexels.
   * Falls back to "cinema" keyword.
   */
  useEffect(() => {
    if (!movie?.title || movie.streamUrl) return
    let canceled = false
    ;(async () => {
      let url = await getRandomPexelsVideo(movie.title)
      if (!url) url = await getRandomPexelsVideo('cinema')
      if (!canceled) setPexelsVideoUrl(url)
    })()
    return () => { canceled = true }
  }, [movie?.title, movie?.streamUrl])

  /**
   * Sync local "playing" state by listening to native <video> events.
   */
  useEffect(() => {
    const v = playerRef.current
    if (!v) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])

  /**
   * Apply local controls state to the underlying <video> element.
   */
  useEffect(() => {
    const v = playerRef.current
    if (!v) return
    v.muted = muted
    v.volume = volume
    v.playbackRate = rate
    v.loop = loop
  }, [muted, volume, rate, loop])

  // ------- Player helpers -------

  /**
   * Play/pause the video depending on current state.
   */
  function togglePlay() {
    const v = playerRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }

  /**
   * Seek the video by an offset in seconds (negative or positive).
   * Clamps the target time to [0, duration].
   * @param offset seconds to jump
   */
  function seek(offset: number) {
    const v = playerRef.current
    if (!v) return
    const d = v.duration || Infinity
    v.currentTime = Math.max(0, Math.min(d, v.currentTime + offset))
  }

  /** Mute/unmute shortcut. */
  function toggleMute() { setMuted(m => !m) }

  /**
   * Volume range input handler (0..1).
   * Also auto-unmutes when user sets volume > 0 while muted.
   */
  function onVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    setVolume(val)
    if (val > 0 && muted) setMuted(false)
  }

  /** Playback rate (speed) select handler. */
  function onRate(e: React.ChangeEvent<HTMLSelectElement>) {
    setRate(Number(e.target.value))
  }

  /** Toggle loop mode. */
  function toggleLoop() { setLoop(l => !l) }

  /**
   * Toggle Picture-in-Picture when supported.
   * Silently catches failures (e.g., browser policies).
   */
  async function togglePiP() {
    const v = playerRef.current as any
    try {
      if ('pictureInPictureElement' in document && (document as any).pictureInPictureElement) {
        await (document as any).exitPictureInPicture()
      } else if (v?.requestPictureInPicture) {
        await v.requestPictureInPicture()
      }
    } catch (e) {
      console.error('PiP error', e)
    }
  }

  /**
   * Toggle native fullscreen for the <video> element.
   */
  async function toggleFullscreen() {
    const v = playerRef.current;
    if (!v) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await v.requestFullscreen?.();
      }
    } catch (e) {
      console.error('Fullscreen error', e);
    }
  }

  // ------- Favorites -------

  /**
   * Initialize favorites state for the current movie.
   * If user is not authenticated, default to false.
   */
  useEffect(() => {
    const movieId = String((movie?.id ?? (movie as any)?._id ?? (movie as any)?.uuid ?? id) ?? '')
    if (!movieId) { setIsFav(false); return }
    if (!getToken()) { setIsFav(false); return }

    let alive = true
    ;(async () => {
      try {
        const exists = await Favorites.has(movieId)
        if (alive) setIsFav(!!exists)
      } catch {
        if (alive) setIsFav(false)
      }
    })()
    return () => { alive = false }
  }, [movie, id])

  /**
   * Toggle favorites on/off for the current movie.
   * - If unauthenticated, redirects to /login with "next" param.
   * - Shows non-blocking status text after the operation.
   */
  async function toggleFav() {
    const movieId = String((movie?.id ?? (movie as any)?._id ?? (movie as any)?.uuid ?? id) ?? '')
    if (!movieId || favBusy || isFav === null) return

    if (!getToken()) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`)
      return
    }

    setFavBusy(true)
    try {
      if (isFav) {
        await Favorites.remove(movieId)
        setIsFav(false)
        setAddedMsg('Quitada de favoritos')
      } else {
        await Favorites.add(movieId)
        setIsFav(true)
        setAddedMsg('Añadida a favoritos')
      }
      setAdded(true)
      setTimeout(() => setAdded(false), 2200)
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo actualizar tus favoritos'
      alert(msg)
    } finally {
      setFavBusy(false)
    }
  }

  // ------- Render guards -------

  if (loading) {
    return (
      <section className="container">
        {/* aria-busy hints async load to AT users */}
        <p aria-busy="true">Cargando…</p>
      </section>
    )
  }
  if (error) {
    return (
      <section className="container">
        {/* role="alert" announces error messages immediately */}
        <p role="alert" style={{ color: 'salmon' }}>{error}</p>
      </section>
    )
  }
  if (!movie) return null

  // Prefer backend stream, otherwise Pexels fallback (or undefined)
  const videoSrc = movie.streamUrl || pexelsVideoUrl || undefined

  return (
    <section className="container movie-detail movie-detail--single">
      <h1 className="detail-title">{movie.title}</h1>

      <div className={`player ${!videoSrc ? 'is-loading' : ''}`}>
        <video
          ref={playerRef}
          id="player"
          controls
          poster={movie.posterUrl}
          src={videoSrc}
          style={{ width: '100%', maxWidth: 980, borderRadius: 8 }}
        />

        {/* Toolbar: all buttons are keyboard accessible (2.1.1) */}
        <div className="toolbar" aria-label="Controles de reproducción">
          <div className="group">
            <button
              type="button"
              className="ctrl hit-24"
              onClick={togglePlay}
              aria-pressed={playing}
              disabled={!videoSrc}
            >
              {playing ? '⏸ Pausa' : '▶ Reproducir'}
            </button>

            <button type="button" className="ctrl hit-24" onClick={() => seek(-10)} disabled={!videoSrc}>⏮ 10s</button>
            <button type="button" className="ctrl hit-24" onClick={() => seek(10)} disabled={!videoSrc}>10s ⏭</button>
          </div>

          <div className="group volume">
            <button
              type="button"
              className="ctrl hit-24"
              onClick={toggleMute}
              aria-pressed={muted}
              disabled={!videoSrc}
            >
              {muted || volume === 0 ? '🔇 Mute' : '🔊 Volumen'}
            </button>
            <input
              className="range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={onVolume}
              disabled={!videoSrc}
              aria-label="Ajustar volumen"
            />
          </div>

          <div className="spacer" />

          <div className="group rate">
            <span style={{ opacity: .8 }}>Vel:</span>
            <select value={rate} onChange={onRate} disabled={!videoSrc} aria-label="Velocidad de reproducción">
              <option value={0.5}>0.5×</option>
              <option value={0.75}>0.75×</option>
              <option value={1}>1×</option>
              <option value={1.25}>1.25×</option>
              <option value={1.5}>1.5×</option>
              <option value={2}>2×</option>
            </select>
          </div>

          <div className="group">
            <button
              type="button"
              className="ctrl hit-24"
              onClick={toggleLoop}
              aria-pressed={loop}
              disabled={!videoSrc}
            >
              {loop ? '🔁 Loop ON' : 'Loop OFF'}
            </button>
            <button type="button" className="ctrl hit-24" onClick={togglePiP} disabled={!videoSrc}>🗔 PiP</button>
            <button type="button" className="ctrl hit-24" onClick={toggleFullscreen} disabled={!videoSrc}>⛶ Full</button>
          </div>
        </div>

        <div className="actions actions--video">
          <button
            className="btn primary"
            onClick={toggleFav}
            disabled={favBusy || isFav === null}
            aria-pressed={!!isFav}
          >
            {favBusy ? 'Guardando…' : isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>
        </div>
        {/* role="status" announces transient confirmation text */}
        {added && <p role="status" className="muted">{addedMsg}</p>}
      </div>

      {movie.description && (
        <>
          {/* Hidden label + readOnly textarea to show long text without being editable */}
          <label className="sr-only" htmlFor="desc">Descripción</label>
          <textarea
            id="desc"
            className="description description--readonly"
            defaultValue={movie.description}
            rows={4}
            readOnly
            aria-readonly="true"
            tabIndex={-1}
          />
        </>
      )}
    </section>
  )
}
