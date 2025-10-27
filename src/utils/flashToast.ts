/**
 * @file flashToast.ts
 * @summary Utilidad para persistir una toast en sessionStorage y mostrarla tras una redirección.
 */

export type FlashToast = {
    kind: 'success' | 'info' | 'warning' | 'error'
    text: string
    title?: string
    /** Tiempo de vida en ms antes de expirar (default 15s). */
    ttl?: number
}

const KEY = 'flash:toast'

/**
 * Guarda una toast “flash” en sessionStorage.
 * Úsala ANTES de navegar a otra vista.
 */
export function pushFlashToast(t: FlashToast) {
    const ttl = t.ttl ?? 15_000
    sessionStorage.setItem(KEY, JSON.stringify({ ...t, exp: Date.now() + ttl }))
}

/**
 * Lee y elimina (si existe) la toast “flash”.
 * Llamar una sola vez al montar la app/layout.
 */
export function popFlashToast(): FlashToast | null {
    try {
        const raw = sessionStorage.getItem(KEY)
        if (!raw) return null
        sessionStorage.removeItem(KEY)
        const obj = JSON.parse(raw)
        if (obj?.exp && Date.now() > obj.exp) return null
        return { kind: obj.kind, text: obj.text, title: obj.title } as FlashToast
    } catch {
        return null
    }
}
