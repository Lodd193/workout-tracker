'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session on mount
    console.log('[Auth] Checking for existing session...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[Auth] Session check result:', session ? 'Found session' : 'No session')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Auth] Auth state changed:', _event, session ? 'User logged in' : 'User logged out')
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Attempting sign in for:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('[Auth] Sign in result:', { data, error })

    if (error) {
      console.error('[Auth] Sign in error:', error.message)
      return { error: error.message }
    }

    console.log('[Auth] Sign in successful!')
    return {}
  }

  const signUp = async (email: string, password: string) => {
    console.log('[Auth] Attempting sign up for:', email)
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log('[Auth] Sign up result:', { data, error })

    if (error) {
      console.error('[Auth] Sign up error:', error.message)
      return { error: error.message }
    }

    console.log('[Auth] Sign up successful!')
    return {}
  }

  const signOut = async () => {
    console.log('[Auth] Signing out...')
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
