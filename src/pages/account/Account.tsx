import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import './Account.scss'
import { api } from '../../services/api'

type Profile = {
  id: string
  name: string
  birthdate: string   // yyyy-mm-dd
  email: string
}

type Errors = Partial<Record<keyof Profile, string>>

function pick(...vals: Array<string | undefined | null>) {
  for (const v of vals) if (typeof v === 'string' && v.trim() !== '') return v
  return ''
}

function formatDateForInput(v?: string | null) {
  if (!v) return ''
  const s = String(v)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const beforeT = s.split('T')[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(beforeT)) return beforeT
  const d = new Date(s)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const MIN_DATE = '1900-01-01'
const TODAY = new Date().toISOString().split('T')[0]

export default function Account(){
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<Profile|null>(null)
  const [form, setForm] = useState<Profile|null>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    (async () => {
      try {
        const me: any = await api.get('/auth/me')
        const id = me?.user?.id ?? me?.id
        const email = me?.user?.email ?? me?.email ?? ''

        let fromDb: any = {}
        try { fromDb = await api.get(`/users/${id}`) } catch {}

        const pObj: any = (fromDb && 'profile' in fromDb) ? fromDb.profile : fromDb

        const p: Profile = {
          id,
          email: pick(pObj?.email, email),
          name:  pick(pObj?.name,  me?.user?.user_metadata?.name),
          birthdate: formatDateForInput(
            pick(pObj?.birthdate, pObj?.birth_date, pObj?.dob, me?.user?.user_metadata?.birthdate)
          ),
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
      profile.birthdate !== form.birthdate ||
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
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Correo inválido.'
    if (!f.birthdate) e.birthdate = 'Selecciona tu fecha.'
    else if (f.birthdate < MIN_DATE || f.birthdate > TODAY) e.birthdate = 'Fecha fuera de rango.'
    return e
  }

  const isValid = useMemo(() => {
    if (!form) return false
    return Object.keys(validate(form)).length === 0
  }, [form])

  const canSave = editing && hasChanges && isValid && !saving

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    const v = name === 'birthdate' ? formatDateForInput(value) : value
    setForm(f => f ? { ...f, [name]: v } : f)
    if (form) setErrors(validate({ ...form, [name]: v } as Profile))
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
        birthdate: formatDateForInput(form.birthdate),
        email: form.email,
      })
      setProfile(form)
      setEditing(false)
      setSaved(true)
      window.setTimeout(()=>setSaved(false), 2500)
    } catch (err:any) {
      alert(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!profile) return
    try {
      await api.del(`/users/${profile.id}`)
    } catch (err:any) {
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
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='Flimhub' />
      <h1 className='sr-only'>Perfil</h1>

      {/* NOTA: añadimos clase is-readonly para estilizar inputs cuando no se edita */}
      <form className={`auth-form ${!editing ? 'is-readonly' : ''}`} onSubmit={onSave} noValidate>
        <label className='field'>
          <span className='field__label'>Nombre</span>
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
          <span className='field__label'>Fecha de nacimiento</span>
          <input
            name='birthdate'
            placeholder='Fecha de nacimiento'
            type='date'
            value={form.birthdate}
            onChange={onChange}
            disabled={!editing}
            min={MIN_DATE}
            max={TODAY}
            aria-invalid={!!errors.birthdate || undefined}
            aria-describedby={errors.birthdate ? 'err_birth' : undefined}
          />
          {errors.birthdate && <small id='err_birth' className='field__error'>{errors.birthdate}</small>}
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
          /* ====== NUEVO: 3 botones alineados/iguales ====== */
          <div className='actions'>
            <button className='btn success' type='button' onClick={()=>setEditing(true)}>Editar</button>
            <Link to='/' className='btn ghost'>Volver</Link>
            <Link to='/forgot-password' className='btn ghost'>Cambiar contraseña</Link>
          </div>
        ) : (
          <div className='row'>
            <button className='btn success' type='submit' disabled={!canSave} aria-busy={saving || undefined}>Guardar</button>
            <button className='btn danger' type='button' onClick={()=>{
              setForm(profile); setErrors({}); setEditing(false)
            }}>Cancelar</button>
          </div>
        )}

        {saved && <p role="status" className="muted" style={{ marginTop: '.5rem' }}>Datos guardados</p>}

        <button type='button' className='btn danger' onClick={()=>setConfirmDelete(true)}>
          Eliminar cuenta
        </button>
      </form>

      {/* Modal de confirmación */}
      {confirmDelete && (
        <div className='modal' role='dialog' aria-modal='true' aria-labelledby='delTitle'>
          <div className='modal-card'>
            <h3 id='delTitle'>¿Eliminar tu cuenta?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <div className='row'>
              <button type='button' className='btn danger' onClick={handleDelete}>Confirmar eliminación</button>
              <button type='button' className='btn ghost' onClick={()=>setConfirmDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
