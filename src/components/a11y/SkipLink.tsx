import { useEffect, useRef } from 'react';

export default function SkipLink() {
    const ref = useRef<HTMLAnchorElement>(null);

    // Asegura que el PRIMER Tab de la página enfoque la píldora.
    useEffect(() => {
        const handleFirstTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || e.shiftKey) return;

            const active = document.activeElement as HTMLElement | null;
            const isStarting =
                !active ||
                active === document.body ||
                active === document.documentElement;

            if (isStarting) {
                e.preventDefault();
                ref.current?.focus();
            }
        };

        document.addEventListener('keydown', handleFirstTab, true);
        return () => document.removeEventListener('keydown', handleFirstTab, true);
    }, []);

    // Al activar, mover foco al contenido real (h1 o primer control).
    function handleActivate(e: React.MouseEvent<HTMLAnchorElement>) {
        const main = document.getElementById('main');
        if (!main) return;

        e.preventDefault();

        // Preferencia: un ancla marcada por nosotros
        let target =
            main.querySelector<HTMLElement>('[data-skip-target]') ||
            // Si no existe, intenta un heading o el primer control interactivo
            main.querySelector<HTMLElement>(
                'h1, [role="heading"][aria-level="1"], h2, [role="heading"], a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

        const el = target || main;
        if (el === main) main.setAttribute('tabindex', '-1'); // por si acaso

        el.focus({ preventScroll: false });
        el.scrollIntoView({ block: 'start' });
    }

    return (
        <a
            ref={ref}
            href="#main"
            className="skip-link"
            onClick={handleActivate}
            aria-label="Saltar al contenido principal"
            accessKey="s"
            aria-keyshortcuts="Alt+Shift+S"
        >
            Saltar al contenido
        </a>
    );
}
