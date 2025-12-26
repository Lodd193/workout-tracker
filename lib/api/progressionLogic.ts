import { supabase } from '@/lib/supabase'
import { WorkoutLog } from '@/lib/types'

/**
 * Progression strategy: 8 reps → 10 reps → 12 reps × 4 sets
 * After hitting 12 reps × 4 sets for 2 CONSECUTIVE sessions → increase weight and drop to 8 reps
 */

export interface ProgressionSuggestion {
  targetWeight: number // in kg
  targetReps: number
  targetSets: number
  volumeIncrease: number // percentage
  reasoning: string
  lastPerformance: {
    date: string
    weight: number
    reps: number
    sets: number
  } | null
}

// Check if a set meets the progression target
export function meetsProgressionTarget(
  weightKg: number,
  reps: number,
  target: ProgressionSuggestion
): boolean {
  // Weight must be at least the target weight
  if (weightKg < target.targetWeight) {
    return false
  }

  // If weight equals target, reps must meet or exceed target
  if (weightKg === target.targetWeight && reps < target.targetReps) {
    return false
  }

  // If weight exceeds target, any reps count as meeting the target
  // (user is pushing heavier than recommended)
  return true
}


// Check if a set exceeds the progression target (for positive feedback)
export function exceedsProgressionTarget(
  weightKg: number,
  reps: number,
  target: ProgressionSuggestion
): boolean {
  // Weight exceeds target
  if (weightKg > target.targetWeight) {
    return true
  }

  // Weight equals target AND reps exceed target
  if (weightKg === target.targetWeight && reps > target.targetReps) {
    return true
  }

  return false
}

// Get weight increment based on exercise equipment type
function getWeightIncrement(exerciseName: string): number {
  const nameLower = exerciseName.toLowerCase()

  // Barbell exercises
  if (
    nameLower.includes('barbell') ||
    nameLower.includes('bb ') ||
    nameLower.includes('squat') ||
    nameLower.includes('deadlift') ||
    nameLower.includes('bench press') && !nameLower.includes('dumbbell')
  ) {
    return 2.5 // kg
  }

  // Dumbbell exercises
  if (nameLower.includes('dumbbell') || nameLower.includes('db ')) {
    return 2 // kg (placeholder - user will confirm)
  }

  // Cable exercises
  if (nameLower.includes('cable') || nameLower.includes('crossover')) {
    return 2.5 // kg (placeholder)
  }

  // Machine or default
  return 2.5 // kg (placeholder)
}

// Fetch last 3 workout sessions for an exercise
async function fetchRecentSessions(exerciseName: string, limit = 3): Promise<
  Array<{
    date: string
    sets: Array<{ weight_kg: number; reps: number }>
  }>
> {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('date, weight_kg, reps, set_number')
    .eq('exercise_name', exerciseName)
    .order('date', { ascending: false })
    .limit(50) // Get enough to cover last few sessions

  if (error || !data || data.length === 0) {
    return []
  }

  // Group by date
  const sessionsByDate: Record<string, Array<{ weight_kg: number; reps: number }>> = {}

  data.forEach((log) => {
    if (!sessionsByDate[log.date]) {
      sessionsByDate[log.date] = []
    }
    sessionsByDate[log.date].push({
      weight_kg: log.weight_kg,
      reps: log.reps,
    })
  })

  // Convert to array and take last N sessions
  const sessions = Object.entries(sessionsByDate)
    .map(([date, sets]) => ({
      date,
      sets,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)

  return sessions
}

// Check if a session hit the target (specific reps × 4 sets)
function sessionHitTarget(
  session: { sets: Array<{ weight_kg: number; reps: number }> },
  targetReps: number,
  weight: number
): boolean {
  // Check if we have 4 sets at the target weight and reps
  const qualifyingSets = session.sets.filter(
    (set) => set.weight_kg === weight && set.reps >= targetReps
  )

  return qualifyingSets.length >= 4
}

// Main progression suggestion function
export async function fetchProgressionSuggestion(
  exerciseName: string
): Promise<ProgressionSuggestion | null> {
  const sessions = await fetchRecentSessions(exerciseName, 3)

  if (sessions.length === 0) {
    return null // No history
  }

  const lastSession = sessions[0]
  const secondLastSession = sessions.length > 1 ? sessions[1] : null

  // Find the most common weight from last session (working weight)
  const lastWeights = lastSession.sets.map((s) => s.weight_kg)
  const workingWeight = lastWeights.sort(
    (a, b) => lastWeights.filter((w) => w === b).length - lastWeights.filter((w) => w === a).length
  )[0]

  // Find best set from last session (highest reps at working weight)
  const setsAtWorkingWeight = lastSession.sets.filter((s) => s.weight_kg === workingWeight)
  const bestSet = setsAtWorkingWeight.reduce((best, set) => (set.reps > best.reps ? set : best))

  const currentReps = bestSet.reps
  const currentSets = setsAtWorkingWeight.length

  // Calculate current volume
  const currentVolume = workingWeight * currentReps * currentSets

  // Determine progression
  let targetWeight = workingWeight
  let targetReps = currentReps
  let reasoning = ''

  // Check if we hit 12 reps × 4 sets for 2 consecutive sessions
  const lastSessionHit12 = sessionHitTarget(lastSession, 12, workingWeight)
  const secondLastSessionHit12 = secondLastSession
    ? sessionHitTarget(secondLastSession, 12, workingWeight)
    : false

  if (lastSessionHit12 && secondLastSessionHit12) {
    // TIME TO INCREASE WEIGHT!
    const increment = getWeightIncrement(exerciseName)
    targetWeight = workingWeight + increment
    targetReps = 8 // Drop back to 8 reps
    reasoning = `You hit 12 reps × 4 sets for 2 sessions! Time to increase weight by ${increment}kg and drop to 8 reps.`
  } else if (currentReps >= 12) {
    // Hit 12 reps but need one more session
    targetWeight = workingWeight
    targetReps = 12
    reasoning = 'Hit 12 reps × 4 sets again to unlock weight progression!'
  } else if (currentReps >= 10) {
    // Progress from 10 to 12 reps
    targetReps = 12
    reasoning = 'Progress from 10 to 12 reps while maintaining form.'
  } else if (currentReps >= 8) {
    // Progress from 8 to 10 reps
    targetReps = 10
    reasoning = 'Progress from 8 to 10 reps.'
  } else {
    // Below 8 reps - try to hit 8
    targetReps = 8
    reasoning = 'Aim for 8 reps × 4 sets to establish a solid baseline.'
  }

  // Calculate target volume and increase
  const targetVolume = targetWeight * targetReps * 4 // Always aim for 4 sets
  const volumeIncrease = ((targetVolume - currentVolume) / currentVolume) * 100

  return {
    targetWeight,
    targetReps,
    targetSets: 4,
    volumeIncrease: Math.round(volumeIncrease * 10) / 10,
    reasoning,
    lastPerformance: {
      date: lastSession.date,
      weight: workingWeight,
      reps: currentReps,
      sets: currentSets,
    },
  }
}
