// src/services/auth.ts
import { api } from './api'

export interface User {
    id: string
    name: string
    email: string
    age?: number | null
    birthdate?: string | null
    created_at?: string
    updated_at?: string
}

export interface AuthResponse { token: string; user: User }
export interface MeResponse { user: User }

const TOKEN_KEY = 'token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

/** Utilidad: si recibimos DOB, lo convertimos a edad. */
function ageFromDob(dob: string): number {
    const d = new Date(dob)
    if (isNaN(d.getTime())) return 0
    const today = new Date()
    let age = today.getFullYear() - d.getFullYear()
    const m = today.getMonth() - d.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
    return age
}

export const Auth = {
    /**
     * Registro.
     * Acepta edad (number) o fecha (string). Siempre envía `age` al backend.
     */
    async signup(
        name: string,
        email: string,
        password: string,
        confirmPassword: string,
        ageOrDob?: number | string
    ) {
        const body: any = { name, email, password, confirmPassword }

        if (typeof ageOrDob === 'number' && Number.isFinite(ageOrDob)) {
            body.age = ageOrDob
        } else if (typeof ageOrDob === 'string' && ageOrDob.trim()) {
            // si llega un string, probamos número y luego fecha
            const maybeNum = Number(ageOrDob)
            if (Number.isFinite(maybeNum)) {
                body.age = maybeNum
            } else {
                const a = ageFromDob(ageOrDob)
                if (a > 0) body.age = a
            }
        }

        const r = await api.post<AuthResponse>('/auth/signup', body)
        setToken(r.token)
        return r
    },

    async login(email: string, password: string) {
        const r = await api.post<AuthResponse>('/auth/login', { email, password })
        setToken(r.token)
        return r
    },

    me() {
        return api.get<MeResponse>('/auth/me')
    },

    logout() {
        clearToken()
    },

    async changePassword(currentPassword: string, newPassword: string) {
        return api.post<{ ok: boolean }>('/auth/change-password', {
            currentPassword,
            newPassword,
        })
    },
}
