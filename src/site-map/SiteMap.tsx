// src/site-map/SiteMap.tsx

/**
 * @file SiteMap.tsx
 * @summary Simple site map page with grouped navigation links.
 * @module Pages/SiteMap
 * @description
 * Renders a structured list of key app routes for quick discovery.
 * A11Y: Uses semantic headings and nested lists for proper outline and navigation.
 */

import { Link } from 'react-router-dom'
import './SiteMap.scss'

/**
 * Site map page.
 * @component
 * @returns {JSX.Element} Section with grouped navigation links.
 */
export default function SiteMap(){
  return (
    <section className='container site-map'>
      {/* Page title (h1) for screen reader landmarking */}
      <h1>Mapa del sitio</h1>

      <div className='cols'>
        {/* Authentication cluster */}
        <div className='col'>
          <h2>Autenticación</h2>
          <ul>
            <li><Link to='/login'>Inicio de sesión</Link></li>
            <li><Link to='/register'>Registro</Link></li>
            <li><Link to='/forgot-password'>Recuperar contraseña</Link></li>
          </ul>
        </div>

        {/* Movies cluster */}
        <div className='col'>
          <h2>Película</h2>
          <ul>
            <li><Link to='/movies'>Buscar película</Link></li>
            <li>
              {/* Nested list keeps hierarchy clear for SRs */}
              <span>Ver película</span>
              <ul>
                <li>Reproducir/Pausar</li>
                <li>Añadir a lista</li>
              </ul>
            </li>
          </ul>
        </div>

        {/* Account cluster */}
        <div className='col'>
          <h2>Cuenta</h2>
          <ul>
            <li><Link to='/account'>Perfil usuario</Link></li>
            <li><Link to='/account/edit'>Actualizar</Link></li>
            <li><Link to='/account/delete'>Eliminar</Link></li>
          </ul>
        </div>

        {/* Info cluster */}
        <div className='col'>
          <h2>Información</h2>
          <ul>
            <li><Link to='/'>Inicio</Link></li>
            <li><Link to='/about'>Sobre nosotros</Link></li>
            <li><Link to='/favorites'>Mi lista</Link></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
