import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWorkoutTimer } from '@/lib/hooks/useWorkoutTimer'

describe('useWorkoutTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('starts with zero elapsed time', () => {
      const { result } = renderHook(() => useWorkoutTimer())
      expect(result.current.elapsedTime).toBe(0)
    })

    it('starts not running', () => {
      const { result } = renderHook(() => useWorkoutTimer())
      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('start', () => {
    it('starts the timer', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      expect(result.current.isRunning).toBe(true)
    })

    it('increments elapsed time every second', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      expect(result.current.elapsedTime).toBe(0)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(result.current.elapsedTime).toBe(1)

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.elapsedTime).toBe(6)
    })

    it('does not restart if already running', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      const elapsedBefore = result.current.elapsedTime

      // Try to start again
      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Should continue from previous time, not reset
      expect(result.current.elapsedTime).toBe(elapsedBefore + 1)
    })
  })

  describe('stop', () => {
    it('stops incrementing elapsed time', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      act(() => {
        result.current.stop()
      })

      const elapsedAfterStop = result.current.elapsedTime

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(result.current.elapsedTime).toBe(elapsedAfterStop)
    })
  })

  describe('reset', () => {
    it('resets elapsed time to zero', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(5000)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.elapsedTime).toBe(0)
      expect(result.current.isRunning).toBe(false)
    })
  })

  describe('formatDuration', () => {
    it('formats seconds only', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(30000) // 30 seconds
      })

      expect(result.current.formatDuration()).toBe('30s')
    })

    it('formats minutes and seconds', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(125000) // 2m 5s
      })

      expect(result.current.formatDuration()).toBe('2m 5s')
    })

    it('formats custom seconds value', () => {
      const { result } = renderHook(() => useWorkoutTimer())
      expect(result.current.formatDuration(90)).toBe('1m 30s')
    })

    it('formats zero correctly', () => {
      const { result } = renderHook(() => useWorkoutTimer())
      expect(result.current.formatDuration(0)).toBe('0s')
    })
  })

  describe('getDurationMinutes', () => {
    it('returns 0 when not started', () => {
      const { result } = renderHook(() => useWorkoutTimer())
      expect(result.current.getDurationMinutes()).toBe(0)
    })

    it('returns duration in minutes', () => {
      const { result } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(150000) // 2.5 minutes
      })

      expect(result.current.getDurationMinutes()).toBe(2)
    })
  })

  describe('cleanup', () => {
    it('cleans up interval on unmount', () => {
      const { result, unmount } = renderHook(() => useWorkoutTimer())

      act(() => {
        result.current.start()
      })

      unmount()

      // No error should occur when timers advance after unmount
      vi.advanceTimersByTime(5000)
    })
  })
})
