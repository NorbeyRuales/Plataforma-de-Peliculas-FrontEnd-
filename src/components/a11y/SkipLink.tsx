/**
 * @file SkipLink.tsx
 * @summary WCAG-compliant skip link that routes keyboard users directly to the main content.
 * @remarks
 * - WCAG 2.4.1 Bypass Blocks: the first Tab focuses the pill and Enter activates it.
 * - Works fully with keyboard and screen readers by moving focus inside <main> or a [data-skip-target] element.
 * - Requires <main id="main"> in the layout; optionally mark headings with [data-skip-target].
 */

import { useEffect, useRef } from 'react';

/**
 * Skip link component that exposes a focusable pill to jump past repeated navigation blocks.
 * @component
 * @returns Anchor element that focuses the preferred landmark before scrolling.
 */
export default function SkipLink() {
    // Reference used to focus the anchor programmatically when forcing the first Tab.
    const ref = useRef<HTMLAnchorElement>(null);

    /**
     * Forces the very first Tab press on the page to land on the pill.
     * Prevents focus from starting in the browser chrome or hidden elements.
     * Runs only when no other element was focused (real keyboard start).
     */
    useEffect(() => {
        const handleFirstTab = (e: KeyboardEvent) => {
            // React only to the first forward Tab (ignore Shift+Tab).
            if (e.key !== 'Tab' || e.shiftKey) return;

            const active = document.activeElement as HTMLElement | null;
            const isStarting =
                !active ||
                active === document.body ||
                active === document.documentElement;

            if (isStarting) {
                e.preventDefault();
                ref.current?.focus(); // Focus the pill before the rest of the UI
            }
        };

        // Capture phase so this executes before other global handlers.
        document.addEventListener('keydown', handleFirstTab, true);
        return () => document.removeEventListener('keydown', handleFirstTab, true);
    }, []);

    /**
     * When the skip link is activated:
     * - Prefers a [data-skip-target] inside <main>.
     * - Falls back to the first heading or focusable control.
     * - As a last resort, focuses <main> (forcing tabindex=-1) and scrolls it into view.
     */
    function handleActivate(e: React.MouseEvent<HTMLAnchorElement>) {
        const main = document.getElementById('main');
        if (!main) return;

        e.preventDefault();

        // Preference: explicit skip targets defined per view.
        let target =
            main.querySelector<HTMLElement>('[data-skip-target]') ||
            // Fallback: first heading or logical focusable inside <main>.
            main.querySelector<HTMLElement>(
                'h1, [role="heading"][aria-level="1"], h2, [role="heading"], a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

        const el = target || main;
        if (el === main) main.setAttribute('tabindex', '-1'); // ensure <main> can receive focus

        // Move focus and give visual feedback of the jump.
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
            accessKey="s"                // Browser shortcut (varies per OS)
            aria-keyshortcuts="Alt+Shift+S" // Document the suggested shortcut
        >
            Saltar al contenido
        </a>
    );
}
