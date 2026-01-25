import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { SelectedExercise, WorkoutTemplate } from '@/lib/types'
import { EXERCISES } from '@/lib/exercises'
import { getTodayDate, formatDateShort } from '@/lib/utils/dateFormat'
import {
  validateDate,
  validateWeight,
  validateReps,
  validateDuration,
} from '@/lib/inputValidation'

interface UseWorkoutPersistenceOptions {
  /** Called when message should be shown to user */
  onMessage?: (message: string) => void
  /** Called when exercises are loaded */
  onExercisesLoaded?: (exercises: SelectedExercise[]) => void
  /** Called when date should be set */
  onDateSet?: (date: string) => void
}

interface UseWorkoutPersistenceReturn {
  /** Whether currently loading last workout */
  loadingLastWorkout: boolean
  /** Date of last loaded workout */
  lastWorkoutDate: string | null
  /** Load the user's most recent workout */
  loadLastWorkout: () => Promise<void>
  /** Load a workout template */
  loadTemplate: (template: WorkoutTemplate) => void
  /** Save workout to database */
  saveWorkout: (params: SaveWorkoutParams) => Promise<boolean>
  /** Whether currently saving */
  saving: boolean
}

interface SaveWorkoutParams {
  userId: string
  date: string
  exercises: SelectedExercise[]
  durationMinutes?: number
}

/**
 * Hook for loading and saving workout data
 *
 * @example
 * const persistence = useWorkoutPersistence({
 *   onMessage: setMessage,
 *   onExercisesLoaded: setExercises,
 *   onDateSet: setDate,
 * })
 *
 * // Load last workout
 * <button onClick={persistence.loadLastWorkout}>
 *   Copy Last
 * </button>
 *
 * // Save workout
 * const success = await persistence.saveWorkout({
 *   userId: user.id,
 *   date,
 *   exercises: selectedExercises,
 * })
 */
