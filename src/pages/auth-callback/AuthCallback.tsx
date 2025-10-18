// src/pages/auth-callback/AuthCallback.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supa } from '../../services/supa'

export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                await supa.auth.exchangeCodeForSession(window.location.href)
            } finally {
                // después de procesar el token, ve al formulario de nueva contraseña
                navigate('/forgot-password', { replace: true })
            }
        })()
    }, [navigate])

    return null
}
