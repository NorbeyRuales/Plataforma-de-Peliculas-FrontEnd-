import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import './Login.scss'
import { Auth } from '../../services/auth'

const EMAIL_KEY = 'last_email'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(localStorage.getItem(EMAIL_KEY) || '')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [caps, setCaps] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const errSummaryRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const pwdRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (email) localStorage.setItem(EMAIL_KEY, email) }, [email])

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim())
  const canSubmit = emailOk && password.length > 0 && !loading

  function validate(): boolean {
    if (!emailOk) { setError('El formato del correo no es válido.'); emailRef.current?.focus(); return false }
    if (!password) { setError('Ingresa tu contraseña.'); pwdRef.current?.focus(); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(undefined)
    if (!validate()) { errSummaryRef.current?.focus(); return }
    setLoading(true)
    try {
      await Auth.login(email, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión')
      errSummaryRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='PYRA' />
      <h1 className='sr-only'>Iniciar sesión</h1>

      {error && (
        <div ref={errSummaryRef} tabIndex={-1} role='alert' className='form-summary form-summary--error'>
          {error}
        </div>
      )}

      <form className='auth-form' onSubmit={handleSubmit} noValidate>
        <label className='field'>
          <span className='field__label'>Tú correo</span>
          <input
            ref={emailRef}
            id='login_email'
            type='email'
            required
            autoComplete='email'
            placeholder='Ingresa tu correo electrónico'
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-describedby='login_email_hint'
            aria-invalid={error?.toLowerCase().includes('correo') ? true : undefined}
          />
          <small id='login_email_hint' className='field__hint'>Usa el correo con el que te registraste.</small>
        </label>

        <label className='field'>
          <span className='field__label'>Tú contraseña</span>
          <div className='password-field'>
            <input
              ref={pwdRef}
              id='login_password'
              type={showPwd ? 'text' : 'password'}
              required
              autoComplete='current-password'
              placeholder='Contraseña'
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyUp={e => setCaps(e.getModifierState('CapsLock'))}
              aria-describedby='login_pwd_hint'
              aria-invalid={error?.toLowerCase().includes('contrase') ? true : undefined}
            />
            <button
              type='button'
              className='pwd-toggle'
              aria-pressed={showPwd}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? (
                // (mismo SVG que ResetPassword cuando show=true)
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                  <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" />
                </svg>
              )}
              <span className="sr-only">{showPwd ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>
          <small id='login_pwd_hint' className='field__hint'>
            {caps ? 'Tienes Bloq Mayús activado.' : 'Es sensible a mayúsculas.'}
          </small>
        </label>

        <button className='btn primary' type='submit' disabled={!canSubmit}>
          {loading ? 'Entrando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className='muted'><Link to='/forgot-password'>¿Olvidaste la contraseña?</Link></p>
      <p className='muted'>¿Primera vez en PYRA? <Link to='/register'>Regístrate aquí</Link></p>
    </section>
  )
}
