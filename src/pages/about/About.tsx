// src/pages/about/About.tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import FlipCard from '../../components/team/FlipCard'
import './About.scss'

type TeamMate = {
  name: string
  role: string
  avatar?: string
  iconUrl?: string
  backText?: string   // texto en la cara trasera (si no, usa role)
}

const TEAM: TeamMate[] = [
  { name: 'Joel',     role: 'Backend',       avatar: '/brand/placeholder-poster.png', iconUrl: '/brand/icons/tsnode.svg',  backText: 'Joel: Responsable del Backend (TypeScript)' },
  { name: 'Norbey',   role: 'Frontend',      avatar: '/brand/placeholder-poster.png', iconUrl: '/brand/icons/vite.svg',     backText: 'Norbey: Responsable del Frontend (Vite)' },
  { name: 'Diego',    role: 'QA',            avatar: '/brand/placeholder-poster.png', iconUrl: '/brand/icons/testin.svg',  backText: 'Diego: Encargado de QA / Testing' },
  { name: 'Cristian', role: 'Product Owner', avatar: '/brand/placeholder-poster.png', iconUrl: '/brand/icons/trello.svg',   backText: 'Cristian: Product Owner' },
]

export default function About() {
  // desplazamiento suave en anclas (#intro, #team, etc.)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!target) return
      const id = target.getAttribute('href')!.slice(1)
      const el = document.getElementById(id)
      if (!el) return
      e.preventDefault()
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.focus({ preventScroll: true })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <section className="about-page">
      {/* HERO */}
      <header className="about-hero" aria-labelledby="about-title">
        <div className="hero-media" aria-hidden="true">
          <img src="/brand/pyra.svg" alt="" className="hero-logo" />
        </div>

        <div className="hero-copy">
          <p className="eyebrow">Desde 2024 · Plataforma de cine</p>
          <h1 id="about-title">Tu próxima película, sin vueltas</h1>
          <p className="lead">
            En <strong>PYRA</strong> reunimos estrenos, clásicos y joyas ocultas en una
            experiencia rápida y clara. Explora, guarda y decide en menos de <b>30&nbsp;segundos</b>.
          </p>

          <nav className="quick-links" aria-label="Secciones de esta página">
            <a href="#intro" className="chip">Introducción</a>
            <a href="#principles" className="chip">Principios</a>
            <a href="#origin" className="chip">Historia</a>
            <a href="#offer" className="chip">Qué ofrecemos</a>
            <a href="#team" className="chip">Equipo</a>
          </nav>
        </div>

        <Link to="/" className="about-back" aria-label="Volver al inicio">←</Link>
      </header>

      {/* MÉTRICAS / HIGHLIGHTS */}
      <section className="metrics" aria-label="Indicadores principales">
        <article className="kpi">
          <div className="num">+10k</div>
          <div className="lbl">Títulos en catálogo</div>
        </article>
        <article className="kpi">
          <div className="num">~22 s</div>
          <div className="lbl">Tiempo promedio para decidir</div>
        </article>
        <article className="kpi">
          <div className="num">99.9%</div>
          <div className="lbl">Disponibilidad del servicio</div>
        </article>
      </section>

      {/* INTRO */}
      <section id="intro" className="about-section" tabIndex={-1}>
        <h2>Introducción</h2>
        <p>
          PYRA te ayuda a descubrir qué ver hoy. Recomendaciones honestas,
          filtros útiles y una navegación que no estorba. El plan: sentarte y disfrutar.
        </p>
        <ul className="bullets">
          <li>Catálogo curado por temas, estados de ánimo y géneros.</li>
          <li>Listas personales y recordatorios para seguir donde quedaste.</li>
          <li>Interfaz accesible, rápida y consistente en todos tus dispositivos.</li>
        </ul>
      </section>

      {/* PRINCIPIOS DE DISEÑO */}
      <section id="principles" className="about-section" tabIndex={-1}>
        <h2>Principios de diseño</h2>
        <div className="principles">
          <article>
            <h3>Menos clics</h3>
            <p>Encuentra lo que buscas con filtros claros y búsqueda inteligente.</p>
          </article>
          <article>
            <h3>Accesible por defecto</h3>
            <p>Contrastes reales, foco visible, soporte de teclado y lector de pantalla.</p>
          </article>
          <article>
            <h3>Velocidad que se siente</h3>
            <p>Cargas progresivas y prefetch para que la app se sienta instantánea.</p>
          </article>
        </div>
      </section>

      {/* HISTORIA / TIMELINE */}
      <section id="origin" className="about-section" tabIndex={-1}>
        <h2>Nuestra historia</h2>
        <div className="timeline">
          <div className="t-item">
            <span className="t-dot" aria-hidden />
            <div>
              <h3>El dolor</h3>
              <p>Demasiadas opciones, demasiado tiempo para elegir. Queríamos algo directo.</p>
            </div>
          </div>
          <div className="t-item">
            <span className="t-dot" aria-hidden />
            <div>
              <h3>La solución</h3>
              <p>Diseño minimal, reseñas cortas y señales visuales que guían la elección.</p>
            </div>
          </div>
          <div className="t-item">
            <span className="t-dot" aria-hidden />
            <div>
              <h3>Hoy</h3>
              <p>Seguimos creciendo con feedback de la comunidad y datos de uso reales.</p>
            </div>
          </div>
        </div>
      </section>

      {/* QUÉ OFRECEMOS */}
      <section id="offer" className="about-section" tabIndex={-1}>
        <h2>¿Qué ofrecemos?</h2>
        <div className="features">
          <article className="card">
            <h3>Descubrimiento inteligente</h3>
            <p>Recomendaciones por estado de ánimo, duración y plataformas donde ver.</p>
          </article>
          <article className="card">
            <h3>Perfiles y listas</h3>
            <p>Guarda favoritos, crea colecciones y compártelas con tus amigos.</p>
          </article>
          <article className="card">
            <h3>Ficha clara</h3>
            <p>Tráiler, reparto, puntuación y críticas en un diseño limpio y legible.</p>
          </article>
          <article className="card">
            <h3>Sin ruido</h3>
            <p>Interfaz sin banners invasivos ni pasos innecesarios. Solo cine.</p>
          </article>
        </div>
      </section>

      {/* CITA / MISIÓN */}
      <section className="about-quote" aria-label="Nuestra misión">
        <blockquote>
          “Elegir una película debería tomar menos tiempo que hacer palomitas.”
        </blockquote>
        <cite>Equipo PYRA</cite>
      </section>

      {/* EQUIPO (se mantiene tu grilla de FlipCards) */}
      <section id="team" className="about-section" tabIndex={-1}>
        <h2>Equipo de trabajo</h2>
        <div className="team-grid">
          {TEAM.map((t) => (
            <FlipCard
              key={t.name}
              name={t.name}
              role={t.role}
              avatarUrl={t.avatar}
              iconUrl={t.iconUrl}
              backText={t.backText}
              accentA="#f4ecda"
              accentB="#89b4fa"
              accentC="#6ea4ff"
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <footer className="about-cta">
        <p>¿Tienes una idea, una lista épica o encontraste un bug?</p>
        <Link to="/account" className="btn">Escríbenos desde tu cuenta</Link>
      </footer>
    </section>
  )
}
