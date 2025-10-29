/**
 * @file App.tsx
 * @summary Root component that wires the global router into React.
 */

import AppRouter from './routes/AppRouter'
import { ToastProvider } from './components/toast/ToastProvider'
import ToastFlashMount from './components/toast/ToastFlashMount' // ✅ NUEVO
import TopLoader from './components/toploader/TopLoader' // ✅ Barra superior (heurística #1)

/**
 * @component
 * @returns Top-level router.
 */
export default function App() {
    return (
        <ToastProvider>
            {/* Barra superior de carga para visibilidad del estado del sistema */}
            <TopLoader />
            {/* Lee y muestra la toast almacenada en sessionStorage tras una redirección */}
            <ToastFlashMount />
            <AppRouter />
        </ToastProvider>
    )
}
