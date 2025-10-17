import { Link } from 'react-router-dom'
import './Footer.scss'

export default function Footer(){
  return (
    <footer className='site-footer'>
      <div className='container small'>
        <p>© {new Date().getFullYear()} Flimhub</p>
        <nav aria-label='Sitemap'>
          <ul className='footer-links'>
            <li><Link to='/site-map'>Mapa del sitio</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
