/**
 * @file slug.ts
 * @description Slug utilities shared by poster generation and routing helpers.
 */

/**
 * Converts a string into a URL-safe slug.
 * @param s - Value to slugify.
 * @returns Lowercase, hyphen-delimited slug without diacritics.
 */
export function slugify(s: string): string {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // removes diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
