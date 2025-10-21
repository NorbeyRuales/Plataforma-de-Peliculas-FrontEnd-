import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import './Header.scss'

export default function Header(){
  const [q, setQ] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Ocultar header en pantallas públicas
  const hide = useMemo(
    () => ['/login','/register','/forgot-password','/reset-password'].includes(pathname),
    [pathname]
  )
  if (hide) return null

  function onSearch(e: React.FormEvent){
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/movies?q=${encodeURIComponent(term)}` : '/movies')
  }

  async function onLogout(){
    try {
      // Si tu backend tiene endpoint de logout, podrías llamar aquí:
      // await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method:'POST', credentials:'include' }).catch(()=>{})
    } finally {
      localStorage.removeItem('token')
      navigate('/login', { replace:true })
    }
  }

  return (
    <header className='site-header'>
      <div className='container nav'>
        <Link to='/' className='brand' aria-label='PYRA home'>
          {/* Logo desde /public */}
          <img src="/brand/pyra.svg" alt="PYRA" className="brand-logo" />
        </Link>

        <nav aria-label='Main'>
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
              onChange={(e)=>setQ(e.target.value)}
            />
          </form>

          <NavLink to='/account' className='avatar-btn' aria-label='Cuenta'>👤</NavLink>

          <button type='button' className='logout-btn' onClick={onLogout} aria-label='Cerrar sesión'>
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
