/**
 * @file App.tsx
 * @summary Root component that wires the global router into React.
 */

import AppRouter from './routes/AppRouter'
import { ToastProvider } from './components/toast/ToastProvider' // ← NUEVO

/**
 * @component
 * @returns Top-level router.
 */
export default function App() {
    return (
        <ToastProvider>
            <AppRouter />
        </ToastProvider>
    )
}
