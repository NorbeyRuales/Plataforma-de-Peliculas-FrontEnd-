// src/pages/forgot-password/ForgotPassword.tsx
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './ForgotPassword.scss';
import { supa } from '../../services/supa';

/**
 * Comportamiento:
 * - Modo "solicitud": pide email y envía el correo de recuperación.
 * - Cuando el usuario hace clic en el correo, Supabase redirige a esta misma ruta con ?type=recovery&code=...
 *   -> Intercambiamos el code por una sesión (exchangeCodeForSession) y mostramos el formulario para nueva contraseña.
 * - Luego actualizamos la contraseña con supa.auth.updateUser({ password }).
 */
export default function ForgotPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');

  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Si viene desde el correo: ?type=recovery&code=...
  useEffect(() => {
    const type = params.get('type');
    const code = params.get('code');

    async function handleRecovery() {
      try {
        setLoading(true);
        setErr(null);
        // Intercambia el code por sesión
        const { error } = await supa.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        setMode('reset');
      } catch (e: any) {
        setErr(e?.message || 'No se pudo validar el enlace de recuperación.');
      } finally {
        setLoading(false);
      }
    }

    if (type === 'recovery' && code) {
      handleRecovery();
    }
  }, [params]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      const redirectTo = `${window.location.origin}/forgot-password`;
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
      // Pequeña pausa para mostrar el mensaje y redirigir
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
