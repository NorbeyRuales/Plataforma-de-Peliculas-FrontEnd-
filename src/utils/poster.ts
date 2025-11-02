/**
 * @file poster.ts
 * @description Utilities for resolving poster URLs from movie payloads.
 */
import { slugify } from './slug'

/**
 * Generates candidate poster URLs based on the movie title, slug and year.
 * @param m - Movie-like object containing title, slug or release metadata.
 * @returns Unique list of poster paths relative to `/public/posters`.
 */
export function posterCandidatesFrom(m: any): string[] {
  const title = String(m?.title ?? '').trim()
  const year =
    m?.year ? String(m.year)
      : (typeof m?.release_date === 'string' ? m.release_date.slice(0, 4) : undefined)

  // Slug base principal (desde slug o título)
  const primary = slugify(m?.slug ?? title)

  // Variantes heurísticas para coincidir con archivos locales típicos.
  // 1) sin artículo inicial (the/a/an)
  const noArticle = primary.replace(/^(the|a|an)-/, '')
  // 2) solo la parte antes de ":"
  const firstPart = slugify(title.split(':')[0] || title)
  // 3) sin guiones (prueba quitar un guion a la vez)
  const hyphenVariants: string[] = []
  if (primary.includes('-')) {
    const chars = primary.split('')
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === '-') {
        hyphenVariants.push(primary.slice(0, i) + primary.slice(i + 1))
      }
    }
  }

  // Conjunto base y con año
  const baseVariants = [primary, noArticle, firstPart, ...hyphenVariants]
  const withYear = year ? baseVariants.map((b) => `${b}-${year}`) : []

  // Aliases puntuales para recursos existentes en /public/posters
  const aliases: string[] = []
  if (primary === 'interstellar' || firstPart === 'interstellar') {
    aliases.push('interestelar')
  }

  // Generar rutas .jpg en orden de preferencia
  const all = [...baseVariants, ...withYear, ...aliases]
    .filter(Boolean)
    .map((b) => `/posters/${b}.jpg`)

  // Eliminar duplicados preservando el orden
  return Array.from(new Set(all))
}
