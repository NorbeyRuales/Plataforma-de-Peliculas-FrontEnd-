import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './Login.scss'
import { Auth } from '../../services/auth'

export default function Login(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(undefined)
    setLoading(true)
    try{
      await Auth.login(email, password)
      navigate('/home')
    }catch(err:any){
      setError(err?.message || 'Error al iniciar sesión')
    }finally{
      setLoading(false)
    }
  }

  return (
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='Flimhub' />
      <h1 className='sr-only'>Iniciar sesión</h1>
      <form className='auth-form' onSubmit={handleSubmit}>
        <input placeholder='Ingresa tu correo electrónico' type='email' required value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder='Contraseña' type='password' required value={password} onChange={e=>setPassword(e.target.value)} />
        <button className='btn primary' type='submit' disabled={loading}>{loading? 'Entrando...' : 'Iniciar sesión'}</button>
      </form>
      {error && <p className='muted' style={{color:'salmon'}}>{error}</p>}
      <p className='muted'><Link to='/forgot-password'>¿Olvidaste la contraseña?</Link></p>
      <p className='muted'>¿Primera vez en Flimhub? <Link to='/register'>Regístrate aquí</Link></p>
    </section>
  )
}
