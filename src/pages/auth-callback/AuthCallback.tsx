/**
 * @file src/pages/auth-callback/AuthCallback.tsx
 * @summary Handles Supabase auth redirects by exchanging URL codes for sessions.
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supa } from '../../services/supa'

/**
 * @component
 * @returns Null component that processes the Supabase callback and redirects.
 */
export default function AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        (async () => {
            try {
                await supa.auth.exchangeCodeForSession(window.location.href)
            } catch {
                // no-op
            } finally {
                // After processing the token, redirect to the password reset form
                navigate('/reset-password', { replace: true })
            }
        })()
    }, [navigate])

    return null
}
