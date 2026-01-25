'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import { ToastProvider } from '@/lib/contexts/ToastContext'
import Navigation from './Navigation'
import ErrorBoundary from './ErrorBoundary'
import ToastContainer from './Toast'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ToastProvider>
            <Navigation />
            {children}
            <ToastContainer />
          </ToastProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
