import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './MovieDetail.scss'
import { api } from '../../services/api'

type Movie = {
  id: string | number
  title: string
  description?: string
  posterUrl?: string
  streamUrl?: string
}

export default function MovieDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const playerRef = useRef<HTMLVideoElement>(null)

  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [playing, setPlaying] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(()=>{
    (async()=>{
      setLoading(true); setError(undefined)
      try{
        const data = await api.get<Movie | {movie: Movie}>(`/movies/${id}`)
        const m = (data as any)?.movie ?? data
        setMovie(m as Movie)
      }catch(e:any){
        setError(e?.message || 'No se pudo cargar la película')
      }finally{
        setLoading(false)
      }
    })()
  }, [id])

  // sincroniza el estado playing según eventos del video
  useEffect(()=>{
    const v = playerRef.current
    if(!v) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [playerRef.current])

  function play(){ playerRef.current?.play() }
  function pause(){ playerRef.current?.pause() }

  async function addToList(){
    try{
      await api.post('/favorites', { movieId: id })
      setAdded(true)
      setTimeout(()=>setAdded(false), 2500)
    }catch(e:any){
      alert(e?.message || 'No se pudo añadir a la lista')
    }
  }

  if (loading) return <section className='container'><p aria-busy="true">Cargando…</p></section>
  if (error)   return <section className='container'><p role="alert" style={{color:'salmon'}}>{error}</p></section>
  if (!movie)  return null

  return (
    <section className='container movie-detail'>
      <div className='topbar'>
        <h1>{movie.title}</h1>
        <button className='back' onClick={()=>navigate(-1)} aria-label='Volver'>←</button>
      </div>

      <div className='player' style={{margin:'1rem 0'}}>
        <video
          ref={playerRef}
          id='player'
          controls
          poster={movie.posterUrl}
          src={movie.streamUrl}
          style={{width:'100%', maxWidth:960, borderRadius:8}}
        />
        <div className='row' style={{marginTop:'.5rem'}}>
          {!playing ? (
            <button className='btn' onClick={play} aria-label='Reproducir'>▶ Reproducir</button>
          ) : (
            <button className='btn' onClick={pause} aria-label='Pausar'>⏸ Pausar</button>
          )}
          <button className='btn primary' onClick={addToList}>Añadir a lista</button>
        </div>
        {added && <p role="status" className="muted">Añadida a tu lista</p>}
      </div>

      {movie.description && (
        <>
          <label className='sr-only' htmlFor='desc'>Descripción</label>
          <textarea
            id='desc'
            className='description'
            defaultValue={movie.description}
            rows={4}
          />
        </>
      )}
    </section>
  )
}
