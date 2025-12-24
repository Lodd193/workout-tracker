'use client'

import { useState, useEffect } from 'react'
import { WorkoutTemplate } from '@/lib/types'
import { getAllTemplates, deleteTemplate } from '@/lib/templates'
import { CATEGORY_COLORS } from '@/lib/exercises'
import { PREMADE_TEMPLATES } from '@/lib/premadeTemplates'

interface TemplateSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: WorkoutTemplate) => void
}

export default function TemplateSelector({ isOpen, onClose, onSelectTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = () => {
    const allTemplates = getAllTemplates()
    setTemplates(allTemplates)
  }

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteTemplate(id)
      loadTemplates()
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const handleSelect = (template: WorkoutTemplate) => {
    onSelectTemplate(template)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">My Templates</h2>
              <p className="text-sm text-slate-400">{templates.length} saved workout{templates.length !== 1 ? 's' : ''}</p>
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

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-slate-400 text-lg mb-2">No templates yet</p>
              <p className="text-slate-500 text-sm">
                Add exercises to a workout and click "Save as Template" to create your first routine
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{template.name}</h3>
                      <p className="text-slate-400 text-sm">
                        {template.exercises.length} exercise{template.exercises.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelect(template)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          confirmDelete === template.id
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400'
                        }`}
                      >
                        {confirmDelete === template.id ? 'Confirm?' : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Exercise List */}
                  <div className="flex flex-wrap gap-2">
                    {template.exercises.map((ex, idx) => {
                      const gradientColor = CATEGORY_COLORS[ex.category] || 'from-slate-500 to-slate-600'
                      return (
                        <div
                          key={idx}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${gradientColor} bg-opacity-20 border border-slate-600`}
                        >
                          <span className="text-xs font-bold text-white opacity-60">{idx + 1}</span>
                          <span className="text-xs text-white font-medium">{ex.name}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                    Created {new Date(template.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
