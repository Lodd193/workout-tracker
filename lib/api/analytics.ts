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
  const { data, error } = await supabase.from('workout_logs').select('exercise_name').order('exercise_name', { ascending: true })

  if (error) {
    console.error('Error fetching exercises:', error)
    throw error
  }

  const uniqueExercises = Array.from(new Set(data?.map((d) => d.exercise_name) || []))
  return uniqueExercises
}
