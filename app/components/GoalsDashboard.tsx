'use client'

import { useState, useEffect } from 'react'
import { GoalProgress } from '@/lib/types'
import { fetchAllGoalsProgress } from '@/lib/api/goals'
import { useSettings } from '@/lib/contexts/SettingsContext'
import ChartSkeleton from './charts/ChartSkeleton'

export default function GoalsDashboard() {
  const { formatWeight } = useSettings()
  const [goalsProgress, setGoalsProgress] = useState<GoalProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGoalsProgress()
  }, [])

  const loadGoalsProgress = async () => {
    try {
      const data = await fetchAllGoalsProgress()
      setGoalsProgress(data)
    } catch (error) {
      console.error('Error loading goals progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <ChartSkeleton />
  }

  if (goalsProgress.length === 0) {
    return null // Don't show anything if no goals
  }

  // Separate achieved and active goals
  const achievedGoals = goalsProgress.filter(gp => gp.isAchieved)
  const activeGoals = goalsProgress.filter(gp => !gp.isAchieved)

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Weight Goals
          </h2>
          <p className="text-slate-400 text-sm mt-1">Track progress toward your targets</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{activeGoals.length}</div>
          <div className="text-xs text-slate-400">Active Goals</div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        {activeGoals.map((progress) => (
          <GoalProgressCard key={progress.goal.id} progress={progress} formatWeight={formatWeight} />
        ))}
      </div>

      {/* Achieved Goals Section */}
      {achievedGoals.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd" />
            </svg>
            Achieved Goals ({achievedGoals.length})
          </h3>
          <div className="space-y-3">
            {achievedGoals.map((progress) => (
              <AchievedGoalCard key={progress.goal.id} progress={progress} formatWeight={formatWeight} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Progress Card for Active Goals
function GoalProgressCard({
  progress,
  formatWeight
}: {
  progress: GoalProgress
  formatWeight: (kg: number) => string
}) {
  const { goal, currentWeight, progressPercentage, weightRemaining, onTrackStatus, daysRemaining } = progress

  // Color based on on-track status
  const statusColors = {
    'ahead': 'from-emerald-500 to-green-500',
    'on-track': 'from-sky-500 to-indigo-500',
    'behind': 'from-orange-500 to-red-500',
    'unknown': 'from-slate-500 to-slate-600',
  }

  const statusLabels = {
    'ahead': 'Ahead of Schedule',
    'on-track': 'On Track',
    'behind': 'Behind Schedule',
    'unknown': 'Insufficient Data',
  }

  const statusIcons = {
    'ahead': (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd" />
      </svg>
    ),
    'on-track': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    'behind': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    'unknown': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  }

  return (
    <div className="bg-slate-700/40 border border-slate-600 rounded-xl p-5 hover:border-slate-500 transition-all">
      {/* Exercise Name and Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="text-white font-semibold text-lg">{goal.exercise_name}</h4>
          {goal.target_date && daysRemaining !== null && (
            <p className="text-slate-400 text-sm mt-1">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}
            </p>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${statusColors[onTrackStatus]}
                       text-white text-xs font-semibold flex items-center gap-1.5`}>
          {statusIcons[onTrackStatus]}
          {statusLabels[onTrackStatus]}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="h-8 bg-slate-700/50 rounded-lg overflow-hidden">
          <div
            className={`h-full transition-all duration-500 bg-gradient-to-r ${statusColors[onTrackStatus]}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-white">{formatWeight(currentWeight)}</div>
          <div className="text-xs text-slate-400">Current</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-emerald-400">{formatWeight(goal.target_weight_kg)}</div>
          <div className="text-xs text-slate-400">Target</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-orange-400">{formatWeight(weightRemaining)}</div>
          <div className="text-xs text-slate-400">Remaining</div>
        </div>
      </div>

      {/* Progress Rate Info */}
      {progress.progressRate > 0 && (
        <div className="mt-3 text-sm text-slate-400 text-center">
          Progressing at <span className="text-white font-semibold">{formatWeight(progress.progressRate)}/week</span>
          {progress.estimatedCompletion && (
            <span className="ml-2">
              • Est. completion:{' '}
              <span className="text-white font-semibold">
                {new Date(progress.estimatedCompletion).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Card for Achieved Goals
function AchievedGoalCard({
  progress,
  formatWeight
}: {
  progress: GoalProgress
  formatWeight: (kg: number) => string
}) {
  const { goal, currentWeight } = progress

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            {goal.exercise_name}
          </h4>
          <p className="text-emerald-400 font-bold mt-1">
            Target: {formatWeight(goal.target_weight_kg)} - Achieved!
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Current PR: {formatWeight(currentWeight)}
          </p>
        </div>
        {goal.achieved_at && (
          <div className="text-right text-sm text-slate-400">
            Achieved on<br />
            {new Date(goal.achieved_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        )}
      </div>
    </div>
  )
}
