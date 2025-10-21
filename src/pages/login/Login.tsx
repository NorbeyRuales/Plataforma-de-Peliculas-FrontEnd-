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
              onClick={() => setShowPwd(s => !s)}
            >
              {showPwd ? (
                // 👁️ contraseña visible
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeWidth="2"
                    d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                  <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" />
                </svg>
              ) : (
                // 🙈 contraseña oculta
                <span className="icon" role="img" aria-hidden="true">🙈</span>
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
