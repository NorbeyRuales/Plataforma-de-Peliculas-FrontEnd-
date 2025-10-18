// src/pages/forgot-password/ForgotPassword.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './ForgotPassword.scss';
import { supa } from '../../services/supa';

const SITE_URL =
  (import.meta as any).env?.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');

  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Helper: limpiar URL
  const cleanUrl = () => {
    try {
      const clean = `${SITE_URL}/forgot-password`;
      window.history.replaceState({}, document.title, clean);
    } catch {/* no-op */}
  };

  // 1) Listener de eventos de Supabase (por si procesa los tokens antes que este efecto)
  useEffect(() => {
    const { data: sub } = supa.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      }
      if (event === 'SIGNED_IN') {
        // Si ya hay sesión tras el intercambio, pasamos a reset
        setMode('reset');
        cleanUrl();
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2) Detección de tokens en query o hash + exchangeCodeForSession(href)
  useEffect(() => {
    const href = window.location.href;
    const url = new URL(href);

    const q = url.searchParams;
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));

    // Errores de Supabase (enlace expirado, dominio no permitido, etc.)
    const supaErr = q.get('error_description') || hashParams.get('error_description');
    if (supaErr) {
      setErr(decodeURIComponent(supaErr));
      return;
    }

    const type = q.get('type') ?? hashParams.get('type');
    const hasCodeOrToken =
      q.get('code') ||
      hashParams.get('code') ||
      hashParams.get('access_token');

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

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const redirectTo = `${SITE_URL}/forgot-password`; // dominio de prod
      const { error } = await supa.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setMsg('Revisa tu correo. Te enviamos un enlace para restablecer tu contraseña.');
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar el correo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      if (pass1.length < 6) throw new Error('La contraseña debe tener al menos 6 caracteres.');
      if (pass1 !== pass2) throw new Error('Las contraseñas no coinciden.');

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
          <p className='muted center'>
            ¿Olvidaste la contraseña? No te preocupes, te ayudaremos a restablecerla.
          </p>

          <form className='auth-form' onSubmit={handleSend}>
            <input
              placeholder='Ingresa tu correo electrónico'
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button className='btn primary' type='submit' disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </form>

          {msg && <p className='muted center' style={{ color: '#7ddc7a' }}>{msg}</p>}
          {err && <p className='muted center' style={{ color: 'salmon' }}>{err}</p>}

          <p className='muted center'>
            <Link to='/login'>¿Recordaste tu contraseña? Volver a inicio</Link>
          </p>
        </>
      ) : (
        <>
          <h1 className='sr-only'>Nueva contraseña</h1>
          <p className='muted center'>Ingresa tu nueva contraseña.</p>

          <form className='auth-form' onSubmit={handleReset}>
            <input
              placeholder='Nueva contraseña'
              type='password'
              required
              value={pass1}
              onChange={e => setPass1(e.target.value)}
            />
            <input
              placeholder='Confirmar contraseña'
              type='password'
              required
              value={pass2}
              onChange={e => setPass2(e.target.value)}
            />
            <button className='btn primary' type='submit' disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </form>

          {msg && <p className='muted center' style={{ color: '#7ddc7a' }}>{msg}</p>}
          {err && <p className='muted center' style={{ color: 'salmon' }}>{err}</p>}

          <p className='muted center'>
            <Link to='/login'>Volver a inicio</Link>
          </p>
        </>
      )}
    </section>
  );
}
