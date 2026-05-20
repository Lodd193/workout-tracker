'use client'

import { useState, useEffect } from 'react'
import {
  fetchAnalyticsSummary,
  fetchPersonalRecords,
  fetchUniqueExercises,
} from '@/lib/api/analytics'
import { AnalyticsSummary, PersonalRecord } from '@/lib/types'
import { useSettings } from '@/lib/contexts/SettingsContext'
import WeightProgressionChart from '@/app/components/charts/WeightProgressionChart'
import PersonalRecordsGrid from '@/app/components/charts/PersonalRecordsGrid'
import ChartSkeleton from '@/app/components/charts/ChartSkeleton'
import VolumeProgressionChart from '@/app/components/charts/VolumeProgressionChart'
import WorkoutCalendar from '@/app/components/WorkoutCalendar'
import WeeklyCardioTracker from '@/app/components/WeeklyCardioTracker'
import ProgressiveOverloadPanel from '@/app/components/ProgressiveOverloadPanel'

export default function ProgressPage() {
  const { formatWeight } = useSettings()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([])
  const [exercises, setExercises] = useState<string[]>([])
  const [selectedExercise, setSelectedExercise] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [summaryData, prData, exerciseList] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchPersonalRecords(),
          fetchUniqueExercises(),
        ])
        setSummary(summaryData)
        setPersonalRecords(prData)
        setExercises(exerciseList)
        if (exerciseList.length > 0) setSelectedExercise(exerciseList[0])
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
      <div className="min-h-screen bg-black py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (!summary || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-black py-8 px-4">
        <div className="max-w-5xl mx-auto text-center py-24">
          <div className="text-7xl font-black text-white mb-4">0</div>
          <p className="text-zinc-500 text-lg">No workouts logged yet.</p>
          <p className="text-zinc-600 text-sm mt-2">Start training to see your progress.</p>
        </div>
      </div>
    )
  }

  const topPR = [...personalRecords].sort((a, b) => b.max_weight - a.max_weight)[0]

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Hero Stats */}
        <div className="grid grid-cols-3 divide-x divide-[#222222] border border-[#222222] rounded-xl overflow-hidden">
          <HeroStat
            value={`${summary.currentStreak}`}
            label="DAY STREAK"
            accent
          />
          <HeroStat
            value={topPR ? formatWeight(topPR.max_weight) : '—'}
            label={topPR ? `${topPR.exercise_name.slice(0, 14).toUpperCase()} PR` : 'NO PR YET'}
          />
          <HeroStat
            value={String(summary.avgWorkoutsPerWeek)}
            label="AVG / WEEK"
          />
        </div>

        {/* Page-level Exercise Selector */}
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 text-xs uppercase tracking-widest font-semibold">Viewing</span>
          <div className="relative">
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="appearance-none bg-[#111111] border border-[#222222] rounded-lg
                         px-4 py-2 pr-9 text-white font-medium text-sm
                         focus:outline-none focus:border-lime-400 transition-colors cursor-pointer"
            >
              {exercises.map((exercise) => (
                <option key={exercise} value={exercise}>{exercise}</option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Weight Progression */}
        <WeightProgressionChart
          selectedExercise={selectedExercise}
          exercises={exercises}
          onExerciseChange={setSelectedExercise}
        />

        {/* Volume Progression */}
        <VolumeProgressionChart
          selectedExercise={selectedExercise}
          exercises={exercises}
          onExerciseChange={setSelectedExercise}
        />

        {/* Progressive Overload Recommendation */}
        <ProgressiveOverloadPanel
          selectedExercise={selectedExercise}
          exercises={exercises}
          onExerciseChange={setSelectedExercise}
        />

        {/* Calendar + Cardio side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorkoutCalendar />
          <WeeklyCardioTracker />
        </div>

        {/* Personal Records */}
        <PersonalRecordsGrid records={personalRecords} />

      </div>
    </div>
  )
}

function HeroStat({ value, label, accent = false }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="bg-black px-4 py-8 text-center">
      <div className={`text-5xl font-black tracking-tight tabular-nums ${accent ? 'text-lime-400' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 mt-2 uppercase">{label}</div>
    </div>
  )
}
