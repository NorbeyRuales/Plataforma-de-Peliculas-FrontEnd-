import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Register.scss'
import { Auth } from '../../services/auth'

export default function Register(){
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(undefined)
    if(password !== password2){ setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try{
      await Auth.signup(name, email, password, password2, dob)
      navigate('/login')
    }catch(err:any){
      setError(err?.message || 'Error al crear la cuenta')
    }finally{
      setLoading(false)
    }
  }

  return (
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='Flimhub' />
      <h1 className='sr-only'>Registro</h1>
      <form className='auth-form' onSubmit={handleSubmit}>
        <input placeholder='Nombre completo' required value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder='Fecha de nacimiento' type='date' required value={dob} onChange={e=>setDob(e.target.value)} />
        <input placeholder='Correo electrónico' type='email' required value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder='Contraseña' type='password' required value={password} onChange={e=>setPassword(e.target.value)} />
        <input placeholder='Confirmar contraseña' type='password' required value={password2} onChange={e=>setPassword2(e.target.value)} />
        <button className='btn primary' type='submit' disabled={loading}>{loading? 'Creando...' : 'Crear cuenta'}</button>
        {error && <p className='muted' style={{color:'salmon'}}>{error}</p>}
      </form>
    </section>
  )
}
