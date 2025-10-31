/**
 * @file authUrl.ts
 * @description Helpers for detecting Supabase auth parameters in URLs.
 */

/**
 * Checks whether the provided URL contains Supabase auth-related query or hash parameters.
 * @param href - URL to inspect, defaults to the current location when available.
 * @returns True when Supabase auth parameters are present.
 */
export function hasSupabaseAuthParams(href = typeof window !== 'undefined' ? window.location.href : ''): boolean {
  if (!href) return false
  return href.includes('access_token=') ||
    href.includes('refresh_token=') ||
    href.includes('type=recovery') ||
    href.includes('code=')
}
