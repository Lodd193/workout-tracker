'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { workoutTypes, exercisesByWorkout } from '../../lib/exercises'

export default function WorkoutForm() {
  const [date, setDate] = useState('')
  const [workoutType, setWorkoutType] = useState('')
  const [sets, setSets] = useState<Record<string, { weight: string; reps: string }[]>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const exercises = workoutType ? exercisesByWorkout[workoutType] : []

  const handleWorkoutTypeChange = (type: string) => {
    setWorkoutType(type)
    const newSets: Record<string, { weight: string; reps: string }[]> = {}
    exercisesByWorkout[type]?.forEach((exercise) => {
      newSets[exercise] = [
        { weight: '', reps: '' },
        { weight: '', reps: '' },
        { weight: '', reps: '' },
        { weight: '', reps: '' },
      ]
    })
    setSets(newSets)
  }

  const updateSet = (exercise: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    setSets((prev) => ({
      ...prev,
      [exercise]: prev[exercise].map((s, i) =>
        i === setIndex ? { ...s, [field]: value } : s
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const rows = []

    for (const exercise of exercises) {
      const exerciseSets = sets[exercise] || []
      for (let i = 0; i < exerciseSets.length; i++) {
        const { weight, reps } = exerciseSets[i]
        if (weight && reps) {
          rows.push({
            date,
            workout_type: workoutType,
            exercise_name: exercise,
            set_number: i + 1,
            weight_kg: parseFloat(weight),
            reps: parseInt(reps),
          })
        }
      }
    }

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
      setWorkoutType('')
      setSets({})
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Workout Log
          </h1>
          <p className="text-slate-400 mt-1">Track your progress</p>
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
                       transition-all duration-200"
          />
        </div>

        {/* Workout Type Select */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Workout Type
          </label>
          <select
            value={workoutType}
            onChange={(e) => handleWorkoutTypeChange(e.target.value)}
            required
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                       transition-all duration-200 appearance-none cursor-pointer"
          >
            <option value="" className="bg-slate-800">Select workout...</option>
            {workoutTypes.map((w) => (
              <option key={w.value} value={w.value} className="bg-slate-800">
                {w.label}
              </option>
            ))}
          </select>
        </div>

        {/* Exercise Cards */}
        <div className="space-y-4">
          {exercises.map((exercise, exerciseIndex) => (
            <div 
              key={exercise} 
              className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 
                         backdrop-blur-sm transition-all duration-300"
              style={{ animationDelay: `${exerciseIndex * 50}ms` }}
            >
              <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-bold">
                  {exerciseIndex + 1}
                </span>
                {exercise}
              </h3>
              
              <div className="grid grid-cols-4 gap-3">
                {sets[exercise]?.map((set, i) => (
                  <div key={i} className="space-y-2">
                    <div className="text-xs text-slate-500 font-medium text-center uppercase">
                      Set {i + 1}
                    </div>
                    <input
                      type="number"
                      placeholder="kg"
                      value={set.weight}
                      onChange={(e) => updateSet(exercise, i, 'weight', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-2 py-2.5 
                                 text-white text-center text-sm font-medium
                                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                 placeholder:text-slate-600 transition-all duration-200"
                    />
                    <input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={(e) => updateSet(exercise, i, 'reps', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-2 py-2.5 
                                 text-white text-center text-sm font-medium
                                 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                                 placeholder:text-slate-600 transition-all duration-200"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        {workoutType && (
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
          <div className={`text-center py-3 px-4 rounded-xl font-medium ${
            message.includes('Error') 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {message}
          </div>
        )}

      </form>
    </div>
  )
}