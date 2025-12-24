'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WeeklyCardioTracker() {
  const [weeklyMinutes, setWeeklyMinutes] = useState(0)
  const [loading, setLoading] = useState(true)
  const weeklyGoal = 150

  useEffect(() => {
    loadWeeklyCardio()
  }, [])

  const loadWeeklyCardio = async () => {
    try {
      // Get the start of current week (Sunday)
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      // Get the end of current week (Saturday)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('workout_logs')
        .select('reps')
        .eq('workout_type', 'cardio')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])

      if (error) throw error

      // Sum up all cardio minutes (stored in reps field)
      const totalMinutes = data?.reduce((sum, log) => sum + log.reps, 0) || 0
      setWeeklyMinutes(totalMinutes)
    } catch (error) {
      console.error('Error loading weekly cardio:', error)
    } finally {
      setLoading(false)
    }
  }

  const percentage = Math.min((weeklyMinutes / weeklyGoal) * 100, 100)
  const isOnTrack = weeklyMinutes >= weeklyGoal

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-slate-700 rounded w-48 mb-4"></div>
        <div className="h-20 bg-slate-700 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Weekly Cardio
        </h2>
        <span className="text-sm text-slate-400">Goal: {weeklyGoal} min/week</span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-16 bg-slate-700/50 rounded-xl overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isOnTrack
                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                : 'bg-gradient-to-r from-sky-500 to-indigo-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Minutes Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {weeklyMinutes} <span className="text-lg text-slate-300">/ {weeklyGoal}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">minutes</div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-4 text-center">
        {isOnTrack ? (
          <div className="flex items-center justify-center gap-2 text-emerald-400">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Goal achieved! Great work!</span>
          </div>
        ) : (
          <div className="text-slate-400">
            <span className="font-semibold text-sky-400">{weeklyGoal - weeklyMinutes} minutes</span> remaining this week
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{Math.round(percentage)}%</div>
          <div className="text-xs text-slate-400">Complete</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{Math.ceil(weeklyMinutes / 7)}</div>
          <div className="text-xs text-slate-400">Avg min/day</div>
        </div>
      </div>
    </div>
  )
}
