/**
 * @file ToastFlashMount.tsx
 * @summary Lee una flash toast (sessionStorage) al montar y la dispara con ToastProvider.
 */
import { useEffect } from 'react'
import { useToast } from './ToastProvider'
import { popFlashToast } from '../../utils/flashToast'

export default function ToastFlashMount() {
    const { success, info, warning, error } = useToast()

    useEffect(() => {
        const f = popFlashToast()
        if (!f) return
        const api = { success, info, warning, error } as const
        api[f.kind](f.text, f.title ? { title: f.title } : undefined)
    }, [])

    return null
}
