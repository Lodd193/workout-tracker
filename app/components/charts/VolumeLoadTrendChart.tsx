'use client'

import { useState, useEffect } from 'react'
import { VolumeLoadDataPoint } from '@/lib/types'
import { fetchVolumeLoadTrend } from '@/lib/api/progressive-overload'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface VolumeLoadTrendChartProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function VolumeLoadTrendChart({
  selectedExercise,
  exercises,
  onExerciseChange,
}: VolumeLoadTrendChartProps) {
  const [data, setData] = useState<VolumeLoadDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [daysBack, setDaysBack] = useState(60)

  useEffect(() => {
    loadData()
  }, [selectedExercise, daysBack])

  const loadData = async () => {
    if (!selectedExercise) return
    setLoading(true)
    try {
      const volumeData = await fetchVolumeLoadTrend(selectedExercise, daysBack)
      setData(volumeData)
    } catch (error) {
      console.error('Error loading volume load trend:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return <ChartSkeleton />
  }

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 backdrop-blur-md text-center">
        <h3 className="text-white font-semibold mb-2">Volume Load Trends</h3>
        <p className="text-slate-400 text-sm">No data available for this exercise</p>
      </div>
    )
  }

  // Calculate stats
  const totalVolume = data.reduce((sum, d) => sum + d.total_volume, 0)
  const avgVolume = totalVolume / data.length
  const peakVolume = Math.max(...data.map(d => d.total_volume))
  const recentAvg = data.slice(-7).reduce((sum, d) => sum + d.total_volume, 0) / Math.min(7, data.length)
  const trend = recentAvg > avgVolume ? 'Increasing' : recentAvg < avgVolume ? 'Decreasing' : 'Stable'
  const trendColor = trend === 'Increasing' ? '#10b981' : trend === 'Decreasing' ? '#ef4444' : '#f59e0b'

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Volume Load Trends</h2>
            <p className="text-slate-400 text-sm">Total volume (weight × reps) over time</p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Time Range Selector */}
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          {/* Exercise Selector */}
          <select
            value={selectedExercise}
            onChange={(e) => onExerciseChange(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            {exercises.map((exercise) => (
              <option key={exercise} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="displayDate"
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
                value: 'Volume (kg)',
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
                const point = props.payload
                return [
                  <div key="tooltip" className="space-y-1">
                    <div className="font-semibold">Total Volume: {value}kg</div>
                    <div className="text-sm text-slate-400">Sets: {point.total_sets}</div>
                    <div className="text-sm text-slate-400">Avg Weight: {point.avg_weight}kg</div>
                  </div>,
                  ''
                ]
              }}
              labelFormatter={() => ''}
            />
            <Area
              type="monotone"
              dataKey="total_volume"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#volumeGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700">
        <StatCard label="Avg Volume/Session" value={`${Math.round(avgVolume)}kg`} />
        <StatCard label="Peak Volume" value={`${Math.round(peakVolume)}kg`} />
        <StatCard label="Recent Avg (7d)" value={`${Math.round(recentAvg)}kg`} />
        <StatCard label="Trend" value={trend} color={trendColor} />
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
