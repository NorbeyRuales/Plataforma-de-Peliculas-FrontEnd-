// src/components/layout/Header.tsx
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import './Header.scss'

export default function Header(){
  const [q,setQ]=useState('')
  const navigate=useNavigate()
  const {pathname}=useLocation()

  // Ocultar header en pantallas públicas
  const hide=useMemo(()=>['/login','/register','/forgot-password'].includes(pathname),[pathname])
  if(hide) return null

  function onSearch(e:React.FormEvent){
    e.preventDefault()
    navigate(`/movies?q=${encodeURIComponent(q)}`)
  }

  // Cerrar sesión
  async function onLogout(){
    try {
      // Si tu backend tiene endpoint de logout, podrías llamar aquí:
      // await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method:'POST', credentials:'include' }).catch(()=>{})
    } finally {
      localStorage.removeItem('token')  // o donde guardes el token
      navigate('/login', { replace:true })
    }
  }

  return (
    <header className='site-header'>
      <div className='container nav'>
        <Link to='/' className='brand' aria-label='Flimhub home'>
          {/* Logo desde /public */}
          <img src="/logo-flimhub.jpg" alt="Flimhub" className="brand-logo" />
        </Link>

        <nav aria-label='Main'>
          <NavLink to='/' end>Inicio</NavLink>
          <NavLink to='/movies'>Películas</NavLink>
          <NavLink to='/favorites'>Mi lista</NavLink>
          <NavLink to='/about'>Sobre nosotros</NavLink>
        </nav>

        <div className='right'>
          <form className='search' onSubmit={onSearch} role='search' aria-label='Buscar'>
            <input placeholder='Buscar' value={q} onChange={(e)=>setQ(e.target.value)} aria-label='Texto de búsqueda'/>
            <button type='submit' className='icon-btn' aria-label='Buscar'/>
          </form>

          <NavLink to='/account' className='avatar-btn' aria-label='Cuenta'>👤</NavLink>

          {/* Botón Salir */}
          <button type='button' className='logout-btn' onClick={onLogout} aria-label='Cerrar sesión'>
            Salir
          </button>
        </div>
      </div>
    </header>
  )
}
