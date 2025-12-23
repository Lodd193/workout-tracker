import { supabase } from '@/lib/supabase'
import {
  WorkoutLog,
  WeightProgressionDataPoint,
  PersonalRecord,
  WorkoutDayData,
  AnalyticsSummary,
} from '@/lib/types'

// ============ FETCH ALL WORKOUT LOGS ============
export async function fetchAllWorkoutLogs(): Promise<WorkoutLog[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching workout logs:', error)
    throw error
  }

  return data || []
}

// ============ WEIGHT PROGRESSION FOR SPECIFIC EXERCISE ============
export async function fetchWeightProgression(exerciseName: string): Promise<WeightProgressionDataPoint[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('date, weight_kg, reps')
    .eq('exercise_name', exerciseName)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching weight progression:', error)
    throw error
  }

  if (!data || data.length === 0) return []

  // Group by date and calculate max/avg weight per day
  const groupedByDate = data.reduce(
    (acc, log) => {
      const date = log.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(log)
      return acc
    },
    {} as Record<string, typeof data>
  )

  return Object.entries(groupedByDate).map(([date, logs]) => {
    const weights = logs.map((l) => l.weight_kg)
    return {
      date,
      maxWeight: Math.max(...weights),
      avgWeight: weights.reduce((sum, w) => sum + w, 0) / weights.length,
      totalSets: logs.length,
      displayDate: formatDateForChart(date),
    }
  })
}

// ============ PERSONAL RECORDS (ALL EXERCISES) ============
export async function fetchPersonalRecords(): Promise<PersonalRecord[]> {
  const logs = await fetchAllWorkoutLogs()

  // Group by exercise
  const exerciseGroups = logs.reduce(
    (acc, log) => {
      if (!acc[log.exercise_name]) {
        acc[log.exercise_name] = []
      }
      acc[log.exercise_name].push(log)
      return acc
    },
    {} as Record<string, WorkoutLog[]>
  )

  // Calculate PR for each exercise
  const records: PersonalRecord[] = Object.entries(exerciseGroups).map(([exerciseName, exerciseLogs]) => {
    // Find max weight
    const maxWeightLog = exerciseLogs.reduce((max, log) => (log.weight_kg > max.weight_kg ? log : max))

    // Count unique workout dates
    const uniqueDates = new Set(exerciseLogs.map((l) => l.date))

    return {
      exercise_name: exerciseName,
      max_weight: maxWeightLog.weight_kg,
      date_achieved: maxWeightLog.date,
      reps_at_max: maxWeightLog.reps,
      total_sessions: uniqueDates.size,
      category: maxWeightLog.workout_type,
    }
  })

  // Sort by max weight descending
  return records.sort((a, b) => b.max_weight - a.max_weight)
}

// ============ WORKOUT FREQUENCY HEATMAP DATA ============
export async function fetchWorkoutFrequency(): Promise<WorkoutDayData[]> {
  const logs = await fetchAllWorkoutLogs()

  // Group by date
  const groupedByDate = logs.reduce(
    (acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = []
      }
      acc[log.date].push(log)
      return acc
    },
    {} as Record<string, WorkoutLog[]>
  )

  return Object.entries(groupedByDate).map(([date, dayLogs]) => {
    const uniqueExercises = new Set(dayLogs.map((l) => l.exercise_name))
    const totalSets = dayLogs.length

    // Calculate intensity level (0-4) based on workout volume
    let intensity = 0
    if (totalSets >= 1) intensity = 1
    if (totalSets >= 10) intensity = 2
    if (totalSets >= 20) intensity = 3
    if (totalSets >= 30) intensity = 4

    return {
      date,
      exerciseCount: uniqueExercises.size,
      totalSets,
      intensity,
    }
  })
}

// ============ ANALYTICS SUMMARY ============
export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const logs = await fetchAllWorkoutLogs()

  const uniqueDates = new Set(logs.map((l) => l.date))
  const uniqueExercises = new Set(logs.map((l) => l.exercise_name))

  // Calculate streaks
  const sortedDates = Array.from(uniqueDates).sort()
  const { current, longest } = calculateStreaks(sortedDates)

  // Calculate average workouts per week
  const dateRange = sortedDates.length > 0 ? daysBetween(sortedDates[0], sortedDates[sortedDates.length - 1]) : 0
  const avgPerWeek = dateRange > 0 ? (uniqueDates.size / dateRange) * 7 : 0

  return {
    totalWorkouts: uniqueDates.size,
    totalSets: logs.length,
    totalExercises: uniqueExercises.size,
    currentStreak: current,
    longestStreak: longest,
    avgWorkoutsPerWeek: Math.round(avgPerWeek * 10) / 10,
  }
}

