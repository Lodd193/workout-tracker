'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  getCSRFToken,
  validateCSRFToken,
  regenerateCSRFToken,
  clearCSRFToken,
} from '@/lib/csrf'

/**
 * React hook for CSRF protection in forms
 *
 * Usage:
 * ```tsx
 * function MyForm() {
 *   const { token, isValid, validate, regenerate } = useCSRF()
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault()
 *     if (!validate()) {
 *       setError('Security validation failed. Please refresh.')
 *       return
 *     }
 *     // ... perform action
 *     regenerate() // Get new token after sensitive action
 *   }
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input type="hidden" name="_csrf" value={token} />
 *       ...
 *     </form>
 *   )
 * }
 * ```
 */
export function useCSRF() {
  const [token, setToken] = useState<string>('')

  // Initialize token on mount
  useEffect(() => {
    setToken(getCSRFToken())
  }, [])

  /**
   * Validate the current token
   */
  const validate = useCallback((): boolean => {
    return validateCSRFToken(token)
  }, [token])

  /**
   * Regenerate the token (call after sensitive operations)
   */
  const regenerate = useCallback(() => {
    const newToken = regenerateCSRFToken()
    setToken(newToken)
    return newToken
  }, [])

  /**
   * Clear the token (call on logout)
   */
  const clear = useCallback(() => {
    clearCSRFToken()
    setToken('')
  }, [])

  /**
   * Get props for a hidden CSRF input field
   */
  const inputProps = {
    name: '_csrf',
    value: token,
    type: 'hidden' as const,
  }

  return {
    token,
    isValid: validateCSRFToken(token),
    validate,
    regenerate,
    clear,
    inputProps,
  }
}

/**
 * Hook that wraps an async action with CSRF protection
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const protectedSubmit = useCSRFProtectedAction(async (data) => {
 *     await api.submit(data)
 *   }, {
 *     onValidationFail: () => toast.error('Please refresh and try again')
 *   })
 *
 *   return <button onClick={() => protectedSubmit(formData)}>Submit</button>
 * }
 * ```
 */
export function useCSRFProtectedAction<T extends unknown[]>(
  action: (...args: T) => Promise<void>,
  options?: {
    onValidationFail?: () => void
    regenerateAfter?: boolean
  }
) {
  const { validate, regenerate } = useCSRF()

  return useCallback(
    async (...args: T) => {
      if (!validate()) {
        if (options?.onValidationFail) {
          options.onValidationFail()
        }
        throw new Error('Security validation failed. Please refresh and try again.')
      }

      await action(...args)

      if (options?.regenerateAfter) {
        regenerate()
      }
    },
    [action, validate, regenerate, options]
  )
}
