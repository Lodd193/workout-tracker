'use client'

import { useState, useEffect } from 'react'
import { WeeklyProgressionData } from '@/lib/types'
import { fetchWeeklyProgression } from '@/lib/api/progressive-overload'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface WeeklyProgressionChartProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function WeeklyProgressionChart({
  selectedExercise,
  exercises,
  onExerciseChange,
}: WeeklyProgressionChartProps) {
  const { formatWeight } = useSettings()
  const [data, setData] = useState<WeeklyProgressionData[]>([])
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState<'volume' | 'weight'>('volume')

  useEffect(() => {
    loadData()
  }, [selectedExercise])

  const loadData = async () => {
    if (!selectedExercise) return
    setLoading(true)
    try {
      const weeklyData = await fetchWeeklyProgression(selectedExercise, 8)
      setData(weeklyData)
    } catch (error) {
      console.error('Error loading weekly progression:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return <ChartSkeleton />
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 backdrop-blur-md text-center">
        <h3 className="text-white font-semibold mb-2">Week-over-Week Progression</h3>
        <p className="text-slate-400 text-sm">No data available for this exercise</p>
      </div>
    )
  }

  // Color mapping for progression status
  const getBarColor = (status: string) => {
    switch (status) {
      case 'improving':
        return '#10b981' // emerald-500
      case 'plateau':
        return '#f59e0b' // amber-500
      case 'declining':
        return '#ef4444' // red-500
      default:
        return '#64748b' // slate-500
    }
  }

  const chartData = data.map(week => ({
    ...week,
    displayValue: metric === 'volume' ? week.total_volume : week.max_weight,
  }))

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Week-over-Week Progression</h2>
            <p className="text-slate-400 text-sm">Track your weekly improvements</p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Metric Toggle */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setMetric('volume')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                metric === 'volume'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Volume
            </button>
            <button
              onClick={() => setMetric('weight')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                metric === 'weight'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Max Weight
            </button>
          </div>

          {/* Exercise Selector */}
          <select
            value={selectedExercise}
            onChange={(e) => onExerciseChange(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            {exercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500"></div>
          <span className="text-slate-300">Improving (+5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span className="text-slate-300">Plateau (±5%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-slate-300">Declining (-5%)</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="week_label"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              label={{
                value: metric === 'volume' ? 'Total Volume (kg)' : 'Max Weight (kg)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#94a3b8', fontSize: 12 }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f1f5f9',
              }}
              formatter={(value: number | undefined, name: string, props: any) => {
                const week = props.payload
                return [
                  <div key="tooltip" className="space-y-1">
                    <div className="font-semibold">
                      {metric === 'volume' ? 'Total Volume:' : 'Max Weight:'}{' '}
                      {metric === 'volume' ? `${value}kg` : formatWeight(value as number)}
                    </div>
                    <div className="text-sm text-slate-400">
                      Sessions: {week.sessions_count}
                    </div>
                    <div className="text-sm text-slate-400">
                      Total Sets: {week.total_sets}
                    </div>
                    <div className="text-sm">
                      Status:{' '}
                      <span
                        className="font-semibold"
                        style={{ color: getBarColor(week.progression_status) }}
                      >
                        {week.progression_status.charAt(0).toUpperCase() + week.progression_status.slice(1)}
                      </span>
                    </div>
                  </div>,
                  ''
                ]
              }}
              labelFormatter={() => ''}
            />
            <Bar dataKey="displayValue" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.progression_status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
        <StatCard label="Avg Volume/Week" value={`${Math.round(data.reduce((sum, w) => sum + w.total_volume, 0) / data.length)}kg`} />
        <StatCard label="Avg Sessions/Week" value={`${(data.reduce((sum, w) => sum + w.sessions_count, 0) / data.length).toFixed(1)}`} />
        <StatCard label="Peak Week" value={data.reduce((max, w) => w.total_volume > max.total_volume ? w : max).week_label} />
        <StatCard
          label="Trend"
          value={data[data.length - 1]?.progression_status || 'Unknown'}
          color={getBarColor(data[data.length - 1]?.progression_status)}
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-3">
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="text-white font-bold" style={color ? { color } : {}}>
        {value}
      </div>
    </div>
  )
}