// ============ UTILITY FUNCTIONS ============
function formatDateForChart(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function calculateStreaks(sortedDates: string[]): { current: number; longest: number } {
  if (sortedDates.length === 0) return { current: 0, longest: 0 }

  let longestStreak = 1
  let tempStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1])
    const currDate = new Date(sortedDates[i])
    const dayDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

    if (dayDiff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  // Check if current streak is active (last workout was yesterday or today)
  const lastDate = new Date(sortedDates[sortedDates.length - 1])
  const today = new Date()
  const daysSinceLastWorkout = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  const currentStreak = daysSinceLastWorkout <= 1 ? tempStreak : 0

  return { current: currentStreak, longest: longestStreak }
}

function daysBetween(start: string, end: string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
}

// ============ GET UNIQUE EXERCISES (FOR DROPDOWN) ============
export async function fetchUniqueExercises(): Promise<string[]> {
  const { data, error} = await supabase.from('workout_logs').select('exercise_name').order('exercise_name', { ascending: true })

  if (error) {
    console.error('Error fetching exercises:', error)
    throw error
  }

  const uniqueExercises = Array.from(new Set(data?.map((d) => d.exercise_name) || []))
  return uniqueExercises
}

// ============ ADVANCED ANALYTICS ============

// Calculate 1RM using Epley formula
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight
  if (reps > 12) return weight // Formula less accurate for >12 reps
  return weight * (1 + reps / 30)
}

// ============ VOLUME TRACKING ============
export interface VolumeDataPoint {
  date: string
  totalVolume: number
  exerciseBreakdown: Record<string, number>
  displayDate: string
}

export async function fetchVolumeProgression(exerciseName?: string): Promise<VolumeDataPoint[]> {
  let query = supabase
    .from('workout_logs')
    .select('date, exercise_name, weight_kg, reps')
    .order('date', { ascending: true })

  if (exerciseName) {
    query = query.eq('exercise_name', exerciseName)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching volume data:', error)
    throw error
  }

  if (!data || data.length === 0) return []

  // Group by date
  const groupedByDate = data.reduce(
    (acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = []
      }
      acc[log.date].push(log)
      return acc
    },
    {} as Record<string, typeof data>
  )

  return Object.entries(groupedByDate).map(([date, logs]) => {
    const exerciseBreakdown: Record<string, number> = {}
    let totalVolume = 0

    logs.forEach((log) => {
      const volume = log.weight_kg * log.reps
      totalVolume += volume
      if (!exerciseBreakdown[log.exercise_name]) {
        exerciseBreakdown[log.exercise_name] = 0
      }
      exerciseBreakdown[log.exercise_name] += volume
    })

    return {
      date,
      totalVolume: Math.round(totalVolume * 10) / 10,
      exerciseBreakdown,
      displayDate: formatDateForChart(date),
    }
  })
}

// ============ 1RM ESTIMATION & TRACKING ============
export interface OneRMDataPoint {
  date: string
  estimated1RM: number
  actualWeight: number
  actualReps: number
  displayDate: string
}

export async function fetch1RMHistory(exerciseName: string): Promise<OneRMDataPoint[]> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('date, weight_kg, reps')
    .eq('exercise_name', exerciseName)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching 1RM history:', error)
    throw error
  }

  if (!data || data.length === 0) return []

  // Group by date and get the best set (highest estimated 1RM)
  const groupedByDate = data.reduce(
    (acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = []
      }
      acc[log.date].push(log)
      return acc
    },
    {} as Record<string, typeof data>
  )

  return Object.entries(groupedByDate).map(([date, logs]) => {
    // Find the set with highest estimated 1RM
    const bestSet = logs.reduce((best, log) => {
      const current1RM = calculate1RM(log.weight_kg, log.reps)
      const best1RM = calculate1RM(best.weight_kg, best.reps)
      return current1RM > best1RM ? log : best
    })

    return {
      date,
      estimated1RM: Math.round(calculate1RM(bestSet.weight_kg, bestSet.reps) * 10) / 10,
      actualWeight: bestSet.weight_kg,
      actualReps: bestSet.reps,
      displayDate: formatDateForChart(date),
    }
  })
}

// ============ PROGRESS PERCENTAGE CALCULATIONS ============
export interface ProgressMetrics {
  absolute: number
  percentage: number
  trend: 'Gaining' | 'Declining' | 'Plateau'
  weeklyRate: number
}

