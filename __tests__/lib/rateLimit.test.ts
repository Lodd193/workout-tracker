import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  checkRateLimit,
  recordAttempt,
  attemptWithRateLimit,
  resetRateLimit,
  clearRateLimit,
  formatRetryTime,
  getRateLimitMessage,
  getRateLimitStatus,
  RATE_LIMITS,
} from '@/lib/rateLimit'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('Rate Limiting', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('checkRateLimit', () => {
    it('allows first attempt', () => {
      const result = checkRateLimit('login')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(RATE_LIMITS.login.maxAttempts)
      expect(result.retryAfter).toBeNull()
    })

    it('allows attempts within limit', () => {
      // Record some attempts
      recordAttempt('login')
      recordAttempt('login')
      recordAttempt('login')

      const result = checkRateLimit('login')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2) // 5 - 3 = 2
    })

    it('blocks when limit exceeded', () => {
      // Exceed the limit
      for (let i = 0; i < RATE_LIMITS.login.maxAttempts; i++) {
        recordAttempt('login')
      }

      const result = checkRateLimit('login')

      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('resets after window expires', () => {
      // Exceed the limit
      for (let i = 0; i < RATE_LIMITS.login.maxAttempts; i++) {
        recordAttempt('login')
      }

      // Verify blocked
      expect(checkRateLimit('login').allowed).toBe(false)

      // Fast forward past the window
      vi.advanceTimersByTime(RATE_LIMITS.login.windowMs + 1000)

      // Should be allowed again
      const result = checkRateLimit('login')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(RATE_LIMITS.login.maxAttempts)
    })

    it('supports identifier-based limiting', () => {
      // Exceed limit for one identifier
      for (let i = 0; i < RATE_LIMITS.login.maxAttempts; i++) {
        recordAttempt('login', 'user1@example.com')
      }

      // Should be blocked for user1
      expect(checkRateLimit('login', 'user1@example.com').allowed).toBe(false)

      // Should still be allowed for user2
      expect(checkRateLimit('login', 'user2@example.com').allowed).toBe(true)
    })
  })

  describe('attemptWithRateLimit', () => {
    it('records attempt and returns status', () => {
      const result = attemptWithRateLimit('login')

      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(RATE_LIMITS.login.maxAttempts - 1)
    })

    it('returns blocked status when limit exceeded', () => {
      // Use up all attempts except last
      for (let i = 0; i < RATE_LIMITS.login.maxAttempts - 1; i++) {
        attemptWithRateLimit('login')
      }

      // One more attempt left - check status shows 1 remaining
      const checkBeforeLast = checkRateLimit('login')
      expect(checkBeforeLast.allowed).toBe(true)
      expect(checkBeforeLast.remaining).toBe(1)

      // Make the last allowed attempt
      // After this, we're at max attempts so remaining becomes 0
      const lastAttempt = attemptWithRateLimit('login')
      // The attempt itself was allowed (we weren't blocked yet)
      // But after recording, remaining is now 0
      expect(lastAttempt.remaining).toBe(0)

      // Next attempt should be blocked
      const blockedAttempt = attemptWithRateLimit('login')
      expect(blockedAttempt.allowed).toBe(false)
    })
  })

  describe('resetRateLimit', () => {
    it('clears rate limit after successful action', () => {
      // Record some attempts
      for (let i = 0; i < 3; i++) {
        recordAttempt('login')
      }

      // Verify attempts recorded
      expect(checkRateLimit('login').remaining).toBe(2)

      // Reset
      resetRateLimit('login')

      // Should be back to full
      expect(checkRateLimit('login').remaining).toBe(RATE_LIMITS.login.maxAttempts)
    })
  })

  describe('clearRateLimit', () => {
    it('removes rate limit record', () => {
      recordAttempt('login')
      expect(checkRateLimit('login').remaining).toBeLessThan(RATE_LIMITS.login.maxAttempts)

      clearRateLimit('login')
      expect(checkRateLimit('login').remaining).toBe(RATE_LIMITS.login.maxAttempts)
    })
  })

  describe('formatRetryTime', () => {
    it('formats seconds', () => {
      expect(formatRetryTime(1)).toBe('1 second')
      expect(formatRetryTime(30)).toBe('30 seconds')
      expect(formatRetryTime(59)).toBe('59 seconds')
    })

    it('formats minutes', () => {
      expect(formatRetryTime(60)).toBe('1 minute')
      expect(formatRetryTime(120)).toBe('2 minutes')
      expect(formatRetryTime(900)).toBe('15 minutes')
    })

    it('formats hours', () => {
      expect(formatRetryTime(3600)).toBe('1 hour')
      expect(formatRetryTime(7200)).toBe('2 hours')
    })
  })

  describe('getRateLimitMessage', () => {
    it('returns login message', () => {
      const message = getRateLimitMessage('login', 300)
      expect(message).toContain('login')
      expect(message).toContain('5 minutes')
    })

    it('returns signup message', () => {
      const message = getRateLimitMessage('signup', 3600)
      expect(message).toContain('signup')
      expect(message).toContain('1 hour')
    })

    it('returns password reset message', () => {
      const message = getRateLimitMessage('passwordReset', 1800)
      expect(message).toContain('password reset')
      expect(message).toContain('30 minutes')
    })
  })

  describe('getRateLimitStatus', () => {
    it('returns not limited for fresh state', () => {
      const status = getRateLimitStatus('login')

      expect(status.isLimited).toBe(false)
      expect(status.remaining).toBe(RATE_LIMITS.login.maxAttempts)
      expect(status.retryAfter).toBeNull()
      expect(status.message).toBeNull()
    })

    it('returns limited with message when blocked', () => {
      // Exceed limit
      for (let i = 0; i < RATE_LIMITS.login.maxAttempts; i++) {
        recordAttempt('login')
      }

      const status = getRateLimitStatus('login')

      expect(status.isLimited).toBe(true)
      expect(status.remaining).toBe(0)
      expect(status.retryAfter).toBeGreaterThan(0)
      expect(status.message).not.toBeNull()
      expect(status.message).toContain('login')
    })
  })

  describe('different rate limit types', () => {
    it('uses correct limits for login', () => {
      expect(RATE_LIMITS.login.maxAttempts).toBe(5)
      expect(RATE_LIMITS.login.windowMs).toBe(15 * 60 * 1000)
    })

    it('uses correct limits for signup', () => {
      expect(RATE_LIMITS.signup.maxAttempts).toBe(3)
      expect(RATE_LIMITS.signup.windowMs).toBe(60 * 60 * 1000)
    })

    it('uses correct limits for password reset', () => {
      expect(RATE_LIMITS.passwordReset.maxAttempts).toBe(3)
      expect(RATE_LIMITS.passwordReset.windowMs).toBe(60 * 60 * 1000)
    })
  })
})
