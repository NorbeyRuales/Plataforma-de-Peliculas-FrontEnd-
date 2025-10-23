import { useParams } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './MovieDetail.scss'
import { api } from '../../services/api'
import { getRandomPexelsVideo } from '../../services/pexelsServices'

type Movie = {
  id: string | number
  title: string
  description?: string
  posterUrl?: string
  streamUrl?: string
}

export default function MovieDetail() {
  const { id } = useParams()
  const playerRef = useRef<HTMLVideoElement>(null)

  const [movie, setMovie] = useState<Movie | null>(null)
  const [pexelsVideoUrl, setPexelsVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [added, setAdded] = useState(false)

  // Controles del reproductor
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [loop, setLoop] = useState(false)

  // Guard: id inválido
  useEffect(() => {
    if (!id || id === 'undefined') setError('ID de película inválido')
  }, [id])

  // Cargar película desde el backend
  useEffect(() => {
    if (!id || id === 'undefined') return
      ; (async () => {
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

  // Si la película no tiene streamUrl, obtener uno de Pexels (con fallback a "cinema")
  useEffect(() => {
    if (!movie?.title || movie.streamUrl) return
    let canceled = false
      ; (async () => {
        let url = await getRandomPexelsVideo(movie.title)
        if (!url) url = await getRandomPexelsVideo('cinema')
        if (!canceled) setPexelsVideoUrl(url)
      })()
    return () => { canceled = true }
  }, [movie?.title, movie?.streamUrl])

  // Sincroniza estado local con el <video>
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

  // Aplicar estado de controles al elemento
  useEffect(() => {
    const v = playerRef.current
    if (!v) return
    v.muted = muted
    v.volume = volume
    v.playbackRate = rate
    v.loop = loop
  }, [muted, volume, rate, loop])

  // Helpers de control
  function togglePlay() {
    const v = playerRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }
  function seek(offset: number) {
    const v = playerRef.current
    if (!v) return
    const d = v.duration || Infinity
    v.currentTime = Math.max(0, Math.min(d, v.currentTime + offset))
  }
  function toggleMute() { setMuted(m => !m) }
  function onVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value)
    setVolume(val)
    if (val > 0 && muted) setMuted(false)
  }
  function onRate(e: React.ChangeEvent<HTMLSelectElement>) {
    setRate(Number(e.target.value))
  }
  function toggleLoop() { setLoop(l => !l) }

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
    const v = playerRef.current;
    if (!v) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        // 👉 pedimos fullscreen sobre el <video>
        await v.requestFullscreen?.();
      }
    } catch (e) {
      console.error('Fullscreen error', e);
    }
  }

  // Añadir a favoritos
  async function addToList() {
    try {
      await api.post('/favorites', { movieId: id })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (e: any) {
      alert(e?.message || 'No se pudo añadir a la lista')
    }
  }

  // Estados de carga / error
  if (loading) {
    return (
      <section className="container">
        <p aria-busy="true">Cargando…</p>
      </section>
    )
  }
  if (error) {
    return (
      <section className="container">
        <p role="alert" style={{ color: 'salmon' }}>{error}</p>
      </section>
    )
  }
  if (!movie) return null

  // Fuente de video (preferir la del backend, luego Pexels)
  const videoSrc = movie.streamUrl || pexelsVideoUrl || undefined

  return (
    <section className="container movie-detail movie-detail--single">
      {/* Título centrado */}
      <h1 className="detail-title">{movie.title}</h1>

      {/* Panel de video */}
      <div className={`player ${!videoSrc ? 'is-loading' : ''}`}>
        <video
          ref={playerRef}
          id="player"
          controls
          poster={movie.posterUrl}
          src={videoSrc}
          style={{ width: '100%', maxWidth: 980, borderRadius: 8 }}
        />

        {/* Barra de controles personalizada */}
        <div className="toolbar" aria-label="Controles de reproducción">
          <div className="group">
            <button
              type="button"
              className="ctrl"
              onClick={togglePlay}
              aria-pressed={playing}
              disabled={!videoSrc}
            >
              {playing ? '⏸ Pausa' : '▶ Reproducir'}
            </button>

            <button type="button" className="ctrl" onClick={() => seek(-10)} disabled={!videoSrc}>⏮ 10s</button>
            <button type="button" className="ctrl" onClick={() => seek(10)} disabled={!videoSrc}>10s ⏭</button>
          </div>

          <div className="group volume">
            <button
              type="button"
              className="ctrl"
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
              className="ctrl"
              onClick={toggleLoop}
              aria-pressed={loop}
              disabled={!videoSrc}
            >
              {loop ? '🔁 Loop ON' : 'Loop OFF'}
            </button>
            <button type="button" className="ctrl" onClick={togglePiP} disabled={!videoSrc}>🗔 PiP</button>
            <button type="button" className="ctrl" onClick={toggleFullscreen} disabled={!videoSrc}>⛶ Full</button>
          </div>
        </div>

        <div className="actions actions--video">
          <button className="btn primary" onClick={addToList}>Añadir a lista</button>
        </div>
        {added && <p role="status" className="muted">Añadida a tu lista</p>}
      </div>

      {movie.description && (
        <>
          <label className="sr-only" htmlFor="desc">Descripción</label>
          <textarea
            id="desc"
            className="description description--readonly"
            defaultValue={movie.description}
            rows={4}
            readOnly               // ⬅️ evita escribir
            aria-readonly="true"   // ⬅️ accesibilidad
            tabIndex={-1}          // ⬅️ (opcional) evita enfocarlo con Tab
          />

        </>
      )}
    </section>
  )
}
