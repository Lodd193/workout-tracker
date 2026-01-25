/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Returns today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * Returns a date string in ISO format (YYYY-MM-DD)
 */
export function toISODateString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

/**
 * Formats a date for short display (e.g., "Jan 15")
 * Used in workout form messages and chart X-axis
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Formats a date for full display with weekday (e.g., "Sat, Jan 15, 2026")
 * Used in history page headers
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Formats a date as relative time (e.g., "earlier today", "yesterday", "3 days ago")
 * Falls back to short format for dates older than 7 days
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const diffMs = today.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'earlier today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDateShort(d)
}

/**
 * Formats a date for chart display (e.g., "Jan 15")
 * Alias for formatDateShort for semantic clarity in chart contexts
 */
export function formatDateForChart(date: Date | string): string {
  return formatDateShort(date)
}

/**
 * Formats a date for tooltip display (locale default)
 */
export function formatDateForTooltip(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

/**
 * Gets a date relative to today
 * @param daysOffset - Number of days from today (negative for past, positive for future)
 */
export function getDateRelativeToToday(daysOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return toISODateString(date)
}

/**
 * Calculates the number of days between two dates
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = typeof end === 'string' ? new Date(end) : end
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toDateString() === new Date().toDateString()
}
