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
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatDateLong } from '@/lib/utils/dateFormat'
import ConfirmDialog from '@/app/components/ConfirmDialog'
import AlertDialog from '@/app/components/AlertDialog'

export default function HistoryPage() {
  const { weightUnit, convertWeight, formatWeight } = useSettings()
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSet, setEditingSet] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editReps, setEditReps] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set())
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  })
  const [deleteSetConfirm, setDeleteSetConfirm] = useState<{ isOpen: boolean; setId: number | null }>({
    isOpen: false,
    setId: null,
  })

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
    const displayWeight = convertWeight(currentWeight)
    setEditWeight(displayWeight.toString())
    setEditReps(currentReps.toString())
  }

  const handleSaveEdit = async (setId: number) => {
    const displayWeight = parseFloat(editWeight)
    const reps = parseInt(editReps)

    if (isNaN(displayWeight) || isNaN(reps)) {
      setAlertDialog({
        isOpen: true,
        title: 'Invalid Input',
        message: 'Please enter valid numbers for weight and reps.',
      })
      return
    }

    const weightInKg = weightUnit === 'lbs' ? displayWeight / 2.20462 : displayWeight

    const success = await updateWorkoutSet(setId, { weight_kg: weightInKg, reps })
    if (success) {
      setEditingSet(null)
      loadHistory()
    }
  }

  const handleDeleteSet = (setId: number) => {
    setDeleteSetConfirm({ isOpen: true, setId })
  }

  const confirmDeleteSet = async () => {
    if (deleteSetConfirm.setId === null) return

    const success = await deleteWorkoutSet(deleteSetConfirm.setId)
    if (success) {
      loadHistory()
    }
    setDeleteSetConfirm({ isOpen: false, setId: null })
  }

  const cancelDeleteSet = () => {
    setDeleteSetConfirm({ isOpen: false, setId: null })
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

  const toggleWorkout = (date: string) => {
    setExpandedWorkouts(prev => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
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
      <div className="min-h-screen bg-black py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-[#111111] rounded"></div>
            <div className="h-64 bg-[#111111] rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Workout History
          </h1>
          <p className="text-zinc-500 mt-2">View, edit, and manage your past workouts</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500"
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
              className="w-full bg-[#111111] border border-[#222222] rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all"
            />
          </div>
          <div className="text-zinc-500 text-sm whitespace-nowrap">
            {filteredHistory.length} workout{filteredHistory.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Workout List */}
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 bg-[#111111] rounded-2xl border border-[#222222]">
            <svg className="w-16 h-16 mx-auto text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-zinc-500 text-lg">No workout history found</p>
            <p className="text-zinc-600 text-sm mt-2">
              {searchTerm ? 'Try a different search term' : 'Start logging workouts to build your history'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry) => (
              <div
                key={entry.date}
                className="bg-[#111111] border border-[#222222] rounded-2xl p-6 hover:border-[#333333] transition-all"
              >
                {/* Workout Header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => toggleWorkout(entry.date)}
                    className="flex items-center gap-3 flex-1 text-left group"
                  >
                    <svg
                      className={`w-6 h-6 text-zinc-500 group-hover:text-lime-400 transition-all ${
                        expandedWorkouts.has(entry.date) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-lime-400 transition-colors">
                        {formatDateLong(entry.date)}
                      </h3>
                      <p className="text-zinc-500 text-sm mt-1">
                        {entry.exercises.length} exercise{entry.exercises.length !== 1 ? 's' : ''} •{' '}
                        {entry.totalSets} set{entry.totalSets !== 1 ? 's' : ''} • {entry.totalVolume.toLocaleString()}kg volume
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteWorkout(entry.date)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      confirmDelete === entry.date
                        ? 'bg-red-500 text-white'
                        : 'bg-[#1A1A1A] text-zinc-500 hover:bg-red-500/20 hover:text-red-400'
                    }`}
                  >
                    {confirmDelete === entry.date ? 'Click again to confirm' : 'Delete Workout'}
                  </button>
                </div>

                {/* Exercises */}
                {expandedWorkouts.has(entry.date) && (
                  <div className="space-y-4">
                    {entry.exercises.map((exercise, exIdx) => {
                      const gradientColor = CATEGORY_COLORS[exercise.workout_type as keyof typeof CATEGORY_COLORS] || 'from-zinc-500 to-zinc-600'

                      return (
                        <div key={exIdx} className="bg-[#1A1A1A] rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 bg-gradient-to-br ${gradientColor} rounded-lg flex items-center justify-center text-sm font-bold text-white`}>
                              {exIdx + 1}
                            </div>
                            <h4 className="text-white font-semibold">{exercise.exercise_name}</h4>
                            <span className="text-xs text-zinc-500 ml-auto">
                              {exercise.sets.length} set{exercise.sets.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Sets Table */}
                          <div className="grid grid-cols-4 gap-2">
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Set</div>
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Weight</div>
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Reps</div>
                            <div className="text-xs text-zinc-500 uppercase font-semibold">Actions</div>

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
                                      className="w-full bg-[#222222] border border-[#333333] rounded px-2 py-1 text-white text-sm"
                                      autoFocus
                                    />
                                  ) : (
                                    <span className="text-white">{formatWeight(set.weight_kg)}</span>
                                  )}
                                </div>
                                <div className="py-2">
                                  {editingSet === set.id ? (
                                    <input
                                      type="number"
                                      value={editReps}
                                      onChange={(e) => setEditReps(e.target.value)}
                                      className="w-full bg-[#222222] border border-[#333333] rounded px-2 py-1 text-white text-sm"
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
                                        className="px-2 py-1 bg-lime-400 text-black text-xs rounded hover:bg-lime-300"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingSet(null)}
                                        className="px-2 py-1 bg-[#1A1A1A] text-white text-xs rounded hover:bg-[#222222]"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditSet(set.id, set.weight_kg, set.reps)}
                                        className="px-2 py-1 bg-[#1A1A1A] text-zinc-300 text-xs rounded hover:bg-[#222222]"
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        message={alertDialog.message}
        variant="warning"
        onClose={() => setAlertDialog({ isOpen: false, title: '', message: '' })}
      />

      {/* Delete Set Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteSetConfirm.isOpen}
        title="Delete Set?"
        message="Are you sure you want to delete this set? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDeleteSet}
        onCancel={cancelDeleteSet}
      />
    </div>
  )
}
