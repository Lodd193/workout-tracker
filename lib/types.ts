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