export function useWorkoutPersistence(
  options: UseWorkoutPersistenceOptions = {}
): UseWorkoutPersistenceReturn {
  const { onMessage, onExercisesLoaded, onDateSet } = options

  const [loadingLastWorkout, setLoadingLastWorkout] = useState(false)
  const [lastWorkoutDate, setLastWorkoutDate] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const loadLastWorkout = useCallback(async () => {
    setLoadingLastWorkout(true)
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('date, exercise_name, workout_type, set_number, weight_kg, reps')
        .order('date', { ascending: false })
        .limit(100)

      if (error) throw error
      if (!data || data.length === 0) {
        onMessage?.('No previous workouts found')
        setLoadingLastWorkout(false)
        return
      }

      const lastDate = data[0].date
      setLastWorkoutDate(lastDate)

      const lastWorkoutLogs = data.filter((log) => log.date === lastDate)

      const exerciseMap = new Map<
        string,
        { name: string; category: string; sets: Array<{ weight: string; reps: string }> }
      >()

      lastWorkoutLogs.forEach((log) => {
        if (!exerciseMap.has(log.exercise_name)) {
          exerciseMap.set(log.exercise_name, {
            name: log.exercise_name,
            category: log.workout_type,
            sets: [],
          })
        }
        const exercise = exerciseMap.get(log.exercise_name)!
        exercise.sets[log.set_number - 1] = {
          weight: log.weight_kg.toString(),
          reps: log.reps.toString(),
        }
      })

      const exercises: SelectedExercise[] = Array.from(exerciseMap.values()).map((ex) => ({
        id: crypto.randomUUID(),
        exerciseId: ex.name.toLowerCase().replace(/\s+/g, '-'),
        name: ex.name,
        category: ex.category as SelectedExercise['category'],
        sets:
          ex.sets.length === 4
            ? ex.sets
            : [...ex.sets, ...Array(4 - ex.sets.length).fill({ weight: '', reps: '' })],
      }))

      onExercisesLoaded?.(exercises)
      onDateSet?.(getTodayDate())
      onMessage?.(
        `Loaded workout from ${formatDateShort(lastDate)} (${exercises.length} exercises)`
      )
    } catch (error) {
      console.error('Error loading last workout:', error)
      onMessage?.('Error loading last workout')
    }
    setLoadingLastWorkout(false)
  }, [onMessage, onExercisesLoaded, onDateSet])

  const loadTemplate = useCallback(
    (template: WorkoutTemplate) => {
      const exercises: SelectedExercise[] = template.exercises.map((ex) => {
        const fullExercise = EXERCISES.find(
          (e) => e.id === ex.exerciseId || e.name === ex.name
        )

        return {
          id: crypto.randomUUID(),
          exerciseId: fullExercise?.id || ex.exerciseId,
          name: ex.name,
          category: ex.category,
          sets: Array(4)
            .fill(null)
            .map(() => ({ weight: '', reps: '' })),
        }
      })

      onExercisesLoaded?.(exercises)
      onDateSet?.(getTodayDate())
      onMessage?.(
        `Loaded template "${template.name}" (${template.exercises.length} exercises)`
      )
    },
    [onMessage, onExercisesLoaded, onDateSet]
  )

  const saveWorkout = useCallback(
    async (params: SaveWorkoutParams): Promise<boolean> => {
      const { userId, date, exercises, durationMinutes } = params

      setSaving(true)

      // Validate date
      if (!date) {
        onMessage?.('Please select a date.')
        setSaving(false)
        return false
      }

      const dateValidation = validateDate(date, {
        allowPast: true,
        allowFuture: false,
        maxDaysInPast: 365,
      })

      if (!dateValidation.isValid) {
        onMessage?.(dateValidation.error || 'Invalid date')
        setSaving(false)
        return false
      }

      if (exercises.length === 0) {
        onMessage?.('Please add at least one exercise.')
        setSaving(false)
        return false
      }

      if (!userId) {
        onMessage?.('You must be logged in to save workouts.')
        setSaving(false)
        return false
      }

      // Validate and build rows
      const validatedRows: Array<{
        user_id: string
        date: string
        workout_type: string
        exercise_name: string
        set_number: number
        weight_kg: number
        reps: number
      }> = []
      let validationError: string | null = null

      for (const exercise of exercises) {
        // Handle cardio exercises
        if (exercise.category === 'cardio') {
          if (!exercise.duration || exercise.duration <= 0) {
            continue // Skip empty cardio exercises
          }

          const durationValidation = validateDuration(exercise.duration)
          if (!durationValidation.isValid) {
            validationError = `${exercise.name}: ${durationValidation.error}`
            break
          }

          validatedRows.push({
            user_id: userId,
            date,
            workout_type: exercise.category,
            exercise_name: exercise.name,
            set_number: 1,
            weight_kg: 0,
            reps: durationValidation.sanitizedValue!,
          })
        } else {
          // Handle strength exercises
          for (let i = 0; i < exercise.sets.length; i++) {
            const set = exercise.sets[i]

            // Skip empty sets
            if (!set.weight || !set.reps) {
              continue
            }

            // Validate weight
            const weightValidation = validateWeight(set.weight)
            if (!weightValidation.isValid) {
              validationError = `${exercise.name} Set ${i + 1}: ${weightValidation.error}`
              break
            }

            // Validate reps
            const repsValidation = validateReps(set.reps)
            if (!repsValidation.isValid) {
              validationError = `${exercise.name} Set ${i + 1}: ${repsValidation.error}`
              break
            }

            validatedRows.push({
              user_id: userId,
              date,
              workout_type: exercise.category,
              exercise_name: exercise.name,
              set_number: i + 1,
              weight_kg: weightValidation.sanitizedValue!,
              reps: repsValidation.sanitizedValue!,
            })
          }

          if (validationError) break
        }
      }

      if (validationError) {
        onMessage?.(validationError)
        setSaving(false)
        return false
      }

      if (validatedRows.length === 0) {
        onMessage?.('No sets to save. Enter at least one set.')
        setSaving(false)
        return false
      }

      const { error } = await supabase.from('workout_logs').insert(validatedRows)

      if (error) {
        onMessage?.('Error saving: ' + error.message)
        setSaving(false)
        return false
      }

      const duration = durationMinutes ?? 0
      onMessage?.(
        `Saved ${validatedRows.length} sets!${duration > 0 ? ` Duration: ${duration}min` : ''}`
      )
      setSaving(false)
      return true
    },
    [onMessage]
  )

  return {
    loadingLastWorkout,
    lastWorkoutDate,
    loadLastWorkout,
    loadTemplate,
    saveWorkout,
    saving,
  }
}
