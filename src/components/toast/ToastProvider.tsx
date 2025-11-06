/**
 * @file ToastProvider.tsx
 * @summary Contexto y viewport de toasts con helpers por tipo.
 * @remarks Mantiene tu API `show/success/error/info/warning` y añade
 *          título por defecto para success/info/warning/error.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import Toast, { type ToastKind } from './Toast'
import './Toast.scss'

type Item = {
    id: string
    type: ToastKind
    title?: string
    text: string
    actionLabel?: string
    onAction?: () => void
    autoHideMs?: number
}

type Ctx = {
    show: (opts: Omit<Item, 'id'>) => void
    success: (text: string, opts?: Partial<Omit<Item, 'id' | 'text' | 'type'>>) => void
    error: (text: string, opts?: Partial<Omit<Item, 'id' | 'text' | 'type'>>) => void
    info: (text: string, opts?: Partial<Omit<Item, 'id' | 'text' | 'type'>>) => void
    warning: (text: string, opts?: Partial<Omit<Item, 'id' | 'text' | 'type'>>) => void
}

const ToastCtx = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<Item[]>([])

    const remove = useCallback((id: string) => {
        setItems(prev => prev.filter(t => t.id !== id))
    }, [])

    const show: Ctx['show'] = useCallback((opts) => {
        const id = Math.random().toString(36).slice(2)
        setItems(prev => [...prev, { id, ...opts }])
    }, [])

    const api = useMemo<Ctx>(() => ({
        show,
        // Mantiene tu comportamiento; añade título por defecto para igualar el estilo de las capturas
        success: (text, opts) => show({ type: 'success', text, title: opts?.title ?? 'Éxito', autoHideMs: 5000, ...opts }),
        error: (text, opts) => show({ type: 'error', text, title: opts?.title ?? 'Error', autoHideMs: 5000, ...opts }), // cierre manual por defecto
        info: (text, opts) => show({ type: 'info', text, title: opts?.title ?? 'Info', autoHideMs: 3500, ...opts }),
        warning: (text, opts) => show({ type: 'warning', text, title: opts?.title ?? 'Aviso', autoHideMs: 4000, ...opts }),
    }), [show])

    return (
        <ToastCtx.Provider value={api}>
            {children}
            <div className="toast-viewport" aria-live="polite">
                {items.map(t => (
                    <Toast
                        key={t.id}
                        type={t.type}
                        title={t.title}
                        text={t.text}
                        actionLabel={t.actionLabel}
                        onAction={() => { t.onAction?.(); remove(t.id) }}
                        onClose={() => remove(t.id)}
                        autoHideMs={t.autoHideMs}
                    />
                ))}
            </div>
        </ToastCtx.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastCtx)
    if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
    return ctx
}
