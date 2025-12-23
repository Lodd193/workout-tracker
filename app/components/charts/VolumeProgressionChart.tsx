'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchVolumeProgression, VolumeDataPoint } from '@/lib/api/analytics'

interface VolumeProgressionChartProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function VolumeProgressionChart({
  selectedExercise,
  exercises,
  onExerciseChange,
}: VolumeProgressionChartProps) {
  const [data, setData] = useState<VolumeDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'exercise' | 'total'>('total')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const volumeData = await fetchVolumeProgression(viewMode === 'exercise' ? selectedExercise : undefined)
        setData(volumeData)
      } catch (error) {
        console.error('Error loading volume data:', error)
      }
      setLoading(false)
    }

    if (viewMode === 'total' || selectedExercise) {
      loadData()
    }
  }, [selectedExercise, viewMode])

  const totalVolume = data.reduce((sum, d) => sum + d.totalVolume, 0)
  const avgVolume = data.length > 0 ? totalVolume / data.length : 0
  const peakVolume = data.length > 0 ? Math.max(...data.map((d) => d.totalVolume)) : 0

  if (loading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md h-96 animate-pulse">
        <div className="h-full bg-slate-700/30 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Training Volume Progression</h2>
          <p className="text-slate-400 text-sm mt-1">Total work done (Weight × Reps)</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-700/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('total')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'total'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total Volume
            </button>
            <button
              onClick={() => setViewMode('exercise')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'exercise'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Per Exercise
            </button>
          </div>

          {/* Exercise Selector (only show when per-exercise view) */}
          {viewMode === 'exercise' && (
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
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total Volume</div>
          <div className="text-white text-lg font-bold">{Math.round(totalVolume).toLocaleString()} kg</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Avg Volume/Day</div>
          <div className="text-white text-lg font-bold">{Math.round(avgVolume).toLocaleString()} kg</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-3">
          <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Peak Volume</div>
          <div className="text-white text-lg font-bold">{Math.round(peakVolume).toLocaleString()} kg</div>
        </div>
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="displayDate" stroke="#94a3b8" style={{ fontSize: '12px' }} />
            <YAxis stroke="#94a3b8" label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalVolume"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Volume (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <p>No volume data available for this selection</p>
        </div>
      )}
    </div>
  )
}
