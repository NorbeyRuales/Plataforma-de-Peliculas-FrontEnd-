// src/routes/AppRouter.tsx
/**
 * @file AppRouter.tsx
 * @description Main application router and layout composition (Header, Breadcrumbs, Footer).
 */

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
import SkipLink from '../components/a11y/SkipLink'

import ErrorBoundary from '../components/error-boundary/ErrorBoundary'
import NotFound from '../pages/not-found/NotFound'

/** Auth gate (token mínimo en localStorage) */
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

function FooterSwitcher() {
  const { pathname } = useLocation()
  const hide = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname)
  return hide ? null : <Footer />
}

/** Delay helper for Suspense fallback */
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
  return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando…</div>
}

/** Envoltorio que SÍ vive dentro del Router y puede usar useLocation */
function InnerApp() {
  const location = useLocation() // ✅ ahora sí, dentro del Router

  return (
    <>
      {/* WCAG 2.4.1 - Bypass Blocks */}
      <SkipLink />

      <Header />
      <Breadcrumbs />

      <Suspense fallback={<DelayedFallback delay={95} />}>
        <ErrorBoundary resetKeys={[location.pathname]}>
          <main id="main" tabIndex={-1}>
            <Routes>
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protegidas */}
              <Route path="/" element={<Protected><Home /></Protected>} />
              <Route path="/movies" element={<Protected><Movies /></Protected>} />
              <Route path="/movie/:id" element={<Protected><MovieDetail /></Protected>} />
              <Route path="/account" element={<Protected><Account /></Protected>} />
              <Route path="/favorites" element={<Protected><Favorites /></Protected>} />
              <Route path="/about" element={<Protected><About /></Protected>} />
              <Route path="/site-map" element={<Protected><SiteMap /></Protected>} />

              {/* Públicas */}
              <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </ErrorBoundary>
      </Suspense>

      <FooterSwitcher />
    </>
  )
}

/** Root (monta el BrowserRouter una sola vez) */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  )
}
