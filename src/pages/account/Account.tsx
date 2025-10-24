// src/pages/account/Account.tsx
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import './Account.scss'
import { api } from '../../services/api'
import { Auth } from '../../services/auth'

type Profile = {
  id: string
  name: string
  apellido: string        // ✅ nuevo
  age: number | undefined
  email: string
}

type Errors = Partial<Record<keyof Profile, string>>

function pickStr(...vals: Array<string | undefined | null>) {
  for (const v of vals) if (typeof v === 'string' && v.trim() !== '') return v
  return ''
}

function toNum(v: unknown): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function calcAgeFromBirthdate(dateISO?: string | null): number | undefined {
  if (!dateISO) return undefined
  const s = String(dateISO)
  const ymd = /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : s.split('T')[0]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return undefined
  const [y, m, d] = ymd.split('-').map(Number)
  const birth = new Date(y, m - 1, d)
  if (Number.isNaN(birth.getTime())) return undefined
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const mDiff = today.getMonth() - birth.getMonth()
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const AGE_MIN = 13
const AGE_MAX = 120

export default function Account() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState<Profile | null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)

  // ---- Cambiar contraseña (misma vista) ----
  const [pwdOpen, setPwdOpen] = useState(false)
  const [currPwd, setCurrPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [newPwd2, setNewPwd2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)
  const [caps1, setCaps1] = useState(false)
  const [caps2, setCaps2] = useState(false)
  const [caps3, setCaps3] = useState(false)
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdSaved, setPwdSaved] = useState(false)
  const [pwdErrorMsg, setPwdErrorMsg] = useState<string | undefined>()

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    if (!/[A-Z]/.test(pwd)) return 'Debe contener al menos una letra mayúscula.'
    if (!/[0-9]/.test(pwd)) return 'Debe contener al menos un número.'
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Debe contener al menos un carácter especial.'
    return null
  }
  const newPwdErr = validatePassword(newPwd)
  const newPwdOk = !!newPwd && !newPwdErr
  const samePwd = newPwd === newPwd2
  const canChangePwd = !!currPwd && newPwdOk && samePwd && !pwdSaving

  useEffect(() => {
    (async () => {
      try {
        const me: any = await api.get('/auth/me')
        const id = me?.user?.id ?? me?.id
        const email = me?.user?.email ?? me?.email ?? ''

        let fromDb: any = {}
        try { fromDb = await api.get(`/users/${id}`) } catch { }

        const pObj: any = (fromDb && 'profile' in fromDb) ? fromDb.profile : fromDb

        // edad: primero DB (age/edad), si no, intenta derivar de birthdate si existe
        const ageFromDb = toNum(pObj?.age ?? pObj?.edad)
        const ageFromMeta = calcAgeFromBirthdate(
          pObj?.birthdate ?? pObj?.birth_date ?? pObj?.dob ?? me?.user?.user_metadata?.birthdate
        )

        const p: Profile = {
          id,
          email: pickStr(pObj?.email, email),
          name: pickStr(pObj?.name, me?.user?.user_metadata?.name),
          apellido: pickStr(pObj?.apellido, me?.user?.user_metadata?.apellido), // ✅
          age: ageFromDb ?? ageFromMeta,
        }

        setProfile(p)
        setForm(p)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  useEffect(() => {
    const mode = params.get('mode')
    if (mode === 'edit') setEditing(true)
    if (mode === 'delete') setConfirmDelete(true)
  }, [params])

  useEffect(() => {
    if (editing) setTimeout(() => nameRef.current?.focus(), 60)
  }, [editing])

  const hasChanges = useMemo(() => {
    if (!profile || !form) return false
    return (
      profile.name !== form.name ||
      profile.apellido !== form.apellido ||  // ✅
      profile.age !== form.age ||
      profile.email !== form.email
    )
  }, [form, profile])

  useEffect(() => {
    function onUnload(e: BeforeUnloadEvent) {
      if (hasChanges && editing) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [editing, hasChanges])

  function validate(f: Profile): Errors {
    const e: Errors = {}
    if (!f.name || f.name.trim().length < 2) e.name = 'Escribe tu nombre (min. 2 caracteres).'
    if (!f.apellido || f.apellido.trim().length < 2) e.apellido = 'Escribe tu apellido (min. 2 caracteres).' // ✅
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo inválido.'
    if (f.age === undefined || f.age === null || Number.isNaN(f.age)) {
      e.age = 'Escribe tu edad.'
    } else if (f.age < AGE_MIN || f.age > AGE_MAX) {
      e.age = `La edad debe estar entre ${AGE_MIN} y ${AGE_MAX}.`
    }
    return e
  }

  const isValid = useMemo(() => {
    if (!form) return false
    return Object.keys(validate(form)).length === 0
  }, [form])

  const canSave = editing && hasChanges && isValid && !saving

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    // Solo tratamiento especial para `age`
    const v =
      name === 'age'
        ? (() => {
          if (value === '') return undefined
          // Sanear: quitar no-dígitos, limitar a 3 chars (max 120)
          const digits = value.replace(/[^\d]/g, '').slice(0, 3)
          if (digits === '') return undefined
          const n = Math.trunc(Number(digits))
          return Number.isFinite(n) ? n : undefined
        })()
        : value

    setForm(f => f ? { ...f, [name]: v } as Profile : f)
    if (form) setErrors(validate({ ...(form as Profile), [name]: v } as Profile))
  }

  // Al salir del input, forzar al rango si hay valor
  function onAgeBlur() {
    setForm(f => {
      if (!f) return f
      if (f.age === undefined || f.age === null || Number.isNaN(f.age)) return f
      const clamped = Math.max(AGE_MIN, Math.min(AGE_MAX, Math.trunc(f.age)))
      if (clamped === f.age) return f
      const next = { ...f, age: clamped }
      setErrors(validate(next))
      return next
    })
  }

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault()
    if (!profile || !form) return

    const vErr = validate(form)
    setErrors(vErr)
    if (Object.keys(vErr).length > 0) return

    setSaving(true)
    try {
      await api.put(`/users/${profile.id}`, {
        name: form.name,
        apellido: form.apellido,       // ✅ enviar apellido
        age: form.age ?? null,
        email: form.email,
      })
      setProfile(form)
      setEditing(false)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      alert(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function onChangePassword(e?: React.FormEvent) {
    e?.preventDefault()
    setPwdErrorMsg(undefined)
    if (!canChangePwd) return

    setPwdSaving(true)
    try {
      await Auth.changePassword(currPwd, newPwd)
      setCurrPwd(''); setNewPwd(''); setNewPwd2('')
      setPwdOpen(false)
      setPwdSaved(true)
      setTimeout(() => setPwdSaved(false), 2500)
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo cambiar la contraseña'
      setPwdErrorMsg(msg)
    } finally {
      setPwdSaving(false)
    }
  }

  async function handleDelete() {
    if (!profile) return
    try {
      await api.del(`/users/${profile.id}`)
    } catch (err: any) {
      alert(err.message || 'No se pudo eliminar')
      return
    }
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  if (!form) {
    return <section className='auth-screen container'><p aria-busy='true'>Cargando…</p></section>
  }

  return (
    <section className='auth-screen container account-page'>
      <div className='logo-big' aria-label='PYRA' />
      <h1 className='sr-only'>Perfil</h1>

      <form className={`auth-form ${!editing ? 'is-readonly' : ''}`} onSubmit={onSave} noValidate>
        <label className='field'>
          <span className='field__label'>Tú nombre</span>
          <input
            ref={nameRef}
            name='name'
            placeholder='Nombre usuario'
            value={form.name}
            onChange={onChange}
            disabled={!editing}
            aria-invalid={!!errors.name || undefined}
            aria-describedby={errors.name ? 'err_name' : undefined}
          />
          {errors.name && <small id='err_name' className='field__error'>{errors.name}</small>}
        </label>

        <label className='field'>
          <span className='field__label'>Apellido</span>
          <input
            name='apellido'
            placeholder='Apellido'
            value={form.apellido}
            onChange={onChange}
            disabled={!editing}
            aria-invalid={!!errors.apellido || undefined}
            aria-describedby={errors.apellido ? 'err_apellido' : undefined}
          />
          {errors.apellido && <small id='err_apellido' className='field__error'>{errors.apellido}</small>}
        </label>

        <label className='field'>
          <span className='field__label'>Edad</span>
          <input
            name='age'
            placeholder='Edad'
            type='number'
            inputMode='numeric'
            step={1}
            min={AGE_MIN}
            max={AGE_MAX}
            value={form.age ?? ''}
            onChange={onChange}
            onBlur={onAgeBlur}
            disabled={!editing}
            aria-invalid={!!errors.age || undefined}
            aria-describedby={errors.age ? 'err_age' : undefined}
          />
          {errors.age && <small id='err_age' className='field__error'>{errors.age}</small>}
          <small className='field__hint italic'>Debes tener al menos {AGE_MIN} años.</small>
        </label>

        <label className='field'>
          <span className='field__label'>Correo</span>
          <input
            name='email'
            placeholder='Correo electrónico'
            type='email'
            value={form.email}
            onChange={onChange}
            disabled={!editing}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={errors.email ? 'err_email' : undefined}
          />
          {errors.email && <small id='err_email' className='field__error'>{errors.email}</small>}
        </label>

        {!editing ? (
          <div className='actions'>
            <button className='btn success' type='button' onClick={() => setEditing(true)}>Editar</button>
            <button
              type='button'
              className='btn ghost'
              aria-expanded={pwdOpen}
              onClick={() => setPwdOpen(v => !v)}
            >
              {pwdOpen ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
            </button>
          </div>
        ) : (
          <div className='row'>
            <button className='btn success' type='submit' disabled={!canSave} aria-busy={saving || undefined}>Guardar</button>
            <button className='btn danger' type='button' onClick={() => {
              setForm(profile); setErrors({}); setEditing(false)
            }}>Cancelar</button>
          </div>
        )}

        {pwdOpen && (
          <fieldset className='pwd-panel'>
            <legend>Cambiar contraseña</legend>

            <label className='field'>
              <span className='field__label'>Contraseña actual</span>
              <div className='password-field'>
                <input
                  placeholder='Contraseña actual'
                  type={show1 ? 'text' : 'password'}
                  autoComplete='current-password'
                  value={currPwd}
                  onChange={(e) => setCurrPwd(e.target.value)}
                  onKeyUp={(e) => setCaps1(e.getModifierState('CapsLock'))}
                />
                <button
                  type='button'
                  className='pwd-toggle'
                  aria-pressed={show1}
                  aria-label={show1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShow1(s => !s)}
                >
                  {show1 ? (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path fill='none' stroke='currentColor' strokeWidth='2' d='M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36' />
                    </svg>
                  ) : (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path fill='none' stroke='currentColor' strokeWidth='2' d='M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z' />
                      <circle fill='none' stroke='currentColor' strokeWidth='2' cx='12' cy='12' r='3.5' />
                    </svg>
                  )}
                  <span className='sr-only'>{show1 ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <small className='field__hint'>{caps1 ? 'Bloq Mayús activado.' : ''}</small>
            </label>

            <label className='field'>
              <span className='field__label'>Nueva contraseña</span>
              <div className='password-field'>
                <input
                  placeholder='Nueva contraseña'
                  type={show2 ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  onKeyUp={(e) => setCaps2(e.getModifierState('CapsLock'))}
                  aria-invalid={!!newPwdErr || undefined}
                  aria-describedby='pwd_new_hint'
                />
                <button
                  type='button'
                  className='pwd-toggle'
                  aria-pressed={show2}
                  aria-label={show2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShow2(s => !s)}
                >
                  {show2 ? (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path fill='none' stroke='currentColor' strokeWidth='2' d='M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36' />
                    </svg>
                  ) : (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path fill='none' stroke='currentColor' strokeWidth='2' d='M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z' />
                      <circle fill='none' stroke='currentColor' strokeWidth='2' cx='12' cy='12' r='3.5' />
                    </svg>
                  )}
                  <span className='sr-only'>{show2 ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <small id='pwd_new_hint' className={`field__hint ${!newPwd ? '' : (newPwdOk ? 'field__hint--ok' : 'field__hint--bad')}`}>
                {!newPwd ? 'Mínimo 8 caracteres, mayúscula, número y símbolo.' : (newPwdOk ? 'La contraseña cumple con los requisitos.' : (newPwdErr as string))}
                {caps2 ? ' Bloq Mayús activado.' : ''}
              </small>
            </label>

            <label className='field'>
              <span className='field__label'>Confirmar nueva contraseña</span>
              <div className='password-field'>
                <input
                  placeholder='Confirmar nueva contraseña'
                  type={show3 ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={newPwd2}
                  onChange={(e) => setNewPwd2(e.target.value)}
                  onKeyUp={(e) => setCaps3(e.getModifierState('CapsLock'))}
                  aria-invalid={!!newPwd2 && !samePwd || undefined}
                  aria-describedby='pwd_new2_hint'
                />
                <button
                  type='button'
                  className='pwd-toggle'
                  aria-pressed={show3}
                  aria-label={show3 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShow3(s => !s)}
                >
                  {show3 ? (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path fill='none' stroke='currentColor' strokeWidth='2' d='M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36' />
                    </svg>
                  ) : (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path fill='none' stroke='currentColor' strokeWidth='2' d='M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z' />
                      <circle fill='none' stroke='currentColor' strokeWidth='2' cx='12' cy='12' r='3.5' />
                    </svg>
                  )}
                  <span className='sr-only'>{show3 ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <small id='pwd_new2_hint' className={`field__hint ${!newPwd2 ? '' : (samePwd ? 'field__hint--ok' : 'field__hint--bad')}`}>
                {!newPwd2 ? 'Debe coincidir con la contraseña.' : (samePwd ? 'Las contraseñas coinciden.' : 'Las contraseñas no coinciden.')}
                {caps3 ? ' Bloq Mayús activado.' : ''}
              </small>
            </label>

            {pwdErrorMsg && (
              <div role='alert' className='form-summary form-summary--error'>{pwdErrorMsg}</div>
            )}

            <div className='row'>
              <button
                className='btn success'
                type='button'
                onClick={onChangePassword}
                disabled={!canChangePwd}
                aria-busy={pwdSaving || undefined}
              >
                Guardar nueva contraseña
              </button>
              <button
                className='btn ghost'
                type='button'
                onClick={() => {
                  setCurrPwd(''); setNewPwd(''); setNewPwd2(''); setPwdErrorMsg(undefined); setPwdOpen(false)
                }}
              >
                Cancelar
              </button>
            </div>
          </fieldset>
        )}

        {saved && <p role="status" className="muted" style={{ marginTop: '.5rem' }}>Datos guardados</p>}
        {pwdSaved && <p role="status" className="muted" style={{ marginTop: '.25rem' }}>Contraseña actualizada</p>}

        <button type='button' className='btn danger' onClick={() => setConfirmDelete(true)}>
          Eliminar cuenta
        </button>
      </form>

      {confirmDelete && (
        <div className='modal' role='dialog' aria-modal='true' aria-labelledby='delTitle'>
          <div className='modal-card'>
            <h3 id='delTitle'>¿Eliminar tu cuenta?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className='row'>
              <button type='button' className='btn danger' onClick={handleDelete}>Confirmar eliminación</button>
              <button type='button' className='btn ghost' onClick={() => setConfirmDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
