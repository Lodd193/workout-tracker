import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase before importing the module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}))

import {
  getLockoutMessage,
  getWarningMessage,
  shouldShowWarning,
  formatUnlockTime,
  LOCKOUT_CONFIG,
  checkAccountLockout,
  recordFailedLogin,
  clearAccountLockout,
} from '@/lib/accountLockout'
import { supabase } from '@/lib/supabase'

// Note: checkAccountLockout, recordFailedLogin, and clearAccountLockout
// use database calls. We mock supabase.rpc for testing.

describe('Account Lockout Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getLockoutMessage', () => {
    it('returns empty string when not locked', () => {
      const status = {
        isLocked: false,
        attempts: 3,
        unlockAt: null,
        minutesRemaining: 0,
      }

      expect(getLockoutMessage(status)).toBe('')
    })

    it('returns minute message when less than a minute remaining', () => {
      const status = {
        isLocked: true,
        attempts: 10,
        unlockAt: new Date(Date.now() + 30000),
        minutesRemaining: 1,
      }

      expect(getLockoutMessage(status)).toContain('about a minute')
    })

    it('returns minutes message when under an hour', () => {
      const status = {
        isLocked: true,
        attempts: 10,
        unlockAt: new Date(Date.now() + 30 * 60000),
        minutesRemaining: 30,
      }

      const message = getLockoutMessage(status)
      expect(message).toContain('30 minutes')
      expect(message).toContain('too many failed attempts')
    })

    it('returns hours message when over an hour', () => {
      const status = {
        isLocked: true,
        attempts: 10,
        unlockAt: new Date(Date.now() + 90 * 60000),
        minutesRemaining: 90,
      }

      const message = getLockoutMessage(status)
      expect(message).toContain('2 hours')
    })

    it('uses singular hour for exactly 1 hour', () => {
      const status = {
        isLocked: true,
        attempts: 10,
        unlockAt: new Date(Date.now() + 60 * 60000),
        minutesRemaining: 60,
      }

      const message = getLockoutMessage(status)
      expect(message).toContain('1 hour')
      expect(message).not.toContain('hours')
    })
  })

  describe('getWarningMessage', () => {
    it('returns null when many attempts remaining', () => {
      expect(getWarningMessage(1)).toBeNull()
      expect(getWarningMessage(5)).toBeNull()
      expect(getWarningMessage(6)).toBeNull()
    })

    it('returns warning when 3 attempts remaining', () => {
      const message = getWarningMessage(7)
      expect(message).toContain('3 attempts remaining')
      expect(message).toContain('Warning')
    })

    it('returns warning when 2 attempts remaining', () => {
      const message = getWarningMessage(8)
      expect(message).toContain('2 attempts remaining')
    })

    it('returns warning when 1 attempt remaining', () => {
      const message = getWarningMessage(9)
      expect(message).toContain('1 attempt remaining')
      expect(message).not.toContain('attempts') // singular
    })

    it('returns null when already at max attempts', () => {
      expect(getWarningMessage(10)).toBeNull()
      expect(getWarningMessage(11)).toBeNull()
    })
  })

  describe('shouldShowWarning', () => {
    it('returns false when many attempts remaining', () => {
      expect(shouldShowWarning(0)).toBe(false)
      expect(shouldShowWarning(5)).toBe(false)
      expect(shouldShowWarning(6)).toBe(false)
    })

    it('returns true when 3 or fewer attempts remaining', () => {
      expect(shouldShowWarning(7)).toBe(true) // 3 remaining
      expect(shouldShowWarning(8)).toBe(true) // 2 remaining
      expect(shouldShowWarning(9)).toBe(true) // 1 remaining
    })

    it('returns false when at or past max attempts', () => {
      expect(shouldShowWarning(10)).toBe(false)
      expect(shouldShowWarning(15)).toBe(false)
    })
  })

  describe('formatUnlockTime', () => {
    it('returns empty string for null', () => {
      expect(formatUnlockTime(null)).toBe('')
    })

    it('returns "now" for past dates', () => {
      const pastDate = new Date(Date.now() - 1000)
      expect(formatUnlockTime(pastDate)).toBe('now')
    })

    it('formats minutes correctly', () => {
      const futureDate = new Date(Date.now() + 15 * 60 * 1000)
      const result = formatUnlockTime(futureDate)
      expect(result).toMatch(/\d+ minutes?/)
    })

    it('formats single minute correctly', () => {
      const futureDate = new Date(Date.now() + 30 * 1000) // 30 seconds
      const result = formatUnlockTime(futureDate)
      expect(result).toBe('1 minute')
    })

    it('formats hours correctly', () => {
      const futureDate = new Date(Date.now() + 90 * 60 * 1000)
      const result = formatUnlockTime(futureDate)
      expect(result).toMatch(/\d+ hours?/)
    })

    it('formats single hour correctly', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000)
      const result = formatUnlockTime(futureDate)
      expect(result).toBe('1 hour')
    })
  })

  describe('LOCKOUT_CONFIG', () => {
    it('has correct max attempts', () => {
      expect(LOCKOUT_CONFIG.maxAttempts).toBe(10)
    })

    it('has correct lockout duration', () => {
      expect(LOCKOUT_CONFIG.lockoutDurationMinutes).toBe(60)
    })
  })

  describe('checkAccountLockout', () => {
    it('returns unlocked status when no record exists', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      } as any)

      const result = await checkAccountLockout('test@example.com')

      expect(result.isLocked).toBe(false)
      expect(result.attempts).toBe(0)
      expect(supabase.rpc).toHaveBeenCalledWith('check_account_lockout', {
        user_email: 'test@example.com',
      })
    })

    it('returns locked status when account is locked', async () => {
      const unlockTime = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ is_locked: true, attempts: 10, unlock_at: unlockTime, minutes_remaining: 60 }],
        error: null,
      } as any)

      const result = await checkAccountLockout('test@example.com')

      expect(result.isLocked).toBe(true)
      expect(result.attempts).toBe(10)
      expect(result.minutesRemaining).toBe(60)
    })

    it('returns unlocked status on error (fail open)', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      } as any)

      const result = await checkAccountLockout('test@example.com')

      expect(result.isLocked).toBe(false)
    })

    it('normalizes email to lowercase', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [],
        error: null,
      } as any)

      await checkAccountLockout('TEST@EXAMPLE.COM')

      expect(supabase.rpc).toHaveBeenCalledWith('check_account_lockout', {
        user_email: 'test@example.com',
      })
    })
  })

  describe('recordFailedLogin', () => {
    it('records failed attempt and returns status', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ is_locked: false, attempts: 3, unlock_at: null }],
        error: null,
      } as any)

      const result = await recordFailedLogin('test@example.com')

      expect(result.isLocked).toBe(false)
      expect(result.attempts).toBe(3)
      expect(supabase.rpc).toHaveBeenCalledWith('record_failed_login', {
        user_email: 'test@example.com',
      })
    })

    it('returns locked status when threshold reached', async () => {
      const unlockTime = new Date(Date.now() + 60 * 60 * 1000).toISOString()
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ is_locked: true, attempts: 10, unlock_at: unlockTime }],
        error: null,
      } as any)

      const result = await recordFailedLogin('test@example.com')

      expect(result.isLocked).toBe(true)
      expect(result.attempts).toBe(10)
    })

    it('returns safe defaults on error', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      } as any)

      const result = await recordFailedLogin('test@example.com')

      expect(result.isLocked).toBe(false)
      expect(result.attempts).toBe(0)
    })
  })

  describe('clearAccountLockout', () => {
    it('calls supabase rpc to clear lockout', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: null,
      } as any)

      await clearAccountLockout('test@example.com')

      expect(supabase.rpc).toHaveBeenCalledWith('clear_account_lockout', {
        user_email: 'test@example.com',
      })
    })

    it('handles errors gracefully', async () => {
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      } as any)

      // Should not throw
      await expect(clearAccountLockout('test@example.com')).resolves.not.toThrow()
    })
  })
})
