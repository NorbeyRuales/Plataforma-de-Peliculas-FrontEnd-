// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Suspense, useEffect, useState } from 'react'
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

import AuthCallback from '../pages/auth-callback/AuthCallback'
import { hasSupabaseAuthParams } from '../utils/authUrl'
import ResetPassword from '../pages/reset-password/ResetPassword'


import Breadcrumbs from '../components/Breadcrumbs/Breadcrumbs'

const isAuthed = () => !!localStorage.getItem('token')

function Protected({ children }: { children: JSX.Element }) {
  const location = useLocation()
  if (hasSupabaseAuthParams()) return children
  return isAuthed() ? children : <Navigate to="/login" replace state={{ from: location }} />
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const location = useLocation()
  if (hasSupabaseAuthParams()) return children
  return isAuthed() ? <Navigate to="/" replace state={{ from: location }} /> : children
}

/** Footer según la ruta actual */
function FooterSwitcher() {
  const { pathname } = useLocation()
  const hide = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname)
  return hide ? null : <Footer />
}

/** ---- Fallback diferido (ajustas el delay aquí) ---- */
function useDelayedVisible(delay = 200) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return show
}
function DelayedFallback({ delay = 200 }: { delay?: number }) {
  const show = useDelayedVisible(delay)
  if (!show) return null
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Cargando…
    </div>
  )
}
/** --------------------------------------------------- */

export default function AppRouter() {
  return (
    <BrowserRouter>
      <a className='skip-link' href='#main'>Skip to content</a>
      <Header />

      {/* 👇 NUEVO: migas de pan */}
      <Breadcrumbs />

      {/* delay (ms)  */}
      <Suspense fallback={<DelayedFallback delay={95} />}>
        <main id='main' tabIndex={-1}>
          <Routes>
            <Route path='/auth/callback' element={<AuthCallback />} />

            {/* Protegidas */}
            <Route path='/' element={<Protected><Home /></Protected>} />
            <Route path='/movies' element={<Protected><Movies /></Protected>} />
            <Route path='/movie/:id' element={<Protected><MovieDetail /></Protected>} />
            <Route path='/account' element={<Protected><Account /></Protected>} />
            <Route path='/favorites' element={<Protected><Favorites /></Protected>} />
            <Route path='/about' element={<Protected><About /></Protected>} />
            <Route path='/site-map' element={<Protected><SiteMap /></Protected>} />

            {/* Públicas */}
            <Route path='/login' element={<GuestOnly><Login /></GuestOnly>} />
            <Route path='/register' element={<GuestOnly><Register /></GuestOnly>} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />

            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </main>
      </Suspense>

      <FooterSwitcher />
    </BrowserRouter>
  )
}
