'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn(email, password)

      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        // Login successful - force hard redirect
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Login error:', err)
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
          <p className="text-zinc-500 text-lg">Your workout tracking companion</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#111111] border border-[#222222] rounded-2xl p-8 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-zinc-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#1A1A1A] border border-[#222222] rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <Link
                  href="/reset-password"
                  className="text-sm text-lime-400 hover:text-lime-300 mt-2 inline-block transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button & Sign Up */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 bg-lime-400 text-black font-semibold py-3 px-6 rounded-lg hover:bg-lime-300 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-offset-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
              <div className="text-zinc-600 text-sm sm:mx-4">or</div>
              <Link
                href="/signup"
                className="w-full sm:flex-1 text-center bg-[#1A1A1A] hover:bg-[#222222] text-white font-semibold py-3 px-6 rounded-lg border border-[#333333] hover:border-[#444444] transition-all"
              >
                Create Account
              </Link>
            </div>
          </form>
        </div>

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

        {/* Already logged in notice */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-sm underline">
            Already logged in? Go to home page
          </Link>
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
