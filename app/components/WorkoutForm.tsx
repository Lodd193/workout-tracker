'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Exercise, SelectedExercise } from '@/lib/types'
import ExerciseCard from './ExerciseCard'
import ExerciseSelector from './ExerciseSelector'

export default function WorkoutForm() {
  const [date, setDate] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const addExercise = (exercise: Exercise) => {
    const newExercise: SelectedExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: Array(4).fill(null).map(() => ({ weight: '', reps: '' })),
    }
    setSelectedExercises((prev) => [...prev, newExercise])
    setIsModalOpen(false)
  }

  const removeExercise = (id: string) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== id))
  }

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) => (i === setIndex ? { ...s, [field]: value } : s)),
            }
          : ex
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    if (!date) {
      setMessage('Please select a date.')
      setSaving(false)
      return
    }

    if (selectedExercises.length === 0) {
      setMessage('Please add at least one exercise.')
      setSaving(false)
      return
    }

    const rows = selectedExercises.flatMap((exercise) =>
      exercise.sets
        .map((set, index) => ({
          date,
          workout_type: exercise.category,
          exercise_name: exercise.name,
          set_number: index + 1,
          weight_kg: parseFloat(set.weight),
          reps: parseInt(set.reps),
        }))
        .filter((row) => !isNaN(row.weight_kg) && !isNaN(row.reps))
    )

    if (rows.length === 0) {
      setMessage('No sets to save. Enter at least one set.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('workout_logs').insert(rows)

    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      setMessage(`Saved ${rows.length} sets!`)
      setDate('')
      setSelectedExercises([])
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400
                         bg-clip-text text-transparent tracking-tight">
            Workout Tracker
          </h1>
          <p className="text-slate-400 mt-2">Build your workout, track your progress</p>
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       transition-all duration-200 backdrop-blur-sm"
          />
        </div>

        {/* Add Exercise Button */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4
                       rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30
                       hover:from-emerald-400 hover:to-cyan-400
                       transform transition-all duration-200 hover:scale-105 active:scale-95
                       flex items-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Exercise
          </button>
        </div>

        {/* Selected Exercises */}
        {selectedExercises.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Your Workout ({selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''})
              </h2>
            </div>
            {selectedExercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                onRemove={() => removeExercise(exercise.id)}
                onUpdateSet={(setIndex, field, value) => updateSet(exercise.id, setIndex, field, value)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {selectedExercises.length === 0 && (
          <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <svg
              className="w-16 h-16 mx-auto text-slate-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-slate-400 text-lg mb-2">No exercises added yet</p>
            <p className="text-slate-500 text-sm">Click "Add Exercise" to build your workout</p>
          </div>
        )}

        {/* Submit Button */}
        {selectedExercises.length > 0 && (
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl
                       font-semibold text-lg shadow-lg shadow-emerald-500/25
                       hover:from-emerald-400 hover:to-emerald-500
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              'Save Workout'
            )}
          </button>
        )}

        {/* Message */}
        {message && (
          <div
            className={`text-center py-3 px-4 rounded-xl font-medium animate-slideIn ${
              message.includes('Error')
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {message}
          </div>
        )}
      </form>

      {/* Exercise Selector Modal */}
      <ExerciseSelector isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelectExercise={addExercise} />
    </div>
  )
}
