import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import "../account/Account.scss";
import { api } from '../../services/api'
import { Auth } from '../../services/auth'

type Profile = {
    id: string
    name: string
    birthdate: string
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

// Validación de password
function validatePassword(pwd: string): string | null {
    if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
    if (!/[A-Z]/.test(pwd)) return 'Debe contener al menos una letra mayúscula.'
    if (!/[0-9]/.test(pwd)) return 'Debe contener al menos un número.'
    if (!/[^A-Za-z0-9]/.test(pwd)) return 'Debe contener al menos un carácter especial.'
    return null
}

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

    // ---- Cambiar contraseña (inline) ----
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

                const p: Profile = {
                    id,
                    email: pick(pObj?.email, email),
                    name: pick(pObj?.name, me?.user?.user_metadata?.name),
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
    const isValid = useMemo(() => form ? Object.keys(validate(form)).length === 0 : false, [form])
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
            window.setTimeout(() => setSaved(false), 2500)
        } catch (err: any) {
            alert(err.message || 'Error al guardar')
        } finally {
            setSaving(false)
        }
    }

    async function onChangePassword(e: React.FormEvent) {
        e.preventDefault()
        setPwdErrorMsg(undefined)
        if (!canChangePwd) return

        setPwdSaving(true)
        try {
            // llamada alineada con el backend: (currentPassword, newPassword)
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
                    <div className='actions'>
                        <button className='btn success' type='button' onClick={() => setEditing(true)}>Editar</button>
                        <button type='button' className='btn ghost' aria-expanded={pwdOpen} onClick={() => setPwdOpen(v => !v)}>
                            {pwdOpen ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
                        </button>
                    </div>
                ) : (
                    <div className='row'>
                        <button className='btn success' type='submit' disabled={!canSave} aria-busy={saving || undefined}>Guardar</button>
                        <button className='btn danger' type='button' onClick={() => { setForm(profile); setErrors({}); setEditing(false) }}>
                            Cancelar
                        </button>
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
                                <button type='button' className='pwd-toggle' aria-pressed={show1} onClick={() => setShow1(s => !s)}>
                                    {show1 ? '🙈' : '👁️'}
                                </button>
                            </div>
                            <small className='field__hint'>{caps1 ? 'Bloq Mayús activado.' : 'Es sensible a mayúsculas.'}</small>
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
                                <button type='button' className='pwd-toggle' aria-pressed={show2} onClick={() => setShow2(s => !s)}>
                                    {show2 ? '🙈' : '👁️'}
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
                                    aria-invalid={!!newPwd2 && !samePwd ? true : undefined}
                                    aria-describedby='pwd_new2_hint'
                                />
                                <button type='button' className='pwd-toggle' aria-pressed={show3} onClick={() => setShow3(s => !s)}>
                                    {show3 ? '🙈' : '👁️'}
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
                            <button className='btn success' type='button' onClick={onChangePassword} disabled={!canChangePwd} aria-busy={pwdSaving || undefined}>
                                Guardar nueva contraseña
                            </button>
                            <button className='btn ghost' type='button' onClick={() => { setCurrPwd(''); setNewPwd(''); setNewPwd2(''); setPwdErrorMsg(undefined); setPwdOpen(false) }}>
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
