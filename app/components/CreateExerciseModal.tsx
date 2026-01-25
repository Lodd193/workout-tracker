'use client'

import { useState, useEffect } from 'react'
import { ExerciseCategory } from '@/lib/types'
import { CATEGORY_LABELS } from '@/lib/exercises'
import { createCustomExercise, customExerciseExists } from '@/lib/customExercises'

interface CreateExerciseModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

const CATEGORIES: ExerciseCategory[] = [
  'chest_upper',
  'chest_mid',
  'chest_lower',
  'back_vertical',
  'back_horizontal',
  'shoulders',
  'arms_biceps',
  'arms_triceps',
  'legs_quad',
  'legs_hamstring',
  'legs_glutes',
  'legs_calves',
  'core',
  'cardio',
]

export default function CreateExerciseModal({ isOpen, onClose, onCreated }: CreateExerciseModalProps) {
  const [exerciseName, setExerciseName] = useState('')
  const [category, setCategory] = useState<ExerciseCategory>('chest_mid')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setExerciseName('')
      setCategory('chest_mid')
      setError('')
    }
  }, [isOpen])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  const handleSave = async () => {
    // Validation
    if (!exerciseName.trim()) {
      setError('Please enter an exercise name')
      return
    }

    if (await customExerciseExists(exerciseName.trim())) {
      setError('You already have an exercise with this name')
      return
    }

    setSaving(true)

    try {
      const result = await createCustomExercise(exerciseName.trim(), category)
      if (result) {
        onCreated()
        onClose()
      } else {
        setError('Failed to create exercise')
      }
    } catch (err) {
      console.error('Error creating exercise:', err)
      setError('Failed to create exercise')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Create Exercise</h2>
              <p className="text-sm text-slate-400">Add a custom exercise</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Exercise Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Exercise Name</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => {
              setExerciseName(e.target.value)
              setError('')
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Cable Lateral Raise"
            autoFocus
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Select */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.5rem',
            }}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Creating...' : 'Create Exercise'}
          </button>
        </div>
      </div>
    </div>
  )
}
