'use client'

import { useState, useEffect } from 'react'
import { Exercise, ExerciseCategory } from '@/lib/types'
import { EXERCISES, CATEGORY_COLORS } from '@/lib/exercises'
import CategoryFilter from './CategoryFilter'

interface ExerciseSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectExercise: (exercise: Exercise) => void
}

export default function ExerciseSelector({ isOpen, onClose, onSelectExercise }: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | 'all'>('all')

  // Filter exercises based on search and category
  const filteredExercises = EXERCISES.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise)
    setSearchTerm('')
    setSelectedCategory('all')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-900 to-slate-800 w-full max-w-2xl
                   sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[95vh] flex flex-col
                   border border-slate-700 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 pt-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-white">Select Exercise</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-slate-700/50 hover:bg-slate-700
                         text-slate-400 hover:text-white transition-all duration-200
                         flex items-center justify-center"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
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
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2.5
                         text-white placeholder:text-slate-500
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                         transition-all duration-200"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2
                           text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 py-4 border-b border-slate-700">
          <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 min-h-[40vh]">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No exercises found</p>
              <p className="text-slate-500 text-sm mt-2">Try adjusting your search or category filter</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const gradientColor = CATEGORY_COLORS[exercise.category]
              return (
                <button
                  key={exercise.id}
                  onClick={() => handleSelectExercise(exercise)}
                  className="w-full bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700
                             hover:border-slate-600 rounded-lg p-3 transition-all duration-200
                             flex items-center gap-3 group"
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-br ${gradientColor}
                               group-hover:scale-125 transition-transform shadow-lg`}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                      {exercise.name}
                    </p>
                    <p className="text-slate-500 text-sm">{exercise.categoryLabel}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-slate-600 group-hover:text-emerald-400
                               group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-900/50">
          <p className="text-slate-400 text-xs text-center">
            Showing {filteredExercises.length} of {EXERCISES.length} exercises
          </p>
        </div>
      </div>
    </div>
  )
}
