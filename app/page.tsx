'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import WorkoutForm from './components/WorkoutForm'
import { logger } from '@/lib/logger'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      logger.debug('[Home] No user found, redirecting to login...')
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Show nothing if not logged in (redirect will happen)
  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <WorkoutForm />
    </main>
  )
}
