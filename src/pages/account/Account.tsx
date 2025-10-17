import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './Account.scss'
import { api } from '../../services/api'

type Profile = {
  id: string
  name: string
  birthdate: string   // yyyy-mm-dd
  email: string
}

/** Devuelve el primer string no vacío (útil para mapear campos con nombres distintos) */
function pick(...vals: Array<string | undefined | null>) {
  for (const v of vals) if (typeof v === 'string' && v.trim() !== '') return v
  return ''
}

/** Normaliza cualquier fecha a YYYY-MM-DD (acepta ISO con hora, etc.) */
function formatDateForInput(v?: string | null) {
  if (!v) return ''
  const s = String(v)

  // ya viene correcta
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s

  // ISO con hora: 1999-07-27T...
  const beforeT = s.split('T')[0]
  if (/^\d{4}-\d{2}-\d{2}$/.test(beforeT)) return beforeT

  // Intenta parsear Date (tener en cuenta TZ)
  const d = new Date(s)
  if (isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export default function Account(){
  const [params] = useSearchParams()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<Profile|null>(null)
  const [form, setForm] = useState<Profile|null>(null)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  // Cargar usuario (solo con api.ts)
  useEffect(() => {
    (async () => {
      try {
        const me: any = await api.get('/auth/me')               // ajusta si tu endpoint es otro
        const id = me?.user?.id ?? me?.id
        const email = me?.user?.email ?? me?.email ?? ''

        let fromDb: any = {}
        try { fromDb = await api.get(`/users/${id}`) } catch {}  // si no existe, lo ignoramos

        // Normaliza (por si /users/:id devuelve { profile: {...} })
        const pObj: any = (fromDb && 'profile' in fromDb) ? fromDb.profile : fromDb

        const p: Profile = {
          id,
          email: pick(pObj?.email, email),
          name:  pick(pObj?.name,  me?.user?.user_metadata?.name),
          // Acepta birthdate / birth_date / dob y formatea a YYYY-MM-DD
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

  // Permite abrir modos por query (?mode=edit|delete)
  useEffect(() => {
    const mode = params.get('mode')
    if (mode === 'edit') setEditing(true)
    if (mode === 'delete') setConfirmDelete(true)
  }, [params])

  const canSave = useMemo(() => {
    if (!profile || !form) return false
    const changed =
      form.name !== profile.name ||
      form.birthdate !== profile.birthdate ||
      form.email !== profile.email
    return editing && changed && !saving
  }, [form, profile, editing, saving])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    // Para birthdate, aseguramos formato correcto
    const v = name === 'birthdate' ? formatDateForInput(value) : value
    setForm(f => f ? { ...f, [name]: v } : f)
  }

  async function onSave(e?: React.FormEvent) {
    e?.preventDefault()
    if (!profile || !form) return
    setSaving(true)
    try {
      await api.put(`/users/${profile.id}`, {
        name: form.name,
        // Enviamos YYYY-MM-DD
        birthdate: formatDateForInput(form.birthdate),
        email: form.email,
      })
      setProfile(form)
      setEditing(false)
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
    localStorage.removeItem('token')        // o tu forma de cerrar sesión
    navigate('/login', { replace: true })
  }

  if (!form) {
    return <section className='auth-screen container'><p aria-busy='true'>Cargando…</p></section>
  }

  return (
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='Flimhub' />
      <h1 className='sr-only'>Perfil</h1>

      <form className='auth-form' onSubmit={onSave}>
        <input
          name='name'
          placeholder='Nombre usuario'
          value={form.name}
          onChange={onChange}
          disabled={!editing}
        />
        <input
          name='birthdate'
          placeholder='Fecha de nacimiento'
          type='date'
          value={form.birthdate}
          onChange={onChange}
          disabled={!editing}
        />
        <input
          name='email'
          placeholder='Correo electrónico'
          type='email'
          value={form.email}
          onChange={onChange}
          disabled={!editing}
        />

        {!editing ? (
          <div className='row'>
            <button className='btn success' type='button' onClick={()=>setEditing(true)}>Editar</button>
            <Link to='/' className='btn ghost'>Volver</Link>
          </div>
        ) : (
          <div className='row'>
            <button className='btn success' type='submit' disabled={!canSave} aria-busy={saving || undefined}>Guardar</button>
            <button className='btn danger' type='button' onClick={()=>{ setForm(profile); setEditing(false) }}>Cancelar</button>
          </div>
        )}

        {/* Eliminar cuenta */}
        {!confirmDelete ? (
          <button type='button' className='btn danger' onClick={()=>setConfirmDelete(true)}>
            Eliminar cuenta
          </button>
        ) : (
          <div className='row'>
            <button type='button' className='btn danger' onClick={handleDelete}>Confirmar eliminación</button>
            <button type='button' className='btn ghost' onClick={()=>setConfirmDelete(false)}>Cancelar</button>
          </div>
        )}
      </form>
    </section>
  )
}
