// src/pages/forgot-password/ForgotPassword.tsx

/**
 * @file ForgotPassword.tsx
 * @summary Password recovery page (request + reset) using Supabase Auth.
 * @module Pages/ForgotPassword
 * @description
 * This page covers two modes:
 *  - "request": user submits their email to receive a recovery link.
 *  - "reset": after Supabase validates the token, user sets a new password.
 *
 * A11Y:
 *  - Uses clear headings and live regions (`role="alert"`/`role="status"`) for feedback.
 *  - Focus is moved to the error message paragraph when an error appears.
 *  - Buttons include disabled state during async operations to avoid double submits.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import './ForgotPassword.scss';
import { supa } from '../../services/supa';

/**
 * Base site URL used for Supabase redirect during the recovery flow.
 * Falls back to window.origin in the browser.
 * @constant
 */
const SITE_URL =
  (import.meta as any).env?.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

/**
 * Forgot password & reset password view.
 * Handles both requesting the recovery email and setting a new password
 * once Supabase has validated the token.
 * @component
 * @returns {JSX.Element}
 */
export default function ForgotPassword() {
  const navigate = useNavigate();

  // --- Local state for both modes ---
  const [email, setEmail] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [caps1, setCaps1] = useState(false);
  const [caps2, setCaps2] = useState(false);

  // Keep a fallback "reset" mode in case a legacy link lands here.
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  // Basic client-side checks
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const canSend = emailOk && !loading;
  const passOk = pass1.length >= 6;
  const same = pass1 === pass2;
  const canSave = passOk && same && !loading;

  /**
   * Replaces the URL (history) to a clean path without Supabase params.
   * Helps avoid re-processing the token if the user refreshes.
   * @function
   */
  const cleanUrl = () => {
    try {
      const clean = `${SITE_URL}/forgot-password`;
      window.history.replaceState({}, document.title, clean);
    } catch {}
  };

  // Subscribe to Supabase auth state changes (in case session is created before this effect).
  useEffect(() => {
    const { data: sub } = supa.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setMode('reset');
        cleanUrl();
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // Detect tokens in query/hash and perform exchange if needed.
  useEffect(() => {
    // If there is no hash nor code (e.g., coming from /reset-password), skip exchange.
    const noHash = !window.location.hash;
    const noCode = !new URLSearchParams(window.location.search).get('code');
    if (noHash && noCode) return;

    const href = window.location.href;
    const url = new URL(href);
    const q = url.searchParams;
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

    // Supabase might hand back an error via params.
    const supaErr = q.get('error_description') || hashParams.get('error_description');
    if (supaErr) {
      setErr(decodeURIComponent(supaErr));
      return;
    }

    const type = q.get('type') ?? hashParams.get('type');
    const hasCodeOrToken = q.get('code') || hashParams.get('code') || hashParams.get('access_token');

    if (type === 'recovery' || hasCodeOrToken) {
      (async () => {
        try {
          setLoading(true);
          setErr(null);
          const { error } = await supa.auth.exchangeCodeForSession(href);
          if (error) throw error;
          setMode('reset');
          cleanUrl();
        } catch (e: any) {
          setErr(e?.message || 'No se pudo validar el enlace de recuperación.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  // Move focus to the error summary for screen readers.
  useEffect(() => {
    if (err) errRef.current?.focus();
  }, [err]);

  /**
   * Sends a recovery email via Supabase.
   * @param {React.FormEvent} e - Form submit event.
   * @returns {Promise<void>}
   */
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      // Use a dedicated reset route for a cleaner UX.
      const redirectTo = `${SITE_URL}/reset-password`;
      const { error } = await supa.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setMsg('Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.');
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar el correo.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Confirms the new password with Supabase once the session/token is valid.
   * @param {React.FormEvent} e - Form submit event.
   * @returns {Promise<void>}
   */
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      if (!passOk) throw new Error('La contraseña debe tener al menos 6 caracteres.');
      if (!same) throw new Error('Las contraseñas no coinciden.');

      const { error } = await supa.auth.updateUser({ password: pass1 });
      if (error) throw error;

      setMsg('¡Contraseña actualizada! Ahora puedes iniciar sesión.');
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

      {mode === 'request' ? (
        <>
          <h1 className='sr-only'>Recuperar contraseña</h1>
          {/* Short instructions to set user expectations */}
          <p className='muted center'>
            ¿Olvidaste la contraseña? Te enviaremos un enlace de recuperación a tu correo.
          </p>

          {err && (
            // Error message is focusable and labeled as an alert for SRs
            <p ref={errRef} role='alert' className='field__error center'>
              {err}
            </p>
          )}
          {msg && (
            <p role='status' className='muted center' style={{ color: '#7ddc7a' }}>
              {msg}
            </p>
          )}

          <form className='auth-form' onSubmit={handleSend} noValidate>
            <label className='field'>
              <span className='field__label'>Correo</span>
              <input
                placeholder='Ingresa tu correo electrónico'
                type='email'
                required
                autoComplete='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <small className='field__hint'>Debe ser el correo de tu cuenta.</small>
            </label>

            <button className='btn primary' type='submit' disabled={!canSend}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>

          <p className='muted center'>
            <Link to='/login'>¿Recordaste tu contraseña? Volver a inicio</Link>
          </p>
        </>
      ) : (
        <>
          <h1 className='sr-only'>Nueva contraseña</h1>
          <p className='muted center'>Ingresa tu nueva contraseña.</p>

          {err && (
            <p ref={errRef} role='alert' className='field__error center'>
              {err}
            </p>
          )}
          {msg && (
            <p role='status' className='muted center' style={{ color: '#7ddc7a' }}>
              {msg}
            </p>
          )}

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
                  aria-describedby='fp_pwd1_hint'
                />
                <button
                  type='button'
                  className='pwd-toggle'
                  aria-pressed={show1}
                  aria-label={show1 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShow1((s) => !s)}
                >
                  {show1 ? (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        d='M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36'
                      />
                    </svg>
                  ) : (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        d='M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z'
                      />
                      <circle
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        cx='12'
                        cy='12'
                        r='3.5'
                      />
                    </svg>
                  )}
                  <span className='sr-only'>{show1 ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <small id='fp_pwd1_hint' className='field__hint'>
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
                  aria-describedby='fp_pwd2_hint'
                />
                <button
                  type='button'
                  className='pwd-toggle'
                  aria-pressed={show2}
                  aria-label={show2 ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setShow2((s) => !s)}
                >
                  {show2 ? (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        d='M3 3l18 18M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 5.09A9.66 9.66 0 0112 5c5.52 0 9.5 4.5 9.5 7-.34.83-1.08 1.99-2.25 3.08M5.06 7.06C3.9 8.15 3.16 9.31 2.82 10.14c0 2.5 3.98 7 9.5 7 .9 0 1.77-.12 2.6-.36'
                      />
                    </svg>
                  ) : (
                    <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'>
                      <path
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        d='M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z'
                      />
                      <circle
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        cx='12'
                        cy='12'
                        r='3.5'
                      />
                    </svg>
                  )}
                  <span className='sr-only'>{show2 ? 'Ocultar' : 'Mostrar'}</span>
                </button>
              </div>
              <small id='fp_pwd2_hint' className='field__hint'>
                Debe coincidir con la contraseña. {caps2 ? 'Bloq Mayús activado.' : ''}
              </small>
            </label>

            <button className='btn primary' type='submit' disabled={!canSave}>
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>

          <p className='muted center'>
            <Link to='/login'>Volver a inicio</Link>
          </p>
        </>
      )}
    </section>
  );
}
