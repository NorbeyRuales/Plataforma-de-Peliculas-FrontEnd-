// src/pages/reset-password/ResetPassword.tsx

/**
 * @file src/pages/reset-password/ResetPassword.tsx
 * @summary Final step of the Supabase password recovery flow (set a new password).
 * @module Pages/ResetPassword
 *
 * @description
 * This page is intended to be the `redirectTo` target used in the password
 * recovery email. It:
 *  1) Silently exchanges the Supabase `code` or `access_token` in the URL
 *     for a session (so the user is authenticated just for the reset).
 *  2) Validates the new password against basic rules (length, uppercase,
 *     digit, symbol) and requires confirmation.
 *  3) Calls `supa.auth.updateUser({ password })` to persist the new password.
 *
 * A11Y:
 *  - Error/status feedback uses live regions (`role="alert"` / `role="status"`).
 *  - Error summary is focusable to announce changes to screen readers.
 *  - Buttons show disabled and busy state to prevent double submits.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.scss';
import { supa } from '../../services/supa';

/**
 * ResetPassword page component.
 * Handles token exchange, password validation and password update.
 * @returns {JSX.Element}
 */
export default function ResetPassword() {
    const navigate = useNavigate();

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
    const errRef = useRef<HTMLParagraphElement>(null);

    /** Password rules used to validate strength. */
    const rules = [
        { re: /.{8,}/, text: 'Mínimo 8 caracteres' },
        { re: /[A-Z]/, text: 'Al menos 1 mayúscula' },
        { re: /\d/, text: 'Al menos 1 número' },
        { re: /[^A-Za-z0-9]/, text: 'Al menos 1 símbolo' },
    ];

    const passStrong = rules.every((r) => r.re.test(pass1));
    const same = pass1 === pass2;
    const canSave = passStrong && same && !loading;

    // --- strength meter ---
    const [strength, setStrength] = useState(0);
    useEffect(() => {
        const passed = rules.reduce((n, r) => n + (r.re.test(pass1) ? 1 : 0), 0);
        setStrength(passed);
    }, [pass1]);

    // Move focus to the error region when an error appears
    useEffect(() => { if (err) errRef.current?.focus(); }, [err]);

    /**
     * Silently exchanges Supabase code/token from URL into a session.
     * This enables `updateUser` to succeed without asking the user to log in.
     * URL is cleaned afterwards to avoid reprocessing on refresh.
     */
    useEffect(() => {
        (async () => {
            try {
                const url = new URL(window.location.href);
                const hasHash = !!window.location.hash;
                const hasCode = !!url.searchParams.get('code');
                if (!hasHash && !hasCode) {
                    console.warn('[reset-password] Missing auth code or hash in URL.');
                    return;
                }
                const { error } = await supa.auth.exchangeCodeForSession(window.location.href);
                if (error) console.warn('[reset-password] exchangeCodeForSession:', error.message);
                window.history.replaceState({}, document.title, '/reset-password');
            } catch (e: any) {
                console.warn('[reset-password] Could not validate recovery link:', e?.message || e);
            }
        })();
    }, []);

    /**
     * Handles the password update submit.
     * Validates strength & match, updates via Supabase and then navigates to /login.
     * @param {React.FormEvent} e - Form submit event.
     * @returns {Promise<void>}
     */
    async function handleReset(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true); setErr(null); setMsg(null);
        try {
            if (!passStrong) throw new Error('La contraseña no cumple los requisitos.');
            if (!same) throw new Error('Las contraseñas no coinciden.');
            const { error } = await supa.auth.updateUser({ password: pass1 });
            if (error) throw error;
            setMsg('¡Contraseña actualizada! Te llevamos al inicio de sesión…');
            // Sign out the temporary recovery session (defensive, not strictly required)
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
                {/* New password */}
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

                    {/* Helper: hidden once all criteria pass */}
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

                    {/* Strength meter visible while typing */}
                    {pass1.length > 0 && (
                        <div className="pwd-meter" aria-hidden="true">
                            <i style={{ width: `${(strength / rules.length) * 100}%` }} />
                        </div>
                    )}

                    <small id="rp_caps1" className="field__hint">
                        {caps1 ? 'Bloq Mayús activado.' : ''}
                    </small>
                </label>

                {/* Confirm password */}
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
