'use client'

import { useState, useEffect } from 'react'
import { ProgressiveOverloadRecommendation } from '@/lib/types'
import { generateProgressiveOverloadRecommendation } from '@/lib/api/progressive-overload'
import { useSettings } from '@/lib/contexts/SettingsContext'
import ChartSkeleton from './charts/ChartSkeleton'

interface ProgressiveOverloadPanelProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function ProgressiveOverloadPanel({
  selectedExercise,
  exercises,
  onExerciseChange,
}: ProgressiveOverloadPanelProps) {
  const { formatWeight } = useSettings()
  const [recommendation, setRecommendation] = useState<ProgressiveOverloadRecommendation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecommendation()
  }, [selectedExercise])

  const loadRecommendation = async () => {
    if (!selectedExercise) return
    setLoading(true)
    try {
      const rec = await generateProgressiveOverloadRecommendation(selectedExercise)
      setRecommendation(rec)
    } catch (error) {
      console.error('Error loading progressive overload recommendation:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return <ChartSkeleton />
  }

  if (!recommendation) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 backdrop-blur-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-2">Progressive Overload Recommendations</h3>
        <p className="text-slate-400 text-sm">
          Need at least 6 sets of data to generate recommendations
        </p>
      </div>
    )
  }

  const confidenceColors = {
    high: 'from-emerald-500 to-green-500',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-slate-500 to-slate-600',
  }

  const confidenceBorderColors = {
    high: 'border-emerald-500/50',
    medium: 'border-yellow-500/50',
    low: 'border-slate-500/50',
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Progressive Overload</h2>
            <p className="text-slate-400 text-sm">Smart weight progression recommendations</p>
          </div>
        </div>

        {/* Exercise Selector */}
        <select
          value={selectedExercise}
          onChange={(e) => onExerciseChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        >
          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>

      {/* Main Recommendation Card */}
      <div className={`border-2 ${confidenceBorderColors[recommendation.confidence]} rounded-xl p-6 mb-6 bg-slate-700/30`}>
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${confidenceColors[recommendation.confidence]} text-white text-sm font-semibold`}>
            {recommendation.confidence.charAt(0).toUpperCase() + recommendation.confidence.slice(1)} Confidence
          </span>
          {recommendation.ready_to_progress && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-semibold border border-emerald-500/30">
              ✓ Ready to Progress
            </span>
          )}
        </div>

        {/* Recommendation Text */}
        <div className="mb-6">
          <p className="text-white text-lg leading-relaxed">
            {recommendation.reasoning}
          </p>
        </div>

        {/* Weight Progression */}
        <div className="flex items-center gap-4 justify-center mb-6">
          <div className="text-center">
            <div className="text-slate-400 text-sm mb-1">Current Weight</div>
            <div className="text-3xl font-bold text-white">
              {formatWeight(recommendation.current_working_weight)}
            </div>
          </div>

          <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>

          <div className="text-center">
            <div className="text-slate-400 text-sm mb-1">Suggested Next</div>
            <div className={`text-3xl font-bold bg-gradient-to-r ${confidenceColors[recommendation.confidence]} bg-clip-text text-transparent`}>
              {formatWeight(recommendation.suggested_next_weight)}
            </div>
          </div>
        </div>

        {/* Consistency Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm">Performance Consistency</span>
            <span className="text-white font-semibold">{recommendation.consistency_score}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${confidenceColors[recommendation.confidence]} transition-all duration-500`}
              style={{ width: `${recommendation.consistency_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TipCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="When to Increase"
          description="Hit 10+ reps consistently for 2-3 sessions before adding weight"
        />
        <TipCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="Rest Between Sets"
          description="2-3 minutes for heavy compounds, 60-90s for accessories"
        />
        <TipCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          title="Deload Weeks"
          description="Every 4-6 weeks, reduce weight by 40% to recover"
        />
        <TipCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="Track Everything"
          description="Log every set to identify patterns and optimize progression"
        />
      </div>
    </div>
  )
}

function TipCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/50 hover:border-orange-500/50 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
          <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
