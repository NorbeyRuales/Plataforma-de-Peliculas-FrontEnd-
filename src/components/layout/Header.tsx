/**
 * @file Header.tsx
 * @description Top navigation bar with brand, primary links, search box, account actions and theme switch.
 * Hides itself on public auth screens and provides a responsive mobile menu.
 * A11y: explicit labels, hit-targets ≥24px, roles/ARIA on the search form.
 */

import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState, useEffect, useRef } from 'react'
import Switch from '../../components/Switch/Switch'
import './Header.scss'
import { supa } from '../../services/supa' // ⬅️ Supabase para intentar obtener nombre
import { Auth, TOKEN_EVENT } from '../../services/auth'

// --- Helpers para obtener un nombre legible ---
function decodeNameFromJWT(token: string | null): string | null {
  if (!token) return null
  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return (
      json.name ||
      json.full_name ||
      json.given_name ||
      json.preferred_username ||
      (json.email ? String(json.email).split('@')[0] : null) ||
      null
    )
  } catch {
    return null
  }
}

function guessNameFromLocalStorage(): string | null {
  try {
    const direct =
      localStorage.getItem('full_name') ||
      localStorage.getItem('name') ||
      localStorage.getItem('username') ||
      null
    if (direct) return direct

    const userRaw =
      localStorage.getItem('user') ||
      localStorage.getItem('profile') ||
      localStorage.getItem('account') ||
      null
    if (userRaw) {
      const u = JSON.parse(userRaw)
      return u?.full_name || u?.name || u?.username || (u?.email ? u.email.split('@')[0] : null) || null
    }
  } catch {
    /* noop */
  }
  return null
}

// Reduce any raw name/email/usernames to a friendly first name for display
function extractFirstName(raw: string | null): string | null {
  if (!raw) return null
  let text = raw.trim()
  if (!text) return null
  if (text.includes('@')) text = text.split('@')[0] // correos → parte antes de @
  text = text.replace(/[_\-.]+/g, ' ')
  const parts = text.split(/\s+/).filter(Boolean)
  if (!parts.length) return null
  let first = parts[0].replace(/^\W+|\W+$/g, '')
  if (!first) return null
  const noDigits = first.replace(/\d+$/, '')
  if (noDigits.trim()) first = noDigits.trim()
  if (!first) return null
  return first.charAt(0).toUpperCase() + first.slice(1)
}

