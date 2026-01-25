'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { SettingsProvider } from '@/lib/contexts/SettingsContext'
import Navigation from './Navigation'
import ErrorBoundary from './ErrorBoundary'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <Navigation />
          {children}
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
