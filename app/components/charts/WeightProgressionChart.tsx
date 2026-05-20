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

export default function WeightProgressionChart({ selectedExercise }: WeightProgressionChartProps) {
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

  const displayData = data.map((point) => ({
    ...point,
    maxWeight: Math.round(convertWeight(point.maxWeight) * 10) / 10,
    avgWeight: Math.round(convertWeight(point.avgWeight) * 10) / 10,
  }))

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Weight Progression</h2>
        <p className="text-zinc-600 text-sm mt-0.5">Strength gains over time</p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600">No data for this exercise yet</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={displayData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" opacity={0.8} />
              <XAxis dataKey="displayDate" stroke="#3f3f46" style={{ fontSize: '11px' }} tickLine={false} />
              <YAxis
                stroke="#3f3f46"
                style={{ fontSize: '11px' }}
                tickLine={false}
                label={{ value: `Weight (${weightUnit})`, angle: -90, position: 'insideLeft', fill: '#52525b' }}
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
                dataKey="maxWeight"
                stroke="#a3e635"
                strokeWidth={2}
                dot={{ fill: '#a3e635', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#a3e635' }}
                name="Max Weight"
              />
              <Line
                type="monotone"
                dataKey="avgWeight"
                stroke="#3f3f46"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3f3f46', strokeWidth: 0, r: 3 }}
                name="Avg Weight"
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#222222]">
            <div className="text-center">
              <div className="text-2xl font-bold text-lime-400">
                {Math.max(...displayData.map((d) => d.maxWeight)).toFixed(1)} {weightUnit}
              </div>
              <div className="text-xs text-zinc-600 mt-1 uppercase tracking-wide">Peak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.length}</div>
              <div className="text-xs text-zinc-600 mt-1 uppercase tracking-wide">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{data.reduce((sum, d) => sum + d.totalSets, 0)}</div>
              <div className="text-xs text-zinc-600 mt-1 uppercase tracking-wide">Sets</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
