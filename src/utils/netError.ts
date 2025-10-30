export function mapNetError(err: any): string {
    const resp = err?.response;
    const status = resp?.status;
    const msg =
        resp?.data?.error?.message ||
        resp?.data?.message ||
        err?.message;

    if (err?.name === 'AbortError') return 'La petición fue cancelada.';
    if (status === 0 || err?.code === 'ERR_NETWORK')
        return 'Sin conexión o el servidor no responde.';
    if (status >= 500) return 'Servidor temporalmente no disponible. Intenta más tarde.';
    if (status === 404) return 'Recurso no encontrado.';
    if (status === 401 || status === 403) return 'No autorizado para esta acción.';
    return msg || 'Ocurrió un error inesperado.';
}
