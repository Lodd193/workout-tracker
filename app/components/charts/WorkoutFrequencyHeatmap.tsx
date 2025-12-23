'use client'

import { WorkoutDayData } from '@/lib/types'

interface WorkoutFrequencyHeatmapProps {
  data: WorkoutDayData[]
}

export default function WorkoutFrequencyHeatmap({ data }: WorkoutFrequencyHeatmapProps) {
  // Generate last 12 months of dates
  const generateHeatmapData = () => {
    const today = new Date()
    const startDate = new Date(today)
    startDate.setMonth(startDate.getMonth() - 12)

    const dateMap = new Map(data.map((d) => [d.date, d]))
    const weeks: Array<Array<{ date: Date; data: WorkoutDayData | null }>> = []

    let currentWeek: (typeof weeks)[0] = []
    const current = new Date(startDate)

    // Start from Sunday
    current.setDate(current.getDate() - current.getDay())

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0]
      const dayData = dateMap.get(dateStr) || null

      currentWeek.push({
        date: new Date(current),
        data: dayData,
      })

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }

      current.setDate(current.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return weeks
  }

  const heatmapData = generateHeatmapData()
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Get intensity color
  const getIntensityColor = (intensity: number | null) => {
    if (intensity === null) return 'bg-slate-700/30'
    if (intensity === 0) return 'bg-slate-700/50'
    if (intensity === 1) return 'bg-emerald-500/30'
    if (intensity === 2) return 'bg-emerald-500/50'
    if (intensity === 3) return 'bg-emerald-500/70'
    return 'bg-emerald-500'
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Workout Frequency</h2>
        <p className="text-slate-400 text-sm mt-1">Your training consistency over the last 12 months</p>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="flex gap-1 mb-2 ml-6">
            {monthLabels.map((month, idx) => (
              <div key={idx} className="text-xs text-slate-500" style={{ width: '52px' }}>
                {month}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          <div className="flex gap-1">
            {/* Day Labels */}
            <div className="flex flex-col gap-1 justify-between">
              {dayLabels.map((day, idx) => (
                <div key={idx} className="w-4 h-3 text-xs text-slate-500 flex items-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {heatmapData.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-1">
                  {week.map((day, dayIdx) => {
                    const intensity = day.data?.intensity ?? null
                    const isToday = day.date.toDateString() === new Date().toDateString()

                    return (
                      <div
                        key={dayIdx}
                        className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}
                                   hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer
                                   ${isToday ? 'ring-2 ring-cyan-400' : ''}`}
                        title={`${day.date.toLocaleDateString()}: ${day.data?.exerciseCount || 0} exercises, ${day.data?.totalSets || 0} sets`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-6 text-xs text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((intensity) => (
                <div key={intensity} className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