export async function fetchProgressRate(exerciseName: string, days: number): Promise<ProgressMetrics> {
  const history = await fetch1RMHistory(exerciseName)

  if (history.length < 2) {
    return { absolute: 0, percentage: 0, trend: 'Plateau', weeklyRate: 0 }
  }

  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const recentData = history.filter((d) => new Date(d.date) >= startDate)

  if (recentData.length < 2) {
    return { absolute: 0, percentage: 0, trend: 'Plateau', weeklyRate: 0 }
  }

  const first1RM = recentData[0].estimated1RM
  const last1RM = recentData[recentData.length - 1].estimated1RM

  const absolute = last1RM - first1RM
  const percentage = (absolute / first1RM) * 100

  // Calculate trend using linear regression slope
  const slope = calculateSlope(recentData.map((d, idx) => ({ x: idx, y: d.estimated1RM })))
  const trend = slope > 0.1 ? 'Gaining' : slope < -0.1 ? 'Declining' : 'Plateau'

  // Weekly rate
  const weeklyRate = (absolute / days) * 7

  return {
    absolute: Math.round(absolute * 10) / 10,
    percentage: Math.round(percentage * 10) / 10,
    trend,
    weeklyRate: Math.round(weeklyRate * 10) / 10,
  }
}

// Linear regression slope calculation
function calculateSlope(points: Array<{ x: number; y: number }>): number {
  const n = points.length
  if (n < 2) return 0

  const sumX = points.reduce((sum, p) => sum + p.x, 0)
  const sumY = points.reduce((sum, p) => sum + p.y, 0)
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0)
  const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  return slope
}

// ============ MUSCLE GROUP AGGREGATION ============
export interface MuscleGroupProgress {
  category: string
  totalVolume: number
  exercises: Array<{
    name: string
    progress: ProgressMetrics
    currentWeight: number
  }>
  overallRating: number
}

export async function fetchMuscleGroupProgress(categoryPrefix: string, days: number = 30): Promise<MuscleGroupProgress> {
  const logs = await fetchAllWorkoutLogs()

  // Filter logs for this muscle group category
  const categoryLogs = logs.filter((log) => log.workout_type.startsWith(categoryPrefix))

  // Get unique exercises
  const exercises = Array.from(new Set(categoryLogs.map((l) => l.exercise_name)))

  // Calculate progress for each exercise
  const exerciseProgress = await Promise.all(
    exercises.map(async (exerciseName) => {
      const progress = await fetchProgressRate(exerciseName, days)
      const exerciseLogs = categoryLogs.filter((l) => l.exercise_name === exerciseName)
      const currentWeight = exerciseLogs.length > 0 ? Math.max(...exerciseLogs.map((l) => l.weight_kg)) : 0

      return {
        name: exerciseName,
        progress,
        currentWeight,
      }
    })
  )

  // Calculate total volume
  const totalVolume = categoryLogs.reduce((sum, log) => sum + log.weight_kg * log.reps, 0)

  // Calculate overall rating (0-10) based on average progress percentage
  const avgProgress = exerciseProgress.reduce((sum, ex) => sum + ex.progress.percentage, 0) / exerciseProgress.length
  const overallRating = Math.min(10, Math.max(0, 5 + avgProgress / 2))

  return {
    category: categoryPrefix,
    totalVolume: Math.round(totalVolume),
    exercises: exerciseProgress,
    overallRating: Math.round(overallRating * 10) / 10,
  }
}

// ============ WEEK-OVER-WEEK COMPARISON ============
export interface WeekComparison {
  thisWeek: {
    startDate: string
    endDate: string
    totalVolume: number
    workoutDays: number
    totalExercises: number
    avgWeight: number
  }
  lastWeek: {
    startDate: string
    endDate: string
    totalVolume: number
    workoutDays: number
    totalExercises: number
    avgWeight: number
  }
  changes: {
    volume: { absolute: number; percentage: number }
    workoutDays: { absolute: number }
    exercises: { absolute: number }
    avgWeight: { absolute: number; percentage: number }
  }
  bestImprovements: Array<{ exercise: string; change: number; percentage: number }>
  declines: Array<{ exercise: string; change: number; percentage: number }>
}

