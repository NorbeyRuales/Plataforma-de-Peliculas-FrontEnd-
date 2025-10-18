// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

import Home from '../pages/home/Home'
import Movies from '../pages/movies/Movies'
import MovieDetail from '../pages/movie/MovieDetail'
import Login from '../pages/login/Login'
import Register from '../pages/register/Register'
import ForgotPassword from '../pages/forgot-password/ForgotPassword'
import Account from '../pages/account/Account'
import Favorites from '../pages/favorites/Favorites'
import About from '../pages/about/About'
import SiteMap from '../site-map/SiteMap'

// 👇 NUEVOS imports
import AuthCallback from '../pages/auth-callback/AuthCallback'
import { hasSupabaseAuthParams } from '../utils/authUrl'

/* ---------- Guards ---------- */
const isAuthed = () => !!localStorage.getItem('token')

function Protected({ children }: { children: JSX.Element }) {
  const location = useLocation()

  // 🔐 Si el URL trae parámetros del flujo de Supabase (access_token, code, type=recovery),
  // no bloquees ni redirijas: deja pasar para que se procese.
  if (hasSupabaseAuthParams()) return children

  return isAuthed()
    ? children
    : <Navigate to="/login" replace state={{ from: location }} />
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const location = useLocation()

  // 🔓 Igual: si viene con params de Supabase, deja ver la vista pública (login/forgot) sin redirigir.
  if (hasSupabaseAuthParams()) return children

  return isAuthed()
    ? <Navigate to="/" replace state={{ from: location }} />
    : children
}
/* ---------------------------- */

export default function AppRouter() {
  return (
    <BrowserRouter>
      <a className='skip-link' href='#main'>Skip to content</a>
      <Header />
      <main id='main' tabIndex={-1}>
        <Routes>
          {/* 📌 Ruta pública dedicada para procesar el callback de Supabase */}
          <Route path='/auth/callback' element={<AuthCallback />} />

          {/* Rutas protegidas (requieren sesión con tu JWT) */}
          <Route path='/' element={<Protected><Home /></Protected>} />
          <Route path='/movies' element={<Protected><Movies /></Protected>} />
          <Route path='/movie/:id' element={<Protected><MovieDetail /></Protected>} />
          <Route path='/account' element={<Protected><Account /></Protected>} />
          <Route path='/favorites' element={<Protected><Favorites /></Protected>} />
          <Route path='/about' element={<Protected><About /></Protected>} />
          <Route path='/site-map' element={<Protected><SiteMap /></Protected>} />

          {/* Públicas solo para invitados */}
          <Route path='/login' element={<GuestOnly><Login /></GuestOnly>} />
          <Route path='/register' element={<GuestOnly><Register /></GuestOnly>} />
          <Route path='/forgot-password' element={<GuestOnly><ForgotPassword /></GuestOnly>} />

          {/* fallback */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
