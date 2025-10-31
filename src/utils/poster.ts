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

  // Generate canonical file names that exist under /public/posters.
  const bases = [
    slugify(m?.slug ?? title),
    year ? `${slugify(m?.slug ?? title)}-${year}` : null,
  ].filter(Boolean) as string[]

  // Only .jpg files to match the existing assets.
  const urls: string[] = []
  for (const b of bases) {
    urls.push(`/posters/${b}.jpg`)
  }

  // Remove duplicates while preserving order.
  return Array.from(new Set(urls))
}
