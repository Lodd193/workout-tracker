import {
  WeeklyProgressionData,
  VolumeLoadDataPoint,
  ProgressiveOverloadRecommendation,
  SetBySetAnalysis,
} from '@/lib/types'
import { fetchWorkoutLogs } from '@/lib/api/analytics'

// ============ WEEKLY PROGRESSION ============

/**
 * Get week-over-week progression data for an exercise
 * Shows if user is consistently improving, plateauing, or declining
 */
export async function fetchWeeklyProgression(
  exerciseName: string,
  weeksBack: number = 8
): Promise<WeeklyProgressionData[]> {
  try {
    const logs = await fetchWorkoutLogs(exerciseName)
    if (logs.length === 0) return []

    // Group logs by week
    const weekMap = new Map<string, typeof logs>()
    const today = new Date()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - (weeksBack * 7))

    logs.forEach(log => {
      const logDate = new Date(log.date)
      if (logDate < cutoffDate) return

      // Get Monday of that week
      const weekStart = new Date(logDate)
      const day = weekStart.getDay()
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1) // Adjust to Monday
      weekStart.setDate(diff)
      weekStart.setHours(0, 0, 0, 0)

      const weekKey = weekStart.toISOString().split('T')[0]
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, [])
      }
      weekMap.get(weekKey)!.push(log)
    })

    // Calculate stats for each week
    const weeklyData: WeeklyProgressionData[] = []
    const sortedWeeks = Array.from(weekMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

    sortedWeeks.forEach(([weekKey, weekLogs], index) => {
      const weights = weekLogs.map(log => log.weight_kg)
      const avg_weight = weights.reduce((a, b) => a + b, 0) / weights.length
      const max_weight = Math.max(...weights)
      const total_volume = weekLogs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0)
      const total_sets = weekLogs.length
      const total_reps = weekLogs.reduce((sum, log) => sum + log.reps, 0)

      // Count unique dates (sessions)
      const uniqueDates = new Set(weekLogs.map(log => log.date))
      const sessions_count = uniqueDates.size

      // Calculate progression status
      let progression_status: 'improving' | 'plateau' | 'declining' = 'plateau'
      if (index > 0) {
        const prevWeek = weeklyData[index - 1]
        const volumeChange = ((total_volume - prevWeek.total_volume) / prevWeek.total_volume) * 100

        if (volumeChange > 5) {
          progression_status = 'improving'
        } else if (volumeChange < -5) {
          progression_status = 'declining'
        }
      }

      const weekStart = new Date(weekKey)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      const week_label = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

      weeklyData.push({
        week_start: weekKey,
        week_end: weekEnd.toISOString().split('T')[0],
        avg_weight: Math.round(avg_weight * 10) / 10,
        max_weight: Math.round(max_weight * 10) / 10,
        total_volume: Math.round(total_volume),
        total_sets,
        total_reps,
        sessions_count,
        week_label,
        progression_status,
      })
    })

    return weeklyData
  } catch (error) {
    console.error('Error fetching weekly progression:', error)
    return []
  }
}

// ============ VOLUME LOAD TRENDS ============

/**
 * Get daily volume load data for charting
 */
export async function fetchVolumeLoadTrend(
  exerciseName: string,
  daysBack: number = 60
): Promise<VolumeLoadDataPoint[]> {
  try {
    const logs = await fetchWorkoutLogs(exerciseName)
    if (logs.length === 0) return []

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)

    // Group by date
    const dateMap = new Map<string, typeof logs>()

    logs.forEach(log => {
      const logDate = new Date(log.date)
      if (logDate < cutoffDate) return

      if (!dateMap.has(log.date)) {
        dateMap.set(log.date, [])
      }
      dateMap.get(log.date)!.push(log)
    })

    // Calculate volume for each date
    const volumeData: VolumeLoadDataPoint[] = []
    const sortedDates = Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))

    sortedDates.forEach(([date, dateLogs]) => {
      const total_volume = dateLogs.reduce((sum, log) => sum + (log.weight_kg * log.reps), 0)
      const total_sets = dateLogs.length
      const weights = dateLogs.map(log => log.weight_kg)
      const avg_weight = weights.reduce((a, b) => a + b, 0) / weights.length

      const displayDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })

      volumeData.push({
        date,
        total_volume: Math.round(total_volume),
        total_sets,
        avg_weight: Math.round(avg_weight * 10) / 10,
        displayDate,
      })
    })

    return volumeData
  } catch (error) {
    console.error('Error fetching volume load trend:', error)
    return []
  }
}

// ============ PROGRESSIVE OVERLOAD RECOMMENDATIONS ============

/**
 * Generate smart recommendations for progressive overload
 */
