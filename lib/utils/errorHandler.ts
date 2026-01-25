/**
 * Centralized error handling utilities
 * Provides consistent error handling patterns across the application
 */

/**
 * Standard error codes used throughout the application
 */
export type ErrorCode =
  | 'UNKNOWN'
  | 'NETWORK'
  | 'AUTH'
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'PERMISSION'
  | 'RATE_LIMIT'
  | 'SERVER'
  | 'DATABASE'
  | 'TIMEOUT'

/**
 * Standardized application error interface
 */
export interface AppError {
  code: ErrorCode
  message: string // Technical message for logging
  userMessage: string // User-friendly message for display
  originalError?: unknown // Original error for debugging
}

/**
 * Result type for async operations
 */
export type AsyncResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: AppError }

/**
 * Create a standardized AppError from various error types
 */
export function createAppError(
  error: unknown,
  defaultUserMessage = 'An unexpected error occurred'
): AppError {
  // Handle Supabase errors
  if (isSupabaseError(error)) {
    return {
      code: mapSupabaseErrorCode(error.code),
      message: error.message,
      userMessage: getSupabaseUserMessage(error),
      originalError: error,
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN',
      message: error.message,
      userMessage: defaultUserMessage,
      originalError: error,
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 'UNKNOWN',
      message: error,
      userMessage: defaultUserMessage,
      originalError: error,
    }
  }

  // Handle unknown errors
  return {
    code: 'UNKNOWN',
    message: String(error),
    userMessage: defaultUserMessage,
    originalError: error,
  }
}

/**
 * Wrapper for async operations with standardized error handling
 * Returns a Result type that forces error checking
 */
export async function handleAsync<T>(
  fn: () => Promise<T>,
  options?: {
    errorMessage?: string
    onError?: (error: AppError) => void
  }
): Promise<AsyncResult<T>> {
  try {
    const data = await fn()
    return { success: true, data, error: null }
  } catch (e) {
    const error = createAppError(e, options?.errorMessage)

    // Call optional error handler
    if (options?.onError) {
      options.onError(error)
    }

    return { success: false, data: null, error }
  }
}

/**
 * Safely execute an async operation and return the result or a default value
 * Useful when you want to continue execution even if the operation fails
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  options?: {
    logError?: boolean
    onError?: (error: AppError) => void
  }
): Promise<T> {
  const result = await handleAsync(fn)

  if (!result.success) {
    if (options?.logError !== false) {
      console.error('[SafeAsync Error]', result.error.message)
    }
    if (options?.onError) {
      options.onError(result.error)
    }
    return defaultValue
  }

  return result.data
}

/**
 * Type guard for Supabase errors
 */
interface SupabaseError {
  code: string
  message: string
  details?: string
  hint?: string
}

function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as SupabaseError).code === 'string' &&
    typeof (error as SupabaseError).message === 'string'
  )
}

/**
 * Map Supabase error codes to our ErrorCode type
 */
function mapSupabaseErrorCode(code: string): ErrorCode {
  const codeMap: Record<string, ErrorCode> = {
    // Auth errors
    invalid_credentials: 'AUTH',
    user_not_found: 'AUTH',
    email_not_confirmed: 'AUTH',
    invalid_grant: 'AUTH',
    signup_disabled: 'AUTH',

    // Database errors
    '23505': 'VALIDATION', // Unique violation
    '23503': 'VALIDATION', // Foreign key violation
    '42501': 'PERMISSION', // Insufficient privilege
    PGRST116: 'NOT_FOUND', // No rows returned

    // Rate limiting
    over_request_rate_limit: 'RATE_LIMIT',

    // Network
    FetchError: 'NETWORK',
  }

  return codeMap[code] || 'DATABASE'
}

/**
 * Get user-friendly message for Supabase errors
 */
function getSupabaseUserMessage(error: SupabaseError): string {
  const messageMap: Record<string, string> = {
    invalid_credentials: 'Invalid email or password',
    user_not_found: 'No account found with this email',
    email_not_confirmed: 'Please verify your email address',
    invalid_grant: 'Session expired. Please sign in again',
    signup_disabled: 'Registration is currently disabled',
    '23505': 'This record already exists',
    '23503': 'Referenced record not found',
    '42501': "You don't have permission to perform this action",
    PGRST116: 'Record not found',
    over_request_rate_limit: 'Too many requests. Please wait a moment',
  }

  return messageMap[error.code] || error.message
}

/**
 * Check if an error is a specific type
 */
export function isErrorCode(error: AppError | null, code: ErrorCode): boolean {
  return error?.code === code
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: AppError | null): boolean {
  return error?.code === 'NETWORK'
}

/**
 * Check if an error is an authentication error
 */
export function isAuthError(error: AppError | null): boolean {
  return error?.code === 'AUTH'
}

/**
 * Format error for display (respects user privacy)
 */
export function formatErrorForDisplay(error: AppError): string {
  return error.userMessage
}

/**
 * Format error for logging (includes technical details)
 */
export function formatErrorForLogging(error: AppError): string {
  return `[${error.code}] ${error.message}`
}
