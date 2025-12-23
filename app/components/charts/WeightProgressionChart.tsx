'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { fetchWeightProgression } from '@/lib/api/analytics'
import { WeightProgressionDataPoint } from '@/lib/types'
import { useSettings } from '@/lib/contexts/SettingsContext'
import ChartSkeleton from './ChartSkeleton'

interface WeightProgressionChartProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function WeightProgressionChart({ selectedExercise, exercises, onExerciseChange }: WeightProgressionChartProps) {
  const { weightUnit, convertWeight } = useSettings()
  const [data, setData] = useState<WeightProgressionDataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!selectedExercise) return

      try {
        setLoading(true)
        const progressData = await fetchWeightProgression(selectedExercise)
        setData(progressData)
      } catch (error) {
        console.error('Error loading weight progression:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedExercise])

  // Convert data for display
  const displayData = data.map((point) => ({
    ...point,
    maxWeight: Math.round(convertWeight(point.maxWeight) * 10) / 10,
    avgWeight: Math.round(convertWeight(point.avgWeight) * 10) / 10,
  }))

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header with Exercise Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Weight Progression</h2>
          <p className="text-slate-400 text-sm mt-1">Track your strength gains over time</p>
        </div>

        {/* Exercise Dropdown */}
        <div className="relative">
          <select
            value={selectedExercise}
            onChange={(e) => onExerciseChange(e.target.value)}
            className="appearance-none bg-slate-700/50 border border-slate-600 rounded-lg
                     px-4 py-2 pr-10 text-white font-medium
                     focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                     transition-all duration-200 cursor-pointer"
          >
            {exercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No data available for this exercise</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={displayData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="displayDate" stroke="#94a3b8" style={{ fontSize: '12px' }} tickLine={false} />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                tickLine={false}
                label={{ value: `Weight (${weightUnit})`, angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
              <Line
                type="monotone"
                dataKey="maxWeight"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
                name="Max Weight"
              />
              <Line
                type="monotone"
                dataKey="avgWeight"
                stroke="#06b6d4"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                name="Avg Weight"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Chart Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">
                {Math.max(...displayData.map((d) => d.maxWeight)).toFixed(1)} {weightUnit}
              </div>
              <div className="text-xs text-slate-400 mt-1">Peak Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{data.length}</div>
              <div className="text-xs text-slate-400 mt-1">Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.reduce((sum, d) => sum + d.totalSets, 0)}</div>
              <div className="text-xs text-slate-400 mt-1">Total Sets</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
