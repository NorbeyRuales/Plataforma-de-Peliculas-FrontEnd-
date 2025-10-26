/**
 * @file Breadcrumbs.tsx
 * @summary Renders navigation breadcrumbs based on the current URL.
 * @remarks
 * - WCAG 1.3.1 Info & Relationships: <nav aria-label="Migas de pan"> + <ol>/<li>.
 * - WCAG 2.4.1 Bypass Blocks: orientation aid to move between levels quickly.
 * - WCAG 2.4.4/2.4.9 Link Purpose: every link exposes descriptive text.
 * - WCAG 2.4.8 Location: shows the user's position within the hierarchy.
 */

import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import "./Breadcrumbs.scss";

/**
 * Rules that map known routes to human-friendly labels.
 * Order matters: rules run sequentially and return the first match.
 */
const LABELS: { pattern: RegExp; label: string }[] = [
    { pattern: /^\/$/, label: "Inicio" },

    // Real application routes
    { pattern: /^\/movies(\/|$)/, label: "Películas" },
    { pattern: /^\/movie(\/|$)/, label: "Película" },
    { pattern: /^\/movie\/[^/]+$/, label: "Detalle" },
    { pattern: /^\/favorites(\/|$)/, label: "Favoritos" },
    { pattern: /^\/account(\/|$)/, label: "Cuenta" },
    { pattern: /^\/about(\/|$)/, label: "Sobre nosotros" },

    // Optional routes in case slugs change to Spanish later
    { pattern: /^\/peliculas(\/|$)/, label: "Películas" },
    { pattern: /^\/series(\/|$)/, label: "Series" },
    { pattern: /^\/favoritos(\/|$)/, label: "Favoritos" },
    { pattern: /^\/perfil(\/|$)/, label: "Mi perfil" },
    { pattern: /^\/peliculas\/[^/]+$/, label: "Detalle" },
    { pattern: /^\/series\/[^/]+$/, label: "Detalle" },
];


/**
 * Returns the label associated with a path based on LABELS, or null if unmatched.
 */
function pathToLabel(path: string): string | null {
    for (const rule of LABELS) {
        if (rule.pattern.test(path)) return rule.label;
    }
    return null;
}

/**
 * @component
 * @summary Builds breadcrumbs from location.pathname (e.g., /movie/123 -> ["/", "/movie", "/movie/123"]).
 */
export default function Breadcrumbs() {
    const location = useLocation();

    // Build each cumulative path segment so previous levels remain linked.
    const segments = useMemo(() => {
        const parts = location.pathname.split("/").filter(Boolean);
        const acc: string[] = [];
        parts.forEach((p, i) => {
            const prev = acc[i - 1] ?? "";
            acc.push(`${prev}/${p}`);
        });
        // Always prepend the root segment
        return ["/", ...acc];
    }, [location.pathname]);

    // Allow overriding the final breadcrumb with a human-friendly label
    // passed via navigation state (e.g., the movie title).
    const lastDynamicLabel =
        (location.state as undefined | { breadcrumb?: string })?.breadcrumb ?? null;

    return (
        // aria-label helps screen readers recognize the navigation
        <nav className="breadcrumbs" aria-label="Migas de pan">
            <ol>
                {segments.map((fullPath, idx) => {
                    const isLast = idx === segments.length - 1;

                    // 1) Try known label rules first
                    let label = pathToLabel(fullPath);

                    // 2) If this is the last crumb and a dynamic label exists, use it
                    if (isLast && lastDynamicLabel) label = lastDynamicLabel;

                    // 3) Fallback: format the trailing segment
                    if (!label) {
                        const raw = fullPath.split("/").filter(Boolean).pop() ?? "";
                        const rawLc = raw.toLowerCase();
                        // Neutral label when the segment is meaningless
                        if (rawLc === "undefined" || rawLc === "null" || rawLc === "") {
                            label = "Detalle";
                        } else {
                            // Decode and capitalize words
                            label = decodeURIComponent(raw)
                                .replace(/[-_]/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase());
                        }
                    }

                    return (
                        <li key={fullPath}>
                            {isLast ? (
                                // aria-current="page" indicates the current point in the hierarchy
                                <span aria-current="page">{label}</span>
                            ) : (
                                <Link to={fullPath}>{label}</Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
