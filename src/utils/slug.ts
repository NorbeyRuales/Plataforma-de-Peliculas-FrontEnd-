// src/utils/slug.ts
export function slugify(s: string): string {
    return (s || '')
        .toString()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}
