import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  validateWeight,
  validateReps,
  validateDuration,
  validateDate,
  validateNotes,
  validateCardioGoal,
  validateWorkoutSet,
} from '@/lib/inputValidation'

describe('sanitizeString', () => {
  it('accepts valid strings', () => {
    const result = sanitizeString('Hello World')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('Hello World')
  })

  it('trims whitespace', () => {
    const result = sanitizeString('  hello  ')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('hello')
  })

  it('removes HTML tags', () => {
    const result = sanitizeString('<script>alert("xss")</script>Hello')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('alert("xss")Hello')
  })

  it('removes javascript: protocols', () => {
    const result = sanitizeString('Click javascript:alert(1)')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('Click alert(1)')
  })

  it('removes javascript: protocols case-insensitively', () => {
    const result = sanitizeString('Click JAVASCRIPT:alert(1)')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('Click alert(1)')
  })

  it('removes event handlers', () => {
    const result = sanitizeString('Test onclick=alert(1)')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('Test alert(1)')
  })

  it('removes various event handlers', () => {
    const inputs = [
      { input: 'test onmouseover=bad', expected: 'test bad' },
      { input: 'test onerror=bad', expected: 'test bad' },
      { input: 'test onload=bad', expected: 'test bad' },
    ]
    inputs.forEach(({ input, expected }) => {
      const result = sanitizeString(input)
      expect(result.isValid).toBe(true)
      expect(result.sanitizedValue).toBe(expected)
    })
  })

  it('enforces max length', () => {
    const result = sanitizeString('a'.repeat(101), 100)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Text must be 100 characters or less')
  })

  it('accepts strings at max length', () => {
    const result = sanitizeString('a'.repeat(100), 100)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('a'.repeat(100))
  })

  it('uses default max length of 1000', () => {
    const result = sanitizeString('a'.repeat(1001))
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Text must be 1000 characters or less')
  })

  it('rejects non-string input', () => {
    const result = sanitizeString(123 as unknown as string)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Input must be a string')
  })

  it('handles empty string', () => {
    const result = sanitizeString('')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('')
  })

  it('preserves safe special characters', () => {
    const result = sanitizeString('Hello! How are you? 100% great.')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('Hello! How are you? 100% great.')
  })
})

describe('validateWeight', () => {
  it('accepts valid weights', () => {
    const result = validateWeight(100)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(100)
  })

  it('accepts zero weight', () => {
    const result = validateWeight(0)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(0)
  })

  it('accepts weight as string', () => {
    const result = validateWeight('50.5')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(50.5)
  })

  it('rejects negative weights', () => {
    const result = validateWeight(-10)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight cannot be negative')
  })

  it('rejects weights over 1000', () => {
    const result = validateWeight(1001)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight must be 1000kg or less')
  })

  it('accepts exactly 1000', () => {
    const result = validateWeight(1000)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(1000)
  })

  it('allows 2 decimal places', () => {
    const result = validateWeight(50.25)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(50.25)
  })

  it('rounds to 2 decimal places', () => {
    const result = validateWeight(50.256)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(50.26)
  })

  it('rounds down when appropriate', () => {
    const result = validateWeight(50.254)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(50.25)
  })

  it('rejects NaN', () => {
    const result = validateWeight(NaN)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight must be a valid number')
  })

  it('rejects non-numeric strings', () => {
    const result = validateWeight('abc')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight must be a valid number')
  })
})

