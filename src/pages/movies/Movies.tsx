// src/pages/movies/Movies.tsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import MovieCard from '../../components/movie/MovieCard'
import { getRandomPexelsVideo } from '../../services/pexelsServices'
import '../home/Home.scss'
import '../movie/MovieDetail.scss'

type RawMovie = {
  _id?: string
  id?: string | number
  title: string
  year?: number | string
  poster_url?: string
  posterUrl?: string
  genres?: string[]
  description?: string
  streamUrl?: string
  stream_url?: string
  url?: string
}

const isMovieArray = (x: unknown): x is RawMovie[] =>
  Array.isArray(x) && x.every(o => o && typeof o === 'object' && 'title' in (o as any))

export default function Movies() {
  const { id } = useParams()
  const navigate = useNavigate()
  const playerRef = useRef<HTMLVideoElement>(null)

  /* ---------- ESTADO: LISTADO ---------- */
  const [movies, setMovies] = useState<RawMovie[]>([])
  const [listLoading, setListLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)

  /* ---------- ESTADO: DETALLE ---------- */
  const [movie, setMovie] = useState<RawMovie | null>(null)
  const [pexelsVideoUrl, setPexelsVideoUrl] = useState<string | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  /* ---------- EFECTO: CARGAR LISTADO (solo cuando no hay id) ---------- */
  useEffect(() => {
    if (id) return // estás en detalle, no cargar listado
    let alive = true
    ;(async () => {
      try {
        setListLoading(true)
        setListError(null)
        const resp = (await api.get('/movies')) as any
        const data = resp?.data ?? resp
        if (!alive) return
        setMovies(isMovieArray(data) ? data : [])
      } catch (err: any) {
        if (!alive) return
        setListError(err?.message || 'No se pudieron cargar las películas')
      } finally {
        if (alive) setListLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  /* ---------- EFECTO: CARGAR DETALLE (solo cuando hay id) ---------- */
  useEffect(() => {
    if (!id) return // estás en listado
    let canceled = false
    ;(async () => {
      setDetailLoading(true)
      setDetailError(null)
      setMovie(null)
      setPexelsVideoUrl(null)
      try {
        const resp = (await api.get<RawMovie | { movie: RawMovie }>(`/movies/${id}`)) as any
        const m = (resp?.movie ?? resp) as RawMovie
        if (!canceled) setMovie(m)
      } catch (e: any) {
        if (!canceled) setDetailError(e?.message || 'No se pudo cargar la película')
      } finally {
        if (!canceled) setDetailLoading(false)
      }
    })()
    return () => { canceled = true }
  }, [id])

  /* ---------- EFECTO: Fallback de Pexels si no hay streamUrl ---------- */
  useEffect(() => {
    if (!id) return
    const title = movie?.title
    const hasStream =
      !!(movie as any)?.streamUrl ||
      !!(movie as any)?.stream_url ||
      !!(movie as any)?.url

    if (!title || hasStream) return

    let canceled = false
    ;(async () => {
      try {
        let url = await getRandomPexelsVideo(title)
        if (!url) url = await getRandomPexelsVideo('cinema')
        if (!canceled && url) setPexelsVideoUrl(url)
      } catch (err) {
        // solo log, no romper UI
        console.error('Pexels fallback error:', err)
      }
    })()
    return () => { canceled = true }
  }, [id, movie?.title])

  /* ---------- Acción: añadir a lista ---------- */
  async function addToList() {
    if (!id) return
    try {
      await api.post('/favorites', { movieId: id })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (e: any) {
      alert(e?.message || 'No se pudo añadir a la lista')
    }
  }

  /* ===================== RENDER ===================== */

  // MODO DETALLE
  if (id) {
    if (detailLoading) {
      return (
        <section className="container">
          <p aria-busy="true">Cargando…</p>
        </section>
      )
    }
    if (detailError) {
      return (
        <section className="container">
          <p role="alert" style={{ color: 'salmon' }}>{detailError}</p>
        </section>
      )
    }
    if (!movie) return null

    const poster =
      movie.posterUrl || movie.poster_url || undefined
    const videoSrc =
      (movie as any).streamUrl ||
      (movie as any).stream_url ||
      (movie as any).url ||
      pexelsVideoUrl ||
      undefined

    return (
      <section className="container movie-detail">
        <div className="topbar">
          <h1>{movie.title}</h1>
          <button className="back" onClick={() => navigate(-1)} aria-label="Volver">←</button>
        </div>

        <div className="player" style={{ margin: '1rem 0' }}>
          <video
            ref={playerRef}
            id="player"
            controls
            poster={poster}
            src={videoSrc}
            style={{ width: '100%', maxWidth: 960, borderRadius: 8 }}
          />
          <div className="row" style={{ marginTop: '.5rem' }}>
            <button className="btn primary" onClick={addToList}>
              Añadir a lista
            </button>
          </div>
          {added && <p role="status" className="muted">Añadida a tu lista</p>}
        </div>

        {movie.description && (
          <>
            <label className="sr-only" htmlFor="desc">Descripción</label>
            <textarea
              id="desc"
              className="description"
              defaultValue={movie.description}
              rows={4}
            />
          </>
        )}
      </section>
    )
  }

  // MODO LISTADO
  return (
    <section className="home">
      <h1 className="title">Películas</h1>

      {listLoading && <p style={{ opacity: .8 }}>Cargando…</p>}
      {listError && <p style={{ color: 'salmon' }}>{listError}</p>}

      {!listLoading && !listError && (
        <div className='grid'>
          {movies.map(m => (
            <MovieCard key={m._id ?? String(m.id)} movie={m as any} />
          ))}
        </div>
      )}
    </section>
  )
}
