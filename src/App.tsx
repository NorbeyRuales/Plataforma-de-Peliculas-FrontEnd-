/**
 * @file App.tsx
 * @summary Root component that wires the global router into React.
 */

import AppRouter from './routes/AppRouter'
import { ToastProvider } from './components/toast/ToastProvider'
import ToastFlashMount from './components/toast/ToastFlashMount' // ✅ NUEVO

/**
 * @component
 * @returns Top-level router.
 */
export default function App() {
    return (
        <ToastProvider>
            {/* Lee y muestra la toast almacenada en sessionStorage tras una redirección */}
            <ToastFlashMount /> 
            <AppRouter />
        </ToastProvider>
    )
}
