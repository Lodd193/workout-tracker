import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Mock supabase before importing the module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}))

import { useWorkoutPersistence } from '@/lib/hooks/useWorkoutPersistence'
import { supabase } from '@/lib/supabase'
import { SelectedExercise, WorkoutTemplate } from '@/lib/types'

describe('useWorkoutPersistence', () => {
  const mockOnMessage = vi.fn()
  const mockOnExercisesLoaded = vi.fn()
  const mockOnDateSet = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-25T12:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with loadingLastWorkout false', () => {
      const { result } = renderHook(() => useWorkoutPersistence())
      expect(result.current.loadingLastWorkout).toBe(false)
    })

    it('starts with lastWorkoutDate null', () => {
      const { result } = renderHook(() => useWorkoutPersistence())
      expect(result.current.lastWorkoutDate).toBeNull()
    })

    it('starts with saving false', () => {
      const { result } = renderHook(() => useWorkoutPersistence())
      expect(result.current.saving).toBe(false)
    })
  })

  describe('loadLastWorkout', () => {
    it('shows message when no workouts found', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      await act(async () => {
        await result.current.loadLastWorkout()
      })

      expect(mockOnMessage).toHaveBeenCalledWith('No previous workouts found')
    })

    it('loads exercises from last workout', async () => {
      const mockWorkoutData = [
        {
          date: '2026-01-24',
          exercise_name: 'Bench Press',
          workout_type: 'chest',
          set_number: 1,
          weight_kg: 100,
          reps: 8,
        },
        {
          date: '2026-01-24',
          exercise_name: 'Bench Press',
          workout_type: 'chest',
          set_number: 2,
          weight_kg: 100,
          reps: 8,
        },
      ]

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: mockWorkoutData, error: null }),
          }),
        }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({
          onMessage: mockOnMessage,
          onExercisesLoaded: mockOnExercisesLoaded,
          onDateSet: mockOnDateSet,
        })
      )

      await act(async () => {
        await result.current.loadLastWorkout()
      })

      expect(mockOnExercisesLoaded).toHaveBeenCalled()
      const loadedExercises = mockOnExercisesLoaded.mock.calls[0][0]
      expect(loadedExercises).toHaveLength(1)
      expect(loadedExercises[0].name).toBe('Bench Press')
      expect(loadedExercises[0].sets).toHaveLength(4)
    })

    it('sets today date after loading', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ date: '2026-01-24', exercise_name: 'Squats', workout_type: 'legs', set_number: 1, weight_kg: 100, reps: 10 }],
              error: null,
            }),
          }),
        }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onDateSet: mockOnDateSet })
      )

      await act(async () => {
        await result.current.loadLastWorkout()
      })

      expect(mockOnDateSet).toHaveBeenCalledWith('2026-01-25')
    })

    it('handles errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
          }),
        }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      await act(async () => {
        await result.current.loadLastWorkout()
      })

      expect(mockOnMessage).toHaveBeenCalledWith('Error loading last workout')
    })
  })

  describe('loadTemplate', () => {
    it('converts template to selected exercises', () => {
      const template: WorkoutTemplate = {
        id: '1',
        name: 'Push Day',
        exercises: [
          { exerciseId: 'bench-press', name: 'Bench Press', category: 'chest' },
          { exerciseId: 'shoulder-press', name: 'Shoulder Press', category: 'shoulders' },
        ],
      }

      const { result } = renderHook(() =>
        useWorkoutPersistence({
          onMessage: mockOnMessage,
          onExercisesLoaded: mockOnExercisesLoaded,
          onDateSet: mockOnDateSet,
        })
      )

      act(() => {
        result.current.loadTemplate(template)
      })

      expect(mockOnExercisesLoaded).toHaveBeenCalled()
      const loadedExercises = mockOnExercisesLoaded.mock.calls[0][0]
      expect(loadedExercises).toHaveLength(2)
      expect(loadedExercises[0].name).toBe('Bench Press')
      expect(loadedExercises[0].sets).toHaveLength(4)
      expect(loadedExercises[0].sets[0]).toEqual({ weight: '', reps: '' })
    })

    it('shows success message', () => {
      const template: WorkoutTemplate = {
        id: '1',
        name: 'Push Day',
        exercises: [{ exerciseId: 'bench-press', name: 'Bench Press', category: 'chest' }],
      }

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      act(() => {
        result.current.loadTemplate(template)
      })

      expect(mockOnMessage).toHaveBeenCalledWith(expect.stringContaining('Push Day'))
    })
  })

  describe('saveWorkout', () => {
    const mockExercises: SelectedExercise[] = [
      {
        id: '1',
        exerciseId: 'bench-press',
        name: 'Bench Press',
        category: 'chest',
        sets: [
          { weight: '100', reps: '8' },
          { weight: '100', reps: '8' },
          { weight: '', reps: '' },
          { weight: '', reps: '' },
        ],
      },
    ]

    it('validates date is required', async () => {
      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.saveWorkout({
          userId: 'user-1',
          date: '',
          exercises: mockExercises,
        })
      })

      expect(success).toBe(false)
      expect(mockOnMessage).toHaveBeenCalledWith('Please select a date.')
    })

    it('validates exercises are required', async () => {
      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.saveWorkout({
          userId: 'user-1',
          date: '2026-01-25',
          exercises: [],
        })
      })

      expect(success).toBe(false)
      expect(mockOnMessage).toHaveBeenCalledWith('Please add at least one exercise.')
    })

    it('validates user is required', async () => {
      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.saveWorkout({
          userId: '',
          date: '2026-01-25',
          exercises: mockExercises,
        })
      })

      expect(success).toBe(false)
      expect(mockOnMessage).toHaveBeenCalledWith('You must be logged in to save workouts.')
    })

    it('saves workout successfully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.saveWorkout({
          userId: 'user-1',
          date: '2026-01-25',
          exercises: mockExercises,
        })
      })

      expect(success).toBe(true)
      expect(mockOnMessage).toHaveBeenCalledWith(expect.stringContaining('Saved'))
    })

    it('includes duration in success message', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      await act(async () => {
        await result.current.saveWorkout({
          userId: 'user-1',
          date: '2026-01-25',
          exercises: mockExercises,
          durationMinutes: 45,
        })
      })

      expect(mockOnMessage).toHaveBeenCalledWith(expect.stringContaining('45min'))
    })

    it('handles save errors', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.saveWorkout({
          userId: 'user-1',
          date: '2026-01-25',
          exercises: mockExercises,
        })
      })

      expect(success).toBe(false)
      expect(mockOnMessage).toHaveBeenCalledWith(expect.stringContaining('Error'))
    })

    it('validates weight values', async () => {
      const invalidExercises: SelectedExercise[] = [
        {
          id: '1',
          exerciseId: 'bench-press',
          name: 'Bench Press',
          category: 'chest',
          sets: [
            { weight: '-50', reps: '8' },
            { weight: '', reps: '' },
            { weight: '', reps: '' },
            { weight: '', reps: '' },
          ],
        },
      ]

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      let success: boolean = false
      await act(async () => {
        success = await result.current.saveWorkout({
          userId: 'user-1',
          date: '2026-01-25',
          exercises: invalidExercises,
        })
      })

      expect(success).toBe(false)
      expect(mockOnMessage).toHaveBeenCalledWith(expect.stringContaining('Bench Press'))
    })

    it('skips empty sets', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      } as any)

      const { result } = renderHook(() =>
        useWorkoutPersistence({ onMessage: mockOnMessage })
      )

      await act(async () => {
        await result.current.saveWorkout({
          userId: 'user-1',
          date: '2026-01-25',
          exercises: mockExercises, // Has 2 filled sets, 2 empty
        })
      })

      expect(mockOnMessage).toHaveBeenCalledWith(expect.stringContaining('2 sets'))
    })
  })
})
