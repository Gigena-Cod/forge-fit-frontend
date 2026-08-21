/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Text, TextWeight } from '../Text/index.ts'
import './Toastify.css'

export const ToastifyType = { Success: 'success', Error: 'error', Warning: 'warning' } as const
export type ToastifyType = (typeof ToastifyType)[keyof typeof ToastifyType]
type Toast = { id: number; type: ToastifyType; text: string }
type ToastifyContextValue = { notify: (toast: Omit<Toast, 'id'>) => void }
const ToastifyContext = createContext<ToastifyContextValue | null>(null)

export function ToastifyProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const notify = useCallback(({ type, text }: Omit<Toast, 'id'>) => { const id = Date.now() + Math.random(); setToasts((current) => [...current, { id, type, text }]); window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 5000) }, [])
  const value = useMemo(() => ({ notify }), [notify])
  return <ToastifyContext.Provider value={value}>{children}<div className="toastify" aria-live="polite" aria-atomic="true">{toasts.map((toast) => <Toastify key={toast.id} type={toast.type} text={toast.text} onClose={() => setToasts((current) => current.filter((item) => item.id !== toast.id))} />)}</div></ToastifyContext.Provider>
}

export function Toastify({ type, text, onClose }: { type: ToastifyType; text: string; onClose?: () => void }) { return <article className={`toastify__item toastify__item--${type}`} role="status"><Text as="span" weight={TextWeight.Bold}>{text}</Text>{onClose && <button className="toastify__close" type="button" onClick={onClose} aria-label="Cerrar notificación">×</button>}</article> }
export function useToastify() { const context = useContext(ToastifyContext); if (!context) throw new Error('useToastify must be used inside ToastifyProvider'); return context }
