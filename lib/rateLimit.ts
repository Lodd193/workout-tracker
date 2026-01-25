/**
 * Client-side rate limiting utility
 *
 * Provides rate limiting for sensitive operations like login, signup, and password reset.
 * Uses localStorage to persist attempts across page refreshes.
 *
 * Note: This is a client-side layer of protection. Supabase also has built-in
 * server-side rate limiting. This provides additional UX-friendly feedback
 * and prevents unnecessary API calls.
 */

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // Time window in milliseconds
}

interface RateLimitRecord {
  attempts: number
  windowStart: number
}

// Rate limit configurations
export const RATE_LIMITS = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  signup: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  passwordReset: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const

type RateLimitKey = keyof typeof RATE_LIMITS

/**
 * Get the storage key for a rate limit record
 */
function getStorageKey(key: RateLimitKey, identifier?: string): string {
  const base = `rate_limit_${key}`
  return identifier ? `${base}_${identifier}` : base
}

/**
 * Get the rate limit record from storage
 */
function getRateLimitRecord(key: RateLimitKey, identifier?: string): RateLimitRecord | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(getStorageKey(key, identifier))
    if (!stored) return null
    return JSON.parse(stored) as RateLimitRecord
  } catch {
    return null
  }
}

/**
 * Save a rate limit record to storage
 */
function saveRateLimitRecord(
  key: RateLimitKey,
  record: RateLimitRecord,
  identifier?: string
): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(getStorageKey(key, identifier), JSON.stringify(record))
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Clear a rate limit record
 */
export function clearRateLimit(key: RateLimitKey, identifier?: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(getStorageKey(key, identifier))
  } catch {
    // Silently fail
  }
}

/**
 * Check if an action is rate limited
 * Returns { allowed: true } if allowed, or { allowed: false, retryAfter, remaining } if blocked
 */
export function checkRateLimit(
  key: RateLimitKey,
  identifier?: string
): {
  allowed: boolean
  remaining: number
  retryAfter: number | null // Seconds until retry is allowed
} {
  const config = RATE_LIMITS[key]
  const record = getRateLimitRecord(key, identifier)
  const now = Date.now()

  // No existing record, allow
  if (!record) {
    return { allowed: true, remaining: config.maxAttempts, retryAfter: null }
  }

  // Window has expired, allow and reset
  if (now - record.windowStart > config.windowMs) {
    clearRateLimit(key, identifier)
    return { allowed: true, remaining: config.maxAttempts, retryAfter: null }
  }

  // Check if limit exceeded
  const remaining = Math.max(0, config.maxAttempts - record.attempts)
  if (remaining === 0) {
    const retryAfter = Math.ceil((config.windowMs - (now - record.windowStart)) / 1000)
    return { allowed: false, remaining: 0, retryAfter }
  }

  return { allowed: true, remaining, retryAfter: null }
}

/**
 * Record an attempt for rate limiting
 * Should be called BEFORE the action is attempted
 */
export function recordAttempt(key: RateLimitKey, identifier?: string): void {
  const config = RATE_LIMITS[key]
  const record = getRateLimitRecord(key, identifier)
  const now = Date.now()

  if (!record || now - record.windowStart > config.windowMs) {
    // Start new window
    saveRateLimitRecord(key, { attempts: 1, windowStart: now }, identifier)
  } else {
    // Increment existing window
    saveRateLimitRecord(
      key,
      { attempts: record.attempts + 1, windowStart: record.windowStart },
      identifier
    )
  }
}

/**
 * Check and record an attempt in one call
 * Returns the rate limit status after recording the attempt
 */
export function attemptWithRateLimit(
  key: RateLimitKey,
  identifier?: string
): {
  allowed: boolean
  remaining: number
  retryAfter: number | null
} {
  const check = checkRateLimit(key, identifier)

  if (!check.allowed) {
    return check
  }

  recordAttempt(key, identifier)
  return checkRateLimit(key, identifier)
}

/**
 * Reset rate limit on successful action (e.g., successful login)
 */
export function resetRateLimit(key: RateLimitKey, identifier?: string): void {
  clearRateLimit(key, identifier)
}

/**
 * Format retry time for display
 */
export function formatRetryTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`
  }

  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }

  const hours = Math.ceil(minutes / 60)
  return `${hours} hour${hours === 1 ? '' : 's'}`
}

/**
 * Get a user-friendly rate limit error message
 */
export function getRateLimitMessage(key: RateLimitKey, retryAfter: number): string {
  const messages: Record<RateLimitKey, string> = {
    login: `Too many login attempts. Please try again in ${formatRetryTime(retryAfter)}.`,
    signup: `Too many signup attempts. Please try again in ${formatRetryTime(retryAfter)}.`,
    passwordReset: `Too many password reset requests. Please try again in ${formatRetryTime(retryAfter)}.`,
  }

  return messages[key]
}

/**
 * Hook-friendly rate limit check
 * Returns all info needed to display rate limit status in UI
 */
export function getRateLimitStatus(key: RateLimitKey, identifier?: string): {
  isLimited: boolean
  remaining: number
  retryAfter: number | null
  message: string | null
} {
  const { allowed, remaining, retryAfter } = checkRateLimit(key, identifier)

  return {
    isLimited: !allowed,
    remaining,
    retryAfter,
    message: !allowed && retryAfter ? getRateLimitMessage(key, retryAfter) : null,
  }
}
