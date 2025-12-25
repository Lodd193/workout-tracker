/**
 * Input validation utility
 * Prevents injection attacks and ensures data integrity
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitizedValue?: any
}

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous characters while preserving safe content
 */
export function sanitizeString(input: string, maxLength: number = 1000): ValidationResult {
  if (typeof input !== 'string') {
    return { isValid: false, error: 'Input must be a string' }
  }

  // Trim whitespace
  let sanitized = input.trim()

  // Check length
  if (sanitized.length > maxLength) {
    return { isValid: false, error: `Text must be ${maxLength} characters or less` }
  }

  // Remove any HTML tags and script content (basic XSS prevention)
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')

  return { isValid: true, sanitizedValue: sanitized }
}

/**
 * Validate weight input (kg)
 */
export function validateWeight(weight: number | string): ValidationResult {
  const num = typeof weight === 'string' ? parseFloat(weight) : weight

  if (isNaN(num)) {
    return { isValid: false, error: 'Weight must be a valid number' }
  }

  if (num < 0) {
    return { isValid: false, error: 'Weight cannot be negative' }
  }

  if (num > 1000) {
    return { isValid: false, error: 'Weight must be 1000kg or less' }
  }

  // Allow up to 2 decimal places
  const rounded = Math.round(num * 100) / 100

  return { isValid: true, sanitizedValue: rounded }
}

/**
 * Validate reps input
 */
export function validateReps(reps: number | string): ValidationResult {
  const num = typeof reps === 'string' ? parseInt(reps, 10) : reps

  if (isNaN(num)) {
    return { isValid: false, error: 'Reps must be a valid number' }
  }

  if (num < 1) {
    return { isValid: false, error: 'Reps must be at least 1' }
  }

  if (num > 999) {
    return { isValid: false, error: 'Reps must be 999 or less' }
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Reps must be a whole number' }
  }

  return { isValid: true, sanitizedValue: num }
}

/**
 * Validate cardio duration (minutes)
 */
export function validateDuration(duration: number | string): ValidationResult {
  const num = typeof duration === 'string' ? parseInt(duration, 10) : duration

  if (isNaN(num)) {
    return { isValid: false, error: 'Duration must be a valid number' }
  }

  if (num < 1) {
    return { isValid: false, error: 'Duration must be at least 1 minute' }
  }

  if (num > 9999) {
    return { isValid: false, error: 'Duration must be 9999 minutes or less' }
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Duration must be a whole number' }
  }

  return { isValid: true, sanitizedValue: num }
}

/**
 * Validate date input
 */
export function validateDate(dateString: string, options?: {
  allowPast?: boolean
  allowFuture?: boolean
  maxDaysInPast?: number
  maxDaysInFuture?: number
}): ValidationResult {
  const {
    allowPast = true,
    allowFuture = true,
    maxDaysInPast = 365,
    maxDaysInFuture = 365
  } = options || {}

  if (!dateString || typeof dateString !== 'string') {
    return { isValid: false, error: 'Please enter a valid date' }
  }

  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if valid date
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }

  // Check if too far in past
  if (!allowPast && date < today) {
    return { isValid: false, error: 'Date cannot be in the past' }
  }

  if (allowPast && maxDaysInPast) {
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() - maxDaysInPast)
    if (date < minDate) {
      return { isValid: false, error: `Date cannot be more than ${maxDaysInPast} days in the past` }
    }
  }

  // Check if too far in future
  if (!allowFuture && date > today) {
    return { isValid: false, error: 'Date cannot be in the future' }
  }

  if (allowFuture && maxDaysInFuture) {
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + maxDaysInFuture)
    if (date > maxDate) {
      return { isValid: false, error: `Date cannot be more than ${maxDaysInFuture} days in the future` }
    }
  }

  return { isValid: true, sanitizedValue: dateString }
}

/**
 * Validate notes/text input
 */
export function validateNotes(notes: string | null): ValidationResult {
  if (notes === null || notes === '') {
    return { isValid: true, sanitizedValue: null }
  }

  return sanitizeString(notes, 500)
}

/**
 * Validate weekly cardio goal
 */
export function validateCardioGoal(goal: number | string): ValidationResult {
  const num = typeof goal === 'string' ? parseInt(goal, 10) : goal

  if (isNaN(num)) {
    return { isValid: false, error: 'Goal must be a valid number' }
  }

  if (num < 1) {
    return { isValid: false, error: 'Goal must be at least 1 minute' }
  }

  if (num > 4200) { // 70 hours * 60 minutes
    return { isValid: false, error: 'Goal cannot exceed 4,200 minutes (70 hours/week)' }
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, error: 'Goal must be a whole number' }
  }

  return { isValid: true, sanitizedValue: num }
}

/**
 * Validate workout data before submission
 */
export interface WorkoutSetData {
  weight: string
  reps: string
}

export function validateWorkoutSet(set: WorkoutSetData): ValidationResult {
  // Validate weight
  const weightResult = validateWeight(set.weight)
  if (!weightResult.isValid) {
    return weightResult
  }

  // Validate reps
  const repsResult = validateReps(set.reps)
  if (!repsResult.isValid) {
    return repsResult
  }

  return {
    isValid: true,
    sanitizedValue: {
      weight: weightResult.sanitizedValue,
      reps: repsResult.sanitizedValue
    }
  }
}
