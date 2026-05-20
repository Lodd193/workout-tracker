'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { fetchVolumeProgression, VolumeDataPoint } from '@/lib/api/analytics'

interface VolumeProgressionChartProps {
  selectedExercise: string
  exercises: string[]
  onExerciseChange: (exercise: string) => void
}

export default function VolumeProgressionChart({ selectedExercise }: VolumeProgressionChartProps) {
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
      <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 h-96 animate-pulse">
        <div className="h-full bg-[#1A1A1A] rounded-lg" />
      </div>
    )
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Volume Progression</h2>
          <p className="text-zinc-600 text-sm mt-0.5">Total work done (weight × reps)</p>
        </div>

        <div className="flex bg-[#1A1A1A] rounded-lg p-1">
          <button
            onClick={() => setViewMode('total')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'total' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setViewMode('exercise')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'exercise' ? 'bg-lime-400 text-black' : 'text-zinc-500 hover:text-white'
            }`}
          >
            This exercise
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1A1A1A] rounded-lg p-3">
          <div className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Total</div>
          <div className="text-white text-lg font-bold">{Math.round(totalVolume).toLocaleString()} kg</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg p-3">
          <div className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Avg / day</div>
          <div className="text-white text-lg font-bold">{Math.round(avgVolume).toLocaleString()} kg</div>
        </div>
        <div className="bg-[#1A1A1A] rounded-lg p-3">
          <div className="text-zinc-600 text-xs uppercase tracking-wide mb-1">Peak</div>
          <div className="text-white text-lg font-bold">{Math.round(peakVolume).toLocaleString()} kg</div>
        </div>
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" opacity={0.8} />
            <XAxis dataKey="displayDate" stroke="#3f3f46" style={{ fontSize: '11px' }} tickLine={false} />
            <YAxis
              stroke="#3f3f46"
              style={{ fontSize: '11px' }}
              tickLine={false}
              label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', style: { fill: '#52525b' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #222222',
                borderRadius: '8px',
                color: '#fff',
              }}
              labelStyle={{ color: '#52525b' }}
            />
            <Legend wrapperStyle={{ paddingTop: '16px' }} iconType="line" />
            <Line
              type="monotone"
              dataKey="totalVolume"
              stroke="#a3e635"
              strokeWidth={2}
              dot={{ fill: '#a3e635', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
              name="Volume (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12 text-zinc-600">
          No volume data for this selection
        </div>
      )}
    </div>
  )
}
