import { Link } from 'react-router-dom'
import { useState } from 'react'
import './Account.scss'
// import { Auth } from '../../services/auth' // cuando tengas back

export default function Account(){
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete(){
    // await Auth.deleteAccount(); // cuando esté el backend
    alert('Cuenta eliminada (demo)');
  }

  return (
    <section className='auth-screen container'>
      <div className='logo-big' aria-label='Flimhub' />
      <h1 className='sr-only'>Perfil</h1>

      <form className='auth-form' onSubmit={(e)=>e.preventDefault()}>
        <input placeholder='Nombre usuario' />
        <input placeholder='Fecha de nacimiento' type='date' />
        <input placeholder='Correo electrónico' type='email' />

        <div className='row'>
          <button className='btn success' type='submit'>Editar</button>
          <button className='btn danger' type='button'>Cancelar</button>
        </div>

        {/* Eliminar cuenta */}
        {!confirmDelete ? (
          <button
            type='button'
            className='btn danger'
            onClick={()=>setConfirmDelete(true)}
          >
            Eliminar cuenta
          </button>
        ) : (
          <div className='row'>
            <button type='button' className='btn danger' onClick={handleDelete}>
              Confirmar eliminación
            </button>
            <button type='button' className='btn ghost' onClick={()=>setConfirmDelete(false)}>
              Cancelar
            </button>
          </div>
        )}

        <Link to='/' className='btn ghost' style={{marginTop:'.5rem'}}>Volver</Link>
      </form>
    </section>
  )
}
