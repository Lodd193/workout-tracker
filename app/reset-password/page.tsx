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
            Reset Password
          </h1>
          <p className="text-zinc-500 text-lg">Enter your email to receive a reset link</p>
        </div>

        {/* Success Message */}
        {emailSent ? (
          <div className="bg-[#111111] border border-lime-400/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-lime-400/20 border-2 border-lime-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-4">Check your email!</h2>

              <div className="bg-[#1A1A1A] border border-[#222222] rounded-lg p-6 mb-6">
                <p className="text-zinc-300 text-lg mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-lime-400 font-semibold text-xl mb-4">
                  {email}
                </p>
                <p className="text-zinc-500 text-sm">
                  Click the link in the email to reset your password.
                </p>
              </div>

              <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-lg p-4 mb-6">
                <p className="text-zinc-500 text-sm mb-2">
                  <strong className="text-zinc-300">Didn't receive the email?</strong>
                </p>
                <ul className="text-zinc-600 text-xs space-y-1 text-left max-w-md mx-auto">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure {email} is correct</li>
                  <li>• Wait a few minutes and check again</li>
                </ul>
              </div>

              <Link
                href="/login"
                className="inline-block bg-lime-400 text-black font-semibold py-3 px-8 rounded-lg hover:bg-lime-300 transition-all"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Reset Password Form Card */
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
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
                className="w-full bg-lime-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
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
