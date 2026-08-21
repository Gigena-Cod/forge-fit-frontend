import { useEffect } from 'react'
import { ToastifyType, useToastify } from '../components/Toastify/index.ts'
export function useErrorToast(error: string | null) { const { notify } = useToastify(); useEffect(() => { if (!error) return; notify({ type: ToastifyType.Error, text: error }) }, [error, notify]) }
