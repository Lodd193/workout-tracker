'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { migrateLocalStorageTemplates } from '@/lib/templates'
import {
  logLogin,
  logLogout,
  logLoginFailed,
  logSignup,
  logSignupFailed,
  logPasswordResetRequest,
  logPasswordResetComplete,
} from '@/lib/audit/auditLog'
import { clearCSRFToken, regenerateCSRFToken } from '@/lib/csrf'
import {
  checkAccountLockout,
  recordFailedLogin,
  clearAccountLockout,
  getLockoutMessage,
  getWarningMessage,
} from '@/lib/accountLockout'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
  updatePassword: (password: string) => Promise<{ error?: string }>
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

    // Check if account is locked before attempting login
    const lockoutStatus = await checkAccountLockout(email)
    if (lockoutStatus.isLocked) {
      logger.debug('[Auth] Account is locked:', email)
      return { error: getLockoutMessage(lockoutStatus) }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    logger.debug('[Auth] Sign in result:', { data, error })

    if (error) {
      logger.error('[Auth] Sign in error:', error.message)
      // Log failed login attempt (don't await to avoid blocking)
      logLoginFailed(email, error.message)

      // Record failed attempt for lockout tracking
      const lockoutResult = await recordFailedLogin(email)

      // Build error message with lockout warning if applicable
      let errorMessage = error.message
      if (lockoutResult.isLocked) {
        errorMessage = getLockoutMessage({
          ...lockoutResult,
          minutesRemaining: 60, // Default to 60 mins for fresh lockout
        })
      } else {
        const warning = getWarningMessage(lockoutResult.attempts)
        if (warning) {
          errorMessage = `${error.message}. ${warning}`
        }
      }

      return { error: errorMessage }
    }

    // Log successful login
    if (data.user) {
      logLogin(data.user.id, email)
    }

    // Clear any lockout status on successful login
    await clearAccountLockout(email)

    // Regenerate CSRF token on successful login
    regenerateCSRFToken()

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
      // Log failed signup attempt
      logSignupFailed(email, error.message)
      return { error: error.message }
    }

    // Log successful signup
    if (data.user) {
      logSignup(data.user.id, email)
    }

    logger.debug('[Auth] Sign up successful!')
    return {}
  }

  const signOut = async () => {
    logger.debug('[Auth] Signing out...')
    // Log logout before signing out (while we still have user context)
    if (user) {
      logLogout(user.id)
    }
    // Clear CSRF token on logout
    clearCSRFToken()
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    logger.debug('[Auth] Requesting password reset for:', email)

    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password/update`
      : '/reset-password/update'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      logger.error('[Auth] Password reset error:', error.message)
      return { error: error.message }
    }

    // Log password reset request
    logPasswordResetRequest(email)

    logger.debug('[Auth] Password reset email sent successfully')
    return {}
  }

  const updatePassword = async (password: string) => {
    logger.debug('[Auth] Updating password...')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      logger.error('[Auth] Password update error:', error.message)
      return { error: error.message }
    }

    // Log successful password update
    if (user) {
      logPasswordResetComplete(user.id)
    }

    logger.debug('[Auth] Password updated successfully')
    return {}
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
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
