'use client'

import { useToast, ToastType } from '@/lib/contexts/ToastContext'

interface ToastConfig {
  bgClass: string
  borderClass: string
  iconBgClass: string
  iconColorClass: string
  icon: React.ReactNode
}

const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    iconBgClass: 'bg-emerald-500/20',
    iconColorClass: 'text-emerald-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  error: {
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    iconBgClass: 'bg-red-500/20',
    iconColorClass: 'text-red-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  warning: {
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    iconBgClass: 'bg-amber-500/20',
    iconColorClass: 'text-amber-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  },
  info: {
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    iconBgClass: 'bg-cyan-500/20',
    iconColorClass: 'text-cyan-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const config = toastConfigs[toast.type]

        return (
          <div
            key={toast.id}
            className={`${config.bgClass} ${config.borderClass} border rounded-xl p-4 shadow-lg backdrop-blur-md animate-slideIn flex items-start gap-3`}
          >
            <div
              className={`w-8 h-8 ${config.iconBgClass} rounded-full flex items-center justify-center flex-shrink-0 ${config.iconColorClass}`}
            >
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}
