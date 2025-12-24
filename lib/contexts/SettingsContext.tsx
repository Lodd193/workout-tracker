'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type WeightUnit = 'kg' | 'lbs'

interface SettingsContextType {
  weightUnit: WeightUnit
  toggleWeightUnit: () => void
  convertWeight: (kg: number) => number
  formatWeight: (kg: number) => string
  weeklyCardioGoal: number
  setWeeklyCardioGoal: (goal: number) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [weeklyCardioGoal, setWeeklyCardioGoalState] = useState<number>(150)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedUnit = localStorage.getItem('weightUnit') as WeightUnit | null
    const savedCardioGoal = localStorage.getItem('weeklyCardioGoal')

    if (savedUnit) setWeightUnit(savedUnit)
    if (savedCardioGoal) setWeeklyCardioGoalState(parseInt(savedCardioGoal, 10))

    setMounted(true)
  }, [])

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === 'kg' ? 'lbs' : 'kg'
    setWeightUnit(newUnit)
    localStorage.setItem('weightUnit', newUnit)
  }

  const setWeeklyCardioGoal = (goal: number) => {
    setWeeklyCardioGoalState(goal)
    localStorage.setItem('weeklyCardioGoal', goal.toString())
  }

  // Convert kg to lbs or return kg
  const convertWeight = (kg: number): number => {
    if (weightUnit === 'lbs') {
      return Math.round(kg * 2.20462 * 10) / 10 // Round to 1 decimal
    }
    return kg
  }

  // Format weight with unit
  const formatWeight = (kg: number): string => {
    const converted = convertWeight(kg)
    return `${converted}${weightUnit}`
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <SettingsContext.Provider
      value={{
        weightUnit,
        toggleWeightUnit,
        convertWeight,
        formatWeight,
        weeklyCardioGoal,
        setWeeklyCardioGoal,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    // Return default values for SSR
    return {
      weightUnit: 'kg' as const,
      toggleWeightUnit: () => {},
      convertWeight: (kg: number) => kg,
      formatWeight: (kg: number) => `${kg}kg`,
      weeklyCardioGoal: 150,
      setWeeklyCardioGoal: () => {},
    }
  }
  return context
}
