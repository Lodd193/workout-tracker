'use client'

import { useState } from 'react'
import { validateDuration } from '@/lib/inputValidation'

interface CardioInputProps {
  duration: number
  onDurationChange: (duration: number) => void
}

export default function CardioInput({ duration, onDurationChange }: CardioInputProps) {
  const [error, setError] = useState('')

  const handleDurationChange = (value: string) => {
    if (!value) {
      onDurationChange(0)
      setError('')
      return
    }

    const validation = validateDuration(value)
    if (!validation.isValid) {
      setError(validation.error || '')
      onDurationChange(parseInt(value) || 0) // Still update to show what user typed
      return
    }

    setError('')
    onDurationChange(validation.sanitizedValue!)
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide mb-2">
        Duration
      </label>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="1"
          max="9999"
          step="1"
          value={duration || ''}
          onChange={(e) => handleDurationChange(e.target.value)}
          placeholder="0"
          title="Duration in minutes (1-9999)"
          className={`flex-1 bg-slate-800 border rounded-lg px-4 py-3 text-white text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-slate-600 focus:ring-sky-500'
          }`}
        />
        <span className="text-slate-400 font-medium">minutes</span>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-400">{error}</div>
      )}

      {/* Quick add buttons */}
      <div className="flex gap-2 mt-3">
        {[10, 15, 20, 30, 45, 60].map((mins) => (
          <button
            key={mins}
            type="button"
            onClick={() => {
              onDurationChange(mins)
              setError('')
            }}
            className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 transition-all"
          >
            {mins}m
          </button>
        ))}
      </div>
    </div>
  )
}
