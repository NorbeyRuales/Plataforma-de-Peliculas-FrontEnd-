import { useEffect, useRef, useState } from 'react'
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

  const [showPwd1, setShowPwd1] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [caps1, setCaps1] = useState(false)
  const [caps2, setCaps2] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|undefined>()
  const errSummaryRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const pwdRef = useRef<HTMLInputElement>(null)
  const pwd2Ref = useRef<HTMLInputElement>(null)

  useEffect(()=>{ if (error) errSummaryRef.current?.focus() }, [error])

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim())
  const passOk = password.length >= 6
  const same = password === password2
  const canSubmit = !!name.trim() && !!dob && emailOk && passOk && same && !loading

  function validate(): boolean {
    if (!name.trim()) { setError('Escribe tu nombre.'); nameRef.current?.focus(); return false }
    if (!emailOk) { setError('El correo no es válido.'); emailRef.current?.focus(); return false }
    if (!passOk) { setError('La contraseña debe tener al menos 6 caracteres.'); pwdRef.current?.focus(); return false }
    if (!same) { setError('Las contraseñas no coinciden.'); pwd2Ref.current?.focus(); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(undefined)
    if (!validate()) return
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

      {error && (
        <div
          ref={errSummaryRef}
          tabIndex={-1}
          role='alert'
          className='form-summary form-summary--error'
        >
          {error}
        </div>
      )}

      <form className='auth-form' onSubmit={handleSubmit} noValidate>
        <label className='field'>
          <span className='field__label'>Nombre completo</span>
          <input
            ref={nameRef}
            placeholder='Nombre completo'
            required
            autoComplete='name'
            value={name}
            onChange={e=>setName(e.target.value)}
          />
        </label>

        <label className='field'>
          <span className='field__label'>Fecha de nacimiento</span>
          <input
            placeholder='Fecha de nacimiento'
            type='date'
            required
            autoComplete='bday'
            value={dob}
            onChange={e=>setDob(e.target.value)}
          />
          <small className='field__hint'>Formato: AAAA-MM-DD</small>
        </label>

        <label className='field'>
          <span className='field__label'>Correo electrónico</span>
          <input
            ref={emailRef}
            placeholder='Correo electrónico'
            type='email'
            required
            autoComplete='email'
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />
        </label>

        <label className='field'>
          <span className='field__label'>Contraseña</span>
          <div className='password-field'>
            <input
              ref={pwdRef}
              placeholder='Contraseña'
              type={showPwd1 ? 'text' : 'password'}
              required
              autoComplete='new-password'
              minLength={6}
              value={password}
              onChange={e=>setPassword(e.target.value)}
              onKeyUp={e=>setCaps1(e.getModifierState('CapsLock'))}
              aria-describedby='reg_pwd_hint'
            />
            <button
              type='button'
              className='pwd-toggle'
              aria-pressed={showPwd1}
              aria-label={showPwd1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={()=>setShowPwd1(s=>!s)}
            >
              {showPwd1 ? (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/>
                  <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5"/>
                </svg>
              )}
              <span className="sr-only">{showPwd1 ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>
          <small id='reg_pwd_hint' className='field__hint'>
            Mínimo 6 caracteres. {caps1 ? 'Bloq Mayús activado.' : ''}
          </small>
        </label>

        <label className='field'>
          <span className='field__label'>Confirmar contraseña</span>
          <div className='password-field'>
            <input
              ref={pwd2Ref}
              placeholder='Confirmar contraseña'
              type={showPwd2 ? 'text' : 'password'}
              required
              autoComplete='new-password'
              value={password2}
              onChange={e=>setPassword2(e.target.value)}
              onKeyUp={e=>setCaps2(e.getModifierState('CapsLock'))}
              aria-describedby='reg_pwd2_hint'
            />
            <button
              type='button'
              className='pwd-toggle'
              aria-pressed={showPwd2}
              aria-label={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={()=>setShowPwd2(s=>!s)}
            >
              {showPwd2 ? (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/>
                  <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5"/>
                </svg>
              )}
              <span className="sr-only">{showPwd2 ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>
          <small id='reg_pwd2_hint' className='field__hint'>
            Debe coincidir con la contraseña. {caps2 ? 'Bloq Mayús activado.' : ''}
          </small>
        </label>

        <button className='btn primary' type='submit' disabled={!canSubmit}>
          {loading? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>
    </section>
  )
}
