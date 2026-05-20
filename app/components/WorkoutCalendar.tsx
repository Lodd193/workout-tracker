'use client'

import { useState, useEffect } from 'react'
import { fetchWorkoutFrequency } from '@/lib/api/analytics'
import { WorkoutDayData } from '@/lib/types'

export default function WorkoutCalendar() {
  const [workoutDays, setWorkoutDays] = useState<WorkoutDayData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const days = await fetchWorkoutFrequency()
      setWorkoutDays(days)
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
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
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
      'bg-[#1A1A1A]',
      'bg-lime-400/20',
      'bg-lime-400/40',
      'bg-lime-400/65',
      'bg-lime-400/85',
    ]
    return colors[intensity] || colors[0]
  }

  const getTooltipText = (date: Date | null) => {
    if (!date) return ''
    const dateStr = date.toISOString().split('T')[0]
    const workout = workoutDays.find(d => d.date === dateStr)
    if (!workout) return `${date.toLocaleDateString()} — Rest day`
    return `${date.toLocaleDateString()} — ${workout.exerciseCount} exercises, ${workout.totalSets} sets`
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
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-[#1A1A1A] rounded w-40 mb-5" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[#1A1A1A] rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={previousMonth}
            className="w-7 h-7 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] text-zinc-500 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="w-7 h-7 rounded-lg bg-[#1A1A1A] hover:bg-[#2A2A2A] text-zinc-500 hover:text-white transition-colors flex items-center justify-center"
            aria-label="Next month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-zinc-700 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {monthDays.map((date, index) => {
          const intensity = getIntensityForDate(date)
          const tooltip = getTooltipText(date)
          const isToday = date && date.toDateString() === new Date().toDateString()

          return (
            <div
              key={index}
              className={`
                relative aspect-square rounded-md transition-all duration-150
                ${date ? 'cursor-pointer hover:scale-110' : ''}
                ${date ? getIntensityColor(intensity) : 'bg-transparent'}
                ${isToday ? 'ring-1 ring-lime-400' : ''}
              `}
              title={tooltip}
            >
              {date && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-medium ${intensity > 0 ? 'text-white' : 'text-zinc-700'}`}>
                    {date.getDate()}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-5">
        <span className="text-[10px] text-zinc-700 mr-1">Less</span>
        {[0, 1, 2, 3, 4].map(intensity => (
          <div key={intensity} className={`w-3.5 h-3.5 rounded-sm ${getIntensityColor(intensity)}`} />
        ))}
        <span className="text-[10px] text-zinc-700 ml-1">More</span>
      </div>
    </div>
  )
}
