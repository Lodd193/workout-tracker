/**
 * Simple logging utility that only logs in development mode
 * Prevents sensitive data exposure in production console logs
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * Debug-level logging (only in development)
   * Use for detailed debugging information that may contain sensitive data
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * Info-level logging (only in development)
   * Use for general informational messages
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * Warning-level logging (production-safe)
   * Use for warnings that don't expose sensitive data
   */
  warn: (...args: any[]) => {
    console.warn(...args)
  },

  /**
   * Error-level logging (production-safe)
   * Use for errors that don't expose sensitive data
   * For detailed errors, use logger.debug() instead
   */
  error: (...args: any[]) => {
    console.error(...args)
  },
}
