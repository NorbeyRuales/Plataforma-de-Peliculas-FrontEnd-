/**
 * @file Footer.tsx
 * @summary Site-wide footer with brand, grouped navigation links, and a scroll-to-top button.
 */

import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import './Footer.scss'
import { Auth, getToken } from '../../services/auth'

/**
 * @component
 * @returns Footer section containing navigation clusters and social links.
 */
export default function Footer() {
  const year = new Date().getFullYear()
  const navigate = useNavigate()
  const location = useLocation()

  // Existing/handy navigation links (adjust if new routes are added)
  const explorar = [
    { to: '/', label: 'Inicio' },
    { to: '/movies', label: 'Películas' },
    { to: '/favorites', label: 'Mi lista' },
    { to: '/about', label: 'Sobre nosotros' },
  ]

  const cuenta = [
    { to: '/account', label: 'Cuenta' },
    { to: '/login', label: 'Iniciar sesión', logout: true },
    { to: '/register', label: 'Registrarse', logout: true },
  ]

  const recursos = [
    { to: '/site-map', label: 'Mapa del sitio' }, // Keeps the existing site-map route entry
  ]

  const handleAuthLinkClick = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    event.preventDefault()
    const tokenSnapshot = getToken()
    try {
      Auth.logout()
    } finally {
      const returnTo = `${location.pathname}${location.search}${location.hash}`
      navigate(to, {
        replace: true,
        state: {
          fromFooter: true,
          returnTo,
          tokenSnapshot,
        },
      })
    }
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Brand */}
        <section className="brand-block">
          <Link to="/" aria-label="PYRA home" className="brand-mini">
            <img src="/brand/pyra.svg" alt="PYRA" />
            <span className="brand-name">PYRA</span>
          </Link>
          <p className="tagline">Explora, guarda y disfruta tus películas favoritas.</p>

          <div className="social">
            <a href="#" aria-label="Twitter" title="Twitter">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M22 5.8c-.7.3-1.5.6-2.3.7.8-.5 1.4-1.2 1.7-2.1-.7.5-1.6.9-2.5 1.1A3.9 3.9 0 0 0 12 8.6c0 .3 0 .6.1.9A11 11 0 0 1 3 5.2a3.9 3.9 0 0 0 1.2 5.2c-.6 0-1.2-.2-1.7-.5v.1a3.9 3.9 0 0 0 3.1 3.8c-.5.1-1 .2-1.6.1.5 1.5 2 2.6 3.7 2.6A7.9 7.9 0 0 1 2 18.6a11 11 0 0 0 6 1.7c7.2 0 11.1-6 11.1-11.1v-.5c.7-.5 1.3-1.1 1.8-1.8z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" title="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.3 2.4.6.6.3 1 .7 1.5 1.3.4.5.7 1.2.8 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.9-.6 2.4-.3.6-.7 1-1.3 1.5-.5.4-1.2.7-2.4.8-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.3-2.4-.6a4 4 0 0 1-1.5-1.3c-.4-.5-.7-1.2-.8-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.9.6-2.4.3-.6.7-1 1.3-1.5.5-.4 1.2-.7 2.4-.8C8.4 2.2 8.8 2.2 12 2.2m0 1.8c-3.1 0-3.5 0-4.7.1-1 0-1.6.2-2 .4-.5.3-.9.6-1.1 1-.2.4-.4 1-.4 2 0 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 1 .2 1.6.4 2 .3.5.6.9 1.1 1.1.4.2 1 .4 2 .4 1.2 0 1.6.1 4.7.1s3.5 0 4.7-.1c1 0 1.6-.2 2-.4.5-.3.9-.6 1.1-1.1.2-.4.4-1 .4-2 0-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-1-.2-1.6-.4-2-.3-.5-.6-.9-1.1-1.1-.4-.2-1-.4-2-.4-1.2 0-1.6-.1-4.7-.1m0 3.2a5.8 5.8 0 1 1 0 11.6 5.8 5.8 0 0 1 0-11.6m0 1.8a4 4 0 1 0 0 7.9 4 4 0 0 0 0-7.9m5-2a1.4 1.4 0 1 1 0 2.9 1.4 1.4 0 0 1 0-2.9z" />
              </svg>
            </a>
          </div>
        </section>

        {/* Link columns */}
        <section>
          <h4 className="footer-title">Explorar</h4>
          <ul className="footer-list">
            {explorar.map(l => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="footer-title">Cuenta</h4>
          <ul className="footer-list">
            {cuenta.map(l => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={l.logout ? (event) => handleAuthLinkClick(event, l.to) : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="footer-title">Recursos</h4>
          <ul className="footer-list">
            {recursos.map(l => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </section>
      </div>

      <div className="container footer-bottom">
        <small>© {year} PYRA. Todos los derechos reservados.</small>
        <button
          type="button"
          className="to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          ↑
          <span className="sr-only">Volver arriba</span>
        </button>
      </div>
    </footer>
  )
}

