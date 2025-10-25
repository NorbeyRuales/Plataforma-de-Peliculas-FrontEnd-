/**
 * @file SkipLink.tsx
 * @description Skip to Content link to comply with
* WCAG 2.4.1 (Bypass Blocks). Allows users navigating with a keyboard
* or screen reader to skip repetitive navigation and move focus
* directly to the main content (#main) or to a more useful target within
* <main> if it exists (e.g., an <h1> with [data-skip-target]).
*
* A11y Details:
* - 2.4.1 Bypass Blocks: The first Tab focuses the skip link, and Enter activates it.
* - 2.1.1 Keyboard: 100% keyboard accessible.
* - 2.4.3 Focus Order: When activated, focus moves to the actual content.
*
* Integration Notes:
* - <main id="main"> must exist in the layout (already present in AppRouter).
* - Optional: Mark each view's title with [data-skip-target] so that the
* focus lands on that element instead of <main>.
*/
import { useEffect, useRef } from 'react';

export default function SkipLink() {
    // Reference to the <a> so that it can be targeted programmatically.
    const ref = useRef<HTMLAnchorElement>(null);

    /**
* Forces the FIRST Tab on the page to focus the pill.
* This prevents focus from "starting" on the browser bar or on non-visible/useful elements.
* Only executed if no element was focused (actual start of keyboard navigation).
*/
    useEffect(() => {
        const handleFirstTab = (e: KeyboardEvent) => {
            // Only reacts to the first Tab (not Shift+Tab).
            if (e.key !== 'Tab' || e.shiftKey) return;

            const active = document.activeElement as HTMLElement | null;
            const isStarting =
                !active ||
                active === document.body ||
                active === document.documentElement;

            if (isStarting) {
                e.preventDefault();
                ref.current?.focus(); // Focus on the "Skip to content" pill
            }
        };

        // Capture in capture phase to occur before other global logic
        document.addEventListener('keydown', handleFirstTab, true);
        return () => document.removeEventListener('keydown', handleFirstTab, true);
    }, []);

    /**
* When the skip link is ACTIVATED:
* - First looks for a target marked with [data-skip-target] within <main>
* - If it doesn't exist, tries a heading (h1/h2) or the first navigable control
* - As a last resort, sets focus on <main> (adding tabindex=-1 if necessary)
* and scrolls to the beginning to provide visual feedback on the jump.
*/
    function handleActivate(e: React.MouseEvent<HTMLAnchorElement>) {
        const main = document.getElementById('main');
        if (!main) return;

        e.preventDefault();

       // Preference: an explicit goal marked by us
        let target =
            main.querySelector<HTMLElement>('[data-skip-target]') ||
            // Fallback: first title or logical interactive control
            main.querySelector<HTMLElement>(
                'h1, [role="heading"][aria-level="1"], h2, [role="heading"], a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

        const el = target || main;
        if (el === main) main.setAttribute('tabindex', '-1'); // ensures that <main> is focusable

        // Move focus and scroll to the top of the content
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
            accessKey="s"                // browser shortcut (may vary depending on OS)
            aria-keyshortcuts="Alt+Shift+S" // documentation of the suggested shortcut
        >
            Saltar al contenido
        </a>
    );
}
