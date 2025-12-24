'use client'

import { useState, useEffect } from 'react'
import { fetchWorkoutFrequency, fetchAnalyticsSummary } from '@/lib/api/analytics'
import { WorkoutDayData, AnalyticsSummary } from '@/lib/types'

export default function WorkoutCalendar() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDayData[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [days, summaryData] = await Promise.all([
        fetchWorkoutFrequency(),
        fetchAnalyticsSummary(),
      ])
      setWorkoutDays(days)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error loading calendar data:', error)
    }
    setLoading(false)
  }

  const getMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    return days
  }

  const getIntensityForDate = (date: Date | null) => {
    if (!date) return 0
    const dateStr = date.toISOString().split('T')[0]
    const workout = workoutDays.find(d => d.date === dateStr)
    return workout?.intensity || 0
  }

  const getIntensityColor = (intensity: number) => {
    const colors = [
      'bg-slate-800/30',
      'bg-emerald-500/20',
      'bg-emerald-500/40',
      'bg-emerald-500/60',
      'bg-emerald-500/80',
    ]
    return colors[intensity] || colors[0]
  }

  const getTooltipText = (date: Date | null) => {
    if (!date) return ''
    const dateStr = date.toISOString().split('T')[0]
    const workout = workoutDays.find(d => d.date === dateStr)
    if (!workout) return `${date.toLocaleDateString()} - Rest day`
    return `${date.toLocaleDateString()} - ${workout.exerciseCount} exercises, ${workout.totalSets} sets`
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthDays = getMonthDays()

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md shadow-lg">
      {/* Streak Stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs text-emerald-400 font-semibold uppercase">Current Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.currentStreak}</p>
            <p className="text-xs text-slate-400">days</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs text-purple-400 font-semibold uppercase">Longest Streak</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.longestStreak}</p>
            <p className="text-xs text-slate-400">days</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs text-cyan-400 font-semibold uppercase">Total Workouts</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.totalWorkouts}</p>
            <p className="text-xs text-slate-400">sessions</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-amber-400 font-semibold uppercase">Avg/Week</span>
            </div>
            <p className="text-3xl font-bold text-white">{summary.avgWorkoutsPerWeek}</p>
            <p className="text-xs text-slate-400">workouts</p>
          </div>
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((date, index) => {
          const intensity = getIntensityForDate(date)
          const tooltip = getTooltipText(date)
          const isToday = date && date.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              className={`
                relative aspect-square rounded-lg transition-all duration-200
                ${date ? 'cursor-pointer hover:scale-105' : ''}
                ${date ? getIntensityColor(intensity) : 'bg-transparent'}
                ${isToday ? 'ring-2 ring-cyan-400' : ''}
                ${date ? 'border border-slate-700 hover:border-slate-600' : ''}
              `}
              title={tooltip}
            >
              {date && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-medium ${intensity > 0 ? 'text-white' : 'text-slate-400'}`}>
                    {date.getDate()}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <span className="text-xs text-slate-400">Less</span>
        {[0, 1, 2, 3, 4].map(intensity => (
          <div
            key={intensity}
            className={`w-4 h-4 rounded ${getIntensityColor(intensity)} border border-slate-700`}
          ></div>
        ))}
        <span className="text-xs text-slate-400">More</span>
      </div>
    </div>
  )
}
