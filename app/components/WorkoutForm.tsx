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
  const [loadingLastWorkout, setLoadingLastWorkout] = useState(false)
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null)

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

  const loadLastWorkout = async () => {
    setLoadingLastWorkout(true)
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('date, exercise_name, workout_type, set_number, weight_kg, reps')
        .order('date', { ascending: false })
        .limit(100)

      if (error) throw error
      if (!data || data.length === 0) {
        setMessage('No previous workouts found')
        setLoadingLastWorkout(false)
        return
      }

      const lastDate = data[0].date
      setLastWorkoutDate(lastDate)

      const lastWorkoutLogs = data.filter((log) => log.date === lastDate)

      const exerciseMap = new Map<string, { name: string; category: string; sets: Array<{ weight: string; reps: string }> }>()

      lastWorkoutLogs.forEach((log) => {
        if (!exerciseMap.has(log.exercise_name)) {
          exerciseMap.set(log.exercise_name, {
            name: log.exercise_name,
            category: log.workout_type,
            sets: [],
          })
        }
        const exercise = exerciseMap.get(log.exercise_name)!
        exercise.sets[log.set_number - 1] = {
          weight: log.weight_kg.toString(),
          reps: log.reps.toString(),
        }
      })

      const exercises: SelectedExercise[] = Array.from(exerciseMap.values()).map((ex) => ({
        id: crypto.randomUUID(),
        exerciseId: ex.name.toLowerCase().replace(/\s+/g, '-'),
        name: ex.name,
        category: ex.category as any,
        sets: ex.sets.length === 4 ? ex.sets : [...ex.sets, ...Array(4 - ex.sets.length).fill({ weight: '', reps: '' })],
      }))

      setSelectedExercises(exercises)
      setDate(getTodayDate())
      setMessage(`Loaded workout from ${formatDate(lastDate)} (${exercises.length} exercises)`)
    } catch (error) {
      console.error('Error loading last workout:', error)
      setMessage('Error loading last workout')
    }
    setLoadingLastWorkout(false)
  }

  const setPresetDate = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysAgo)
    setDate(date.toISOString().split('T')[0])
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Workout Tracker
          </h1>
          <p className="text-slate-400 mt-2">Build your workout, track your progress</p>
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Date
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => setPresetDate(0)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(-1)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setPresetDate(-2)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-all"
            >
              2 Days Ago
            </button>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="button"
            onClick={loadLastWorkout}
            disabled={loadingLastWorkout}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingLastWorkout ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Last Workout
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-cyan-400 transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
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
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
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
