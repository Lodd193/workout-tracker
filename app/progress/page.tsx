'use client'

import { useState, useEffect } from 'react'
import {
  fetchAnalyticsSummary,
  fetchPersonalRecords,
  fetchWorkoutFrequency,
  fetchUniqueExercises,
} from '@/lib/api/analytics'
import { AnalyticsSummary, PersonalRecord, WorkoutDayData } from '@/lib/types'
import WeightProgressionChart from '@/app/components/charts/WeightProgressionChart'
import PersonalRecordsGrid from '@/app/components/charts/PersonalRecordsGrid'
import WorkoutFrequencyHeatmap from '@/app/components/charts/WorkoutFrequencyHeatmap'
import ChartSkeleton from '@/app/components/charts/ChartSkeleton'
import VolumeProgressionChart from '@/app/components/charts/VolumeProgressionChart'
import AdvancedMetricsPanel from '@/app/components/charts/AdvancedMetricsPanel'
import WeekComparisonCard from '@/app/components/charts/WeekComparisonCard'

export default function ProgressPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [frequencyData, setFrequencyData] = useState<WorkoutDayData[]>([])
  const [exercises, setExercises] = useState<string[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [summaryData, prData, freqData, exerciseList] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchPersonalRecords(),
          fetchWorkoutFrequency(),
          fetchUniqueExercises(),
        ])

        setSummary(summaryData)
        setPersonalRecords(prData)
        setFrequencyData(freqData)
        setExercises(exerciseList)

        // Auto-select first exercise if available
        if (exerciseList.length > 0) {
          setSelectedExercise(exerciseList[0])
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (!summary || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <svg className="w-20 h-20 mx-auto text-slate-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-slate-300 mb-3">No Workout Data Yet</h2>
            <p className="text-slate-500">Start logging workouts to see your progress analytics</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400
                       bg-clip-text text-transparent tracking-tight"
          >
            Your Progress
          </h1>
          <p className="text-slate-400 mt-2">Track your strength gains and consistency</p>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Workouts" value={summary.totalWorkouts} icon="calendar" />
          <StatCard label="Total Sets" value={summary.totalSets} icon="layers" />
          <StatCard label="Exercises" value={summary.totalExercises} icon="activity" />
          <StatCard label="Current Streak" value={`${summary.currentStreak}d`} icon="flame" highlight />
          <StatCard label="Longest Streak" value={`${summary.longestStreak}d`} icon="trophy" />
          <StatCard label="Avg/Week" value={summary.avgWorkoutsPerWeek} icon="trending" />
        </div>

        {/* Weight Progression Chart */}
        <WeightProgressionChart
          selectedExercise={selectedExercise}
          exercises={exercises}
          onExerciseChange={setSelectedExercise}
        />

        {/* Volume Progression Chart */}
        <VolumeProgressionChart
          selectedExercise={selectedExercise}
          exercises={exercises}
          onExerciseChange={setSelectedExercise}
        />

        {/* Advanced Metrics Panel (1RM & Progress Rates) */}
        <AdvancedMetricsPanel
          selectedExercise={selectedExercise}
          exercises={exercises}
          onExerciseChange={setSelectedExercise}
        />

        {/* Week-over-Week Comparison */}
        <WeekComparisonCard />

        {/* Personal Records Grid */}
        <PersonalRecordsGrid records={personalRecords} />

        {/* Workout Frequency Heatmap */}
        <WorkoutFrequencyHeatmap data={frequencyData} />
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
  highlight = false,
}: {
  label: string
  value: string | number
  icon: string
  highlight?: boolean
}) {
  const iconPaths: Record<string, string> = {
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    layers: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    activity: 'M13 10V3L4 14h7v7l9-11h-7z',
    flame:
      'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z',
    trophy: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    trending: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  }

  return (
    <div
      className={`bg-slate-800/60 border rounded-xl p-4 backdrop-blur-md
                    transition-all duration-300 hover:border-slate-600 ${
                      highlight ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' : 'border-slate-700'
                    }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            highlight ? 'bg-gradient-to-br from-emerald-500 to-cyan-500' : 'bg-slate-700'
          }`}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[icon]} />
          </svg>
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
    </div>
  )
}
