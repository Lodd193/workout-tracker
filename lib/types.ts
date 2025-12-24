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
  | 'cardio'

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
  duration?: number       // for cardio exercises (minutes)
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

// ============ WORKOUT TEMPLATES ============

export interface WorkoutTemplate {
  id: string                // Unique template ID
  name: string              // User-defined name (e.g., "Push Day")
  exercises: Array<{
    exerciseId: string      // Reference to exercise library
    name: string
    category: ExerciseCategory
  }>
  createdAt: string         // ISO timestamp
  updatedAt: string         // ISO timestamp
}

// ============ USER GOALS ============

export interface UserGoal {
  id: number
  user_id: string
  exercise_name: string
  target_weight_kg: number
  target_date: string | null      // ISO date string (YYYY-MM-DD) or null
  created_at: string               // ISO timestamp
  achieved_at: string | null       // ISO timestamp or null
  is_active: boolean
  notes: string | null
}

export interface GoalProgress {
  goal: UserGoal
  currentWeight: number            // Current max weight for this exercise
  currentWeightDate: string        // Date of current PR
  progressPercentage: number       // (current / target) * 100
  weightRemaining: number          // target - current
  isAchieved: boolean              // currentWeight >= target_weight_kg
  onTrackStatus: 'ahead' | 'on-track' | 'behind' | 'unknown'
  estimatedCompletion: string | null  // Estimated date based on trend
  daysRemaining: number | null     // Days until target_date
  progressRate: number             // kg/week based on recent trend
  recentTrend: 'improving' | 'plateau' | 'declining'
}

export interface GoalFormData {
  exercise_name: string
  target_weight_kg: number
  target_date: string | null
  notes: string | null
}

// ============ PREDICTIVE ANALYTICS ============

export interface PRPrediction {
  exercise_name: string
  current_pr: number
  predicted_pr: number              // Predicted max in next 30 days
  predicted_date: string            // ISO date when prediction is expected
  confidence: 'high' | 'medium' | 'low'  // Based on data consistency
  weekly_gain: number               // Average kg/week gain
}

export interface PlateauAlert {
  exercise_name: string
  last_pr_date: string
  days_since_progress: number
  last_pr_weight: number
  recommendation: string
  severity: 'warning' | 'concern' | 'critical'
}

export interface MilestonePrediction {
  exercise_name: string
  milestone_weight: number          // e.g., 100kg
  current_weight: number
  estimated_date: string | null     // When you'll hit it (null if declining)
  weeks_remaining: number | null
  is_achievable: boolean
}
