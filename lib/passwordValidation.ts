/**
 * Password validation utility
 * Enforces strong password requirements for security
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validates password strength according to security requirements
 *
 * Requirements:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []

  // Check minimum length
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long')
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get password strength indicator (for UI)
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  const validation = validatePassword(password)

  if (password.length < 8) return 'weak'
  if (validation.isValid && password.length >= 16) return 'strong'
  if (validation.isValid) return 'medium'
  if (validation.errors.length <= 2) return 'medium'

  return 'weak'
}
