import { Link } from 'react-router-dom'
import type { Movie } from '../../types'
import './MovieCard.scss'

export default function MovieCard({ movie }: { movie: Movie }){
  return (
    <article className='movie-card'>
      <Link to={`/movie/${movie._id}`} aria-label={`Abrir ${movie.title}`}>
        <div className='poster'><div className='poster-placeholder'/></div>
        <div className='info'>
          <h3>{movie.title}</h3>
          <p className='meta'>{movie.year} • {(movie.genres||[]).slice(0,2).join(' / ')}</p>
          <p className='stars' aria-label='Rating'>★★★★★</p>
        </div>
      </Link>
    </article>
  )
}
