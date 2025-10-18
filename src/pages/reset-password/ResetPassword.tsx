// src/pages/reset-password/ResetPassword.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.scss';
import { supa } from '../../services/supa';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [caps1, setCaps1] = useState(false);
    const [caps2, setCaps2] = useState(false);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    const passOk = pass1.length >= 6;
    const same = pass1 === pass2;
    const canSave = passOk && same && !loading;

    useEffect(() => { if (err) errRef.current?.focus(); }, [err]);

    // 1) Intercambia el token del URL por una sesión de Supabase
    useEffect(() => {
        (async () => {
            try {
                const url = new URL(window.location.href);
                const hasHash = !!window.location.hash;
                const hasCode = !!url.searchParams.get('code');
                if (!hasHash && !hasCode) {
                    setErr('El enlace de recuperación no es válido o ya fue usado.');
                    return;
                }
                const { error } = await supa.auth.exchangeCodeForSession(window.location.href);
                if (error) throw error;
                // Limpia el URL para no dejar el token a la vista
                window.history.replaceState({}, document.title, '/reset-password');
            } catch (e: any) {
                setErr(e?.message || 'No se pudo validar el enlace de recuperación.');
            }
        })();
    }, []);

    // 2) Guardar nueva contraseña
    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setErr(null); setMsg(null);
        try {
            if (!passOk) throw new Error('La contraseña debe tener al menos 6 caracteres.');
            if (!same) throw new Error('Las contraseñas no coinciden.');
            const { error } = await supa.auth.updateUser({ password: pass1 });
            if (error) throw error;
            setMsg('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
            try { await supa.auth.signOut(); } catch { }
            setTimeout(() => navigate('/login', { replace: true }), 1200);
        } catch (e: any) {
            setErr(e?.message || 'No se pudo actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className='auth-screen container'>
            <div className='logo-big' aria-label='Flimhub' />
            <h1 className='sr-only'>Nueva contraseña</h1>
            <p className='muted center'>Ingresa tu nueva contraseña.</p>

            {err && <p ref={errRef} role='alert' className='field__error center'>{err}</p>}
            {msg && <p role='status' className='muted center' style={{ color: '#7ddc7a' }}>{msg}</p>}

            <form className='auth-form' onSubmit={handleReset} noValidate>
                <label className='field'>
                    <span className='field__label'>Nueva contraseña</span>
                    <div className='password-field'>
                        <input
                            placeholder='Nueva contraseña'
                            type={show1 ? 'text' : 'password'}
                            required
                            minLength={6}
                            autoComplete='new-password'
                            value={pass1}
                            onChange={(e) => setPass1(e.target.value)}
                            onKeyUp={(e) => setCaps1(e.getModifierState('CapsLock'))}
                            aria-describedby='rp_pwd1_hint'
                        />
                        <button
                            type='button'
                            className='pwd-toggle'
                            aria-pressed={show1}
                            aria-label={show1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            onClick={() => setShow1((s) => !s)}
                        >
                            {show1 ? (
                                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" /></svg>
                            )}
                        </button>
                    </div>
                    <small id='rp_pwd1_hint' className='field__hint'>
                        Mínimo 6 caracteres. {caps1 ? 'Bloq Mayús activado.' : ''}
                    </small>
                </label>

                <label className='field'>
                    <span className='field__label'>Confirmar contraseña</span>
                    <div className='password-field'>
                        <input
                            placeholder='Confirmar contraseña'
                            type={show2 ? 'text' : 'password'}
                            required
                            autoComplete='new-password'
                            value={pass2}
                            onChange={(e) => setPass2(e.target.value)}
                            onKeyUp={(e) => setCaps2(e.getModifierState('CapsLock'))}
                            aria-describedby='rp_pwd2_hint'
                        />
                        <button
                            type='button'
                            className='pwd-toggle'
                            aria-pressed={show2}
                            aria-label={show2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            onClick={() => setShow2((s) => !s)}
                        >
                            {show2 ? (
                                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36" /></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="20" height="20"><path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" /><circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" /></svg>
                            )}
                        </button>
                    </div>
                    <small id='rp_pwd2_hint' className='field__hint'>
                        Debe coincidir con la contraseña. {caps2 ? 'Bloq Mayús activado.' : ''}
                    </small>
                </label>

                <button className='btn primary' type='submit' disabled={!canSave}>
                    {loading ? 'Guardando...' : 'Guardar contraseña'}
                </button>
            </form>
        </section>
    );
}