describe('validateReps', () => {
  it('accepts valid reps', () => {
    const result = validateReps(10)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(10)
  })

  it('accepts reps as string', () => {
    const result = validateReps('15')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(15)
  })

  it('accepts minimum reps (1)', () => {
    const result = validateReps(1)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(1)
  })

  it('accepts maximum reps (999)', () => {
    const result = validateReps(999)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(999)
  })

  it('rejects zero reps', () => {
    const result = validateReps(0)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be at least 1')
  })

  it('rejects negative reps', () => {
    const result = validateReps(-5)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be at least 1')
  })

  it('rejects reps over 999', () => {
    const result = validateReps(1000)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be 999 or less')
  })

  it('rejects non-integer reps', () => {
    const result = validateReps(10.5)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be a whole number')
  })

  it('rejects NaN', () => {
    const result = validateReps(NaN)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be a valid number')
  })

  it('rejects non-numeric strings', () => {
    const result = validateReps('abc')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be a valid number')
  })
})

describe('validateDuration', () => {
  it('accepts valid duration', () => {
    const result = validateDuration(30)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(30)
  })

  it('accepts duration as string', () => {
    const result = validateDuration('45')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(45)
  })

  it('accepts minimum duration (1)', () => {
    const result = validateDuration(1)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(1)
  })

  it('accepts maximum duration (9999)', () => {
    const result = validateDuration(9999)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(9999)
  })

  it('rejects zero duration', () => {
    const result = validateDuration(0)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Duration must be at least 1 minute')
  })

  it('rejects negative duration', () => {
    const result = validateDuration(-10)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Duration must be at least 1 minute')
  })

  it('rejects duration over 9999', () => {
    const result = validateDuration(10000)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Duration must be 9999 minutes or less')
  })

  it('rejects non-integer duration', () => {
    const result = validateDuration(30.5)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Duration must be a whole number')
  })

  it('rejects NaN', () => {
    const result = validateDuration(NaN)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Duration must be a valid number')
  })

  it('rejects non-numeric strings', () => {
    const result = validateDuration('abc')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Duration must be a valid number')
  })
})

describe('validateDate', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  it('accepts valid date string', () => {
    const result = validateDate(formatDate(today))
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(formatDate(today))
  })

  it('rejects empty string', () => {
    const result = validateDate('')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Please enter a valid date')
  })

  it('rejects null', () => {
    const result = validateDate(null as unknown as string)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Please enter a valid date')
  })

  it('rejects invalid date format', () => {
    const result = validateDate('not-a-date')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Invalid date format')
  })

  it('rejects past dates when allowPast is false', () => {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const result = validateDate(formatDate(yesterday), { allowPast: false })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Date cannot be in the past')
  })

  it('accepts past dates by default', () => {
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)
    const result = validateDate(formatDate(lastWeek))
    expect(result.isValid).toBe(true)
  })

  it('rejects dates too far in past', () => {
    const oldDate = new Date(today)
    oldDate.setDate(oldDate.getDate() - 400)
    const result = validateDate(formatDate(oldDate), { maxDaysInPast: 365 })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Date cannot be more than 365 days in the past')
  })

  it('rejects future dates when allowFuture is false', () => {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const result = validateDate(formatDate(tomorrow), { allowFuture: false })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Date cannot be in the future')
  })

  it('accepts future dates by default', () => {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const result = validateDate(formatDate(nextWeek))
    expect(result.isValid).toBe(true)
  })

  it('rejects dates too far in future', () => {
    const futureDate = new Date(today)
    futureDate.setDate(futureDate.getDate() + 400)
    const result = validateDate(formatDate(futureDate), { maxDaysInFuture: 365 })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Date cannot be more than 365 days in the future')
  })

  it('uses custom maxDaysInPast', () => {
    const oldDate = new Date(today)
    oldDate.setDate(oldDate.getDate() - 35)
    const result = validateDate(formatDate(oldDate), { maxDaysInPast: 30 })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Date cannot be more than 30 days in the past')
  })

  it('uses custom maxDaysInFuture', () => {
    const futureDate = new Date(today)
    futureDate.setDate(futureDate.getDate() + 35)
    const result = validateDate(formatDate(futureDate), { maxDaysInFuture: 30 })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Date cannot be more than 30 days in the future')
  })
})

