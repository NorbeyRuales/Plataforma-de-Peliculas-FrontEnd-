/**
 * @file Toast.tsx
 * @summary Presentational toast card used by ToastProvider.
 * @remarks Mantiene accesibilidad (role, aria-live), animación suave y
 *          soporta título opcional para coincidir con las referencias de diseño.
 */

import { useEffect, useRef } from 'react'

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

type Props = {
    type: ToastKind
    text: string
    title?: string
    actionLabel?: string
    onAction?: () => void
    onClose: () => void
    autoHideMs?: number
}

export default function Toast({
    type,
    title,
    text,
    actionLabel,
    onAction,
    onClose,
    autoHideMs,
}: Props) {
    const timerRef = useRef<number | null>(null)

    // Auto-ocultamiento si se especifica
    useEffect(() => {
        if (!autoHideMs) return
        timerRef.current = window.setTimeout(() => onClose(), autoHideMs)
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current)
        }
    }, [autoHideMs, onClose])

    const isError = type === 'error'
    const role = isError ? 'alert' : 'status'
    const ariaLive = isError ? 'assertive' : 'polite'

    return (
        <div
            className={`toast toast--${type}`}
            role={role}
            aria-live={ariaLive}
            data-kind={type}
        >
            <span className="toast__icon" aria-hidden="true">
                {iconFor(type)}
            </span>

            <div className="toast__content">
                {title && <div className="toast__title">{title}</div>}
                <div className="toast__body">{text}</div>
            </div>

            {actionLabel && onAction && (
                <button
                    className="toast__action"
                    onClick={onAction}
                    aria-label={actionLabel}
                >
                    {actionLabel}
                </button>
            )}

            <button
                className="toast__close"
                onClick={onClose}
                aria-label="Cerrar notificación"
            >
                ×
            </button>
        </div>
    )
}

function iconFor(type: ToastKind) {
    // Iconos simples, consistentes con el aro circular del SCSS
    switch (type) {
        case 'success':
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M9 12.8l-2-2  -1.4 1.4 3.4 3.4 7-7 -1.4-1.4z" />
                </svg>
            )
        case 'error':
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M12 7v6m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
            )
        case 'warning':
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M12 9v4m0 4h.01M10.3 3.1L1.6 18a2 2 0 001.7 3h17.4a2 2 0 001.7-3L13.7 3.1a2 2 0 00-3.4 0z" />
                </svg>
            )
        case 'info':
        default:
            return (
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                    <path d="M12 7h.01M11 10h2v7h-2z" />
                </svg>
            )
    }
}
