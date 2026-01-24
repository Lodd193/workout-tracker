'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await resetPassword(email)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        setEmailSent(true)
        setLoading(false)
      }
    } catch (err) {
      console.error('Password reset error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              {/* Barbell bar */}
              <line x1="4" y1="12" x2="20" y2="12" strokeWidth={2.5} strokeLinecap="round" />
              {/* Left weight plate */}
              <rect x="3" y="9" width="3" height="6" rx="0.5" fill="currentColor" />
              {/* Right weight plate */}
              <rect x="18" y="9" width="3" height="6" rx="0.5" fill="currentColor" />
              {/* Upward trending graph line */}
              <polyline points="7,16 10,13 13,14 16,10 19,8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight mb-3">
            Reset Password
          </h1>
          <p className="text-slate-400 text-lg">Enter your email to receive a reset link</p>
        </div>

        {/* Success Message */}
        {emailSent ? (
          <div className="bg-slate-800/60 border border-emerald-500/50 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Check your email!</h2>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-6">
                <p className="text-slate-300 text-lg mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-emerald-400 font-semibold text-xl mb-4">
                  {email}
                </p>
                <p className="text-slate-400 text-sm">
                  Click the link in the email to reset your password.
                </p>
              </div>

              <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-4 mb-6">
                <p className="text-slate-400 text-sm mb-2">
                  <strong className="text-slate-300">Didn't receive the email?</strong>
                </p>
                <ul className="text-slate-500 text-xs space-y-1 text-left max-w-md mx-auto">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure {email} is correct</li>
                  <li>• Wait a few minutes and check again</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3 px-8 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Password Form Card */
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

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
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-emerald-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
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