export async function fetchWeekComparison(weekOffset: number = 0): Promise<WeekComparison> {
  const today = new Date()

  // Calculate week start/end (Sunday to Saturday)
  const thisWeekEnd = new Date(today)
  thisWeekEnd.setDate(thisWeekEnd.getDate() - thisWeekEnd.getDay() - weekOffset * 7 + 6)
  const thisWeekStart = new Date(thisWeekEnd)
  thisWeekStart.setDate(thisWeekStart.getDate() - 6)

  const lastWeekEnd = new Date(thisWeekStart)
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1)
  const lastWeekStart = new Date(lastWeekEnd)
  lastWeekStart.setDate(lastWeekStart.getDate() - 6)

  const logs = await fetchAllWorkoutLogs()

  const thisWeekLogs = logs.filter((log) => {
    const logDate = new Date(log.date)
    return logDate >= thisWeekStart && logDate <= thisWeekEnd
  })

  const lastWeekLogs = logs.filter((log) => {
    const logDate = new Date(log.date)
    return logDate >= lastWeekStart && logDate <= lastWeekEnd
  })

  // Calculate metrics for each week
  const thisWeekMetrics = calculateWeekMetrics(thisWeekLogs)
  const lastWeekMetrics = calculateWeekMetrics(lastWeekLogs)

  // Calculate changes
  const volumeChange = thisWeekMetrics.totalVolume - lastWeekMetrics.totalVolume
  const volumePercentage = lastWeekMetrics.totalVolume > 0 ? (volumeChange / lastWeekMetrics.totalVolume) * 100 : 0

  const avgWeightChange = thisWeekMetrics.avgWeight - lastWeekMetrics.avgWeight
  const avgWeightPercentage = lastWeekMetrics.avgWeight > 0 ? (avgWeightChange / lastWeekMetrics.avgWeight) * 100 : 0

  // Find best improvements and declines by exercise
  const { improvements, declines } = compareExercises(thisWeekLogs, lastWeekLogs)

  return {
    thisWeek: {
      startDate: thisWeekStart.toISOString().split('T')[0],
      endDate: thisWeekEnd.toISOString().split('T')[0],
      ...thisWeekMetrics,
    },
    lastWeek: {
      startDate: lastWeekStart.toISOString().split('T')[0],
      endDate: lastWeekEnd.toISOString().split('T')[0],
      ...lastWeekMetrics,
    },
    changes: {
      volume: {
        absolute: Math.round(volumeChange),
        percentage: Math.round(volumePercentage * 10) / 10,
      },
      workoutDays: {
        absolute: thisWeekMetrics.workoutDays - lastWeekMetrics.workoutDays,
      },
      exercises: {
        absolute: thisWeekMetrics.totalExercises - lastWeekMetrics.totalExercises,
      },
      avgWeight: {
        absolute: Math.round(avgWeightChange * 10) / 10,
        percentage: Math.round(avgWeightPercentage * 10) / 10,
      },
    },
    bestImprovements: improvements,
    declines,
  }
}

function calculateWeekMetrics(logs: WorkoutLog[]) {
  const totalVolume = logs.reduce((sum, log) => sum + log.weight_kg * log.reps, 0)
  const workoutDays = new Set(logs.map((l) => l.date)).size
  const totalExercises = new Set(logs.map((l) => l.exercise_name)).size
  const avgWeight = logs.length > 0 ? logs.reduce((sum, log) => sum + log.weight_kg, 0) / logs.length : 0

  return {
    totalVolume: Math.round(totalVolume),
    workoutDays,
    totalExercises,
    avgWeight: Math.round(avgWeight * 10) / 10,
  }
}

function compareExercises(thisWeekLogs: WorkoutLog[], lastWeekLogs: WorkoutLog[]) {
  const thisWeekByExercise = groupByExercise(thisWeekLogs)
  const lastWeekByExercise = groupByExercise(lastWeekLogs)

  const comparisons: Array<{ exercise: string; change: number; percentage: number }> = []

  // Compare exercises that appear in both weeks
  Object.keys(thisWeekByExercise).forEach((exercise) => {
    if (lastWeekByExercise[exercise]) {
      const thisWeekMax = Math.max(...thisWeekByExercise[exercise].map((l) => l.weight_kg))
      const lastWeekMax = Math.max(...lastWeekByExercise[exercise].map((l) => l.weight_kg))
      const change = thisWeekMax - lastWeekMax
      const percentage = (change / lastWeekMax) * 100

      comparisons.push({
        exercise,
        change: Math.round(change * 10) / 10,
        percentage: Math.round(percentage * 10) / 10,
      })
    }
  })

  // Sort by absolute change
  const sorted = comparisons.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

  const improvements = sorted.filter((c) => c.change > 0).slice(0, 3)
  const declines = sorted.filter((c) => c.change < 0).slice(0, 3)

  return { improvements, declines }
}

function groupByExercise(logs: WorkoutLog[]): Record<string, WorkoutLog[]> {
  return logs.reduce(
    (acc, log) => {
      if (!acc[log.exercise_name]) {
        acc[log.exercise_name] = []
      }
      acc[log.exercise_name].push(log)
      return acc
    },
    {} as Record<string, WorkoutLog[]>
  )
}
