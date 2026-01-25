'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  success: (message: string, duration?: number) => string
  error: (message: string, duration?: number) => string
  warning: (message: string, duration?: number) => string
  info: (message: string, duration?: number) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const DEFAULT_DURATION = 4000 // 4 seconds

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const duration = toast.duration ?? DEFAULT_DURATION

      setToasts((prev) => [...prev, { ...toast, id }])

      // Auto-dismiss after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }

      return id
    },
    [removeToast]
  )

  const success = useCallback(
    (message: string, duration?: number) => {
      return addToast({ type: 'success', message, duration })
    },
    [addToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      return addToast({ type: 'error', message, duration })
    },
    [addToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      return addToast({ type: 'warning', message, duration })
    },
    [addToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      return addToast({ type: 'info', message, duration })
    },
    [addToast]
  )

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
