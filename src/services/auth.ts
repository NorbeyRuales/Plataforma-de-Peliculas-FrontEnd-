// src/services/auth.ts
import { api } from './api'

export interface User {
    id: string
    name: string
    email: string
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

export const Auth = {
    async signup(name: string, email: string, password: string, confirmPassword: string, birthdate?: string) {
        const r = await api.post<AuthResponse>('/auth/signup', { name, email, password, confirmPassword, birthdate: birthdate ?? null })
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
