import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useMemo, useState } from 'react'
import './Header.scss'

export default function Header(){
  const [q,setQ]=useState('')
  const navigate=useNavigate()
  const {pathname}=useLocation()
  const hide=useMemo(()=>['/login','/register','/forgot-password'].includes(pathname),[pathname])
  if(hide) return null

  function onSearch(e:React.FormEvent){ e.preventDefault(); navigate(`/?q=${encodeURIComponent(q)}`) }

  return (<header className='site-header'>
    <div className='container nav'>
      <Link to='/' className='brand' aria-label='Flimhub home'>
        <span className='logo-square' aria-hidden/><span>Flimhub</span>
      </Link>

      <nav aria-label='Main'>
        <NavLink to='/' end>Inicio</NavLink>
        <NavLink to='/?tab=movies'>Películas</NavLink>
        <NavLink to='/?tab=series'>Serie</NavLink>
        <NavLink to='/favorites'>Mi lista</NavLink>
      </nav>

      <div className='right'>
        <form className='search' onSubmit={onSearch} role='search' aria-label='Buscar'>
          <input placeholder='Buscar' value={q} onChange={(e)=>setQ(e.target.value)} aria-label='Texto de búsqueda'/>
          <button type='submit' className='icon-btn' aria-label='Buscar'/>
        </form>
        <button className='avatar-btn' aria-label='Cuenta'>👤</button>
      </div>
    </div>
  </header>)
}
