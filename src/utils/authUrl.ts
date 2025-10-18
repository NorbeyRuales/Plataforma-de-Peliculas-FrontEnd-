// src/utils/authUrl.ts
export function hasSupabaseAuthParams(href = typeof window !== 'undefined' ? window.location.href : ''): boolean {
    if (!href) return false;
    return href.includes('access_token=') ||
        href.includes('refresh_token=') ||
        href.includes('type=recovery') ||
        href.includes('code=');
}
