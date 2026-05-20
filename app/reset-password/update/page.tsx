'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePassword } from '@/lib/passwordValidation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const { updatePassword, user } = useAuth()
  const router = useRouter()

  // Wait for auth to be ready (user should be set from the magic link)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      setShowPasswordRequirements(true)
      return
    }

    setLoading(true)

    try {
      const result = await updatePassword(password)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        setSuccess(true)
        setLoading(false)
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      console.error('Password update error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-lime-400 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-9 h-9 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <line x1="4" y1="12" x2="20" y2="12" strokeWidth={2.5} strokeLinecap="round" />
              <rect x="3" y="9" width="3" height="6" rx="0.5" fill="currentColor" />
              <rect x="18" y="9" width="3" height="6" rx="0.5" fill="currentColor" />
              <polyline points="7,16 10,13 13,14 16,10 19,8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Set New Password
          </h1>
          <p className="text-zinc-500 text-lg">Choose a strong password for your account</p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="bg-[#111111] border border-lime-400/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-lime-400/20 border-2 border-lime-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Password Updated!</h2>

              <p className="text-zinc-300 mb-6">
                Your password has been successfully updated. You will be redirected to the login page shortly.
              </p>

              <Link
                href="/login"
                className="inline-block bg-lime-400 text-black font-semibold py-3 px-8 rounded-lg hover:bg-lime-300 transition-all"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : !isReady ? (
          /* Loading State */
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-300">Verifying your reset link...</p>
            </div>
          </div>
        ) : (
          /* Update Password Form Card */
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-zinc-300 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setShowPasswordRequirements(true)
                  }}
                  onFocus={() => setShowPasswordRequirements(true)}
                  required
                  minLength={12}
                  className="w-full bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordRequirements(!showPasswordRequirements)}
                  className="text-xs text-lime-400 hover:text-lime-300 mt-1 underline"
                >
                  {showPasswordRequirements ? 'Hide' : 'Show'} password requirements
                </button>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={12}
                  className="w-full bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Password Requirements */}
              {showPasswordRequirements && (
                <div className="bg-[#1A1A1A] border border-[#222222] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-zinc-300 mb-2">Password must contain:</h3>
                  <ul className="text-xs text-zinc-500 space-y-1">
                    <li className={password.length >= 12 ? 'text-lime-400' : ''}>
                      {password.length >= 12 ? '✓' : '○'} At least 12 characters
                    </li>
                    <li className={/[A-Z]/.test(password) ? 'text-lime-400' : ''}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} At least one uppercase letter (A-Z)
                    </li>
                    <li className={/[a-z]/.test(password) ? 'text-lime-400' : ''}>
                      {/[a-z]/.test(password) ? '✓' : '○'} At least one lowercase letter (a-z)
                    </li>
                    <li className={/[0-9]/.test(password) ? 'text-lime-400' : ''}>
                      {/[0-9]/.test(password) ? '✓' : '○'} At least one number (0-9)
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password) ? 'text-lime-400' : ''}>
                      {/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password) ? '✓' : '○'} At least one special character (!@#$%^&*...)
                    </li>
                  </ul>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-lime-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-lime-400 hover:text-lime-300 text-sm transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
