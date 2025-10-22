// src/pages/about/About.tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './About.scss'

type TeamMate = {
  name: string
  role: string
  avatar?: string // url opcional
  bio?: string
  links?: { label: string; href: string }[]
}

const TEAM: TeamMate[] = [
  { name: 'Diego', role: 'Frontend', avatar: '/brand/placeholder-poster.png' },
  { name: 'Yoel', role: 'Backend', avatar: '/brand/placeholder-poster.png' },
  { name: 'Cristian', role: 'UI/UX', avatar: '/brand/placeholder-poster.png' },
  { name: 'Dully', role: 'QA/Soporte', avatar: '/brand/placeholder-poster.png' },
]

export default function About() {
  // Enlaza navegación interna con desplazamiento suave
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement
      const a = el.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')!.slice(1)
      const target = document.getElementById(id)
      if (target) {
        e.preventDefault()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // manejo de foco accesible
        target.focus({ preventScroll: true })
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <section className="about">
      {/* Hero */}
      <header className="about-hero">
        <img src="/brand/pyra.svg" alt="PYRA" className="about-logo" />
        <div className="about-hero-text">
          <h1>Sobre nosotros</h1>
          <p>
            En <strong>PYRA</strong> creemos que ver películas debe ser simple, rápido y agradable.
            Construimos una plataforma ligera y honesta: sin enredos, centrada en las personas.
          </p>
          <nav className="about-quick">
            {/* Botones como en tu Figma */}
            <a href="#intro" className="chip">Introducción</a>
            <a href="#origin" className="chip">Cómo nació la idea</a>
            <a href="#offer" className="chip">¿Qué ofrecemos?</a>
            <a href="#team" className="chip">Equipo de trabajo</a>
          </nav>
        </div>

        {/* Back minimal (opcional, ya tienes Header) */}
        <Link to="/" className="about-back" aria-label="Volver al inicio">←</Link>
      </header>

      {/* Introducción */}
      <section id="intro" className="about-section" tabIndex={-1}>
        <h2>Introducción</h2>
        <p>
          PYRA es un proyecto académico convertido en producto: una plataforma web de
          catálogo y exploración de películas con foco en <em>rendimiento</em>, <em>accesibilidad</em>
          y <em>experiencia</em>. Nuestro objetivo: que encuentres algo para ver en menos de 30 segundos.
        </p>
        <ul className="bullets">
          <li>Interfaz clara y consistente (mismo patrón de tarjetas y navegación).</li>
          <li>Accesible por teclado, contrastes revisados y avisos comprensibles.</li>
          <li>Arquitectura simple: menos fricción, más velocidad.</li>
        </ul>
      </section>

      {/* Origen / timeline breve */}
      <section id="origin" className="about-section" tabIndex={-1}>
        <h2>Cómo nació la idea</h2>
        <div className="timeline">
          <div className="t-item">
            <span className="t-dot" aria-hidden />
            <div>
              <h3>El problema</h3>
              <p>Perder tiempo entre catálogos y menús complejos. Queríamos algo directo.</p>
            </div>
          </div>
          <div className="t-item">
            <span className="t-dot" aria-hidden />
            <div>
              <h3>El enfoque</h3>
              <p>Diseño minimal, búsqueda y filtros útiles, y rutas claras (migajas de pan incluidas).</p>
            </div>
          </div>
          <div className="t-item">
            <span className="t-dot" aria-hidden />
            <div>
              <h3>Hoy</h3>
              <p>PYRA crece con feedback real de usuarios y mejoras continuas en rendimiento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Oferta / value props */}
      <section id="offer" className="about-section" tabIndex={-1}>
        <h2>¿Qué ofrecemos?</h2>
        <div className="features">
          <article className="card">
            <h3>Navegación clara</h3>
            <p>Rutas predecibles, estado visible y accesos directos a lo importante.</p>
          </article>
          <article className="card">
            <h3>Rendimiento</h3>
            <p>Carga rápida, recursos livianos y caché donde aporta valor.</p>
          </article>
          <article className="card">
            <h3>Accesibilidad</h3>
            <p>Atajos, foco visible, textos entendibles y soporte a lector de pantalla.</p>
          </article>
          <article className="card">
            <h3>Transparencia</h3>
            <p>Sin sorpresas: mensajes claros ante errores y controles comprensibles.</p>
          </article>
        </div>
      </section>

      {/* Equipo */}
      <section id="team" className="about-section" tabIndex={-1}>
        <h2>Equipo de trabajo</h2>
        <ul className="team" role="list">
          {TEAM.map((t) => (
            <li key={t.name} className="member">
              <img
                src={t.avatar}
                alt={`Foto de ${t.name}`}
                loading="lazy"
                width={96}
                height={96}
              />
              <div className="m-info">
                <strong className="m-name">{t.name}</strong>
                <span className="m-role">{t.role}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA suave */}
      <footer className="about-cta">
        <p>¿Sugerencias o ideas? Nos encanta escuchar a quienes usan PYRA.</p>
        <Link to="/account" className="btn">Escríbenos por tu cuenta</Link>
      </footer>
    </section>
  )
}
