// src/components/Breadcrumbs/Breadcrumbs.tsx
import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import "./Breadcrumbs.scss";

/**
 * Reglas para dar nombre a cada tramo de la URL.
 * - Usa rutas "base" conocidas.
 * - Para rutas dinámicas muestra un nombre genérico (p. ej., "Detalle").
 * - Si envías `state: { breadcrumb: "Nombre dinámico" }` en el Link,
 *   este componente lo usará automáticamente para la última miga.
 */
const LABELS: { pattern: RegExp; label: string }[] = [
    { pattern: /^\/$/, label: "Inicio" },
    { pattern: /^\/auth(\/|$)/, label: "Autenticación" },
    { pattern: /^\/peliculas(\/|$)/, label: "Películas" },
    { pattern: /^\/series(\/|$)/, label: "Series" },
    { pattern: /^\/favoritos(\/|$)/, label: "Favoritos" },
    { pattern: /^\/perfil(\/|$)/, label: "Mi perfil" },
    // Detalles genéricos (ej: /peliculas/123, /series/abc)
    { pattern: /^\/peliculas\/[^/]+$/, label: "Detalle" },
    { pattern: /^\/series\/[^/]+$/, label: "Detalle" },
    // Agrega aquí otras rutas que tengas
];

function pathToLabel(path: string): string | null {
    for (const rule of LABELS) {
        if (rule.pattern.test(path)) return rule.label;
    }
    return null;
}

export default function Breadcrumbs() {
    const location = useLocation();

    // Partimos la ruta en segmentos acumulativos: /a/b/c => ["/a", "/a/b", "/a/b/c"]
    const segments = useMemo(() => {
        const parts = location.pathname.split("/").filter(Boolean);
        const acc: string[] = [];
        parts.forEach((p, i) => {
            const prev = acc[i - 1] ?? "";
            acc.push(`${prev}/${p}`);
        });
        // Home ("/") al inicio
        return ["/", ...acc];
    }, [location.pathname]);

    // Si alguien navegó con `state: { breadcrumb: "Título X" }`, úsalo en la última miga
    const lastDynamicLabel =
        (location.state as undefined | { breadcrumb?: string })?.breadcrumb ?? null;

    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol>
                {segments.map((fullPath, idx) => {
                    const isLast = idx === segments.length - 1;
                    // Etiqueta por patrón
                    let label = pathToLabel(fullPath);

                    // Para la última miga, si hay etiqueta dinámica en state, úsala
                    if (isLast && lastDynamicLabel) label = lastDynamicLabel;

                    // Si no tenemos una etiqueta (ruta no mapeada), derivamos un fallback legible
                    if (!label) {
                        const raw = fullPath.split("/").filter(Boolean).pop() ?? "";
                        label = decodeURIComponent(raw)
                            .replace(/[-_]/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase());
                    }

                    // La penúltima y anteriores son enlaces; la última es texto
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
