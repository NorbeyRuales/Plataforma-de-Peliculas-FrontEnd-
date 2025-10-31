/**
 * @file netError.ts
 * @description Maps low-level network errors to user-friendly messages.
 */

/**
 * Normalizes different network error shapes (fetch, Axios, Supabase) to a single message.
 * @param err - Error object thrown by a network request.
 * @returns Localized, user-friendly message describing the failure.
 */
export function mapNetError(err: any): string {
  const resp = err?.response
  const status = resp?.status
  const msg =
    resp?.data?.error?.message ||
    resp?.data?.message ||
    err?.message

  if (err?.name === 'AbortError') return 'La peticion fue cancelada.'
  if (status === 0 || err?.code === 'ERR_NETWORK') return 'Sin conexion o el servidor no responde.'
  if (status >= 500) return 'Servidor temporalmente no disponible. Intenta mas tarde.'
  if (status === 404) return 'Recurso no encontrado.'
  if (status === 401 || status === 403) return 'No autorizado para esta accion.'
  return msg || 'Ocurrio un error inesperado.'
}
