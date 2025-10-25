/**
 * @file Header.tsx
 * @description Top navigation bar with brand, primary links, search box, account actions and theme switch.
 * It hides itself on public auth screens and provides a responsive mobile menu.
 * Includes a few a11y enhancements: explicit labels, hit-targets ≥24px, and roles/ARIA on the search form.
 */

import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import Switch from '../../components/Switch/Switch'
import './Header.scss'

/**
 * Site header component. Renders the brand, main navigation, search form and actions.
 * The header is hidden on public auth routes (/login, /register, /forgot-password, /reset-password).
 * @component
 * @returns {JSX.Element | null}
 */
export default function Header() {
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Hide header on public screens
  const hide = useMemo(
    () => ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname),
    [pathname]
  )

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  if (hide) return null

  /**
   * Handles the search submit and navigates to the movies catalog.
   * It trims the query and falls back to /movies when empty.
   * @param {React.FormEvent<HTMLFormElement>} e
   * @returns {void}
   */
  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/movies?q=${encodeURIComponent(term)}` : '/movies')
  }

  /**
   * Signs the user out client-side and redirects to /login.
   * The API logout request is optional (kept commented here for simplicity).
   * @returns {Promise<void>}
   */
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
          {/* Mobile menu button (hamburger) */}
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

          <Link to='/' className='brand' aria-label='PYRA home'>
            <img src="/brand/pyra.svg" alt="PYRA" className="brand-logo" />
          </Link>

          <nav id="primary-navigation" className={`nav-links ${menuOpen ? 'open' : ''}`} aria-label='Main'>
            <NavLink to='/' end>Inicio</NavLink>
            <NavLink to='/movies'>Películas</NavLink>
            <NavLink to='/favorites'>Mis Favoritos</NavLink>
            <NavLink to='/about'>Sobre nosotros</NavLink>
          </nav>

          <div className='right'>
            <form className='search' onSubmit={onSearch} role='search' aria-label='Buscar'>
              <input
                className='search__input'
                type='search'
                inputMode='search'
                placeholder='Buscar…'
                aria-label='Texto de búsqueda'
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </form>

            <NavLink to='/account' className='avatar-btn hit-24' aria-label='Cuenta'>👤</NavLink>

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

      {/* backdrop to close by tapping outside (mobile only) */}
      <div className={`menu-backdrop ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} />
    </>
  )
}
