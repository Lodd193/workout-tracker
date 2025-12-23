export type ExerciseCategory =
  | 'chest_upper'
  | 'chest_mid'
  | 'chest_lower'
  | 'back_vertical'
  | 'back_horizontal'
  | 'shoulders'
  | 'arms_biceps'
  | 'arms_triceps'
  | 'legs_quad'
  | 'legs_hamstring'
  | 'legs_glutes'
  | 'legs_calves'
  | 'core'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  categoryLabel: string
}

export interface SetData {
  weight: string
  reps: string
}

export interface SelectedExercise {
  id: string              // unique instance ID for this exercise in the workout
  exerciseId: string      // reference to exercise library
  name: string
  category: ExerciseCategory
  sets: SetData[]
}

// ============ ANALYTICS TYPES ============

// Raw workout log from database
export interface WorkoutLog {
  id: number
  date: string              // ISO date string (YYYY-MM-DD)
  workout_type: string      // Category from exercises library
  exercise_name: string
  set_number: number
  weight_kg: number
  reps: number
  created_at: string
}

// Data point for weight progression chart
export interface WeightProgressionDataPoint {
  date: string              // ISO date string
  maxWeight: number         // Maximum weight lifted that day
  avgWeight: number         // Average weight across all sets
  totalSets: number         // Number of sets performed
  displayDate: string       // Formatted date for chart (e.g., "Jan 15")
}

// Personal record for an exercise
export interface PersonalRecord {
  exercise_name: string
  max_weight: number
  date_achieved: string     // ISO date string
  reps_at_max: number       // Reps performed at max weight
  total_sessions: number    // How many times exercise was performed
  category: string          // Exercise category
}

// Workout frequency data for heatmap
export interface WorkoutDayData {
  date: string              // ISO date string (YYYY-MM-DD)
  exerciseCount: number     // Number of unique exercises that day
  totalSets: number         // Total sets logged
  intensity: number         // 0-4 for heatmap color intensity
}

// Analytics summary stats
export interface AnalyticsSummary {
  totalWorkouts: number
  totalSets: number
  totalExercises: number
  currentStreak: number     // Consecutive days with workouts
  longestStreak: number
  avgWorkoutsPerWeek: number
}
