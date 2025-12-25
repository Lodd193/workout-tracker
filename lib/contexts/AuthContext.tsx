'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { migrateLocalStorageTemplates } from '@/lib/templates'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Inactivity timeout: 30 minutes (in milliseconds)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Check active session on mount
    logger.debug('[Auth] Checking for existing session...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.debug('[Auth] Session check result:', session ? 'Found session' : 'No session')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      logger.debug('[Auth] Auth state changed:', _event, session ? 'User logged in' : 'User logged out')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Migrate localStorage templates to Supabase when user logs in
  useEffect(() => {
    if (user) {
      migrateLocalStorageTemplates()
        .then((count) => {
          if (count > 0) {
            logger.debug(`[Auth] Migrated ${count} templates to Supabase`)
          }
        })
        .catch((error) => {
          logger.error('[Auth] Template migration error:', error)
        })
    }
  }, [user])

  // Setup inactivity tracking when user logs in
  useEffect(() => {
    if (!user) {
      // Clear timer when user logs out
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
        inactivityTimerRef.current = null
      }
      return
    }

    // Define reset function inside useEffect to have access to current user
    const resetInactivityTimer = () => {
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      // Set new timer
      inactivityTimerRef.current = setTimeout(() => {
        logger.debug('[Auth] User inactive for 30 minutes, logging out...')
        supabase.auth.signOut()
      }, INACTIVITY_TIMEOUT)
    }

    // Start inactivity timer
    resetInactivityTimer()

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer)
    })

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer)
      })
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [user])

  const signIn = async (email: string, password: string) => {
    logger.debug('[Auth] Attempting sign in for:', email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    logger.debug('[Auth] Sign in result:', { data, error })

    if (error) {
      logger.error('[Auth] Sign in error:', error.message)
      return { error: error.message }
    }

    logger.debug('[Auth] Sign in successful!')
    return {}
  }

  const signUp = async (email: string, password: string) => {
    logger.debug('[Auth] Attempting sign up for:', email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    logger.debug('[Auth] Sign up result:', { data, error })

    if (error) {
      logger.error('[Auth] Sign up error:', error.message)
      return { error: error.message }
    }

    logger.debug('[Auth] Sign up successful!')
    return {}
  }

  const signOut = async () => {
    logger.debug('[Auth] Signing out...')
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
