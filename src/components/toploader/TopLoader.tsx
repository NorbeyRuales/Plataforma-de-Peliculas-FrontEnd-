import { useEffect, useRef, useState } from 'react'

/**
 * Lightweight top-loading bar that reacts to:
 *   window.dispatchEvent(new CustomEvent('top-loader', { detail: 'start' | 'stop' }))
 */
export default function TopLoader() {
    const [visible, setVisible] = useState(false)
    const [progress, setProgress] = useState(0)
    const rafRef = useRef<number | null>(null)
    const finishingRef = useRef(false)

    // avanza hacia ~85% mientras esté en "start"
    const tick = () => {
        setProgress(prev => {
            const target = finishingRef.current ? 100 : 85
            const next = prev + (target - prev) * 0.12
            return next > 99.5 ? 100 : next
        })
        rafRef.current = requestAnimationFrame(tick)
    }

    useEffect(() => {
        const onEvt = (e: Event) => {
            const ce = e as CustomEvent<string>
            if (ce.detail === 'start') {
                finishingRef.current = false
                setVisible(true)
                if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick)
            } else if (ce.detail === 'stop') {
                // empuja a 100% y oculta suavemente
                finishingRef.current = true
                setProgress(p => (p < 95 ? 95 : p))
                setTimeout(() => {
                    setProgress(100)
                    setTimeout(() => {
                        setVisible(false)
                        setProgress(0)
                        finishingRef.current = false
                        if (rafRef.current) {
                            cancelAnimationFrame(rafRef.current)
                            rafRef.current = null
                        }
                    }, 220) // espera la transición
                }, 120)
            }
        }

        window.addEventListener('top-loader', onEvt as EventListener)
        return () => {
            window.removeEventListener('top-loader', onEvt as EventListener)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return (
        <div
            aria-hidden="true"
            style={{
                position: 'fixed',
                insetInline: 0,
                top: 0,
                height: visible ? 3 : 0,
                zIndex: 9999,
                pointerEvents: 'none',
                transition: 'height .18s ease'
            }}
        >
            <div
                style={{
                    width: `${progress}%`,
                    height: '100%',
                    background:
                        'linear-gradient(90deg, var(--primary, #2266ff), rgba(255,255,255,.85))',
                    boxShadow: '0 1px 6px rgba(0,0,0,.25)',
                    transition: 'width .2s ease, opacity .25s ease',
                    opacity: visible ? 1 : 0
                }}
            />
        </div>
    )
}
