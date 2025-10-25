/**
 * @file SkipLink.tsx
 * @description Enlace "Saltar al contenido" (Skip Link) para cumplir con
 * WCAG 2.4.1 (Bypass Blocks). Permite a los usuarios que navegan con teclado
 * o lector de pantalla saltar la navegación repetitiva y mover el foco
 * directamente al contenido principal (#main) o a un objetivo más útil dentro
 * de <main> si existe (p.ej., un <h1> con [data-skip-target]).
 *
 * Detalles A11y:
 * - 2.4.1 Bypass Blocks: primer Tab enfoca el skip-link y Enter lo activa.
 * - 2.1.1 Teclado: accesible 100% con teclado.
 * - 2.4.3 Orden del foco: al activar, el foco se traslada al contenido real.
 *
 * Notas de integración:
 * - Debe existir <main id="main"> en el layout (ya presente en AppRouter).
 * - Opcional: marca el título de cada vista con [data-skip-target] para que el
 *   foco aterrice en ese elemento en lugar de en <main>.
 */

import { useEffect, useRef } from 'react';

export default function SkipLink() {
    // Referencia al <a> para poder enfocarlo programáticamente.
    const ref = useRef<HTMLAnchorElement>(null);

    /**
     * Fuerza que el PRIMER Tab de la página enfoque la píldora.
     * Esto evita que el foco "empiece" en la barra del navegador o en elementos
     * no visibles/útiles. Solo se ejecuta si no había ningún elemento enfocado
     * (inicio real de la navegación por teclado).
     */
    useEffect(() => {
        const handleFirstTab = (e: KeyboardEvent) => {
            // Solo reacciona al primer Tab (no Shift+Tab).
            if (e.key !== 'Tab' || e.shiftKey) return;

            const active = document.activeElement as HTMLElement | null;
            const isStarting =
                !active ||
                active === document.body ||
                active === document.documentElement;

            if (isStarting) {
                e.preventDefault();
                ref.current?.focus(); // Enfoca la píldora de "Saltar al contenido"
            }
        };

        // Captura en fase de captura para que ocurra antes de otra lógica global
        document.addEventListener('keydown', handleFirstTab, true);
        return () => document.removeEventListener('keydown', handleFirstTab, true);
    }, []);

    /**
     * Al ACTIVAR el skip link:
     * - Busca primero un objetivo marcado con [data-skip-target] dentro de <main>
     * - Si no existe, intenta un heading (h1/h2) o el primer control navegable
     * - Como último recurso, pone foco en <main> (añadiendo tabindex=-1 si hace falta)
     *   y hace scroll al inicio para dar feedback visual del salto.
     */
    function handleActivate(e: React.MouseEvent<HTMLAnchorElement>) {
        const main = document.getElementById('main');
        if (!main) return;

        e.preventDefault();

        // Preferencia: un objetivo explícito marcado por nosotros
        let target =
            main.querySelector<HTMLElement>('[data-skip-target]') ||
            // Fallback: primer título o control interactivo lógico
            main.querySelector<HTMLElement>(
                'h1, [role="heading"][aria-level="1"], h2, [role="heading"], a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

        const el = target || main;
        if (el === main) main.setAttribute('tabindex', '-1'); // asegura que <main> sea enfocables

        // Mueve foco y desplaza a la parte superior del contenido
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
            accessKey="s"                // atajo del navegador (puede variar según SO)
            aria-keyshortcuts="Alt+Shift+S" // documentación del atajo sugerido
        >
            Saltar al contenido
        </a>
    );
}
