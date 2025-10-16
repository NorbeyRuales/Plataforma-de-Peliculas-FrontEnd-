import './SiteMap.scss'

export default function SiteMap(){
  return (
    <section className='container site-map'>
      <h1>Mapa del sitio</h1>
      <div className='cols'>
        <div className='col'>
          <h2>Autenticación</h2>
          <ul>
            <li>Inicio de sesión</li>
            <li>Registro</li>
            <li>Recuperar contraseña</li>
          </ul>
        </div>
        <div className='col'>
          <h2>Película</h2>
          <ul>
            <li>Buscar película</li>
            <li>Ver película (Reproducir/Pausar)</li>
            <li>Añadir a lista</li>
          </ul>
        </div>
        <div className='col'>
          <h2>Cuenta</h2>
          <ul>
            <li>Perfil usuario</li>
            <li>Actualizar</li>
            <li>Eliminar</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
