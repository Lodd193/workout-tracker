import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWorkoutTimerOptions {
  /** Whether to auto-start when triggered (default: true) */
  autoStart?: boolean
}

interface UseWorkoutTimerReturn {
  /** Time elapsed in seconds since workout started */
  elapsedTime: number
  /** Whether the timer is currently running */
  isRunning: boolean
  /** Start the timer */
  start: () => void
  /** Stop the timer */
  stop: () => void
  /** Reset the timer */
  reset: () => void
  /** Format elapsed time as human-readable string */
  formatDuration: (seconds?: number) => string
  /** Get duration in minutes (for saving) */
  getDurationMinutes: () => number
}

/**
 * Hook for tracking workout duration
 *
 * @example
 * const timer = useWorkoutTimer()
 *
 * // Start when first exercise is added
 * useEffect(() => {
 *   if (exercises.length > 0 && !timer.isRunning) {
 *     timer.start()
 *   }
 * }, [exercises.length])
 *
 * // Display elapsed time
 * <span>{timer.formatDuration()}</span>
 *
 * // Reset after saving
 * timer.reset()
 */
export function useWorkoutTimer(options: UseWorkoutTimerOptions = {}): UseWorkoutTimerReturn {
  const { autoStart = true } = options

  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Update elapsed time every second when running
  useEffect(() => {
    if (startTime) {
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [startTime])

  const start = useCallback(() => {
    if (!startTime) {
      setStartTime(Date.now())
    }
  }, [startTime])

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setStartTime(null)
    setElapsedTime(0)
  }, [])

  const formatDuration = useCallback((seconds?: number): string => {
    const secs = seconds ?? elapsedTime
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    if (mins === 0) return `${remainingSecs}s`
    return `${mins}m ${remainingSecs}s`
  }, [elapsedTime])

  const getDurationMinutes = useCallback((): number => {
    return startTime ? Math.floor((Date.now() - startTime) / 60000) : 0
  }, [startTime])

  return {
    elapsedTime,
    isRunning: startTime !== null,
    start,
    stop,
    reset,
    formatDuration,
    getDurationMinutes,
  }
}
