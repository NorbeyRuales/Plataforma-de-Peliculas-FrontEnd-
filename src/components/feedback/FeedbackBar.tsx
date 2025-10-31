import { useId, useState } from 'react'
import FeedbackModal from './FeedbackModal'
import './FeedbackBar.scss'

export default function FeedbackBar() {
    const [open, setOpen] = useState(false)

    // a11y: texto de ayuda asociado al botón
    const helpId = useId()

    const handleOpen = () => setOpen(true)

    return (
        <>
            <div className="feedback-bar" role="region" aria-label="Enviar feedback">
                {/* Pregunta solo como label, sin textarea */}
                <p className="label">
                    ¿Tienes una idea, una lista épica o encontraste un bug?
                </p>

                <button
                    type="button"
                    onClick={handleOpen}
                    aria-haspopup="dialog"
                    aria-controls="feedback-modal"
                    aria-expanded={open}
                    aria-describedby={helpId}
                    className="btn"
                >
                    Escríbenos desde tu cuenta
                </button>

            </div>

            {open && (
                <FeedbackModal
                    prefill=""                 // sin texto previo; el usuario escribe en el modal
                    onClose={() => setOpen(false)}
                    onSent={() => setOpen(false)}
                />
            )}
        </>
    )
}
