'use client'

import { useState, useEffect } from 'react'
import { Exercise, WorkoutTemplate } from '@/lib/types'
import { updateTemplate, templateNameExists } from '@/lib/templates'
import { EXERCISES, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/exercises'

interface EditTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  template: WorkoutTemplate | null
}

export default function EditTemplateModal({ isOpen, onClose, onSaved, template }: EditTemplateModalProps) {
  const [templateName, setTemplateName] = useState('')
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Load template data when modal opens
  useEffect(() => {
    if (isOpen && template) {
      setTemplateName(template.name)

      // Convert template exercises to full Exercise objects
      const exercises = template.exercises
        .map((ex) => EXERCISES.find((e) => e.id === ex.exerciseId || e.name === ex.name))
        .filter((ex): ex is Exercise => ex !== undefined)

      setSelectedExercises(exercises)
      setError('')
      setSearchQuery('')
      setSelectedCategory('all')
    }
  }, [isOpen, template])

  const categories = ['all', ...Array.from(new Set(EXERCISES.map((ex) => ex.category)))]

  const getCategoryDisplayName = (category: string) => {
    if (category === 'all') return 'All Categories'
    return CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category
  }

  const filteredExercises = EXERCISES.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const isSelected = prev.some((ex) => ex.id === exercise.id)
      if (isSelected) {
        return prev.filter((ex) => ex.id !== exercise.id)
      } else {
        return [...prev, exercise]
      }
    })
  }

  const isExerciseSelected = (exerciseId: string) => {
    return selectedExercises.some((ex) => ex.id === exerciseId)
  }

  const handleSave = async () => {
    if (!template) return

    // Validation
    if (!templateName.trim()) {
      setError('Please enter a template name')
      return
    }

    if (await templateNameExists(templateName.trim(), template.id)) {
      setError('A template with this name already exists')
      return
    }

    if (selectedExercises.length === 0) {
      setError('Please select at least one exercise')
      return
    }

    setSaving(true)

    try {
      const templateExercises = selectedExercises.map((ex) => ({
        exerciseId: ex.id,
        name: ex.name,
        category: ex.category,
      }))

      const result = await updateTemplate(template.id, {
        name: templateName.trim(),
        exercises: templateExercises,
      })

      if (result) {
        onSaved()
        onClose()
      } else {
        setError('Failed to update template')
      }
    } catch (err) {
      console.error('Error updating template:', err)
      setError('Failed to update template')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !template) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Edit Template</h2>
              <p className="text-sm text-slate-400">Modify your workout routine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => {
                setTemplateName(e.target.value)
                setError('')
              }}
              placeholder="e.g., Push Day, Pull Day, Leg Day"
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Selected Exercises Preview */}
          {selectedExercises.length > 0 && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-cyan-400">
                  Selected ({selectedExercises.length})
                </h3>
                <button
                  onClick={() => setSelectedExercises([])}
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedExercises.map((ex, idx) => {
                  const gradientColor = CATEGORY_COLORS[ex.category] || 'from-slate-500 to-slate-600'
                  return (
                    <div
                      key={ex.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradientColor} border border-slate-600`}
                    >
                      <span className="text-xs font-bold text-white opacity-60">{idx + 1}</span>
                      <span className="text-xs text-white font-medium">{ex.name}</span>
                      <button
                        onClick={() => toggleExercise(ex)}
                        className="ml-1 text-white/60 hover:text-white transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Exercise Selection */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Modify Exercises</h3>

            {/* Search and Filter */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryDisplayName(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No exercises found
                </div>
              ) : (
                filteredExercises.map((exercise) => {
                  const isSelected = isExerciseSelected(exercise.id)
                  const gradientColor = CATEGORY_COLORS[exercise.category] || 'from-slate-500 to-slate-600'

                  return (
                    <button
                      key={exercise.id}
                      onClick={() => toggleExercise(exercise)}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-500/50'
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{exercise.name}</div>
                          <div className={`text-xs mt-1 inline-block px-2 py-0.5 rounded bg-gradient-to-r ${gradientColor}`}>
                            <span className="text-white font-medium">
                              {exercise.categoryLabel}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
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
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
