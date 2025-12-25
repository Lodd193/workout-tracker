'use client'

import { useState, useEffect } from 'react'
import { UserGoal, GoalFormData, Exercise } from '@/lib/types'
import { fetchUserGoals, createGoal, updateGoal, deleteGoal } from '@/lib/api/goals'
import { useSettings } from '@/lib/contexts/SettingsContext'
import ExerciseSelector from './ExerciseSelector'
import { validateWeight, validateDate, validateNotes } from '@/lib/inputValidation'

export default function GoalManagement() {
  const { formatWeight, convertWeight, weightUnit } = useSettings()
  const [goals, setGoals] = useState<UserGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null)
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)

  // Form state
  const [formData, setFormData] = useState<GoalFormData>({
    exercise_name: '',
    target_weight_kg: 0,
    target_date: null,
    notes: null,
  })
  const [formErrors, setFormErrors] = useState({
    weight: '',
    date: '',
    notes: ''
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const data = await fetchUserGoals()
      setGoals(data)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectExercise = (exercise: Exercise) => {
    setFormData({ ...formData, exercise_name: exercise.name })
    setShowExerciseSelector(false)
  }

  const handleSubmit = async () => {
    // Validate exercise name
    if (!formData.exercise_name) {
      alert('Please select an exercise')
      return
    }

    // Validate weight
    const weightValidation = validateWeight(formData.target_weight_kg)
    if (!weightValidation.isValid) {
      alert(weightValidation.error || 'Invalid weight')
      return
    }

    if (formData.target_weight_kg <= 0) {
      alert('Target weight must be greater than 0')
      return
    }

    // Validate target date if provided
    if (formData.target_date) {
      const dateValidation = validateDate(formData.target_date, {
        allowPast: false,
        allowFuture: true,
        maxDaysInFuture: 1095 // ~3 years
      })

      if (!dateValidation.isValid) {
        alert(dateValidation.error || 'Invalid target date')
        return
      }
    }

    // Validate notes if provided
    if (formData.notes) {
      const notesValidation = validateNotes(formData.notes)
      if (!notesValidation.isValid) {
        alert(notesValidation.error || 'Invalid notes')
        return
      }
    }

    try {
      // Convert weight to kg if in lbs
      const targetWeightKg = weightUnit === 'lbs'
        ? weightValidation.sanitizedValue! / 2.20462
        : weightValidation.sanitizedValue!

      const goalData = {
        ...formData,
        target_weight_kg: targetWeightKg,
      }

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData)
      } else {
        await createGoal(goalData)
      }

      // Reset form and reload
      setFormData({ exercise_name: '', target_weight_kg: 0, target_date: null, notes: null })
      setShowAddForm(false)
      setEditingGoal(null)
      await loadGoals()
    } catch (error) {
      console.error('Error saving goal:', error)
      alert('Failed to save goal')
    }
  }

  const handleEdit = (goal: UserGoal) => {
    setEditingGoal(goal)
    setFormData({
      exercise_name: goal.exercise_name,
      target_weight_kg: convertWeight(goal.target_weight_kg),
      target_date: goal.target_date,
      notes: goal.notes,
    })
    setShowAddForm(true)
  }

  const handleDelete = async (goalId: number) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      await deleteGoal(goalId)
      await loadGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleWeightChange = (value: string) => {
    const num = parseFloat(value)
    setFormData({ ...formData, target_weight_kg: num || 0 })

    if (!value || num <= 0) {
      setFormErrors({ ...formErrors, weight: '' })
      return
    }

    const validation = validateWeight(value)
    if (!validation.isValid) {
      setFormErrors({ ...formErrors, weight: validation.error || '' })
    } else {
      setFormErrors({ ...formErrors, weight: '' })
    }
  }

  const handleDateChange = (value: string) => {
    setFormData({ ...formData, target_date: value || null })

    if (!value) {
      setFormErrors({ ...formErrors, date: '' })
      return
    }

    const validation = validateDate(value, {
      allowPast: false,
      allowFuture: true,
      maxDaysInFuture: 1095
    })

    if (!validation.isValid) {
      setFormErrors({ ...formErrors, date: validation.error || '' })
    } else {
      setFormErrors({ ...formErrors, date: '' })
    }
  }

  const handleNotesChange = (value: string) => {
    setFormData({ ...formData, notes: value || null })

    if (!value) {
      setFormErrors({ ...formErrors, notes: '' })
      return
    }

    const validation = validateNotes(value)
    if (!validation.isValid) {
      setFormErrors({ ...formErrors, notes: validation.error || '' })
    } else {
      setFormErrors({ ...formErrors, notes: '' })
    }
  }

  const cancelEdit = () => {
    setShowAddForm(false)
    setEditingGoal(null)
    setFormData({ exercise_name: '', target_weight_kg: 0, target_date: null, notes: null })
    setFormErrors({ weight: '', date: '', notes: '' })
  }

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-48 mb-4"></div>
        <div className="h-32 bg-slate-700 rounded"></div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md hover:border-slate-600 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Weight Goals</h3>
              <p className="text-sm text-slate-400 mt-0.5">Set and track exercise-specific weight targets</p>
            </div>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg
                       hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg"
            >
              + Add Goal
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <h4 className="text-white font-semibold mb-4">
              {editingGoal ? 'Edit Goal' : 'New Goal'}
            </h4>

            {/* Exercise Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Exercise</label>
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-left
                         text-white hover:border-slate-500 transition-colors"
              >
                {formData.exercise_name || 'Select an exercise...'}
              </button>
            </div>

            {/* Target Weight */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Weight ({weightUnit})
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max={weightUnit === 'lbs' ? '2205' : '1000'}
                value={formData.target_weight_kg || ''}
                onChange={(e) => handleWeightChange(e.target.value)}
                title={`Target weight (0.5-${weightUnit === 'lbs' ? '2205' : '1000'}${weightUnit})`}
                className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white
                         focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                           formErrors.weight
                             ? 'border-red-500 focus:ring-red-500'
                             : 'border-slate-600 focus:ring-emerald-500'
                         }`}
                placeholder="e.g., 100"
              />
              {formErrors.weight && (
                <div className="mt-1 text-sm text-red-400">{formErrors.weight}</div>
              )}
            </div>

            {/* Target Date (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Target Date (Optional)
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.target_date || ''}
                onChange={(e) => handleDateChange(e.target.value)}
                title="Target date (must be in the future, max 3 years ahead)"
                className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white
                         focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                           formErrors.date
                             ? 'border-red-500 focus:ring-red-500'
                             : 'border-slate-600 focus:ring-emerald-500'
                         }`}
              />
              {formErrors.date && (
                <div className="mt-1 text-sm text-red-400">{formErrors.date}</div>
              )}
            </div>

            {/* Notes (Optional) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                maxLength={500}
                value={formData.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                title="Notes (max 500 characters)"
                className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-white
                         focus:outline-none focus:ring-2 focus:border-transparent resize-none transition-colors ${
                           formErrors.notes
                             ? 'border-red-500 focus:ring-red-500'
                             : 'border-slate-600 focus:ring-emerald-500'
                         }`}
                rows={2}
                placeholder="e.g., Focus on progressive overload"
              />
              {formErrors.notes && (
                <div className="mt-1 text-sm text-red-400">{formErrors.notes}</div>
              )}
              <div className="mt-1 text-xs text-slate-500 text-right">
                {(formData.notes || '').length} / 500
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-emerald-500 text-white font-semibold py-2 rounded-lg
                         hover:bg-emerald-600 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 bg-slate-600 text-white font-semibold py-2 rounded-lg
                         hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No active goals yet</p>
            <p className="text-slate-500 text-sm mt-1">Create your first weight goal to start tracking progress</p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-slate-700/40 border border-slate-600 rounded-lg p-4
                         hover:border-slate-500 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{goal.exercise_name}</h4>
                    <p className="text-emerald-400 text-lg font-bold mt-1">
                      Target: {formatWeight(goal.target_weight_kg)}
                    </p>
                    {goal.target_date && (
                      <p className="text-slate-400 text-sm mt-1">
                        By {new Date(goal.target_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    )}
                    {goal.notes && (
                      <p className="text-slate-500 text-sm mt-2 italic">{goal.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-amber-400">Tip:</span> Goals are synced across all your devices.
            Track your progress on the Progress page.
          </p>
        </div>
      </div>

      {/* Exercise Selector Modal */}
      <ExerciseSelector
        isOpen={showExerciseSelector}
        onClose={() => setShowExerciseSelector(false)}
        onSelectExercise={handleSelectExercise}
      />
    </>
  )
}
