'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Exercise, SelectedExercise, WorkoutTemplate } from '@/lib/types'
import ExerciseCard from './ExerciseCard'
import ExerciseSelector from './ExerciseSelector'
import TemplateSelector from './TemplateSelector'
import SaveTemplateModal from './SaveTemplateModal'
import { EXERCISES } from '@/lib/exercises'
import ConfirmDialog from './ConfirmDialog'
import { validateDate, validateWeight, validateReps, validateDuration } from '@/lib/inputValidation'

export default function WorkoutForm() {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [dateError, setDateError] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [loadingLastWorkout, setLoadingLastWorkout] = useState(false)
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null)
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; exerciseId: string | null }>({
    isOpen: false,
    exerciseId: null,
  })

  // Start timer when exercises are added
  useEffect(() => {
    if (selectedExercises.length > 0 && !workoutStartTime) {
      setWorkoutStartTime(Date.now())
    }
  }, [selectedExercises.length])

  // Update elapsed time every second
  useEffect(() => {
    if (workoutStartTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - workoutStartTime) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [workoutStartTime])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

    const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  const addExercise = (exercise: Exercise) => {
    const isCardio = exercise.category === 'cardio'
    const newExercise: SelectedExercise = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      sets: isCardio ? [] : Array(4).fill(null).map(() => ({ weight: '', reps: '' })),
      duration: isCardio ? 0 : undefined,
    }
    setSelectedExercises((prev) => [...prev, newExercise])
    setIsModalOpen(false)
  }

  const removeExercise = (id: string) => {
    setDeleteConfirm({ isOpen: true, exerciseId: id })
  }

  const confirmRemoveExercise = () => {
    if (deleteConfirm.exerciseId) {
      setSelectedExercises((prev) => prev.filter((ex) => ex.id !== deleteConfirm.exerciseId))
      setDeleteConfirm({ isOpen: false, exerciseId: null })
    }
  }

  const cancelRemoveExercise = () => {
    setDeleteConfirm({ isOpen: false, exerciseId: null })
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

  const updateDuration = (exerciseId: string, duration: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, duration }
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

  const handleDateChange = (value: string) => {
    setDate(value)

    if (!value) {
      setDateError('')
      return
    }

    const validation = validateDate(value, {
      allowPast: true,
      allowFuture: false,
      maxDaysInPast: 365
    })

    if (!validation.isValid) {
      setDateError(validation.error || 'Invalid date')
    } else {
      setDateError('')
    }
  }

  const setPresetDate = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysAgo)
    const dateString = date.toISOString().split('T')[0]
    handleDateChange(dateString)
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    // Convert template exercises to selected exercises with empty sets
    const exercises: SelectedExercise[] = template.exercises.map((ex) => {
      // Find the full exercise from EXERCISES to get all details
      const fullExercise = EXERCISES.find((e) => e.id === ex.exerciseId || e.name === ex.name)

      return {
        id: crypto.randomUUID(),
        exerciseId: fullExercise?.id || ex.exerciseId,
        name: ex.name,
        category: ex.category,
        sets: Array(4)
          .fill(null)
          .map(() => ({ weight: '', reps: '' })),
      }
    })

    setSelectedExercises(exercises)
    setDate(getTodayDate())
    setMessage(`Loaded template "${template.name}" (${template.exercises.length} exercises)`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    // Validate date
    if (!date) {
      setMessage('Please select a date.')
      setSaving(false)
      return
    }

    const dateValidation = validateDate(date, {
      allowPast: true,
      allowFuture: false,
      maxDaysInPast: 365
    })

    if (!dateValidation.isValid) {
      setMessage(dateValidation.error || 'Invalid date')
      setSaving(false)
      return
    }

    if (selectedExercises.length === 0) {
      setMessage('Please add at least one exercise.')
      setSaving(false)
      return
    }

    if (!user) {
      setMessage('You must be logged in to save workouts.')
      setSaving(false)
      return
    }

    // Validate and build rows
    const validatedRows: any[] = []
    let validationError: string | null = null

    for (const exercise of selectedExercises) {
      // Handle cardio exercises
      if (exercise.category === 'cardio') {
        if (!exercise.duration || exercise.duration <= 0) {
          continue // Skip empty cardio exercises
        }

        const durationValidation = validateDuration(exercise.duration)
        if (!durationValidation.isValid) {
          validationError = `${exercise.name}: ${durationValidation.error}`
          break
        }

        validatedRows.push({
          user_id: user.id,
          date,
          workout_type: exercise.category,
          exercise_name: exercise.name,
          set_number: 1,
          weight_kg: 0,
          reps: durationValidation.sanitizedValue,
        })
      } else {
        // Handle strength exercises
        for (let i = 0; i < exercise.sets.length; i++) {
          const set = exercise.sets[i]

          // Skip empty sets
          if (!set.weight || !set.reps) {
            continue
          }

          // Validate weight
          const weightValidation = validateWeight(set.weight)
          if (!weightValidation.isValid) {
            validationError = `${exercise.name} Set ${i + 1}: ${weightValidation.error}`
            break
          }

          // Validate reps
          const repsValidation = validateReps(set.reps)
          if (!repsValidation.isValid) {
            validationError = `${exercise.name} Set ${i + 1}: ${repsValidation.error}`
            break
          }

          validatedRows.push({
            user_id: user.id,
            date,
            workout_type: exercise.category,
            exercise_name: exercise.name,
            set_number: i + 1,
            weight_kg: weightValidation.sanitizedValue,
            reps: repsValidation.sanitizedValue,
          })
        }

        if (validationError) break
      }
    }

    if (validationError) {
      setMessage(validationError)
      setSaving(false)
      return
    }

    if (validatedRows.length === 0) {
      setMessage('No sets to save. Enter at least one set.')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('workout_logs').insert(validatedRows)

    if (error) {
      setMessage('Error saving: ' + error.message)
    } else {
      const duration = workoutStartTime ? Math.floor((Date.now() - workoutStartTime) / 60000) : 0
      setMessage(`Saved ${validatedRows.length} sets!${duration > 0 ? ` Duration: ${duration}min` : ''}`)
      setDate('')
      setSelectedExercises([])
      setWorkoutStartTime(null)
      setElapsedTime(0)
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
          {user?.email && (
            <p className="text-emerald-400 mt-3 font-medium">
              {getGreeting()}, {user.email.split('@')[0]}!
            </p>
          )}
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
            onChange={(e) => handleDateChange(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            title="Workout date (cannot be in the future or more than 1 year ago)"
            className={`w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 backdrop-blur-sm [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200 [&::-webkit-calendar-picker-indicator]:cursor-pointer ${
              dateError
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-700 focus:ring-emerald-500'
            }`}
          />
          {dateError && (
            <div className="text-sm text-red-400">{dateError}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <button
            type="button"
            onClick={loadLastWorkout}
            disabled={loadingLastWorkout}
            className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Copy Last</span>
                <span className="sm:hidden">Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsTemplateSelectorOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="hidden sm:inline">Load Template</span>
            <span className="sm:hidden">Template</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-4 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-cyan-400 transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Exercise</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Selected Exercises */}
        {selectedExercises.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Your Workout ({selectedExercises.length} exercise{selectedExercises.length !== 1 ? 's' : ''})
                </h2>
                {workoutStartTime && elapsedTime > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-cyan-400 font-medium">{formatDuration(elapsedTime)}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSaveTemplateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span className="text-sm font-semibold">Save as Template</span>
              </button>
            </div>
            {selectedExercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                onRemove={() => removeExercise(exercise.id)}
                onUpdateSet={(setIndex, field, value) => updateSet(exercise.id, setIndex, field, value)}
                onUpdateDuration={(duration) => updateDuration(exercise.id, duration)}
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

      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelectTemplate={handleLoadTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Remove Exercise?"
        message="Are you sure you want to remove this exercise from your workout? This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep"
        onConfirm={confirmRemoveExercise}
        onCancel={cancelRemoveExercise}
        variant="danger"
      />

      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={isSaveTemplateOpen}
        onClose={() => setIsSaveTemplateOpen(false)}
        exercises={selectedExercises}
        onSaved={() => setMessage('Template saved successfully!')}
      />
    </div>
  )
}
