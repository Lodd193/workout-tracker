'use client'

import { useState, useEffect } from 'react'
import { SetData } from '@/lib/types'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { validateWeight, validateReps } from '@/lib/inputValidation'

interface SetInputProps {
  setNumber: number
  setData: SetData
  onWeightChange: (value: string) => void
  onRepsChange: (value: string) => void
}

export default function SetInput({ setNumber, setData, onWeightChange, onRepsChange }: SetInputProps) {
  const { weightUnit, convertWeight } = useSettings()
  const [weightError, setWeightError] = useState('')
  const [repsError, setRepsError] = useState('')

  // Convert kg value from state to display value
  const displayWeight = setData.weight
    ? weightUnit === 'lbs'
      ? Math.round(parseFloat(setData.weight) * 2.20462 * 10) / 10
      : parseFloat(setData.weight)
    : ''

  const handleWeightChange = (value: string) => {
    if (!value) {
      onWeightChange('')
      setWeightError('')
      return
    }

    // Validate in display units
    const validation = validateWeight(value)
    if (!validation.isValid) {
      setWeightError(validation.error || '')
      onWeightChange(value) // Still update to show what user typed
      return
    }

    setWeightError('')

    // Convert input value back to kg if needed
    const numValue = parseFloat(value)
    const kgValue = weightUnit === 'lbs' ? numValue / 2.20462 : numValue
    onWeightChange(kgValue.toString())
  }

  const handleRepsChange = (value: string) => {
    if (!value) {
      onRepsChange('')
      setRepsError('')
      return
    }

    const validation = validateReps(value)
    if (!validation.isValid) {
      setRepsError(validation.error || '')
      onRepsChange(value) // Still update to show what user typed
      return
    }

    setRepsError('')
    onRepsChange(validation.sanitizedValue!.toString())
  }

  const weightLimitDisplay = weightUnit === 'lbs' ? '2205' : '1000'

  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 font-medium text-center uppercase tracking-wide">
        Set {setNumber}
      </div>
      <div>
        <input
          type="number"
          step={weightUnit === 'lbs' ? '0.5' : '0.5'}
          min="0"
          max={weightLimitDisplay}
          placeholder={weightUnit}
          value={displayWeight}
          onChange={(e) => handleWeightChange(e.target.value)}
          title={`Weight (0-${weightLimitDisplay}${weightUnit})`}
          className={`w-full bg-slate-900/50 border rounded-lg px-2 py-2.5
                     text-white text-center text-sm font-medium
                     focus:outline-none focus:ring-2 focus:border-transparent
                     placeholder:text-slate-600 transition-all duration-200
                     hover:border-slate-500 focus:scale-105 ${
                       weightError
                         ? 'border-red-500 focus:ring-red-500'
                         : 'border-slate-600 focus:ring-emerald-500'
                     }`}
        />
        {weightError && (
          <div className="text-[10px] text-red-400 text-center mt-1">{weightError}</div>
        )}
      </div>
      <div>
        <input
          type="number"
          step="1"
          min="1"
          max="999"
          placeholder="reps"
          value={setData.reps}
          onChange={(e) => handleRepsChange(e.target.value)}
          title="Reps (1-999, whole numbers)"
          className={`w-full bg-slate-900/50 border rounded-lg px-2 py-2.5
                     text-white text-center text-sm font-medium
                     focus:outline-none focus:ring-2 focus:border-transparent
                     placeholder:text-slate-600 transition-all duration-200
                     hover:border-slate-500 focus:scale-105 ${
                       repsError
                         ? 'border-red-500 focus:ring-red-500'
                         : 'border-slate-600 focus:ring-emerald-500'
                     }`}
        />
        {repsError && (
          <div className="text-[10px] text-red-400 text-center mt-1">{repsError}</div>
        )}
      </div>
    </div>
  )
}
