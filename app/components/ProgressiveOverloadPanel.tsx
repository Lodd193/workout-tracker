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

export default function ProgressiveOverloadPanel({ selectedExercise }: ProgressiveOverloadPanelProps) {
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
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-[#1A1A1A] rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-white font-semibold mb-2">Progressive Overload</h3>
        <p className="text-zinc-600 text-sm">Need at least 6 sets of data to generate recommendations</p>
      </div>
    )
  }

  const confidenceColors = {
    high: 'from-lime-400 to-lime-500',
    medium: 'from-yellow-400 to-amber-500',
    low: 'from-zinc-500 to-zinc-600',
  }

  const confidenceBorderColors = {
    high: 'border-lime-400/25',
    medium: 'border-yellow-400/25',
    low: 'border-[#333333]',
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Progressive Overload</h2>
          <p className="text-zinc-600 text-sm">Weight progression recommendation</p>
        </div>
      </div>

      <div className={`border ${confidenceBorderColors[recommendation.confidence]} rounded-xl p-5 mb-5 bg-[#0D0D0D]`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${confidenceColors[recommendation.confidence]} text-black text-xs font-bold uppercase tracking-wide`}>
            {recommendation.confidence} confidence
          </span>
          {recommendation.ready_to_progress && (
            <span className="px-2.5 py-1 rounded-full bg-lime-400/10 text-lime-400 text-xs font-bold border border-lime-400/20">
              Ready to progress
            </span>
          )}
        </div>

        <p className="text-white text-base leading-relaxed mb-5">{recommendation.reasoning}</p>

        <div className="flex items-center gap-6 justify-center mb-5">
          <div className="text-center">
            <div className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Current</div>
            <div className="text-3xl font-black text-white">{formatWeight(recommendation.current_working_weight)}</div>
          </div>
          <svg className="w-6 h-6 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <div className="text-center">
            <div className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Target</div>
            <div className={`text-3xl font-black bg-gradient-to-r ${confidenceColors[recommendation.confidence]} bg-clip-text text-transparent`}>
              {formatWeight(recommendation.suggested_next_weight)}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-zinc-600 text-xs uppercase tracking-wide">Consistency</span>
            <span className="text-white text-sm font-bold">{recommendation.consistency_score}%</span>
          </div>
          <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${confidenceColors[recommendation.confidence]} transition-all duration-500`}
              style={{ width: `${recommendation.consistency_score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TipCard
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="When to Increase"
          description="Hit 10+ reps consistently for 2–3 sessions before adding weight"
        />
        <TipCard
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          title="Rest Between Sets"
          description="2–3 min for heavy compounds, 60–90s for accessories"
        />
        <TipCard
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
          title="Deload Weeks"
          description="Every 4–6 weeks, reduce weight by 40% to recover"
        />
        <TipCard
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          title="Track Everything"
          description="Log every set to identify patterns and optimise progression"
        />
      </div>
    </div>
  )
}

function TipCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-[#0D0D0D] rounded-lg p-4 border border-[#222222] hover:border-lime-400/20 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 bg-lime-400/10 rounded-lg flex items-center justify-center text-lime-400 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>
          <p className="text-zinc-600 text-xs leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}
