import { Link } from 'react-router-dom'
import './ForgotPassword.scss'

export default function ForgotPassword(){
  return (
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='Flimhub' />
      <h1 className='sr-only'>Recuperar contraseña</h1>
      <p className='muted center'>¿Olvidaste la contraseña? No te preocupes, te ayudaremos a restablecerla.</p>
      <form className='auth-form' onSubmit={(e)=>e.preventDefault()}>
        <input placeholder='Ingresa tu correo electrónico' type='email' required />
        <button className='btn primary' type='submit'>Enviar</button>
      </form>
      <p className='muted center'><Link to='/login'>¿Recordaste tu contraseña? Volver a inicio</Link></p>
    </section>
  )
}
