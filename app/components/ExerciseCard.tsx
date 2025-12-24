import { useState, useEffect } from 'react'
import { SelectedExercise } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/exercises'
import SetInput from './SetInput'
import CardioInput from './CardioInput'
import { fetchLastPerformance, fetchPersonalRecords } from '@/lib/api/analytics'
import { useSettings } from '@/lib/contexts/SettingsContext'

interface ExerciseCardProps {
  exercise: SelectedExercise
  index: number
  onRemove: () => void
  onUpdateSet: (setIndex: number, field: 'weight' | 'reps', value: string) => void
  onUpdateDuration?: (duration: number) => void
}

export default function ExerciseCard({ exercise, index, onRemove, onUpdateSet, onUpdateDuration }: ExerciseCardProps) {
  const gradientColor = CATEGORY_COLORS[exercise.category]
  const isCardio = exercise.category === 'cardio'
  const { weightUnit, convertWeight, formatWeight } = useSettings()
  const [bulkWeight, setBulkWeight] = useState('')
  const [bulkReps, setBulkReps] = useState('')
  const [showBulkFill, setShowBulkFill] = useState(false)
  const [lastPerformance, setLastPerformance] = useState<{
    date: string
    bestSet: { weight_kg: number; reps: number }
  } | null>(null)
  const [loadingLast, setLoadingLast] = useState(false)
  const [personalRecord, setPersonalRecord] = useState<{ max_weight: number; reps_at_max: number; date_achieved: string } | null>(null)

  useEffect(() => {
    loadLastPerformance()
  }, [exercise.name])

  const loadPersonalRecord = async () => {
    try {
      const records = await fetchPersonalRecords()
      const pr = records.find(r => r.exercise_name === exercise.name)
      setPersonalRecord(pr || null)
    } catch (error) {
      console.error('Error loading personal record:', error)
    }
  }

  const loadLastPerformance = async () => {
    setLoadingLast(true)
    try {
      const data = await fetchLastPerformance(exercise.name)
      setLastPerformance(data)
    } catch (error) {
      console.error('Error loading last performance:', error)
    }
    setLoadingLast(false)
  }

  const fillAllSets = () => {
    if (!bulkWeight || !bulkReps) return

    // Convert bulk weight to kg if user is in lbs mode
    const weightInKg =
      weightUnit === 'lbs' ? (parseFloat(bulkWeight) / 2.20462).toString() : bulkWeight

    for (let i = 0; i < exercise.sets.length; i++) {
      onUpdateSet(i, 'weight', weightInKg)
      onUpdateSet(i, 'reps', bulkReps)
    }
    setBulkWeight('')
    setBulkReps('')
    setShowBulkFill(false)
  }

  const getSuggestion = () => {
    if (!lastPerformance) return null
    const { weight_kg, reps } = lastPerformance.bestSet

    // Suggest weight increase if reps >= 8, otherwise suggest rep increase
    const increment = weightUnit === 'lbs' ? 5 : 2.5 // 5 lbs ≈ 2.5 kg
    if (reps >= 8) {
      return {
        weight: convertWeight(weight_kg + 2.5), // Convert suggested weight to display unit
        reps,
        type: 'weight',
        increment: weightUnit === 'lbs' ? '5lbs' : '2.5kg',
      }
    } else {
      return {
        weight: convertWeight(weight_kg),
        reps: reps + 1,
        type: 'reps',
        increment: '',
      }
    }
  }

  const suggestion = getSuggestion()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'earlier today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div
      className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5
                 backdrop-blur-md transition-all duration-300 hover:border-slate-600
                 shadow-lg hover:shadow-xl animate-slideIn"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-10 h-10 bg-gradient-to-br ${gradientColor} rounded-lg
                       flex items-center justify-center text-sm font-bold text-white
                       shadow-lg`}
          >
            {index + 1}
          </span>
          <div>
            <h3 className="font-semibold text-white text-lg">{exercise.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{exercise.category.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20
                     text-red-400 hover:text-red-300 transition-all duration-200
                     flex items-center justify-center group"
          aria-label="Remove exercise"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progressive Overload Assistant */}
      {lastPerformance && (
        <div className="mb-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-cyan-400 mb-1">Last time ({formatDate(lastPerformance.date)})</div>
              <div className="text-sm text-white mb-2">
                Best set: {formatWeight(lastPerformance.bestSet.weight_kg)} × {lastPerformance.bestSet.reps} reps
              </div>
              {suggestion && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Try:</span>
                  <span className="font-bold text-emerald-400">
                    {suggestion.weight}{weightUnit} × {suggestion.reps} reps
                  </span>
                  {suggestion.increment && (
                    <span className="text-slate-500">
                      ({suggestion.type === 'weight' ? `+${suggestion.increment}` : '+1 rep'})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Fill Section */}
      <div className="mb-4">
        {!showBulkFill ? (
          <button
            type="button"
            onClick={() => setShowBulkFill(true)}
            className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Fill All Sets
          </button>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-sm font-semibold text-emerald-400">Quick Fill</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                placeholder={`Weight (${weightUnit})`}
                value={bulkWeight}
                onChange={(e) => setBulkWeight(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-400 text-sm">{weightUnit} ×</span>
              <input
                type="number"
                placeholder="Reps"
                value={bulkReps}
                onChange={(e) => setBulkReps(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-400 text-sm">reps</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillAllSets}
                disabled={!bulkWeight || !bulkReps}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Apply to All Sets
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBulkFill(false)
                  setBulkWeight('')
                  setBulkReps('')
                }}
                className="px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {exercise.sets.map((set, setIndex) => (
          <SetInput
            key={setIndex}
            setNumber={setIndex + 1}
            setData={set}
            onWeightChange={(value) => onUpdateSet(setIndex, 'weight', value)}
            onRepsChange={(value) => onUpdateSet(setIndex, 'reps', value)}
          />
        ))}
      </div>
    </div>
  )
}
