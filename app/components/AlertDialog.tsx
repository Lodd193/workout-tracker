'use client'

interface AlertDialogProps {
  isOpen: boolean
  title: string
  message: string
  buttonText?: string
  onClose: () => void
  variant?: 'error' | 'warning' | 'info' | 'success'
}

export default function AlertDialog({
  isOpen,
  title,
  message,
  buttonText = 'OK',
  onClose,
  variant = 'info',
}: AlertDialogProps) {
  if (!isOpen) return null

  const variantConfig = {
    error: {
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400',
      buttonClass: 'from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-red-500/25',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
    warning: {
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      buttonClass: 'from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    info: {
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      buttonClass: 'from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 shadow-cyan-500/25',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    success: {
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      buttonClass: 'from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  }

  const config = variantConfig[variant]

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-700 animate-slideIn">
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0 ${config.iconColor}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-slate-300">{message}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full bg-gradient-to-r ${config.buttonClass} text-white px-4 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}
