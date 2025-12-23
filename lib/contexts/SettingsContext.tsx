'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type WeightUnit = 'kg' | 'lbs'
type Theme = 'dark' | 'light'

interface SettingsContextType {
  weightUnit: WeightUnit
  theme: Theme
  toggleWeightUnit: () => void
  toggleTheme: () => void
  convertWeight: (kg: number) => number
  formatWeight: (kg: number) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedUnit = localStorage.getItem('weightUnit') as WeightUnit | null
    const savedTheme = localStorage.getItem('theme') as Theme | null

    if (savedUnit) setWeightUnit(savedUnit)
    if (savedTheme) setTheme(savedTheme)

    setMounted(true)
  }, [])

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    if (theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }, [theme, mounted])

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === 'kg' ? 'lbs' : 'kg'
    setWeightUnit(newUnit)
    localStorage.setItem('weightUnit', newUnit)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
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
        theme,
        toggleWeightUnit,
        toggleTheme,
        convertWeight,
        formatWeight,
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
      theme: 'dark' as const,
      toggleWeightUnit: () => {},
      toggleTheme: () => {},
      convertWeight: (kg: number) => kg,
      formatWeight: (kg: number) => `${kg}kg`,
    }
  }
  return context
}
