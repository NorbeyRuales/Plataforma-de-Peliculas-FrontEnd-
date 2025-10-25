/**
 * @file AppRouter.tsx
 * @description Main application router and layout composition (Header, Breadcrumbs, Footer).
 * Includes WCAG helpers: Skip Link (2.4.1), visible focus styles (2.4.7 via global CSS),
 * and a minimal Suspense fallback with an optional delay.
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

/**
 * Checks if the user is authenticated based on a persisted token.
 * NOTE: this is a minimal client-side gate; the server/API must also validate.
 * @returns {boolean} True when a token exists in localStorage.
 */
const isAuthed = () => !!localStorage.getItem('token')

/**
 * Wrapper for private (authenticated) routes.
 * If the user is not authenticated, navigates to /login, preserving the origin in state.
 * Supabase auth callback routes are always allowed to pass through.
 * @param {{ children: JSX.Element }} props
 * @returns {JSX.Element}
 */
function Protected({ children }: { children: JSX.Element }) {
  const location = useLocation()
  if (hasSupabaseAuthParams()) return children
  return isAuthed() ? children : <Navigate to="/login" replace state={{ from: location }} />
}

/**
 * Wrapper for guest-only routes (Login/Register).
 * If the user is already authenticated, redirects to the home page.
 * Supabase auth callback routes are always allowed to pass through.
 * @param {{ children: JSX.Element }} props
 * @returns {JSX.Element}
 */
function GuestOnly({ children }: { children: JSX.Element }) {
  const location = useLocation()
  if (hasSupabaseAuthParams()) return children
  return isAuthed() ? <Navigate to="/" replace state={{ from: location }} /> : children
}

/**
 * Renders the global footer except on public auth screens.
 * @returns {JSX.Element | null}
 */
function FooterSwitcher() {
  const { pathname } = useLocation()
  const hide = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname)
  return hide ? null : <Footer />
}

/**
 * Small utility hook that flips to "visible" after a given delay.
 * Useful to avoid flashing very short Suspense fallbacks.
 * @param {number} [delay=200] - Milliseconds to wait before showing.
 * @returns {boolean} True once the delay has elapsed.
 */
function useDelayedVisible(delay = 200) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return show
}

/**
 * Suspense fallback that appears after a short delay (to reduce flashes).
 * @param {{ delay?: number }} props
 * @returns {JSX.Element | null}
 */
function DelayedFallback({ delay = 200 }: { delay?: number }) {
  const show = useDelayedVisible(delay)
  if (!show) return null
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      Cargando…
    </div>
  )
}

/**
 * Root application router. Provides:
 * - Skip Link targeting <main> (WCAG 2.4.1 Bypass Blocks)
 * - Global header and breadcrumbs
 * - Protected and guest-only route guards
 * - Footer visibility based on current route
 * @component
 * @returns {JSX.Element}
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      {/* WCAG 2.4.1 - Bypass Blocks */}
      <SkipLink />

      <Header />

      {/* Breadcrumbs / page trail */}
      <Breadcrumbs />

      {/* Suspense fallback with small delay (ms) */}
      <Suspense fallback={<DelayedFallback delay={95} />}>
        <main id='main' tabIndex={-1}>
          <Routes>
            <Route path='/auth/callback' element={<AuthCallback />} />

            {/* Protected */}
            <Route path='/' element={<Protected><Home /></Protected>} />
            <Route path='/movies' element={<Protected><Movies /></Protected>} />
            <Route path='/movie/:id' element={<Protected><MovieDetail /></Protected>} />
            <Route path='/account' element={<Protected><Account /></Protected>} />
            <Route path='/favorites' element={<Protected><Favorites /></Protected>} />
            <Route path='/about' element={<Protected><About /></Protected>} />
            <Route path='/site-map' element={<Protected><SiteMap /></Protected>} />

            {/* Public */}
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