describe('validateNotes', () => {
  it('accepts null', () => {
    const result = validateNotes(null)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(null)
  })

  it('accepts empty string', () => {
    const result = validateNotes('')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(null)
  })

  it('accepts valid notes', () => {
    const result = validateNotes('This was a great workout!')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('This was a great workout!')
  })

  it('sanitizes HTML from notes', () => {
    const result = validateNotes('<b>bold</b> text')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('bold text')
  })

  it('sanitizes XSS from notes', () => {
    const result = validateNotes('Test onclick=alert(1)')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('Test alert(1)')
  })

  it('enforces 500 character limit', () => {
    const result = validateNotes('a'.repeat(501))
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Text must be 500 characters or less')
  })

  it('accepts notes at 500 characters', () => {
    const result = validateNotes('a'.repeat(500))
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe('a'.repeat(500))
  })
})

describe('validateCardioGoal', () => {
  it('accepts valid cardio goal', () => {
    const result = validateCardioGoal(150)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(150)
  })

  it('accepts cardio goal as string', () => {
    const result = validateCardioGoal('120')
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(120)
  })

  it('accepts minimum goal (1)', () => {
    const result = validateCardioGoal(1)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(1)
  })

  it('accepts maximum goal (4200)', () => {
    const result = validateCardioGoal(4200)
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toBe(4200)
  })

  it('rejects zero goal', () => {
    const result = validateCardioGoal(0)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Goal must be at least 1 minute')
  })

  it('rejects negative goal', () => {
    const result = validateCardioGoal(-100)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Goal must be at least 1 minute')
  })

  it('rejects goal over 4200', () => {
    const result = validateCardioGoal(4201)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Goal cannot exceed 4,200 minutes (70 hours/week)')
  })

  it('rejects non-integer goal', () => {
    const result = validateCardioGoal(150.5)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Goal must be a whole number')
  })

  it('rejects NaN', () => {
    const result = validateCardioGoal(NaN)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Goal must be a valid number')
  })

  it('rejects non-numeric strings', () => {
    const result = validateCardioGoal('abc')
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Goal must be a valid number')
  })
})

describe('validateWorkoutSet', () => {
  it('accepts valid workout set', () => {
    const result = validateWorkoutSet({ weight: '100', reps: '10' })
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toEqual({ weight: 100, reps: 10 })
  })

  it('rounds weight to 2 decimal places', () => {
    const result = validateWorkoutSet({ weight: '100.256', reps: '10' })
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toEqual({ weight: 100.26, reps: 10 })
  })

  it('returns weight error for invalid weight', () => {
    const result = validateWorkoutSet({ weight: '-10', reps: '10' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight cannot be negative')
  })

  it('returns weight error for weight over limit', () => {
    const result = validateWorkoutSet({ weight: '1001', reps: '10' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight must be 1000kg or less')
  })

  it('returns reps error for invalid reps', () => {
    const result = validateWorkoutSet({ weight: '100', reps: '0' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be at least 1')
  })

  it('returns reps error for reps over limit', () => {
    const result = validateWorkoutSet({ weight: '100', reps: '1000' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be 999 or less')
  })

  it('truncates decimal reps via parseInt', () => {
    // parseInt('10.5', 10) returns 10, so this is valid
    const result = validateWorkoutSet({ weight: '100', reps: '10.5' })
    expect(result.isValid).toBe(true)
    expect(result.sanitizedValue).toEqual({ weight: 100, reps: 10 })
  })

  it('returns weight error first when both are invalid', () => {
    const result = validateWorkoutSet({ weight: '-10', reps: '0' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight cannot be negative')
  })

  it('handles non-numeric weight string', () => {
    const result = validateWorkoutSet({ weight: 'abc', reps: '10' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Weight must be a valid number')
  })

  it('handles non-numeric reps string', () => {
    const result = validateWorkoutSet({ weight: '100', reps: 'abc' })
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Reps must be a valid number')
  })
})
