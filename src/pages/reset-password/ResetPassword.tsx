// src/pages/reset-password/ResetPassword.tsx

/**
 * @file src/pages/reset-password/ResetPassword.tsx
 * @summary Final step of the Supabase password recovery flow (set a new password).
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.scss';
import { supa } from '../../services/supa';
import { useToast } from '../../components/toast/ToastProvider';
import { pushFlashToast } from '../../utils/flashToast';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { error: showErrorToast } = useToast();

    // --- form state ---
    const [pass1, setPass1] = useState('');
    const [pass2, setPass2] = useState('');
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [caps1, setCaps1] = useState(false);
    const [caps2, setCaps2] = useState(false);

    // --- UI state ---
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [hasAuth, setHasAuth] = useState(false);
    const [recoveryToken, setRecoveryToken] = useState<string | null>(null); // ← access_token del hash
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

    const [strength, setStrength] = useState(0);
    useEffect(() => {
        const passed = rules.reduce((n, r) => n + (r.re.test(pass1) ? 1 : 0), 0);
        setStrength(passed);
    }, [pass1]);

    useEffect(() => { if (err) errRef.current?.focus(); }, [err]);

    // si ya hay sesión, habilita
    useEffect(() => {
        (async () => {
            try {
                const { data } = await supa.auth.getSession();
                if (data.session) setHasAuth(true);
            } catch { }
        })();
    }, []);

    // limpia URL sin romper HashRouter
    function cleanRecoveryParams() {
        const u = new URL(window.location.href);
        const isHashRouter = u.hash.startsWith('#/');
        if (isHashRouter) {
            const routeOnly = u.hash.split('?')[0];
            window.history.replaceState({}, document.title, routeOnly);
        } else {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Toma tokens del enlace: ?code=... | #access_token=... | token_hash/token+email
    useEffect(() => {
        (async () => {
            try {
                const href = window.location.href;
                const url = new URL(href);
                const q = url.searchParams;
                const hash = new URLSearchParams(url.hash.replace(/^#/, ''));

                const code = q.get('code') || undefined;
                const access_token = hash.get('access_token') || undefined;
                const token_hash = hash.get('token_hash') || q.get('token_hash') || undefined;
                const token = hash.get('token') || q.get('token') || undefined;
                const email = q.get('email') || hash.get('email') || undefined;

                // 1) PKCE: ?code=...
                if (code) {
                    const { error } = await supa.auth.exchangeCodeForSession(href);
                    if (error) {
                        if (!email) throw error;
                        const { error: vErr } = await supa.auth.verifyOtp({ email, token: code, type: 'recovery' });
                        if (vErr) throw vErr;
                    }
                    setHasAuth(true);
                    cleanRecoveryParams();
                    return;
                }

                // 2) Legado: #access_token=...  → habilitamos botón y guardamos token.
                if (access_token) {
                    setHasAuth(true);
                    setRecoveryToken(access_token);
                    // Intentamos dejar sesión en background (si falla igual seguimos con fetch en submit)
                    supa.auth.exchangeCodeForSession(href).finally(() => cleanRecoveryParams());
                    return;
                }

                // 3) OTP directo
                if (token_hash || (token && email)) {
                    if (token && email) {
                        const { error } = await supa.auth.verifyOtp({ email, token, type: 'recovery' });
                        if (error) throw error;
                    } else if (token_hash) {
                        const { error } = await supa.auth.verifyOtp({ type: 'recovery', token_hash });
                        if (error) throw error;
                    }
                    setHasAuth(true);
                    cleanRecoveryParams();
                    return;
                }

                // 4) Por si quedaba sesión
                const { data } = await supa.auth.getSession();
                if (data.session) {
                    setHasAuth(true);
                    cleanRecoveryParams();
                    return;
                }

                setErr('El enlace de recuperación no trae el token de autenticación. Ábrelo desde el correo o solicita uno nuevo.');
                setHasAuth(false);
            } catch (e: any) {
                console.warn('[reset-password] Could not validate recovery link:', e?.message || e);
                setErr('No se pudo validar el enlace de recuperación. Solicita uno nuevo.');
                setHasAuth(false);
            }
        })();
    }, []);

    // Submit: si hay session → updateUser; si solo hay access_token → llamada directa a /auth/v1/user
    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setErr(null); setMsg(null);

        try {
            if (!passStrong) throw new Error('La contraseña no cumple los requisitos.');
            if (!same) throw new Error('Las contraseñas no coinciden.');

            if (recoveryToken) {
                // ✅ Camino robusto para hash con access_token (sin sesión en cliente)
                const SUPA_URL = import.meta.env.VITE_SUPABASE_URL as string;
                const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
                const res = await fetch(`${SUPA_URL}/auth/v1/user`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': ANON,
                        'Authorization': `Bearer ${recoveryToken}`,
                    },
                    body: JSON.stringify({ password: pass1 }),
                });
                if (!res.ok) {
                    let detail = 'No se pudo actualizar la contraseña.';
                    try {
                        const data = await res.json();
                        detail = data?.error_description || data?.msg || detail;
                    } catch { }
                    throw new Error(detail);
                }
            } else {
                // Sesión activa normal
                const { error } = await supa.auth.updateUser({ password: pass1 });
                if (error) throw error;
            }

            pushFlashToast({ kind: 'success', text: 'Contraseña actualizada. Inicia sesión.' });
            setMsg('¡Contraseña actualizada! Te llevamos al inicio de sesión…');
            try { await supa.auth.signOut(); } catch { }
            setTimeout(() => navigate('/login', { replace: true }), 800);
        } catch (e: any) {
            const message = e?.message || 'No se pudo actualizar la contraseña.';
            setErr(message);
            showErrorToast(message);
        } finally {
            setLoading(false);
        }
    }

    const showRules = pass1.length > 0 && !passStrong;
    const canSave = passStrong && same && !loading && hasAuth;

    return (
        <section className="auth-screen container">
            <div className="logo-big" aria-label="Flimhub" />
            <h1 className="sr-only">Nueva contraseña</h1>
            <p className="muted center">Ingresa tu nueva contraseña.</p>

            {err && (
                <p ref={errRef} role="alert" className="field__error center" aria-live="assertive" tabIndex={-1}>
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
                            onKeyUp={(e) => setCaps1((e as any).getModifierState('CapsLock'))}
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
                            pass1.length > 0 && <p className="field__hint ok">La contraseña cumple los requisitos.</p>
                        )}
                    </div>

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
                            onKeyUp={(e) => setCaps2((e as any).getModifierState('CapsLock'))}
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

                <button
                    className="btn primary"
                    type="submit"
                    disabled={!canSave}
                    aria-busy={loading}
                    title={!hasAuth ? 'Abre el enlace desde tu correo para habilitar el cambio.' : undefined}
                >
                    {loading ? 'Guardando…' : 'Guardar contraseña'}
                </button>

                {!hasAuth && (
                    <p className="muted" style={{ marginTop: 8 }}>
                        Abre este formulario desde el enlace del correo de recuperación para habilitar el cambio.
                    </p>
                )}
            </form>
        </section>
    );
}