export async function generateProgressiveOverloadRecommendation(
  exerciseName: string
): Promise<ProgressiveOverloadRecommendation | null> {
  try {
    const logs = await fetchWorkoutLogs(exerciseName)
    if (logs.length < 6) return null // Need at least 6 sets of data

    // Get last 3 sessions (assume ~3 sets per session = 9 sets)
    const recentLogs = logs.slice(-9)
    const weights = recentLogs.map(log => log.weight_kg)
    const reps = recentLogs.map(log => log.reps)

    // Find most common working weight (mode)
    const weightCounts = new Map<number, number>()
    weights.forEach(w => {
      weightCounts.set(w, (weightCounts.get(w) || 0) + 1)
    })
    const [current_working_weight] = Array.from(weightCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]

    // Check consistency (do they hit similar reps at this weight?)
    const repsAtWorkingWeight = recentLogs
      .filter(log => log.weight_kg === current_working_weight)
      .map(log => log.reps)

    if (repsAtWorkingWeight.length === 0) return null

    const avgReps = repsAtWorkingWeight.reduce((a, b) => a + b, 0) / repsAtWorkingWeight.length
    const repVariance = Math.max(...repsAtWorkingWeight) - Math.min(...repsAtWorkingWeight)

    // Calculate consistency score (0-100)
    const consistency_score = Math.max(0, 100 - (repVariance * 10))

    // Determine if ready to progress
    const ready_to_progress = avgReps >= 10 && consistency_score >= 70

    // Smart weight increment (2.5kg for most, 5kg for big lifts)
    const isBigLift = exerciseName.toLowerCase().includes('squat') ||
                      exerciseName.toLowerCase().includes('deadlift') ||
                      exerciseName.toLowerCase().includes('bench press')
    const increment = isBigLift ? 5 : 2.5
    const suggested_next_weight = current_working_weight + increment

    // Generate reasoning
    let reasoning = ''
    let confidence: 'high' | 'medium' | 'low' = 'medium'

    if (ready_to_progress) {
      reasoning = `You're consistently hitting ${Math.round(avgReps)} reps at ${current_working_weight}kg. Time to increase!`
      confidence = 'high'
    } else if (avgReps < 8) {
      reasoning = `Current weight feels heavy (avg ${Math.round(avgReps)} reps). Focus on consistency before increasing.`
      confidence = 'low'
    } else if (consistency_score < 70) {
      reasoning = `Rep count varies too much (${Math.min(...repsAtWorkingWeight)}-${Math.max(...repsAtWorkingWeight)}). Build consistency first.`
      confidence = 'low'
    } else {
      reasoning = `You're close! Hit 10+ reps consistently to progress to ${suggested_next_weight}kg.`
      confidence = 'medium'
    }

    return {
      exercise_name: exerciseName,
      current_working_weight,
      suggested_next_weight,
      reasoning,
      confidence,
      ready_to_progress,
      consistency_score: Math.round(consistency_score),
    }
  } catch (error) {
    console.error('Error generating progressive overload recommendation:', error)
    return null
  }
}

// ============ SET-BY-SET ANALYSIS ============

/**
 * Analyze set-by-set performance to identify drop-off patterns
 */
export async function fetchSetBySetAnalysis(
  exerciseName: string,
  sessionCount: number = 5
): Promise<SetBySetAnalysis | null> {
  try {
    const logs = await fetchWorkoutLogs(exerciseName)
    if (logs.length === 0) return null

    // Group by date (session)
    const sessionMap = new Map<string, typeof logs>()
    logs.forEach(log => {
      if (!sessionMap.has(log.date)) {
        sessionMap.set(log.date, [])
      }
      sessionMap.get(log.date)!.push(log)
    })

    // Get recent sessions
    const sortedSessions = Array.from(sessionMap.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, sessionCount)

    if (sortedSessions.length === 0) return null

    const recent_sessions = sortedSessions.map(([date, sessionLogs]) => {
      // Sort by set number
      const sortedSets = sessionLogs.sort((a, b) => a.set_number - b.set_number)

      const sets = sortedSets.map(log => ({
        set_number: log.set_number,
        weight_kg: log.weight_kg,
        reps: log.reps,
        volume: log.weight_kg * log.reps,
      }))

      const weights = sets.map(s => s.weight_kg)
      const avg_weight = weights.reduce((a, b) => a + b, 0) / weights.length
      const total_volume = sets.reduce((sum, s) => sum + s.volume, 0)

      // Calculate drop-off from first to last set
      const firstSetVolume = sets[0].volume
      const lastSetVolume = sets[sets.length - 1].volume
      const drop_off_percentage = ((firstSetVolume - lastSetVolume) / firstSetVolume) * 100

      return {
        date,
        sets,
        avg_weight: Math.round(avg_weight * 10) / 10,
        total_volume: Math.round(total_volume),
        drop_off_percentage: Math.round(drop_off_percentage * 10) / 10,
      }
    }).reverse() // Show oldest to newest

    // Calculate average drop-off
    const dropOffs = recent_sessions.map(s => s.drop_off_percentage)
    const avg_drop_off = dropOffs.reduce((a, b) => a + b, 0) / dropOffs.length

    // Determine consistency rating
    let consistency_rating: 'excellent' | 'good' | 'fair' | 'needs-improvement'
    if (avg_drop_off < 10) {
      consistency_rating = 'excellent'
    } else if (avg_drop_off < 20) {
      consistency_rating = 'good'
    } else if (avg_drop_off < 30) {
      consistency_rating = 'fair'
    } else {
      consistency_rating = 'needs-improvement'
    }

    // Generate recommendation
    let recommendation = ''
    if (consistency_rating === 'excellent') {
      recommendation = 'Outstanding consistency! Your performance is stable across all sets.'
    } else if (consistency_rating === 'good') {
      recommendation = 'Good consistency. Minor drop-off is normal and acceptable.'
    } else if (consistency_rating === 'fair') {
      recommendation = 'Moderate drop-off detected. Consider longer rest periods between sets.'
    } else {
      recommendation = 'Significant drop-off detected. Try reducing weight or increasing rest time to maintain quality.'
    }

    return {
      exercise_name: exerciseName,
      recent_sessions,
      avg_drop_off: Math.round(avg_drop_off * 10) / 10,
      consistency_rating,
      recommendation,
    }
  } catch (error) {
    console.error('Error fetching set-by-set analysis:', error)
    return null
  }
}
