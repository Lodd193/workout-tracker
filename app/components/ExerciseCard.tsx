import { useState } from 'react'
import { SelectedExercise } from '@/lib/types'
import { CATEGORY_COLORS } from '@/lib/exercises'
import SetInput from './SetInput'

interface ExerciseCardProps {
  exercise: SelectedExercise
  index: number
  onRemove: () => void
  onUpdateSet: (setIndex: number, field: 'weight' | 'reps', value: string) => void
}

export default function ExerciseCard({ exercise, index, onRemove, onUpdateSet }: ExerciseCardProps) {
  const gradientColor = CATEGORY_COLORS[exercise.category]
  const [bulkWeight, setBulkWeight] = useState('')
  const [bulkReps, setBulkReps] = useState('')
  const [showBulkFill, setShowBulkFill] = useState(false)

  const fillAllSets = () => {
    if (!bulkWeight || !bulkReps) return
    for (let i = 0; i < exercise.sets.length; i++) {
      onUpdateSet(i, 'weight', bulkWeight)
      onUpdateSet(i, 'reps', bulkReps)
    }
    setBulkWeight('')
    setBulkReps('')
    setShowBulkFill(false)
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
                placeholder="Weight"
                value={bulkWeight}
                onChange={(e) => setBulkWeight(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-400 text-sm">kg ×</span>
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
