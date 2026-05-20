'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { validatePassword } from '@/lib/passwordValidation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

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
      const result = await signUp(email, password)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        setEmailSent(true)
        setLoading(false)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
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
          <h1 className="text-5xl font-bold text-white tracking-tight mb-3">
            Gym Bestie
          </h1>
          <p className="text-zinc-500 text-lg">Start your fitness journey</p>
        </div>

        {/* Email Verification Success Message */}
        {emailSent ? (
          <div className="bg-[#111111] border border-lime-400/50 rounded-2xl p-8 shadow-2xl mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-lime-400/20 border-2 border-lime-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">Check your email!</h2>

              <div className="bg-[#1A1A1A] border border-[#222222] rounded-lg p-6 mb-6">
                <p className="text-zinc-300 text-lg mb-2">
                  We've sent a confirmation email to:
                </p>
                <p className="text-lime-400 font-semibold text-xl mb-4">
                  {email}
                </p>
                <p className="text-zinc-500 text-sm">
                  Click the link in the email to activate your account.
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
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          /* Signup Form Card */
          <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl mb-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-zinc-300 mb-2">
                  Password
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
                  Confirm Password
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
            </div>

            {/* Password Requirements */}
            {showPasswordRequirements && (
              <div className="bg-[#1A1A1A] border border-[#222222] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-zinc-300 mb-2">Password must contain:</h3>
                <ul className="text-xs text-zinc-500 space-y-1">
                  <li className={password.length >= 12 ? 'text-lime-400' : ''}>
                    ✓ At least 12 characters
                  </li>
                  <li className={/[A-Z]/.test(password) ? 'text-lime-400' : ''}>
                    ✓ At least one uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(password) ? 'text-lime-400' : ''}>
                    ✓ At least one lowercase letter (a-z)
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-lime-400' : ''}>
                    ✓ At least one number (0-9)
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password) ? 'text-lime-400' : ''}>
                    ✓ At least one special character (!@#$%^&*...)
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

            {/* Submit Button & Login */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-lime-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
              <div className="text-zinc-600 text-sm sm:mx-4">or</div>
              <Link
                href="/login"
                className="w-full sm:flex-1 text-center bg-[#1A1A1A] hover:bg-[#222222] text-white font-semibold py-3 px-6 rounded-lg border border-[#333333] hover:border-[#444444] transition-all"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
        )}

        {/* Feature Showcase Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            title="70+ Exercises"
            description="Comprehensive exercise library"
            delay="0"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
            title="Advanced Analytics"
            description="Track progress & PRs"
            delay="100"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Custom Goals"
            description="Set & achieve targets"
            delay="200"
          />
          <FeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="AI Predictions"
            description="Smart insights & trends"
            delay="300"
          />
        </div>
      </div>
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: string
}) {
  return (
    <div
      className="bg-[#111111] border border-[#222222] rounded-xl p-5 hover:border-lime-400/30 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-lime-400/10 rounded-lg flex items-center justify-center mb-3 border border-lime-400/20">
        <div className="text-lime-400">{icon}</div>
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-zinc-500 text-sm">{description}</p>
    </div>
  )
}
