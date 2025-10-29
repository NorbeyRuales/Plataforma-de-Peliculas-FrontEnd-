// src/utils/poster.ts
import { slugify } from './slug'

export function posterCandidatesFrom(m: any): string[] {
    const title = String(m?.title ?? '').trim()
    const year =
        m?.year ? String(m.year)
            : (typeof m?.release_date === 'string' ? m.release_date.slice(0, 4) : undefined)

    // Generamos nombres exactos que realmente existen en /public/posters
    const bases = [
        slugify(m?.slug ?? title),
        year ? `${slugify(m?.slug ?? title)}-${year}` : null,
    ].filter(Boolean) as string[]

    // Solo .jpg para empatar con tus archivos
    const urls: string[] = []
    for (const b of bases) {
        urls.push(`/posters/${b}.jpg`)
    }
    // Sin duplicados
    return Array.from(new Set(urls))
}
