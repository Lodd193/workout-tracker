/**
 * Account lockout protection
 *
 * Prevents brute force attacks by locking accounts after too many failed login attempts.
 * Uses database-backed storage for persistence across devices.
 *
 * Configuration:
 * - Max attempts: 10 consecutive failures
 * - Lockout duration: 1 hour
 * - Auto-unlock: Yes, after lockout period expires
 */

import { supabase } from '@/lib/supabase'

export interface LockoutStatus {
  isLocked: boolean
  attempts: number
  unlockAt: Date | null
  minutesRemaining: number
}

export interface LockoutResult {
  isLocked: boolean
  attempts: number
  unlockAt: Date | null
}

const MAX_ATTEMPTS = 10
const LOCKOUT_DURATION_MINUTES = 60

/**
 * Check if an account is currently locked
 */
export async function checkAccountLockout(email: string): Promise<LockoutStatus> {
  try {
    const { data, error } = await supabase.rpc('check_account_lockout', {
      user_email: email.toLowerCase().trim(),
    })

    if (error) {
      console.error('[Lockout] Error checking lockout status:', error)
      // Fail open - allow login attempt if check fails
      return {
        isLocked: false,
        attempts: 0,
        unlockAt: null,
        minutesRemaining: 0,
      }
    }

    // Handle case where function returns no rows
    if (!data || data.length === 0) {
      return {
        isLocked: false,
        attempts: 0,
        unlockAt: null,
        minutesRemaining: 0,
      }
    }

    const result = data[0]
    return {
      isLocked: result.is_locked || false,
      attempts: result.attempts || 0,
      unlockAt: result.unlock_at ? new Date(result.unlock_at) : null,
      minutesRemaining: result.minutes_remaining || 0,
    }
  } catch (error) {
    console.error('[Lockout] Unexpected error:', error)
    // Fail open
    return {
      isLocked: false,
      attempts: 0,
      unlockAt: null,
      minutesRemaining: 0,
    }
  }
}

/**
 * Record a failed login attempt
 * Returns the updated lockout status
 */
export async function recordFailedLogin(email: string): Promise<LockoutResult> {
  try {
    const { data, error } = await supabase.rpc('record_failed_login', {
      user_email: email.toLowerCase().trim(),
    })

    if (error) {
      console.error('[Lockout] Error recording failed login:', error)
      // Return safe defaults
      return {
        isLocked: false,
        attempts: 0,
        unlockAt: null,
      }
    }

    if (!data || data.length === 0) {
      return {
        isLocked: false,
        attempts: 1,
        unlockAt: null,
      }
    }

    const result = data[0]
    return {
      isLocked: result.is_locked || false,
      attempts: result.attempts || 0,
      unlockAt: result.unlock_at ? new Date(result.unlock_at) : null,
    }
  } catch (error) {
    console.error('[Lockout] Unexpected error recording failed login:', error)
    return {
      isLocked: false,
      attempts: 0,
      unlockAt: null,
    }
  }
}

/**
 * Clear lockout status after successful login
 */
export async function clearAccountLockout(email: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('clear_account_lockout', {
      user_email: email.toLowerCase().trim(),
    })

    if (error) {
      console.error('[Lockout] Error clearing lockout:', error)
    }
  } catch (error) {
    console.error('[Lockout] Unexpected error clearing lockout:', error)
  }
}

/**
 * Get a user-friendly lockout message
 */
export function getLockoutMessage(status: LockoutStatus): string {
  if (!status.isLocked) {
    return ''
  }

  if (status.minutesRemaining <= 1) {
    return 'Account temporarily locked. Please try again in about a minute.'
  }

  if (status.minutesRemaining < 60) {
    return `Account temporarily locked due to too many failed attempts. Please try again in ${status.minutesRemaining} minutes.`
  }

  const hours = Math.ceil(status.minutesRemaining / 60)
  return `Account temporarily locked due to too many failed attempts. Please try again in ${hours} hour${hours > 1 ? 's' : ''}.`
}

/**
 * Get a warning message when approaching lockout
 */
export function getWarningMessage(attempts: number): string | null {
  const remaining = MAX_ATTEMPTS - attempts

  if (remaining <= 0) {
    return null // Already locked
  }

  if (remaining <= 3) {
    return `Warning: ${remaining} attempt${remaining > 1 ? 's' : ''} remaining before account lockout.`
  }

  return null
}

/**
 * Check if we should show a warning based on attempt count
 */
export function shouldShowWarning(attempts: number): boolean {
  const remaining = MAX_ATTEMPTS - attempts
  return remaining > 0 && remaining <= 3
}

/**
 * Format unlock time for display
 */
export function formatUnlockTime(unlockAt: Date | null): string {
  if (!unlockAt) return ''

  const now = new Date()
  const diffMs = unlockAt.getTime() - now.getTime()

  if (diffMs <= 0) return 'now'

  const minutes = Math.ceil(diffMs / (1000 * 60))

  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours > 1 ? 's' : ''}`
}

/**
 * Constants for reference
 */
export const LOCKOUT_CONFIG = {
  maxAttempts: MAX_ATTEMPTS,
  lockoutDurationMinutes: LOCKOUT_DURATION_MINUTES,
} as const
