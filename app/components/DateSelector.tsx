'use client'

import { useState, useCallback } from 'react'
import { validateDate } from '@/lib/inputValidation'
import { getTodayDate, getDateRelativeToToday } from '@/lib/utils/dateFormat'

interface DateSelectorProps {
  /** Current selected date value (YYYY-MM-DD format) */
  value: string
  /** Called when date changes */
  onChange: (date: string) => void
  /** Called when validation error occurs */
  onError?: (error: string) => void
  /** Whether to show preset buttons (default: true) */
  showPresets?: boolean
  /** Custom preset labels */
  presets?: Array<{
    label: string
    daysOffset: number
  }>
  /** Max days in past allowed (default: 365) */
  maxDaysInPast?: number
  /** Allow future dates (default: false) */
  allowFuture?: boolean
}

const DEFAULT_PRESETS = [
  { label: 'Today', daysOffset: 0 },
  { label: 'Yesterday', daysOffset: -1 },
  { label: '2 Days Ago', daysOffset: -2 },
]

/**
 * Date input component with preset buttons and validation
 *
 * @example
 * <DateSelector
 *   value={date}
 *   onChange={setDate}
 *   onError={setDateError}
 * />
 */
export default function DateSelector({
  value,
  onChange,
  onError,
  showPresets = true,
  presets = DEFAULT_PRESETS,
  maxDaysInPast = 365,
  allowFuture = false,
}: DateSelectorProps) {
  const [error, setError] = useState('')

  const handleDateChange = useCallback((newValue: string) => {
    onChange(newValue)

    if (!newValue) {
      setError('')
      onError?.('')
      return
    }

    const validation = validateDate(newValue, {
      allowPast: true,
      allowFuture,
      maxDaysInPast,
    })

    if (!validation.isValid) {
      const errorMsg = validation.error || 'Invalid date'
      setError(errorMsg)
      onError?.(errorMsg)
    } else {
      setError('')
      onError?.('')
    }
  }, [onChange, onError, allowFuture, maxDaysInPast])

  const setPresetDate = useCallback((daysOffset: number) => {
    const dateString = getDateRelativeToToday(daysOffset)
    handleDateChange(dateString)
  }, [handleDateChange])

  const maxDate = allowFuture ? undefined : new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
        Date
      </label>

      {showPresets && (
        <div className="flex flex-wrap gap-2 mb-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setPresetDate(preset.daysOffset)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <input
        type="date"
        value={value}
        onChange={(e) => handleDateChange(e.target.value)}
        max={maxDate}
        title={`Workout date (cannot be in the future${maxDaysInPast ? ` or more than ${maxDaysInPast} days ago` : ''})`}
        className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-slate-700 focus:ring-emerald-500'
        }`}
      />

      {error && (
        <div className="text-sm text-red-400" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
