'use client'

import { useState, useEffect } from 'react'
import { fetchWeekComparison, WeekComparison } from '@/lib/api/analytics'

export default function WeekComparisonCard() {
  const [comparison, setComparison] = useState<WeekComparison | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const data = await fetchWeekComparison(weekOffset)
        setComparison(data)
      } catch (error) {
        console.error('Error loading week comparison:', error)
      }
      setLoading(false)
    }

    loadData()
  }, [weekOffset])

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md h-96 animate-pulse">
        <div className="h-full bg-slate-700/30 rounded-lg"></div>
      </div>
    )
  }

  if (!comparison) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
        <p className="text-slate-500 text-center">No week comparison data available</p>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Week-over-Week Comparison</h2>
          <p className="text-slate-400 text-sm mt-1">Track weekly progress and changes</p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg p-1">
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
          >
            ←
          </button>
          <div className="px-4 py-1.5 text-sm text-white">
            {weekOffset === 0 ? 'This Week' : `${weekOffset} ${weekOffset === 1 ? 'Week' : 'Weeks'} Ago`}
          </div>
          <button
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
            className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {/* Week Dates */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
          <div className="text-sm text-emerald-400 font-semibold mb-1">This Period</div>
          <div className="text-white text-sm">
            {formatDate(comparison.thisWeek.startDate)} - {formatDate(comparison.thisWeek.endDate)}
          </div>
        </div>
        <div className="text-center p-3 bg-slate-700/30 border border-slate-600 rounded-lg">
          <div className="text-sm text-slate-400 font-semibold mb-1">Previous Period</div>
          <div className="text-white text-sm">
            {formatDate(comparison.lastWeek.startDate)} - {formatDate(comparison.lastWeek.endDate)}
          </div>
        </div>
      </div>

      {/* Metrics Comparison */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Volume"
          current={`${comparison.thisWeek.totalVolume.toLocaleString()}kg`}
          previous={`${comparison.lastWeek.totalVolume.toLocaleString()}kg`}
          change={comparison.changes.volume.absolute}
          percentage={comparison.changes.volume.percentage}
        />
        <MetricCard
          label="Workout Days"
          current={comparison.thisWeek.workoutDays.toString()}
          previous={comparison.lastWeek.workoutDays.toString()}
          change={comparison.changes.workoutDays.absolute}
          isCount
        />
        <MetricCard
          label="Exercises"
          current={comparison.thisWeek.totalExercises.toString()}
          previous={comparison.lastWeek.totalExercises.toString()}
          change={comparison.changes.exercises.absolute}
          isCount
        />
        <MetricCard
          label="Avg Weight"
          current={`${comparison.thisWeek.avgWeight}kg`}
          previous={`${comparison.lastWeek.avgWeight}kg`}
          change={comparison.changes.avgWeight.absolute}
          percentage={comparison.changes.avgWeight.percentage}
        />
      </div>

      {/* Best Improvements */}
      {comparison.bestImprovements.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>🏆</span>
            Best Improvements
          </h3>
          <div className="space-y-2">
            {comparison.bestImprovements.map((improvement, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                  <span className="text-white font-medium">{improvement.exercise}</span>
                </div>
                <div className="text-emerald-400 font-bold">
                  +{improvement.change}kg ({improvement.percentage > 0 ? '+' : ''}{improvement.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Declines */}
      {comparison.declines.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>⚠️</span>
            Declines
          </h3>
          <div className="space-y-2">
            {comparison.declines.map((decline, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <span className="text-white font-medium">{decline.exercise}</span>
                <div className="text-red-400 font-bold">
                  {decline.change}kg ({decline.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data state */}
      {comparison.bestImprovements.length === 0 && comparison.declines.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>Not enough data to compare exercises between these weeks</p>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  label,
  current,
  previous,
  change,
  percentage,
  isCount = false,
}: {
  label: string
  current: string
  previous: string
  change: number
  percentage?: number
  isCount?: boolean
}) {
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <div className="bg-slate-700/30 rounded-lg p-4">
      <div className="text-slate-400 text-xs uppercase tracking-wide mb-2">{label}</div>
      <div className="flex items-baseline gap-2 mb-1">
        <div className="text-white text-xl font-bold">{current}</div>
        <div className="text-slate-500 text-sm">vs {previous}</div>
      </div>
      <div className={`text-sm font-medium flex items-center gap-1 ${
        isNeutral ? 'text-slate-400' : isPositive ? 'text-emerald-400' : 'text-red-400'
      }`}>
        {!isNeutral && (
          <span>{isPositive ? '↗' : '↘'}</span>
        )}
        <span>
          {isPositive ? '+' : ''}{isCount ? change : `${change}kg`}
          {percentage !== undefined && ` (${isPositive ? '+' : ''}${percentage}%)`}
        </span>
      </div>
    </div>
  )
}
