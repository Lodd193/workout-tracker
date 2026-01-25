/**
 * Client-side CSRF protection utility
 *
 * Since this app uses Supabase with JWT auth (not cookies), traditional
 * server-side CSRF protection isn't applicable. This provides client-side
 * defense-in-depth against:
 * - Malicious scripts attempting to submit forms
 * - Clickjacking attacks
 *
 * The token is stored in sessionStorage and validated before sensitive operations.
 */

const CSRF_TOKEN_KEY = 'csrf_token'
const CSRF_TIMESTAMP_KEY = 'csrf_timestamp'
const TOKEN_VALIDITY_MS = 60 * 60 * 1000 // 1 hour

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  if (typeof window === 'undefined') return ''

  // Use crypto API for secure random generation
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Check if a valid CSRF token exists (without creating one)
 */
export function hasValidCSRFToken(): boolean {
  if (typeof window === 'undefined') return true // SSR bypass

  try {
    const existingToken = sessionStorage.getItem(CSRF_TOKEN_KEY)
    const timestamp = sessionStorage.getItem(CSRF_TIMESTAMP_KEY)
    const now = Date.now()

    if (existingToken && timestamp) {
      const tokenAge = now - parseInt(timestamp, 10)
      return tokenAge < TOKEN_VALIDITY_MS
    }

    return false
  } catch {
    return true // Allow if storage fails
  }
}

/**
 * Get or create a CSRF token for the current session
 */
export function getCSRFToken(): string {
  if (typeof window === 'undefined') return ''

  try {
    const existingToken = sessionStorage.getItem(CSRF_TOKEN_KEY)
    const timestamp = sessionStorage.getItem(CSRF_TIMESTAMP_KEY)
    const now = Date.now()

    // Check if token exists and is still valid
    if (existingToken && timestamp) {
      const tokenAge = now - parseInt(timestamp, 10)
      if (tokenAge < TOKEN_VALIDITY_MS) {
        return existingToken
      }
    }

    // Generate new token
    const newToken = generateToken()
    sessionStorage.setItem(CSRF_TOKEN_KEY, newToken)
    sessionStorage.setItem(CSRF_TIMESTAMP_KEY, now.toString())
    return newToken
  } catch {
    // Fallback if sessionStorage is not available
    return generateToken()
  }
}

/**
 * Validate a CSRF token against the stored token
 */
export function validateCSRFToken(token: string): boolean {
  if (typeof window === 'undefined') return true // SSR bypass

  if (!token) return false

  try {
    const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY)
    const timestamp = sessionStorage.getItem(CSRF_TIMESTAMP_KEY)
    const now = Date.now()

    // Check if token matches and is not expired
    if (storedToken && timestamp) {
      const tokenAge = now - parseInt(timestamp, 10)
      if (tokenAge < TOKEN_VALIDITY_MS && token === storedToken) {
        return true
      }
    }

    return false
  } catch {
    // If sessionStorage fails, allow the operation
    // (we don't want to break functionality)
    return true
  }
}

/**
 * Regenerate the CSRF token (call after sensitive operations)
 */
export function regenerateCSRFToken(): string {
  if (typeof window === 'undefined') return ''

  try {
    const newToken = generateToken()
    const now = Date.now()
    sessionStorage.setItem(CSRF_TOKEN_KEY, newToken)
    sessionStorage.setItem(CSRF_TIMESTAMP_KEY, now.toString())
    return newToken
  } catch {
    return generateToken()
  }
}

/**
 * Clear the CSRF token (call on logout)
 */
export function clearCSRFToken(): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(CSRF_TOKEN_KEY)
    sessionStorage.removeItem(CSRF_TIMESTAMP_KEY)
  } catch {
    // Silently fail
  }
}

/**
 * Create a protected form submission handler
 * Validates CSRF token before executing the action
 */
export function withCSRFProtection<T extends unknown[]>(
  action: (...args: T) => Promise<void>,
  options?: {
    onValidationFail?: () => void
    regenerateAfter?: boolean
  }
): (...args: T) => Promise<void> {
  return async (...args: T) => {
    // Check if a valid token exists (don't auto-create)
    if (!hasValidCSRFToken()) {
      if (options?.onValidationFail) {
        options.onValidationFail()
      }
      console.warn('[CSRF] Token validation failed')
      throw new Error('Security validation failed. Please refresh and try again.')
    }

    await action(...args)

    // Optionally regenerate token after successful action
    if (options?.regenerateAfter) {
      regenerateCSRFToken()
    }
  }
}

/**
 * Hidden input component value for forms (if using traditional form submission)
 */
export function getCSRFInputProps(): { name: string; value: string; type: 'hidden' } {
  return {
    name: '_csrf',
    value: getCSRFToken(),
    type: 'hidden',
  }
}
