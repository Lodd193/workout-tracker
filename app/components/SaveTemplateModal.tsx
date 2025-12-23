'use client'

import { useState, useEffect } from 'react'
import { SelectedExercise } from '@/lib/types'
import { saveTemplate, templateNameExists } from '@/lib/templates'

interface SaveTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  exercises: SelectedExercise[]
  onSaved: () => void
}

export default function SaveTemplateModal({ isOpen, onClose, exercises, onSaved }: SaveTemplateModalProps) {
  const [templateName, setTemplateName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTemplateName('')
      setError('')
    }
  }, [isOpen])

  const handleSave = () => {
    // Validation
    if (!templateName.trim()) {
      setError('Please enter a template name')
      return
    }

    if (templateNameExists(templateName.trim())) {
      setError('A template with this name already exists')
      return
    }

    if (exercises.length === 0) {
      setError('No exercises to save')
      return
    }

    setSaving(true)

    try {
      // Convert selected exercises to template format
      const templateExercises = exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
      }))

      saveTemplate(templateName.trim(), templateExercises)
      onSaved()
      onClose()
    } catch (err) {
      console.error('Error saving template:', err)
      setError('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Save as Template</h2>
              <p className="text-sm text-slate-400">Reuse this workout anytime</p>
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

        {/* Exercise Preview */}
        <div className="mb-4">
          <div className="text-sm text-slate-400 mb-2">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}:</div>
          <div className="bg-slate-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
            <div className="space-y-1">
              {exercises.map((ex, idx) => (
                <div key={ex.id} className="text-sm text-slate-300 flex items-center gap-2">
                  <span className="text-emerald-400">{idx + 1}.</span>
                  {ex.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Template Name Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value)
              setError('')
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., Push Day, Pull Day, Leg Day"
            autoFocus
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Actions */}
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
            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  )
}
