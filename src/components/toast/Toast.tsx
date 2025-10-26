// src/components/toast/Toast.tsx
import { useEffect } from 'react'
import './Toast.scss'

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

type Props = {
    type?: ToastKind
    title?: string
    text: string
    actionLabel?: string
    onAction?: () => void
    onClose?: () => void
    autoHideMs?: number
}

export default function Toast({
    type = 'info',
    title,
    text,
    actionLabel,
    onAction,
    onClose,
    autoHideMs,
}: Props) {
    const isError = type === 'error'
    const role = isError ? 'alert' : 'status'
    const live = isError ? 'assertive' : 'polite'

    // Autocierre (excepto error)
    useEffect(() => {
        if (!autoHideMs || isError) return
        const id = window.setTimeout(() => onClose?.(), autoHideMs)
        return () => window.clearTimeout(id)
    }, [autoHideMs, isError, onClose])

    // Cerrar con ESC
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose?.()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    // Mismo layout “fancy” para info y success
    const isFancy = type === 'info' || type === 'success'

    return (
        <div className={`toast toast--${type}`} role={role} aria-live={live} aria-atomic="true">
            {isFancy ? (
                // ========= Variante INFO/SUCCESS (ticket) =========
                <>
                    {/* Onda lateral */}
                    <svg className="toast__wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M0,256L11.4,240C22.9,224,46,192,69,192C91.4,192,114,224,137,234.7C160,245,183,235,206,213.3C228.6,192,251,160,274,149.3C297.1,139,320,149,343,181.3C365.7,213,389,267,411,282.7C434.3,299,457,277,480,250.7C502.9,224,526,192,549,181.3C571.4,171,594,181,617,208C640,235,663,277,686,256C708.6,235,731,149,754,122.7C777.1,96,800,128,823,165.3C845.7,203,869,245,891,224C914.3,203,937,117,960,112C982.9,107,1006,181,1029,197.3C1051.4,213,1074,171,1097,144C1120,117,1143,107,1166,133.3C1188.6,160,1211,224,1234,218.7C1257.1,213,1280,139,1303,133.3C1325.7,128,1349,192,1371,192C1394.3,192,1417,128,1429,96L1440,64L1440,320L1428.6,320C1417.1,320,1394,320,1371,320C1348.6,320,1326,320,1303,320C1280,320,1257,320,1234,320C1211.4,320,1189,320,1166,320C1142.9,320,1120,320,1097,320C1074.3,320,1051,320,1029,320C1005.7,320,983,320,960,320C937.1,320,914,320,891,320C868.6,320,846,320,823,320C800,320,777,320,754,320C731.4,320,709,320,686,320C662.9,320,640,320,617,320C594.3,320,571,320,549,320C525.7,320,503,320,480,320C457.1,320,434,320,411,320C388.6,320,366,320,343,320C320,320,297,320,274,320C251.4,320,229,320,206,320C182.9,320,160,320,137,320C114.3,320,91,320,69,320C45.7,320,23,320,11,320L0,320Z" fillOpacity={1} />
                    </svg>

                    {/* Icono redondo */}
                    <div className="toast__icon-container" aria-hidden="true">
                        {type === 'success' ? (
                            <svg viewBox="0 0 24 24" className="toast__icon" aria-hidden="true" focusable="false">
                                <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" />
                                <path d="M8.5 12.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" className="toast__icon" aria-hidden="true" focusable="false">
                                <circle cx="12" cy="7.5" r="1.2" />
                                <rect x="11.1" y="10" width="1.8" height="6" rx=".9" />
                            </svg>
                        )}
                    </div>

                    {/* Texto */}
                    <div className="toast__message">
                        <p className="toast__title">{title ?? (type === 'success' ? 'Éxito' : 'Info')}</p>
                        <p className="toast__text">{text}</p>
                    </div>

                    {/* Acción opcional */}
                    {actionLabel && onAction && (
                        <button className="toast__action" onClick={onAction}>{actionLabel}</button>
                    )}

                    {/* Cerrar */}
                    <button className="toast__close" aria-label="Cerrar" onClick={onClose}>
                        <svg viewBox="0 0 15 15" className="toast__close-icon" aria-hidden="true">
                            <path
                                fill="currentColor"
                                d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                            />
                        </svg>
                    </button>
                </>
            ) : (
                // ========= Fallback solo para error/warning =========
                <>
                    {/** en este bloque `type` ∈ {'error' | 'warning'}; evitamos comparar con 'success'/'info' */}
                    <span className="toast__glyph" aria-hidden="true">
                        {type === 'error' ? '✖' : '!'}
                    </span>
                    <div className="toast__body">
                        <strong className="toast__title">
                            {title ?? (type === 'error' ? 'Error' : 'Atención')}
                        </strong>
                        <div className="toast__text">{text}</div>
                    </div>
                    {actionLabel && onAction && (
                        <button className="toast__action" onClick={onAction}>{actionLabel}</button>
                    )}
                    <button className="toast__close" aria-label="Cerrar" onClick={onClose}>×</button>
                </>
            )}
        </div>
    )
}
