import MovieCard from '../../components/movie/MovieCard'
import './Home.scss'

const dummy = Array.from({length:8}).map((_,i)=>({
  _id:String(i+1), title:`Película ${i+1}`, year:2000+i, genres:['Acción','Aventura']
}))

export default function Home(){
  return (
    <section className='container home-page'>
      <h2>Recomendado para ti</h2>
      <div className='grid'>{dummy.map(m => <MovieCard key={m._id} movie={m as any} />)}</div>
      <h2>Series</h2>
      <div className='grid'>{dummy.map(m => <MovieCard key={'s-'+m._id} movie={m as any} />)}</div>
    </section>
  )
}
