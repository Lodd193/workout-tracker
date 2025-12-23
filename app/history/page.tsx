'use client'

import { useState, useEffect } from 'react'
import {
  fetchWorkoutHistory,
  updateWorkoutSet,
  deleteWorkoutSet,
  deleteWorkoutByDate,
  WorkoutHistoryEntry,
} from '@/lib/api/analytics'
import { CATEGORY_COLORS } from '@/lib/exercises'

export default function HistoryPage() {
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSet, setEditingSet] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editReps, setEditReps] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = await fetchWorkoutHistory()
      setHistory(data)
    } catch (error) {
      console.error('Error loading history:', error)
    }
    setLoading(false)
  }

  const handleEditSet = (setId: number, currentWeight: number, currentReps: number) => {
    setEditingSet(setId)
    setEditWeight(currentWeight.toString())
    setEditReps(currentReps.toString())
  }

  const handleSaveEdit = async (setId: number) => {
    const weight = parseFloat(editWeight)
    const reps = parseInt(editReps)

    if (isNaN(weight) || isNaN(reps)) {
      alert('Please enter valid numbers')
      return
    }

    const success = await updateWorkoutSet(setId, { weight_kg: weight, reps })
    if (success) {
      setEditingSet(null)
      loadHistory() // Refresh data
    }
  }

  const handleDeleteSet = async (setId: number) => {
    if (!confirm('Delete this set?')) return

    const success = await deleteWorkoutSet(setId)
    if (success) {
      loadHistory()
    }
  }

  const handleDeleteWorkout = async (date: string) => {
    if (confirmDelete === date) {
      const success = await deleteWorkoutByDate(date)
      if (success) {
        setConfirmDelete(null)
        loadHistory()
      }
    } else {
      setConfirmDelete(date)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredHistory = history.filter((entry) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      entry.date.includes(search) ||
      entry.exercises.some((ex) => ex.exercise_name.toLowerCase().includes(search))
    )
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-slate-700/30 rounded"></div>
            <div className="h-64 bg-slate-700/30 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            Workout History
          </h1>
          <p className="text-slate-400 mt-2">View, edit, and manage your past workouts</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by date or exercise..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="text-slate-400 text-sm whitespace-nowrap">
            {filteredHistory.length} workout{filteredHistory.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Workout List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-slate-700/50">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-400 text-lg">No workout history found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm ? 'Try a different search term' : 'Start logging workouts to build your history'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry) => (
              <div
                key={entry.date}
                className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md hover:border-slate-600 transition-all"
              >
                {/* Workout Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{formatDate(entry.date)}</h3>
                    <p className="text-slate-400 text-sm mt-1">
                      {entry.exercises.length} exercise{entry.exercises.length !== 1 ? 's' : ''} •{' '}
                      {entry.totalSets} set{entry.totalSets !== 1 ? 's' : ''} • {entry.totalVolume.toLocaleString()}kg volume
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteWorkout(entry.date)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      confirmDelete === entry.date
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                    }`}
                  >
                    {confirmDelete === entry.date ? 'Click again to confirm' : 'Delete Workout'}
                  </button>
                </div>

                {/* Exercises */}
                <div className="space-y-4">
                  {entry.exercises.map((exercise, exIdx) => {
                    const gradientColor = CATEGORY_COLORS[exercise.workout_type as keyof typeof CATEGORY_COLORS] || 'from-slate-500 to-slate-600'

                    return (
                      <div key={exIdx} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${gradientColor} rounded-lg flex items-center justify-center text-sm font-bold text-white`}>
                            {exIdx + 1}
                          </div>
                          <h4 className="text-white font-semibold">{exercise.exercise_name}</h4>
                          <span className="text-xs text-slate-400 ml-auto">
                            {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Sets Table */}
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-xs text-slate-400 uppercase font-semibold">Set</div>
                          <div className="text-xs text-slate-400 uppercase font-semibold">Weight</div>
                          <div className="text-xs text-slate-400 uppercase font-semibold">Reps</div>
                          <div className="text-xs text-slate-400 uppercase font-semibold">Actions</div>

                          {exercise.sets.map((set) => (
                            <div key={set.id} className="contents">
                              <div className="text-white py-2">{set.set_number}</div>
                              <div className="py-2">
                                {editingSet === set.id ? (
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={editWeight}
                                    onChange={(e) => setEditWeight(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                                    autoFocus
                                  />
                                ) : (
                                  <span className="text-white">{set.weight_kg}kg</span>
                                )}
                              </div>
                              <div className="py-2">
                                {editingSet === set.id ? (
                                  <input
                                    type="number"
                                    value={editReps}
                                    onChange={(e) => setEditReps(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-sm"
                                  />
                                ) : (
                                  <span className="text-white">{set.reps}</span>
                                )}
                              </div>
                              <div className="py-2 flex gap-1">
                                {editingSet === set.id ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveEdit(set.id)}
                                      className="px-2 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-400"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingSet(null)}
                                      className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-500"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleEditSet(set.id, set.weight_kg, set.reps)}
                                      className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-500"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSet(set.id)}
                                      className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded hover:bg-red-500/30"
                                    >
                                      Del
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
