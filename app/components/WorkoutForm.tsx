'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { Exercise, SelectedExercise, WorkoutTemplate } from '@/lib/types'
import ExerciseCard from './ExerciseCard'
import ExerciseSelector from './ExerciseSelector'
import TemplateSelector from './TemplateSelector'
import SaveTemplateModal from './SaveTemplateModal'
import ConfirmDialog from './ConfirmDialog'
import DateSelector from './DateSelector'
import { useWorkoutTimer } from '@/lib/hooks/useWorkoutTimer'
import { useWorkoutPersistence } from '@/lib/hooks/useWorkoutPersistence'

export default function WorkoutForm() {
  const { user } = useAuth()
  const [date, setDate] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false)
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; exerciseId: string | null }>({
    isOpen: false,
    exerciseId: null,
  })

  // Use extracted hooks
  const timer = useWorkoutTimer()
  const persistence = useWorkoutPersistence({
    onMessage: setMessage,
    onExercisesLoaded: setSelectedExercises,
    onDateSet: setDate,
  })

  // Start timer when exercises are added
  useEffect(() => {
    if (selectedExercises.length > 0 && !timer.isRunning) {
      timer.start()
    }
  }, [selectedExercises.length, timer.isRunning])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
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

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    persistence.loadTemplate(template)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!user) {
      setMessage('You must be logged in to save workouts.')
      return
    }

    const success = await persistence.saveWorkout({
      userId: user.id,
      date,
      exercises: selectedExercises,
      durationMinutes: timer.getDurationMinutes(),
    })

    if (success) {
      setDate('')
      setSelectedExercises([])
      timer.reset()
    }
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Workout Tracker
          </h1>
          {user?.email && (
            <p className="text-lime-400 mt-3 font-medium">
              {getGreeting()}, {user.email.split('@')[0]}!
            </p>
          )}
          <p className="text-zinc-500 mt-2">Build your workout, track your progress</p>
        </div>

        {/* Date Input */}
        <DateSelector value={date} onChange={setDate} />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <button
            type="button"
            onClick={persistence.loadLastWorkout}
            disabled={persistence.loadingLastWorkout}
            className="bg-[#1A1A1A] hover:bg-[#222222] text-zinc-300 hover:text-white px-4 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-[#222222]"
          >
            {persistence.loadingLastWorkout ? (
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
            className="bg-[#1A1A1A] hover:bg-[#222222] text-zinc-300 hover:text-white px-4 py-4 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-[#222222] hover:border-[#333333]"
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
            className="bg-lime-400 text-black px-4 py-4 rounded-xl font-semibold hover:bg-lime-300 transform transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
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
                {timer.isRunning && timer.elapsedTime > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-lime-400 font-medium">{timer.formatDuration()}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsSaveTemplateOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] border border-[#222222] text-zinc-500 hover:text-white hover:border-[#333333] transition-all"
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
          <div className="text-center py-12 bg-[#111111] rounded-2xl border border-[#222222]">
            <svg
              className="w-16 h-16 mx-auto text-zinc-700 mb-4"
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
            <p className="text-zinc-500 text-lg mb-2">No exercises added yet</p>
            <p className="text-zinc-600 text-sm">Click "Add Exercise" to build your workout</p>
          </div>
        )}

        {/* Submit Button */}
        {selectedExercises.length > 0 && (
          <button
            type="submit"
            disabled={persistence.saving}
            className="w-full bg-lime-400 text-black py-4 rounded-xl font-semibold text-lg hover:bg-lime-300 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {persistence.saving ? (
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
                : 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
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
