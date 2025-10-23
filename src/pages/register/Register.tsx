import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Register.scss'
import { Auth } from '../../services/auth'

const AGE_MIN = 13
const AGE_MAX = 120

export default function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [age, setAge] = useState<number | ''>('')       // ← antes: dob
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')

  const [showPwd1, setShowPwd1] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)
  const [caps1, setCaps1] = useState(false)
  const [caps2, setCaps2] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const errSummaryRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)         // ← para focus en errores
  const emailRef = useRef<HTMLInputElement>(null)
  const pwdRef = useRef<HTMLInputElement>(null)
  const pwd2Ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (error) errSummaryRef.current?.focus() }, [error])

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim())
  const same = password === password2

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    if (!/[A-Z]/.test(pwd)) return 'Debe contener al menos una letra mayúscula.'
    if (!/[0-9]/.test(pwd)) return 'Debe contener al menos un número.'
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Debe contener al menos un carácter especial.'
    return null
  }

  // ====== AÑADIDOS ======
  // (1) Medidor de fortaleza (0–4)
  const pwdScore = useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  const pwdMeterClass =
    'pwd-meter' +
    (pwdScore >= 2 ? ' pwd-meter--2' : '') +
    (pwdScore >= 3 ? ' pwd-meter--3' : '') +
    (pwdScore >= 4 ? ' pwd-meter--4' : '')

  // (2) Sugerencia de dominio para emails comunes
  const emailSuggestion = useMemo(() => {
    const fixes: Record<string, string> = {
      'gmal.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gnail.com': 'gmail.com',
      'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'yaho.com': 'yahoo.com'
    }
    const parts = email.split('@')
    if (parts.length === 2) {
      const dom = parts[1].toLowerCase()
      const fix = fixes[dom]
      if (fix && fix !== dom) return `${parts[0]}@${fix}`
    }
    return ''
  }, [email])
  // =======================

  const pwdError = validatePassword(password)
  const pwdValid = !!password && !pwdError
  const pwdHintText = !password
    ? 'Mínimo 8 caracteres, mayúscula, número y símbolo.'
    : (pwdValid ? 'La contraseña cumple con los requisitos.' : (pwdError as string))
  const pwdHintClass =
    'field__hint ' + (!password ? '' : (pwdValid ? 'field__hint--ok' : 'field__hint--bad'))

  const confirmHintText = !password2
    ? 'Debe coincidir con la contraseña.'
    : (same ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.')
  const confirmHintClass =
    'field__hint ' + (!password2 ? '' : (same ? 'field__hint--ok' : 'field__hint--bad'))

  const ageOk = age !== '' && Number(age) >= AGE_MIN && Number(age) <= AGE_MAX

  const canSubmit =
    !!name.trim() &&
    ageOk &&
    emailOk &&
    !validatePassword(password) &&
    same &&
    !loading

  function validate(): boolean {
    if (!name.trim()) { setError('Escribe tu nombre.'); nameRef.current?.focus(); return false }
    if (!ageOk) { setError(`La edad debe estar entre ${AGE_MIN} y ${AGE_MAX}.`); ageRef.current?.focus(); return false }
    if (!emailOk) { setError('El correo no es válido.'); emailRef.current?.focus(); return false }
    if (pwdError) { setError(pwdError); pwdRef.current?.focus(); return false }
    if (!same) { setError('Las contraseñas no coinciden.'); pwd2Ref.current?.focus(); return false }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(undefined)
    if (!validate()) return
    setLoading(true)
    try {
      // usa la sugerencia si el usuario aún tiene el dominio mal escrito
      await Auth.signup(
        name,
        emailSuggestion || email,
        password,
        password2,
        typeof age === 'number' ? age : Number(age)     
      )
      navigate('/login')
    } catch (err: any) {
      const fieldErrors = err?.response?.data?.error?.fieldErrors || {}
      const backendMsg =
        err?.response?.data?.error?.formErrors?.[0] ||
        (Object.values(fieldErrors)[0] as string[] | undefined)?.[0]
      setError(backendMsg || err?.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='PYRA' />
      <h1 className='sr-only'>Registro</h1>

      {error && (
        <div ref={errSummaryRef} tabIndex={-1} role='alert' className='form-summary form-summary--error'>
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
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        {/* ← Cambiado: Fecha de nacimiento → Edad */}
        <label className='field'>
          <span className='field__label'>Edad</span>
          <input
            ref={ageRef}
            placeholder='Edad'
            type='number'
            inputMode='numeric'
            required
            min={AGE_MIN}
            max={AGE_MAX}
            value={age === '' ? '' : age}
            onChange={(e) => {
              const v = e.target.value
              setAge(v === '' ? '' : Math.max(0, Math.trunc(Number(v))))
            }}
          />
          <small className='field__hint italic'>Digita tú edad</small>
        </label>

        <label className='field'>
          <span className='field__label'>Correo electrónico</span>
          <input
            ref={emailRef}
            placeholder='correo@dominio.com'
            type='email'
            required
            autoComplete='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={email.length > 0 && !emailOk ? true : undefined}
          />
          {emailSuggestion && emailSuggestion !== email && (
            <div className="input-hint-inline">
              ¿Quisiste decir{' '}
              <button
                type="button"
                className="btn ghost"
                onClick={() => setEmail(emailSuggestion)}
                aria-label={`Usar ${emailSuggestion}`}
                style={{ padding: '.2rem .5rem', borderRadius: 8 }}
              >
                {emailSuggestion}
              </button>
              ?
            </div>
          )}
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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => setCaps1(e.getModifierState('CapsLock'))}
              aria-describedby='reg_pwd_hint'
            />
            <button
              type='button'
              className='pwd-toggle'
              aria-pressed={showPwd1}
              aria-label={showPwd1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPwd1(!showPwd1)}
            >
              {showPwd1 ? (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                  <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" />
                </svg>
              )}
              <span className='sr-only'>{showPwd1 ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>

          <div className={pwdMeterClass} aria-hidden="true" style={{ marginTop: '.4rem', marginBottom: '.2rem' }}>
            <div className="pwd-meter__fill" />
          </div>

          <small id='reg_pwd_hint' className={pwdHintClass} aria-live='polite'>
            {pwdHintText}{caps1 ? ' Bloq Mayús activado.' : ''}
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
              onChange={(e) => setPassword2(e.target.value)}
              onKeyUp={(e) => setCaps2(e.getModifierState('CapsLock'))}
              aria-describedby='reg_pwd2_hint'
            />
            <button
              type='button'
              className='pwd-toggle'
              aria-pressed={showPwd2}
              aria-label={showPwd2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPwd2(!showPwd2)}
            >
              {showPwd2 ? (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                  <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" />
                </svg>
              )}
              <span className='sr-only'>{showPwd2 ? 'Ocultar' : 'Mostrar'}</span>
            </button>
          </div>
          <small id='reg_pwd2_hint' className={confirmHintClass} aria-live='polite'>
            {confirmHintText}{caps2 ? ' Bloq Mayús activado.' : ''}
          </small>
        </label>

        <button className='btn primary' type='submit' disabled={!canSubmit}>
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>
    </section>
  )
}
