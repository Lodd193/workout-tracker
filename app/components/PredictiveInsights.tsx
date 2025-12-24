'use client'

import { useState, useEffect } from 'react'
import { PRPrediction, PlateauAlert, MilestonePrediction } from '@/lib/types'
import { generatePRPredictions, detectPlateaus, generateCommonMilestones } from '@/lib/api/predictions'
import { useSettings } from '@/lib/contexts/SettingsContext'
import ChartSkeleton from './charts/ChartSkeleton'

export default function PredictiveInsights() {
  const { formatWeight } = useSettings()
  const [prPredictions, setPrPredictions] = useState<PRPrediction[]>([])
  const [plateauAlerts, setPlateauAlerts] = useState<PlateauAlert[]>([])
  const [milestones, setMilestones] = useState<MilestonePrediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      const [predictions, alerts, commonMilestones] = await Promise.all([
        generatePRPredictions(),
        detectPlateaus(),
        generateCommonMilestones(),
      ])

      setPrPredictions(predictions)
      setPlateauAlerts(alerts)
      setMilestones(commonMilestones)
    } catch (error) {
      console.error('Error loading predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ChartSkeleton />
  }

  const hasAnyData = prPredictions.length > 0 || plateauAlerts.length > 0 || milestones.length > 0

  if (!hasAnyData) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 backdrop-blur-md text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Insufficient Data for Predictions</h3>
        <p className="text-slate-400 text-sm">
          Log more workouts to unlock AI-powered insights and predictions
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* PR Predictions */}
      {prPredictions.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">PR Predictions</h2>
              <p className="text-slate-400 text-sm">Projected personal records in the next 30 days</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prPredictions.map((prediction) => (
              <PRPredictionCard key={prediction.exercise_name} prediction={prediction} formatWeight={formatWeight} />
            ))}
          </div>
        </div>
      )}

      {/* Plateau Alerts */}
      {plateauAlerts.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Plateau Alerts</h2>
              <p className="text-slate-400 text-sm">Exercises showing no recent progress</p>
            </div>
          </div>

          <div className="space-y-3">
            {plateauAlerts.map((alert) => (
              <PlateauAlertCard key={alert.exercise_name} alert={alert} formatWeight={formatWeight} />
            ))}
          </div>
        </div>
      )}

      {/* Milestone Predictions */}
      {milestones.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Upcoming Milestones</h2>
              <p className="text-slate-400 text-sm">Major weight targets you're approaching</p>
            </div>
          </div>

          <div className="space-y-3">
            {milestones.map((milestone, index) => (
              <MilestoneCard key={`${milestone.exercise_name}-${milestone.milestone_weight}`} milestone={milestone} formatWeight={formatWeight} rank={index + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// PR Prediction Card
function PRPredictionCard({
  prediction,
  formatWeight
}: {
  prediction: PRPrediction
  formatWeight: (kg: number) => string
}) {
  const confidenceColors = {
    high: 'from-emerald-500 to-green-500',
    medium: 'from-yellow-500 to-orange-500',
    low: 'from-slate-500 to-slate-600',
  }

  const confidenceLabels = {
    high: 'High Confidence',
    medium: 'Medium Confidence',
    low: 'Low Confidence',
  }

  const gain = prediction.predicted_pr - prediction.current_pr

  return (
    <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-4 hover:border-slate-500 transition-all">
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-semibold text-sm">{prediction.exercise_name}</h4>
        <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${confidenceColors[prediction.confidence]}
                       text-white text-xs font-semibold`}>
          {confidenceLabels[prediction.confidence]}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-400">{formatWeight(prediction.predicted_pr)}</span>
          <span className="text-slate-400 text-sm">
            (+{formatWeight(gain)})
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Current PR: <span className="text-white font-semibold">{formatWeight(prediction.current_pr)}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            By {new Date(prediction.predicted_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Gaining {formatWeight(prediction.weekly_gain)}/week</span>
        </div>
      </div>
    </div>
  )
}

// Plateau Alert Card
function PlateauAlertCard({
  alert,
  formatWeight
}: {
  alert: PlateauAlert
  formatWeight: (kg: number) => string
}) {
  const severityColors = {
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    concern: 'border-orange-500/50 bg-orange-500/10',
    critical: 'border-red-500/50 bg-red-500/10',
  }

  const severityIcons = {
    warning: '⚠️',
    concern: '🔴',
    critical: '🚨',
  }

  return (
    <div className={`border rounded-xl p-4 ${severityColors[alert.severity]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{severityIcons[alert.severity]}</span>
          <h4 className="text-white font-semibold">{alert.exercise_name}</h4>
        </div>
        <span className="text-slate-400 text-sm">{alert.days_since_progress} days</span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="text-slate-300">
          Last PR: <span className="text-white font-semibold">{formatWeight(alert.last_pr_weight)}</span>
          {' '}on{' '}
          {new Date(alert.last_pr_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </div>

        <div className="text-slate-300 bg-slate-700/50 rounded-lg p-3">
          <span className="font-semibold text-white">💡 Recommendation:</span>
          <p className="mt-1">{alert.recommendation}</p>
        </div>
      </div>
    </div>
  )
}

// Milestone Card
function MilestoneCard({
  milestone,
  formatWeight,
  rank
}: {
  milestone: MilestonePrediction
  formatWeight: (kg: number) => string
  rank: number
}) {
  const progress = (milestone.current_weight / milestone.milestone_weight) * 100

  return (
    <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-4 hover:border-cyan-500 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">#{rank}</span>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">{milestone.exercise_name}</h4>
            <p className="text-cyan-400 font-bold">{formatWeight(milestone.milestone_weight)} Milestone</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>{formatWeight(milestone.current_weight)}</span>
          <span>{progress.toFixed(0)}%</span>
          <span>{formatWeight(milestone.milestone_weight)}</span>
        </div>
      </div>

      {milestone.estimated_date && milestone.weeks_remaining && (
        <div className="flex items-center justify-between text-sm">
          <div className="text-slate-400">
            <span className="text-white font-semibold">{milestone.weeks_remaining}</span>{' '}
            {milestone.weeks_remaining === 1 ? 'week' : 'weeks'} away
          </div>
          <div className="text-slate-400">
            {new Date(milestone.estimated_date).toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </div>
      )}
    </div>
  )
}
