/**
 * @file Breadcrumbs.tsx
 * @description Breadcrumb component based on the current URL.
* Maps path segments to human-readable labels and marks the last item with
* aria-current="page" for screen readers.
*
* A11y (WCAG):
* - 1.3.1 Info and Relationships: <nav aria-label="Breadcrumb"> + <ol>/<li>.
* - 2.4.1 Bypass Blocks: Helps navigate and jump between levels.
* - 2.4.4/2.4.9 Link Purpose: Each link has descriptive text.
* - 2.4.8 Location: Indicates the position within the hierarchy.
*/
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import "./Breadcrumbs.scss";

/**
* Rules for converting known routes into navigation labels.
* Order matters: they are evaluated in sequence, and the first match is returned.
*/
const LABELS: { pattern: RegExp; label: string }[] = [
    { pattern: /^\/$/, label: "Inicio" },

    // Actual routes of your app
    { pattern: /^\/movies(\/|$)/, label: "Películas" },
    { pattern: /^\/movie\/[^/]+$/, label: "Detalle" },

    // (Optional in case slugs are changed to Spanish in the future)
    { pattern: /^\/peliculas(\/|$)/, label: "Películas" },
    { pattern: /^\/series(\/|$)/, label: "Series" },
    { pattern: /^\/favoritos(\/|$)/, label: "Favoritos" },
    { pattern: /^\/perfil(\/|$)/, label: "Mi perfil" },
    { pattern: /^\/peliculas\/[^/]+$/, label: "Detalle" },
    { pattern: /^\/series\/[^/]+$/, label: "Detalle" },
];

/**
* Returns the label associated with a path based on LABELS, or null if there is no match.
*/
function pathToLabel(path: string): string | null {
    for (const rule of LABELS) {
        if (rule.pattern.test(path)) return rule.label;
    }
    return null;
}

/**
* Breadcrumbs built from location.pathname.
* Example: "/movie/123" -> ["/", "/movie", "/movie/123"]
*/
export default function Breadcrumbs() {
    const location = useLocation();

    // Build each path stack to link the previous levels.
    const segments = useMemo(() => {
        const parts = location.pathname.split("/").filter(Boolean);
        const acc: string[] = [];
        parts.forEach((p, i) => {
            const prev = acc[i - 1] ?? "";
            acc.push(`${prev}/${p}`);
        });
        // Always include the root at the beginning
        return ["/", ...acc];
    }, [location.pathname]);

    // Allows you to override the end tag with a “human” name
// passed by state (e.g., the movie title).
    const lastDynamicLabel =
        (location.state as undefined | { breadcrumb?: string })?.breadcrumb ?? null;

    return (
        // aria-label helps screen readers identify navigation
        <nav className="breadcrumbs" aria-label="Migas de pan">
            <ol>
                {segments.map((fullPath, idx) => {
                    const isLast = idx === segments.length - 1;

                    // 1) Try with known rules
                    let label = pathToLabel(fullPath);

                    // 2) If it is the last one and comes with a dynamic label, use it
                    if (isLast && lastDynamicLabel) label = lastDynamicLabel;

                    // 3) Fallback: Format the last segment
                    if (!label) {
                        const raw = fullPath.split("/").filter(Boolean).pop() ?? "";
                        const rawLc = raw.toLowerCase();
                        // Neutral label if the segment is not significant
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
