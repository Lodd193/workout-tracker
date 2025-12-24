'use client'

import { useState, useEffect } from 'react'
import { SetBySetAnalysis } from '@/lib/types'
import { fetchSetBySetAnalysis } from '@/lib/api/progressive-overload'
import { useSettings } from '@/lib/contexts/SettingsContext'
import ChartSkeleton from './charts/ChartSkeleton'

interface SetConsistencyAnalysisProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function SetConsistencyAnalysis({
  selectedExercise,
  exercises,
  onExerciseChange,
}: SetConsistencyAnalysisProps) {
  const { formatWeight } = useSettings()
  const [analysis, setAnalysis] = useState<SetBySetAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalysis()
  }, [selectedExercise])

  const loadAnalysis = async () => {
    if (!selectedExercise) return
    setLoading(true)
    try {
      const data = await fetchSetBySetAnalysis(selectedExercise, 5)
      setAnalysis(data)
    } catch (error) {
      console.error('Error loading set consistency analysis:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return <ChartSkeleton />
  }

  if (!analysis) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 backdrop-blur-md text-center">
        <h3 className="text-white font-semibold mb-2">Set-by-Set Consistency</h3>
        <p className="text-slate-400 text-sm">No data available for this exercise</p>
      </div>
    )
  }

  const ratingColors = {
    'excellent': { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400' },
    'good': { bg: 'bg-green-500/20', border: 'border-green-500/50', text: 'text-green-400' },
    'fair': { bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', text: 'text-yellow-400' },
    'needs-improvement': { bg: 'bg-red-500/20', border: 'border-red-500/50', text: 'text-red-400' },
  }

  const colors = ratingColors[analysis.consistency_rating]

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Set-by-Set Consistency</h2>
            <p className="text-slate-400 text-sm">Analyze performance drop-off across sets</p>
          </div>
        </div>

        {/* Exercise Selector */}
        <select
          value={selectedExercise}
          onChange={(e) => onExerciseChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
        >
          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>

      {/* Overall Rating Card */}
      <div className={`border-2 ${colors.border} ${colors.bg} rounded-xl p-5 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-slate-300 text-sm mb-1">Consistency Rating</div>
            <div className={`text-2xl font-bold ${colors.text}`}>
              {analysis.consistency_rating.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </div>
          </div>
          <div className="text-right">
            <div className="text-slate-300 text-sm mb-1">Avg Drop-Off</div>
            <div className={`text-2xl font-bold ${colors.text}`}>
              {analysis.avg_drop_off}%
            </div>
          </div>
        </div>
        <div className={`${colors.bg} rounded-lg p-3 border ${colors.border}`}>
          <p className="text-white text-sm">
            <span className="font-semibold">💡 Insight:</span> {analysis.recommendation}
          </p>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Recent Sessions</h3>
        {analysis.recent_sessions.map((session, idx) => (
          <SessionCard
            key={session.date}
            session={session}
            formatWeight={formatWeight}
            isLatest={idx === analysis.recent_sessions.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function SessionCard({
  session,
  formatWeight,
  isLatest,
}: {
  session: SetBySetAnalysis['recent_sessions'][0]
  formatWeight: (kg: number) => string
  isLatest: boolean
}) {
  const dropOffColor = session.drop_off_percentage < 10 ? 'text-emerald-400' :
                       session.drop_off_percentage < 20 ? 'text-yellow-400' : 'text-red-400'

  const formattedDate = new Date(session.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className={`bg-slate-700/40 border rounded-xl p-4 ${isLatest ? 'border-teal-500/50 ring-2 ring-teal-500/20' : 'border-slate-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">{formattedDate}</span>
          {isLatest && (
            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs font-semibold rounded-full border border-teal-500/30">
              Latest
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-xs">Drop-off</div>
          <div className={`font-bold ${dropOffColor}`}>{session.drop_off_percentage}%</div>
        </div>
      </div>

      {/* Sets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {session.sets.map((set, idx) => (
          <SetBadge
            key={idx}
            set={set}
            formatWeight={formatWeight}
            isFirst={idx === 0}
            isLast={idx === session.sets.length - 1}
          />
        ))}
      </div>

      {/* Session Summary */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-600">
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">Avg Weight</div>
          <div className="text-white font-semibold text-sm">{formatWeight(session.avg_weight)}</div>
        </div>
        <div className="text-center">
          <div className="text-slate-400 text-xs mb-1">Total Volume</div>
          <div className="text-white font-semibold text-sm">{session.total_volume}kg</div>
        </div>
      </div>
    </div>
  )
}

function SetBadge({
  set,
  formatWeight,
  isFirst,
  isLast,
}: {
  set: { set_number: number; weight_kg: number; reps: number; volume: number }
  formatWeight: (kg: number) => string
  isFirst: boolean
  isLast: boolean
}) {
  const bgColor = isFirst ? 'bg-teal-500/20 border-teal-500/50' :
                  isLast ? 'bg-slate-600/30 border-slate-500' : 'bg-slate-700/50 border-slate-600'

  return (
    <div className={`rounded-lg p-2 border ${bgColor}`}>
      <div className="text-xs text-slate-400 mb-1">Set {set.set_number}</div>
      <div className="text-white font-semibold text-sm">{formatWeight(set.weight_kg)}</div>
      <div className="text-slate-400 text-xs">{set.reps} reps</div>
    </div>
  )
}
