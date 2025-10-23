// src/components/Breadcrumbs/Breadcrumbs.tsx
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import "./Breadcrumbs.scss";

/** Reglas de nombres por ruta */
const LABELS: { pattern: RegExp; label: string }[] = [
    { pattern: /^\/$/, label: "Inicio" },

    // Rutas reales de tu app
    { pattern: /^\/movies(\/|$)/, label: "Películas" },
    { pattern: /^\/movie\/[^/]+$/, label: "Detalle" },

    // (Dejas las anteriores por si cambias el slug a español algún día)
    { pattern: /^\/peliculas(\/|$)/, label: "Películas" },
    { pattern: /^\/series(\/|$)/, label: "Series" },
    { pattern: /^\/favoritos(\/|$)/, label: "Favoritos" },
    { pattern: /^\/perfil(\/|$)/, label: "Mi perfil" },
    { pattern: /^\/peliculas\/[^/]+$/, label: "Detalle" },
    { pattern: /^\/series\/[^/]+$/, label: "Detalle" },
];

function pathToLabel(path: string): string | null {
    for (const rule of LABELS) {
        if (rule.pattern.test(path)) return rule.label;
    }
    return null;
}

export default function Breadcrumbs() {
    const location = useLocation();

    const segments = useMemo(() => {
        const parts = location.pathname.split("/").filter(Boolean);
        const acc: string[] = [];
        parts.forEach((p, i) => {
            const prev = acc[i - 1] ?? "";
            acc.push(`${prev}/${p}`);
        });
        return ["/", ...acc];
    }, [location.pathname]);

    const lastDynamicLabel =
        (location.state as undefined | { breadcrumb?: string })?.breadcrumb ?? null;

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
                {segments.map((fullPath, idx) => {
                    const isLast = idx === segments.length - 1;
                    let label = pathToLabel(fullPath);

                    if (isLast && lastDynamicLabel) label = lastDynamicLabel;

                    if (!label) {
                        const raw = fullPath.split("/").filter(Boolean).pop() ?? "";
                        const rawLc = raw.toLowerCase();
                        // si el segmento es "undefined" o "null", muestra un texto neutro
                        if (rawLc === "undefined" || rawLc === "null" || rawLc === "") {
                            label = "Detalle";
                        } else {
                            label = decodeURIComponent(raw)
                                .replace(/[-_]/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase());
                        }
                    }

                    return (
                        <li key={fullPath}>
                            {isLast ? (
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
