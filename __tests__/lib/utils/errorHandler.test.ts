import { describe, it, expect, vi } from 'vitest'
import {
  createAppError,
  handleAsync,
  safeAsync,
  isErrorCode,
  isNetworkError,
  isAuthError,
  formatErrorForDisplay,
  formatErrorForLogging,
  type AppError,
} from '@/lib/utils/errorHandler'

describe('createAppError', () => {
  it('handles Error objects', () => {
    const error = new Error('Test error message')
    const appError = createAppError(error)

    expect(appError.code).toBe('UNKNOWN')
    expect(appError.message).toBe('Test error message')
    expect(appError.userMessage).toBe('An unexpected error occurred')
    expect(appError.originalError).toBe(error)
  })

  it('handles string errors', () => {
    const appError = createAppError('String error')

    expect(appError.code).toBe('UNKNOWN')
    expect(appError.message).toBe('String error')
    expect(appError.userMessage).toBe('An unexpected error occurred')
  })

  it('uses custom user message', () => {
    const appError = createAppError(new Error('Tech error'), 'Something went wrong')

    expect(appError.userMessage).toBe('Something went wrong')
  })

  it('handles Supabase auth errors', () => {
    const supabaseError = {
      code: 'invalid_credentials',
      message: 'Invalid login credentials',
    }
    const appError = createAppError(supabaseError)

    expect(appError.code).toBe('AUTH')
    expect(appError.userMessage).toBe('Invalid email or password')
  })

  it('handles Supabase database errors', () => {
    const supabaseError = {
      code: '23505',
      message: 'duplicate key value violates unique constraint',
    }
    const appError = createAppError(supabaseError)

    expect(appError.code).toBe('VALIDATION')
    expect(appError.userMessage).toBe('This record already exists')
  })

  it('handles Supabase permission errors', () => {
    const supabaseError = {
      code: '42501',
      message: 'permission denied for table',
    }
    const appError = createAppError(supabaseError)

    expect(appError.code).toBe('PERMISSION')
    expect(appError.userMessage).toBe("You don't have permission to perform this action")
  })

  it('handles Supabase not found errors', () => {
    const supabaseError = {
      code: 'PGRST116',
      message: 'The result contains 0 rows',
    }
    const appError = createAppError(supabaseError)

    expect(appError.code).toBe('NOT_FOUND')
    expect(appError.userMessage).toBe('Record not found')
  })

  it('handles Supabase rate limit errors', () => {
    const supabaseError = {
      code: 'over_request_rate_limit',
      message: 'Rate limit exceeded',
    }
    const appError = createAppError(supabaseError)

    expect(appError.code).toBe('RATE_LIMIT')
    expect(appError.userMessage).toBe('Too many requests. Please wait a moment')
  })

  it('handles unknown Supabase errors', () => {
    const supabaseError = {
      code: 'unknown_code',
      message: 'Unknown error message',
    }
    const appError = createAppError(supabaseError)

    expect(appError.code).toBe('DATABASE')
    expect(appError.userMessage).toBe('Unknown error message')
  })

  it('handles null/undefined gracefully', () => {
    const appError = createAppError(null)

    expect(appError.code).toBe('UNKNOWN')
    expect(appError.message).toBe('null')
  })
})

describe('handleAsync', () => {
  it('returns success result on success', async () => {
    const result = await handleAsync(async () => 'success data')

    expect(result.success).toBe(true)
    expect(result.data).toBe('success data')
    expect(result.error).toBeNull()
  })

  it('returns error result on failure', async () => {
    const result = await handleAsync(async () => {
      throw new Error('Test error')
    })

    expect(result.success).toBe(false)
    expect(result.data).toBeNull()
    expect(result.error).not.toBeNull()
    expect(result.error?.message).toBe('Test error')
  })

  it('uses custom error message', async () => {
    const result = await handleAsync(
      async () => {
        throw new Error('Tech error')
      },
      { errorMessage: 'Failed to save' }
    )

    expect(result.success).toBe(false)
    expect(result.error?.userMessage).toBe('Failed to save')
  })

  it('calls onError callback on failure', async () => {
    const onError = vi.fn()

    await handleAsync(
      async () => {
        throw new Error('Test error')
      },
      { onError }
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'UNKNOWN',
        message: 'Test error',
      })
    )
  })

  it('does not call onError on success', async () => {
    const onError = vi.fn()

    await handleAsync(async () => 'success', { onError })

    expect(onError).not.toHaveBeenCalled()
  })
})

describe('safeAsync', () => {
  it('returns data on success', async () => {
    const result = await safeAsync(async () => 'success data', 'default')

    expect(result).toBe('success data')
  })

  it('returns default value on failure', async () => {
    const result = await safeAsync(
      async () => {
        throw new Error('Test error')
      },
      'default value'
    )

    expect(result).toBe('default value')
  })

  it('logs error by default', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await safeAsync(
      async () => {
        throw new Error('Test error')
      },
      'default'
    )

    expect(consoleSpy).toHaveBeenCalledWith('[SafeAsync Error]', 'Test error')
    consoleSpy.mockRestore()
  })

  it('does not log when logError is false', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await safeAsync(
      async () => {
        throw new Error('Test error')
      },
      'default',
      { logError: false }
    )

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('calls onError callback on failure', async () => {
    const onError = vi.fn()
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await safeAsync(
      async () => {
        throw new Error('Test error')
      },
      'default',
      { onError }
    )

    expect(onError).toHaveBeenCalledTimes(1)
    consoleSpy.mockRestore()
  })
})

describe('error type checks', () => {
  it('isErrorCode returns true for matching code', () => {
    const error: AppError = {
      code: 'AUTH',
      message: 'Auth error',
      userMessage: 'Authentication failed',
    }

    expect(isErrorCode(error, 'AUTH')).toBe(true)
    expect(isErrorCode(error, 'NETWORK')).toBe(false)
  })

  it('isErrorCode handles null', () => {
    expect(isErrorCode(null, 'AUTH')).toBe(false)
  })

  it('isNetworkError returns true for network errors', () => {
    const networkError: AppError = {
      code: 'NETWORK',
      message: 'Network error',
      userMessage: 'Connection failed',
    }
    const authError: AppError = {
      code: 'AUTH',
      message: 'Auth error',
      userMessage: 'Auth failed',
    }

    expect(isNetworkError(networkError)).toBe(true)
    expect(isNetworkError(authError)).toBe(false)
    expect(isNetworkError(null)).toBe(false)
  })

  it('isAuthError returns true for auth errors', () => {
    const authError: AppError = {
      code: 'AUTH',
      message: 'Auth error',
      userMessage: 'Auth failed',
    }
    const networkError: AppError = {
      code: 'NETWORK',
      message: 'Network error',
      userMessage: 'Connection failed',
    }

    expect(isAuthError(authError)).toBe(true)
    expect(isAuthError(networkError)).toBe(false)
    expect(isAuthError(null)).toBe(false)
  })
})

describe('error formatting', () => {
  it('formatErrorForDisplay returns user message', () => {
    const error: AppError = {
      code: 'AUTH',
      message: 'Technical auth error details',
      userMessage: 'Please sign in again',
    }

    expect(formatErrorForDisplay(error)).toBe('Please sign in again')
  })

  it('formatErrorForLogging includes code and message', () => {
    const error: AppError = {
      code: 'DATABASE',
      message: 'Connection timeout',
      userMessage: 'Service unavailable',
    }

    expect(formatErrorForLogging(error)).toBe('[DATABASE] Connection timeout')
  })
})
