/**
 * @file MovieDetail.tsx
 * @description Movie detail screen with HTML5 video player, keyboard-accessible
 * controls, favorites toggle, and star rating integration.
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './MovieDetail.scss'
import { api } from '../../services/api'
import { getRandomPexelsVideo } from '../../services/pexelsServices'
import { Favorites } from '../../services/favorites'
import { getToken } from '../../services/auth'
import { useToast } from '../../components/toast/ToastProvider'
import StarRating from '../../pages/movie/StarRating' // ⭐ Nuevo componente

type Movie = {
  id: string | number
  title: string
  description?: string
  posterUrl?: string
  streamUrl?: string
  userRating?: number
}

/* ---------- Helpers ---------- */
function loaderStart() {
  window.dispatchEvent(new CustomEvent('top-loader', { detail: 'start' }))
}
function loaderStop() {
  window.dispatchEvent(new CustomEvent('top-loader', { detail: 'stop' }))
}
function formatDateES(d?: string | Date) {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', day: '2-digit' }).format(date)
}
function formatYearES(d?: string | Date) {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear())
}
function formatDuration(mins?: number | string) {
  const m = Number(mins)
  if (!Number.isFinite(m) || m <= 0) return ''
  const h = Math.floor(m / 60)
  const r = m % 60
  return h > 0 ? `${h} h ${r} min` : `${r} min`
}
function pickText(m: any, keys: string[]) {
  for (const k of keys) {
    const v = m?.[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return ''
}

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const playerRef = useRef<HTMLVideoElement>(null)
  const { error: showErrorToast } = useToast()

  // Estados
  const [movie, setMovie] = useState<Movie | null>(null)
  const [pexelsVideoUrl, setPexelsVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [added, setAdded] = useState(false)
  const [addedMsg, setAddedMsg] = useState('')
  const [isFav, setIsFav] = useState<boolean | null>(null)
  const [favBusy, setFavBusy] = useState(false)

  // Controles del reproductor
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [loop, setLoop] = useState(false)

  // Sinopsis expandible
  const [synopsisExpanded, setSynopsisExpanded] = useState(false)

  /* -------- VALIDAR ID -------- */
  useEffect(() => {
    if (!id || id === 'undefined') setError('ID de película inválido')
  }, [id])

  /* -------- CARGAR PELÍCULA -------- */
  useEffect(() => {
    if (!id || id === 'undefined') return
    ;(async () => {
      loaderStart()
      setLoading(true)
      setError(undefined)
      try {
        const resp = await api.get<Movie | { movie: Movie }>(`/movies/${encodeURIComponent(id)}`)
        const m = (resp as any)?.movie ?? resp
        setMovie(m as Movie)
      } catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || 'No se pudo cargar la película'
        setError(msg)
        showErrorToast(msg)
      } finally {
        setLoading(false)
        loaderStop()
      }
    })()
  }, [id, showErrorToast])

  /* -------- FALLBACK DE VIDEO PEXELS -------- */
  useEffect(() => {
    if (!movie?.title || (movie as any).streamUrl) return
    let canceled = false
    ;(async () => {
      loaderStart()
      let url = await getRandomPexelsVideo(movie.title)
      if (!url) url = await getRandomPexelsVideo('cinema')
      if (!canceled) setPexelsVideoUrl(url)
      loaderStop()
    })()
    return () => {
      canceled = true
    }
  }, [movie?.title, (movie as any)?.streamUrl])

  /* -------- CONTROLADORES DE VIDEO -------- */
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

  useEffect(() => {
    const v = playerRef.current
    if (!v) return
    v.muted = muted
    v.volume = volume
    v.playbackRate = rate
    v.loop = loop
  }, [muted, volume, rate, loop])

  /* -------- FAVORITOS -------- */
  useEffect(() => {
    const movieId = String((movie?.id ?? id) ?? '')
    if (!movieId) return setIsFav(false)
    if (!getToken()) return setIsFav(false)

    let alive = true
    ;(async () => {
      try {
        const exists = await Favorites.has(movieId)
        if (alive) setIsFav(!!exists)
      } catch {
        if (alive) setIsFav(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [movie, id])

  async function toggleFav() {
    const movieId = String((movie?.id ?? id) ?? '')
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
      showErrorToast(msg)
    } finally {
      setFavBusy(false)
    }
  }

  /* -------- SHORTCUTS DE TECLADO -------- */
  useEffect(() => {
    const isEditable = (el: EventTarget | null) => {
      const n = el as HTMLElement | null
      if (!n) return false
      const tag = (n.tagName || '').toLowerCase()
      const editable = (n.getAttribute?.('contenteditable') || '').toLowerCase()
      return tag === 'input' || tag === 'textarea' || editable === 'true'
    }

    function onKey(e: KeyboardEvent) {
      if (e.altKey || e.ctrlKey || e.metaKey || isEditable(e.target)) return
      const key = e.key.toLowerCase()
      if (e.key === ' ' || key === 'k') {
        e.preventDefault()
        togglePlay()
      } else if (key === 'j') seek(-10)
      else if (key === 'l') seek(10)
      else if (key === 'm') setMuted(m => !m)
      else if (key === 'f') toggleFullscreen()
      else if (key === 'p') togglePiP()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function togglePlay() {
    const v = playerRef.current
    if (!v) return
    v.paused ? v.play() : v.pause()
  }

  function seek(offset: number) {
    const v = playerRef.current
    if (!v) return
    const d = v.duration || Infinity
    v.currentTime = Math.max(0, Math.min(d, v.currentTime + offset))
  }

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

  async function toggleFullscreen() {
    const v = playerRef.current
    if (!v) return
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await v.requestFullscreen?.()
    } catch (e) {
      console.error('Fullscreen error', e)
    }
  }

  /* -------- RENDER -------- */
  if (loading) return <section className="container"><p aria-busy="true">Cargando…</p></section>
  if (error) return <section className="container"><p role="alert" style={{ color: 'salmon' }}>{error}</p></section>
  if (!movie) return null

  const videoSrc = (movie as any).streamUrl || pexelsVideoUrl || undefined
  const rawRelease = (movie as any)?.release_date ?? (movie as any)?.releaseDate
  const yearField = (movie as any)?.year
  const year = formatYearES(rawRelease) || (yearField ? String(yearField) : '')
  const estreno = formatDateES(rawRelease) || (year ? year : '')
  const duracion = formatDuration((movie as any)?.runtime ?? (movie as any)?.duration)
  const genres = Array.isArray((movie as any)?.genres)
    ? ((movie as any).genres as any[]).map(g => (typeof g === 'string' ? g : g?.name)).filter(Boolean)
    : []
  const rawSynopsis =
    pickText(movie, ['description', 'overview', 'synopsis', 'plot', 'summary']) || (movie as any)?.description || ''
  const hasSynopsis = !!rawSynopsis
  const maxChars = 280
  const shortText = hasSynopsis && rawSynopsis.length > maxChars ? rawSynopsis.slice(0, maxChars) + '…' : rawSynopsis

  return (
    <section className="container movie-detail movie-detail--single">
      <h1 className="detail-title">{movie.title}</h1>

      {/* ⭐ Calificación del usuario */}
      <StarRating movieId={String(movie.id)} initialRating={movie.userRating ?? 0} />

      <div className={`player ${!videoSrc ? 'is-loading' : ''}`}>
        <video
          ref={playerRef}
          id="player"
          controls
          poster={(movie as any).posterUrl}
          src={videoSrc}
          style={{ width: '100%', maxWidth: 980, borderRadius: 8 }}
        />

        <div className="toolbar" aria-label="Controles de reproducción">
          <div className="group">
            <button type="button" className="ctrl" onClick={togglePlay} aria-pressed={playing} disabled={!videoSrc}>
              {playing ? '⏸ Pausa' : '▶ Reproducir'}
            </button>
            <button type="button" className="ctrl" onClick={() => seek(-10)} disabled={!videoSrc}>⏮ 10s</button>
            <button type="button" className="ctrl" onClick={() => seek(10)} disabled={!videoSrc}>10s ⏭</button>
          </div>

          <div className="group volume">
            <button type="button" className="ctrl" onClick={() => setMuted(m => !m)} aria-pressed={muted} disabled={!videoSrc}>
              {muted || volume === 0 ? '🔇 Mute' : '🔊 Volumen'}
            </button>
            <input
              className="range"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              disabled={!videoSrc}
              aria-label="Ajustar volumen"
            />
          </div>

          <div className="spacer" />

          <div className="group rate">
            <span style={{ opacity: 0.8 }}>Vel:</span>
            <select value={rate} onChange={e => setRate(Number(e.target.value))} disabled={!videoSrc}>
              <option value={0.5}>0.5×</option>
              <option value={0.75}>0.75×</option>
              <option value={1}>1×</option>
              <option value={1.25}>1.25×</option>
              <option value={1.5}>1.5×</option>
              <option value={2}>2×</option>
            </select>
          </div>

          <div className="group">
            <button type="button" className="ctrl" onClick={() => setLoop(l => !l)} aria-pressed={loop} disabled={!videoSrc}>
              {loop ? '🔁 Loop ON' : 'Loop OFF'}
            </button>
            <button type="button" className="ctrl" onClick={togglePiP} disabled={!videoSrc}>🗔 PiP</button>
            <button type="button" className="ctrl" onClick={toggleFullscreen} disabled={!videoSrc}>⛶ Full</button>
          </div>
        </div>

        <div className="actions actions--video">
          <button className="btn primary" onClick={toggleFav} disabled={favBusy || isFav === null} aria-pressed={!!isFav}>
            {favBusy ? 'Guardando…' : isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>
        </div>
        {added && <p role="status" className="muted">{addedMsg}</p>}
      </div>

      {(estreno || duracion || genres.length) && (
        <section className="movie-meta">
          <h2>Detalles</h2>
          <ul className="meta-list">
            {estreno && <li><strong>Estreno:</strong> {estreno}{year ? ` (${year})` : ''}</li>}
            {duracion && <li><strong>Duración:</strong> {duracion}</li>}
            {!!genres.length && <li><strong>Géneros:</strong> {genres.join(', ')}</li>}
          </ul>
        </section>
      )}

      <section className="movie-synopsis">
        <h2>Sinopsis</h2>
        <p id="synopsis-text" style={{ whiteSpace: 'pre-line' }}>
          {hasSynopsis ? (synopsisExpanded ? rawSynopsis : shortText) : 'No hay sinopsis disponible por ahora.'}
        </p>

        {hasSynopsis && rawSynopsis.length > maxChars && (
          <button
            type="button"
            className="linklike"
            aria-expanded={synopsisExpanded}
            aria-controls="synopsis-text"
            onClick={() => setSynopsisExpanded(v => !v)}
          >
            {synopsisExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </section>
    </section>
  )
}
