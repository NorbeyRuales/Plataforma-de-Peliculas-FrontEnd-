// src/pages/reset-password/ResetPassword.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.scss';
import { supa } from '../../services/supa';

export default function ResetPassword() {
    const navigate = useNavigate();

    // form state
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [caps1, setCaps1] = useState(false);
    const [caps2, setCaps2] = useState(false);

    // ui state
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    // reglas de contraseña
    const rules = [
        { re: /.{8,}/, text: 'Mínimo 8 caracteres' },
        { re: /[A-Z]/, text: 'Al menos 1 mayúscula' },
        { re: /\d/, text: 'Al menos 1 número' },
        { re: /[^A-Za-z0-9]/, text: 'Al menos 1 símbolo' },
    ];
    const passStrong = rules.every((r) => r.re.test(pass1));
    const same = pass1 === pass2;
    const canSave = passStrong && same && !loading;

    // medidor de fuerza
    const [strength, setStrength] = useState(0);
    useEffect(() => {
        const passed = rules.reduce((n, r) => n + (r.re.test(pass1) ? 1 : 0), 0);
        setStrength(passed);
    }, [pass1]);

    useEffect(() => { if (err) errRef.current?.focus(); }, [err]);

    // Intercambio de código -> sesión (silencioso)
    useEffect(() => {
        (async () => {
            try {
                const url = new URL(window.location.href);
                const hasHash = !!window.location.hash;
                const hasCode = !!url.searchParams.get('code');
                if (!hasHash && !hasCode) {
                    console.warn('[reset-password] Falta auth code o hash en la URL.');
                    return;
                }
                const { error } = await supa.auth.exchangeCodeForSession(window.location.href);
                if (error) console.warn('[reset-password] exchangeCodeForSession:', error.message);
                window.history.replaceState({}, document.title, '/reset-password');
            } catch (e: any) {
                console.warn('[reset-password] No se pudo validar el enlace:', e?.message || e);
            }
        })();
    }, []);

    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setErr(null); setMsg(null);
        try {
            if (!passStrong) throw new Error('La contraseña no cumple los requisitos.');
            if (!same) throw new Error('Las contraseñas no coinciden.');
            const { error } = await supa.auth.updateUser({ password: pass1 });
            if (error) throw error;
            setMsg('¡Contraseña actualizada! Te llevamos al inicio de sesión…');
            try { await supa.auth.signOut(); } catch { }
            setTimeout(() => navigate('/login', { replace: true }), 1200);
        } catch (e: any) {
            setErr(e?.message || 'No se pudo actualizar la contraseña.');
        } finally {
            setLoading(false);
        }
    }

    const showRules = pass1.length > 0 && !passStrong;

    return (
        <section className="auth-screen container">
            <div className="logo-big" aria-label="Flimhub" />
            <h1 className="sr-only">Nueva contraseña</h1>
            <p className="muted center">Ingresa tu nueva contraseña.</p>

            {err && (
                <p ref={errRef} role="alert" className="field__error center" aria-live="assertive">
                    {err}
                </p>
            )}
            {msg && (
                <p role="status" className="muted center" style={{ color: '#7ddc7a' }} aria-live="polite">
                    {msg}
                </p>
            )}

            <form className="auth-form" onSubmit={handleReset} noValidate>
                {/* Nueva contraseña */}
                <label className="field">
                    <span className="field__label">Nueva contraseña</span>
                    <div className="password-field">
                        <input
                            placeholder="Nueva contraseña"
                            type={show1 ? 'text' : 'password'}
                            required
                            autoFocus
                            autoComplete="new-password"
                            value={pass1}
                            onChange={(e) => setPass1(e.target.value)}
                            onKeyUp={(e) => setCaps1(e.getModifierState('CapsLock'))}
                            aria-describedby="rp_help rp_caps1"
                        />
                        <button
                            type="button"
                            className="pwd-toggle"
                            aria-pressed={show1}
                            aria-label={show1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            onMouseDown={() => setShow1(true)}
                            onMouseUp={() => setShow1(false)}
                            onMouseLeave={() => setShow1(false)}
                            onTouchStart={() => setShow1(true)}
                            onTouchEnd={() => setShow1(false)}
                        >
                            {show1 ? (
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                                    <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Ayuda: se oculta cuando todos los criterios pasan */}
                    <div id="rp_help" aria-live="polite">
                        {showRules ? (
                            <ul className="pwd-rules" role="list">
                                {rules.map((r) => {
                                    const ok = r.re.test(pass1);
                                    return (
                                        <li key={r.text} className={ok ? 'ok' : 'bad'}>
                                            {r.text}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            pass1.length > 0 && (
                                <p className="field__hint ok">La contraseña cumple los requisitos.</p>
                            )
                        )}
                    </div>

                    {/* Medidor de fuerza siempre visible mientras escribes */}
                    {pass1.length > 0 && (
                        <div className="pwd-meter" aria-hidden="true">
                            <i style={{ width: `${(strength / rules.length) * 100}%` }} />
                        </div>
                    )}

                    <small id="rp_caps1" className="field__hint">
                        {caps1 ? 'Bloq Mayús activado.' : ''}
                    </small>
                </label>

                {/* Confirmar contraseña */}
                <label className="field">
                    <span className="field__label">Confirmar contraseña</span>
                    <div className="password-field">
                        <input
                            placeholder="Confirmar contraseña"
                            type={show2 ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={pass2}
                            onChange={(e) => setPass2(e.target.value)}
                            onKeyUp={(e) => setCaps2(e.getModifierState('CapsLock'))}
                            aria-describedby="rp_match rp_caps2"
                        />
                        <button
                            type="button"
                            className="pwd-toggle"
                            aria-pressed={show2}
                            aria-label={show2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            onMouseDown={() => setShow2(true)}
                            onMouseUp={() => setShow2(false)}
                            onMouseLeave={() => setShow2(false)}
                            onTouchStart={() => setShow2(true)}
                            onTouchEnd={() => setShow2(false)}
                        >
                            {show2 ? (
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                                    <circle fill="none" stroke="currentColor" strokeWidth="2" cx="12" cy="12" r="3.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <small id="rp_match" className={`field__hint ${pass2 ? (same ? 'ok' : 'bad') : ''}`}>
                        {pass2 ? (same ? 'Las contraseñas coinciden.' : 'Deben coincidir.') : ''}
                    </small>
                    <small id="rp_caps2" className="field__hint">
                        {caps2 ? 'Bloq Mayús activado.' : ''}
                    </small>
                </label>

                <button className="btn primary" type="submit" disabled={!canSave} aria-busy={loading}>
                    {loading ? 'Guardando…' : 'Guardar contraseña'}
                </button>
            </form>
        </section>
    );
}
