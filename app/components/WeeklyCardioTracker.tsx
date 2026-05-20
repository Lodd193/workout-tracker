'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function WeeklyCardioTracker() {
  const { user } = useAuth()
  const { weeklyCardioGoal } = useSettings()
  const [weeklyMinutes, setWeeklyMinutes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadWeeklyCardio()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadWeeklyCardio = async () => {
    try {
      setLoading(true)
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('workout_logs')
        .select('reps')
        .eq('workout_type', 'cardio')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0])

      if (error) {
        console.error('Error loading weekly cardio:', error.message || error)
        throw error
      }

      const totalMinutes = data?.reduce((sum, log) => sum + log.reps, 0) || 0
      setWeeklyMinutes(totalMinutes)
    } catch (error) {
      console.error('Error loading weekly cardio:', error)
    } finally {
      setLoading(false)
    }
  }

  const percentage = Math.min((weeklyMinutes / weeklyCardioGoal) * 100, 100)
  const isOnTrack = weeklyMinutes >= weeklyCardioGoal

  if (loading) {
    return (
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-[#1A1A1A] rounded w-36 mb-5" />
        <div className="h-16 bg-[#1A1A1A] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Weekly Cardio
        </h2>
        <span className="text-xs text-zinc-600 uppercase tracking-wide">Goal: {weeklyCardioGoal} min</span>
      </div>

      <div className="relative mb-4">
        <div className="h-14 bg-[#1A1A1A] rounded-xl overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isOnTrack
                ? 'bg-gradient-to-r from-lime-400 to-lime-500'
                : 'bg-gradient-to-r from-zinc-700 to-zinc-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-2xl font-black text-white tabular-nums">{weeklyMinutes}</span>
            <span className="text-zinc-500 text-sm font-medium"> / {weeklyCardioGoal} min</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-4">
        {isOnTrack ? (
          <span className="text-lime-400 text-sm font-semibold">Goal achieved</span>
        ) : (
          <span className="text-zinc-500 text-sm">
            <span className="text-white font-semibold">{weeklyCardioGoal - weeklyMinutes} min</span> remaining this week
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1A1A1A] rounded-lg p-3 text-center">
          <div className="text-xl font-black text-white">{Math.round(percentage)}%</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-wide mt-0.5">Complete</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg p-3 text-center">
          <div className="text-xl font-black text-white">{Math.ceil(weeklyMinutes / 7)}</div>
          <div className="text-[10px] text-zinc-600 uppercase tracking-wide mt-0.5">Avg min/day</div>
        </div>
      </div>
    </div>
  )
}
