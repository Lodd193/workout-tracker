import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  getCSRFToken,
  validateCSRFToken,
  regenerateCSRFToken,
  clearCSRFToken,
  withCSRFProtection,
  getCSRFInputProps,
} from '@/lib/csrf'

// Mock sessionStorage
const sessionStorageMock = (() => {
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

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
})

// Mock crypto.getRandomValues
const mockCrypto = {
  getRandomValues: (array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  },
}

Object.defineProperty(window, 'crypto', {
  value: mockCrypto,
})

describe('CSRF Protection', () => {
  beforeEach(() => {
    sessionStorageMock.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getCSRFToken', () => {
    it('generates a new token when none exists', () => {
      const token = getCSRFToken()

      expect(token).toBeDefined()
      expect(token.length).toBe(64) // 32 bytes = 64 hex chars
    })

    it('returns existing token if still valid', () => {
      const token1 = getCSRFToken()
      const token2 = getCSRFToken()

      expect(token1).toBe(token2)
    })

    it('generates new token after expiry', () => {
      const token1 = getCSRFToken()

      // Advance time past token validity (1 hour)
      vi.advanceTimersByTime(60 * 60 * 1000 + 1000)

      const token2 = getCSRFToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('validateCSRFToken', () => {
    it('validates correct token', () => {
      const token = getCSRFToken()

      expect(validateCSRFToken(token)).toBe(true)
    })

    it('rejects empty token', () => {
      expect(validateCSRFToken('')).toBe(false)
    })

    it('rejects incorrect token', () => {
      getCSRFToken() // Generate a token

      expect(validateCSRFToken('wrong-token')).toBe(false)
    })

    it('rejects expired token', () => {
      const token = getCSRFToken()

      // Advance time past token validity
      vi.advanceTimersByTime(60 * 60 * 1000 + 1000)

      expect(validateCSRFToken(token)).toBe(false)
    })
  })

  describe('regenerateCSRFToken', () => {
    it('generates a new different token', () => {
      const token1 = getCSRFToken()
      const token2 = regenerateCSRFToken()

      expect(token1).not.toBe(token2)
    })

    it('new token is valid', () => {
      const newToken = regenerateCSRFToken()

      expect(validateCSRFToken(newToken)).toBe(true)
    })

    it('old token becomes invalid after regeneration', () => {
      const oldToken = getCSRFToken()
      regenerateCSRFToken()

      expect(validateCSRFToken(oldToken)).toBe(false)
    })
  })

  describe('clearCSRFToken', () => {
    it('removes token from storage', () => {
      getCSRFToken() // Generate token
      clearCSRFToken()

      expect(sessionStorageMock.getItem('csrf_token')).toBeNull()
      expect(sessionStorageMock.getItem('csrf_timestamp')).toBeNull()
    })

    it('old token becomes invalid after clearing', () => {
      const token = getCSRFToken()
      clearCSRFToken()

      expect(validateCSRFToken(token)).toBe(false)
    })
  })

  describe('withCSRFProtection', () => {
    it('executes action when token is valid', async () => {
      const action = vi.fn().mockResolvedValue(undefined)
      const protectedAction = withCSRFProtection(action)

      getCSRFToken() // Ensure token exists

      await protectedAction('arg1', 'arg2')

      expect(action).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('throws error when token is invalid', async () => {
      const action = vi.fn().mockResolvedValue(undefined)
      const protectedAction = withCSRFProtection(action)

      // Clear token to make validation fail
      clearCSRFToken()

      await expect(protectedAction()).rejects.toThrow('Security validation failed')
      expect(action).not.toHaveBeenCalled()
    })

    it('calls onValidationFail callback when token is invalid', async () => {
      const action = vi.fn().mockResolvedValue(undefined)
      const onValidationFail = vi.fn()
      const protectedAction = withCSRFProtection(action, { onValidationFail })

      clearCSRFToken()

      await expect(protectedAction()).rejects.toThrow()
      expect(onValidationFail).toHaveBeenCalled()
    })

    it('regenerates token after action when option is set', async () => {
      const action = vi.fn().mockResolvedValue(undefined)
      const protectedAction = withCSRFProtection(action, { regenerateAfter: true })

      const originalToken = getCSRFToken()

      await protectedAction()

      const newToken = getCSRFToken()
      expect(newToken).not.toBe(originalToken)
    })
  })

  describe('getCSRFInputProps', () => {
    it('returns correct input props', () => {
      const props = getCSRFInputProps()

      expect(props.name).toBe('_csrf')
      expect(props.type).toBe('hidden')
      expect(props.value).toBeDefined()
      expect(props.value.length).toBe(64)
    })

    it('value matches current token', () => {
      const token = getCSRFToken()
      const props = getCSRFInputProps()

      expect(props.value).toBe(token)
    })
  })

  describe('token format', () => {
    it('generates hex-encoded token', () => {
      const token = getCSRFToken()

      // Should be valid hex
      expect(token).toMatch(/^[a-f0-9]+$/)
    })

    it('token is 64 characters (32 bytes)', () => {
      const token = getCSRFToken()

      expect(token.length).toBe(64)
    })
  })
})