export default function Header() {
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [displayName, setDisplayName] = useState<string | null>(null) // ⬅️ nombre mostrado

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const searchRef = useRef<HTMLInputElement>(null)

  // === Solo renderizar hamburguesa en móvil (≤820px) ===
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(max-width: 820px)').matches
  })
  useEffect(() => {
    if (!window.matchMedia) return
    const mq = window.matchMedia('(max-width: 820px)')
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    // init + listeners (compatibilidad Safari antiguo)
    setIsMobile(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange as any)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange as any)
    }
  }, [])

  // Intentar resolver el nombre (Supabase → token → localStorage)
  useEffect(() => {
    let mounted = true
    async function resolveDisplayName() {
      let name: string | null = null

      // 0) API propia (Auth.me) con datos de perfil
      try {
        const me = await Auth.me()
        const u = me?.user
        if (u) {
          name = u.name || null
          if (!name && u.email) name = u.email
        }
      } catch {
        /* noop */
      }

      // 1) Supabase user + (opcional) tabla profiles
      try {
        const { data } = await supa.auth.getUser()
        const user = data?.user
        if (user) {
          name =
            (user.user_metadata as any)?.full_name ||
            (user.user_metadata as any)?.name ||
            (user.user_metadata as any)?.username ||
            null

          if (!name) {
            const { data: profile } = await supa
              .from('profiles')
              .select('full_name, name, username')
              .eq('id', user.id)
              .maybeSingle()
            name = profile?.full_name || profile?.name || profile?.username || null
          }

          if (!name && user.email) name = user.email.split('@')[0]
        }
      } catch {
        /* noop */
      }

      // 2) JWT en localStorage
      if (!name) name = decodeNameFromJWT(localStorage.getItem('token'))

      // 3) Claves varias en localStorage
      if (!name) name = guessNameFromLocalStorage()

      if (mounted) setDisplayName(extractFirstName(name))
    }

    resolveDisplayName()

    const onToken = () => resolveDisplayName()
    if (typeof window !== 'undefined') window.addEventListener(TOKEN_EVENT, onToken)

    const sub = supa.auth.onAuthStateChange(() => resolveDisplayName())
    return () => {
      mounted = false
      sub.data?.subscription?.unsubscribe?.()
      if (typeof window !== 'undefined') window.removeEventListener(TOKEN_EVENT, onToken)
    }
  }, [])

  // Hide header on public screens
  const hide = useMemo(
    () => ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname),
    [pathname]
  )

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Global hotkeys: ESC cierra menú; "/" enfoca búsqueda (si no estás escribiendo ya)
  useEffect(() => {
    const isEditable = (t: EventTarget | null) => {
      const el = t as HTMLElement | null
      if (!el) return false
      const tag = el.tagName?.toLowerCase()
      return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as any)?.isContentEditable
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      if (e.key === 'Escape' && menuOpen) setMenuOpen(false)
      if ((e.key === '/' || e.key === '¿' || e.key === '?') && !isEditable(e.target)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  if (hide) return null

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/movies?q=${encodeURIComponent(term)}` : '/movies')
  }

  async function onLogout() {
    try {
      // await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method:'POST', credentials:'include' }).catch(()=>{})
    } finally {
      localStorage.removeItem('token')
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      <header className='site-header'>
        <div className='container nav'>
          {/* Mobile menu button (hamburger) — solo en móvil */}
          {isMobile && (
            <button
              type="button"
              className="menu-btn hit-24"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="primary-navigation"
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              )}
              <span className="sr-only">{menuOpen ? 'Cerrar' : 'Abrir'}</span>
            </button>
          )}

          <Link to='/' className='brand' aria-label='PYRA home'>
            <img src="/brand/pyra.svg" alt="PYRA" className="brand-logo" />
          </Link>

          <nav
            id="primary-navigation"
            className={`nav-links ${menuOpen ? 'open' : ''}`}
            aria-label='Main'
            aria-hidden={isMobile ? (!menuOpen) : false}
          >
            <NavLink to='/' end>Inicio</NavLink>
            <NavLink to='/movies'>Películas</NavLink>
            <NavLink to='/favorites'>Mis Favoritos</NavLink>
            <NavLink to='/about'>Sobre nosotros</NavLink>
          </nav>

          <div className='right'>
            <form className='search' onSubmit={onSearch} role='search' aria-label='Buscar'>
              <input
                ref={searchRef}
                className='search__input'
                type='search'
                inputMode='search'
                placeholder='Buscar…'
                aria-label='Texto de búsqueda'
                aria-keyshortcuts='/'
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>

            <NavLink to='/account' className='avatar-btn hit-24' aria-label='Cuenta'>👤</NavLink>

            {/*  Nombre visible al lado del icono (con fallback) */}
            <NavLink
              to='/account'
              className='account-name'
              title={displayName ?? 'Mi cuenta'}
              aria-label={displayName ?? 'Mi cuenta'}
            >
              {displayName ?? 'Mi cuenta'}
            </NavLink>

            <button type='button' className='logout-btn hit-24' onClick={onLogout} aria-label='Cerrar sesión'>
              Salir
            </button>

            {/* Theme switch (compact size) */}
            <div className='theme-toggle hit-24'>
              <Switch size={12} />
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop para móvil */}
      {isMobile && (
        <div
          className={`menu-backdrop ${menuOpen ? 'show' : ''}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
