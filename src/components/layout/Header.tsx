import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import './Header.scss'

export default function Header() {
  const [q, setQ] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Ocultar header en pantallas públicas
  const hide = useMemo(
    () => ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname),
    [pathname]
  )
  // Cierra el menú cuando cambias de ruta
  useEffect(() => { setMenuOpen(false) }, [pathname])
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
          {/* Botón hamburguesa (solo móvil) */}
          <button
            type="button"
            className="menu-btn"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen(o => !o)}
          >
            {/* icono hamburguesa / close */}
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
            <NavLink to='/favorites'>Mi lista</NavLink>
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

            <NavLink to='/account' className='avatar-btn' aria-label='Cuenta'>👤</NavLink>

            <button type='button' className='logout-btn' onClick={onLogout} aria-label='Cerrar sesión'>
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* backdrop para cerrar tocando fuera (solo móvil) */}
      <div className={`menu-backdrop ${menuOpen ? 'show' : ''}`} onClick={() => setMenuOpen(false)} />
    </>
  )
}
