import { useEffect, useState } from 'react'
import { Feedback, FeedbackCategory } from '../../services/feedback'
import { useToast } from '../../components/toast/ToastProvider'
import './FeedbackModal.scss'

function FeedbackModal({
    prefill,
    onClose,
    onSent,
}: {
    prefill: string
    onClose: () => void
    onSent: () => void
}) {
    const [cat, setCat] = useState<FeedbackCategory>('idea')
    const [msg, setMsg] = useState(prefill)
    const [file, setFile] = useState<File | undefined>()
    const [loading, setLoading] = useState(false)

    const { success: showOkToast, error: showErrorToast } = useToast()

    // Cerrar con ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    async function submit() {
        if (!msg.trim() || loading) return
        setLoading(true)
        const ok = await Feedback.send({ category: cat, message: msg, file })
        setLoading(false)
        if (ok) {
            showOkToast('¡Gracias por tu feedback! 👀')
            onSent()
        } else {
            showErrorToast('No pudimos enviar tu mensaje. Intenta de nuevo.')
        }
    }

    return (
        <div className="fb-backdrop" role="dialog" aria-modal="true" aria-labelledby="fb-title">
            <div className="fb-modal" role="document">
                <header className="fb-header">
                    <h3 id="fb-title">Enviar feedback</h3>
                    <button type="button" className="close" onClick={onClose} aria-label="Cerrar">×</button>
                </header>

                <p className="fb-intro">
                    Cuéntanos tu idea, sugiere una lista o reporta un problema.
                </p>

                <label className="field">
                    <span>Categoría</span>
                    <select value={cat} onChange={e => setCat(e.target.value as FeedbackCategory)}>
                        <option value="idea">Idea</option>
                        <option value="lista">Lista épica</option>
                        <option value="bug">Bug</option>
                    </select>
                </label>

                <label className="field">
                    <span>Mensaje</span>
                    <textarea
                        value={msg}
                        onChange={e => setMsg(e.target.value.slice(0, 1000))}
                        rows={4}
                        style={{ resize: 'none' }}
                        placeholder="Cuéntanos tu idea o qué ocurrió…"
                    />
                    <small className="hint">{msg.length}/1000</small>
                </label>

                <label className="field">
                    <span>Captura (opcional)</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files?.[0])}
                    />
                    {file && (
                        <small className="hint">
                            Archivo: {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB{' '}
                            <button type="button" onClick={() => setFile(undefined)}>Quitar</button>
                        </small>
                    )}
                </label>

                <div className="actions">
                    <button type="button" onClick={onClose} disabled={loading}>Cancelar</button>
                    <button type="button" onClick={submit} disabled={loading || !msg.trim()}>
                        {loading ? 'Enviando…' : 'Enviar'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default FeedbackModal
export { FeedbackModal }
