import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'
import './MovieDetail.scss'

export default function MovieDetail(){
  const { id } = useParams()
  const [playing, setPlaying] = useState(false)

  return (
    <section className='container movie-detail'>
      <div className='topbar'>
        <h1>Dragonball Z</h1>
        <Link to='/' className='back' aria-label='Volver'>←</Link>
      </div>

      <div className='player'>
        <button aria-label='Anterior'>⏮</button>
        <button aria-label={playing ? 'Pausar' : 'Reproducir'} onClick={()=>setPlaying(p=>!p)}>
          {playing ? '⏸' : '▶'}
        </button>
        <button aria-label='Siguiente'>⏭</button>
      </div>

      <div className='progress' aria-label='Barra de progreso'>
        <div className='progress-track'><div className='progress-thumb' style={{width:'30%'}} /></div>
        <div className='progress-controls'>
          <button aria-label='Retroceder 10s'>⏮</button>
          <button aria-label='Pausa'>⏯</button>
          <button aria-label='Avanzar 10s'>⏭</button>
        </div>
      </div>

      <label className='sr-only' htmlFor='desc'>Descripción</label>
      <textarea id='desc' className='description' placeholder='Descripción de la película' rows={4} />

      <div className='row'>
        <button className='btn primary'>Añadir a lista</button>
        <button className='btn ghost'>Compartir</button>
      </div>
    </section>
  )
}
