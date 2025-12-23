'use client'

import { useState, useEffect } from 'react'
import { fetch1RMHistory, fetchProgressRate, OneRMDataPoint, ProgressMetrics } from '@/lib/api/analytics'

interface AdvancedMetricsPanelProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function AdvancedMetricsPanel({
  selectedExercise,
  exercises,
  onExerciseChange,
}: AdvancedMetricsPanelProps) {
  const [oneRMHistory, setOneRMHistory] = useState<OneRMDataPoint[]>([])
  const [progress7Days, setProgress7Days] = useState<ProgressMetrics | null>(null)
  const [progress30Days, setProgress30Days] = useState<ProgressMetrics | null>(null)
  const [progress90Days, setProgress90Days] = useState<ProgressMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!selectedExercise) return

      setLoading(true)
      try {
        const [history, p7, p30, p90] = await Promise.all([
          fetch1RMHistory(selectedExercise),
          fetchProgressRate(selectedExercise, 7),
          fetchProgressRate(selectedExercise, 30),
          fetchProgressRate(selectedExercise, 90),
        ])

        setOneRMHistory(history)
        setProgress7Days(p7)
        setProgress30Days(p30)
        setProgress90Days(p90)
      } catch (error) {
        console.error('Error loading advanced metrics:', error)
      }
      setLoading(false)
    }

    loadData()
  }, [selectedExercise])

  const current1RM = oneRMHistory.length > 0 ? oneRMHistory[oneRMHistory.length - 1].estimated1RM : 0
  const first1RM = oneRMHistory.length > 0 ? oneRMHistory[0].estimated1RM : 0
  const allTimeGain = current1RM - first1RM
  const allTimePercentage = first1RM > 0 ? (allTimeGain / first1RM) * 100 : 0

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md h-64 animate-pulse">
        <div className="h-full bg-slate-700/30 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Advanced Metrics</h2>
          <p className="text-slate-400 text-sm mt-1">1RM estimates and progress rates</p>
        </div>

        <select
          value={selectedExercise}
          onChange={(e) => onExerciseChange(e.target.value)}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {exercises.map((exercise) => (
            <option key={exercise} value={exercise}>
              {exercise}
            </option>
          ))}
        </select>
      </div>

      {oneRMHistory.length > 0 ? (
        <div className="space-y-6">
          {/* 1RM Card */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-emerald-400 font-semibold">Estimated 1 Rep Max</div>
                <div className="text-3xl font-bold text-white">{current1RM} kg</div>
              </div>
            </div>
            <div className="text-sm text-slate-300">
              Based on: {oneRMHistory[oneRMHistory.length - 1].actualWeight}kg × {oneRMHistory[oneRMHistory.length - 1].actualReps} reps
            </div>
            <div className="mt-3 pt-3 border-t border-emerald-500/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">All-time gain:</span>
                <span className={`font-bold ${allTimeGain > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {allTimeGain > 0 ? '+' : ''}{allTimeGain.toFixed(1)}kg ({allTimePercentage > 0 ? '+' : ''}{allTimePercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Progress Rates Grid */}
          <div>
            <h3 className="text-white font-semibold mb-3">Progress Tracking</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 7 Days */}
              <ProgressCard
                label="Last 7 Days"
                metrics={progress7Days}
                icon="📅"
              />

              {/* 30 Days */}
              <ProgressCard
                label="Last 30 Days"
                metrics={progress30Days}
                icon="📊"
              />

              {/* 90 Days */}
              <ProgressCard
                label="Last 90 Days"
                metrics={progress90Days}
                icon="📈"
              />
            </div>
          </div>

          {/* Trend Insight */}
          {progress30Days && (
            <div className={`rounded-lg p-4 ${
              progress30Days.trend === 'Gaining'
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : progress30Days.trend === 'Declining'
                ? 'bg-red-500/10 border border-red-500/30'
                : 'bg-slate-700/30 border border-slate-600'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {progress30Days.trend === 'Gaining' ? '🚀' : progress30Days.trend === 'Declining' ? '⚠️' : '😐'}
                </span>
                <div>
                  <div className={`font-semibold ${
                    progress30Days.trend === 'Gaining'
                      ? 'text-emerald-400'
                      : progress30Days.trend === 'Declining'
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}>
                    {progress30Days.trend === 'Gaining' && 'Excellent Progress!'}
                    {progress30Days.trend === 'Declining' && 'Strength Declining'}
                    {progress30Days.trend === 'Plateau' && 'Maintaining Strength'}
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    {progress30Days.trend === 'Gaining' && `At this rate: +${(progress30Days.weeklyRate * 4).toFixed(1)}kg per month`}
                    {progress30Days.trend === 'Declining' && 'Consider deload or check recovery'}
                    {progress30Days.trend === 'Plateau' && 'Try progressive overload or new variation'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>No data available for this exercise</p>
        </div>
      )}
    </div>
  )
}

function ProgressCard({ label, metrics, icon }: { label: string; metrics: ProgressMetrics | null; icon: string }) {
  if (!metrics) return null

  return (
    <div className="bg-slate-700/30 rounded-lg p-4">
      <div className="text-slate-400 text-xs uppercase tracking-wide mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </div>
      <div className={`text-2xl font-bold mb-1 ${
        metrics.absolute > 0 ? 'text-emerald-400' : metrics.absolute < 0 ? 'text-red-400' : 'text-slate-400'
      }`}>
        {metrics.absolute > 0 ? '+' : ''}{metrics.absolute}kg
      </div>
      <div className={`text-sm ${
        metrics.percentage > 0 ? 'text-emerald-400' : metrics.percentage < 0 ? 'text-red-400' : 'text-slate-400'
      }`}>
        {metrics.percentage > 0 ? '+' : ''}{metrics.percentage}%
      </div>
      <div className="text-xs text-slate-500 mt-2">
        {metrics.trend}
        {metrics.weeklyRate !== 0 && ` • ${metrics.weeklyRate > 0 ? '+' : ''}${metrics.weeklyRate}kg/week`}
      </div>
    </div>
  )
}
