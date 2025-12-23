import { WorkoutTemplate, ExerciseCategory } from './types'

const STORAGE_KEY = 'workout_templates'

// ============ TEMPLATE CRUD OPERATIONS ============

/**
 * Get all saved templates from localStorage
 */
export function getAllTemplates(): WorkoutTemplate[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const templates = JSON.parse(stored)
    return Array.isArray(templates) ? templates : []
  } catch (error) {
    console.error('Error loading templates:', error)
    return []
  }
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(id: string): WorkoutTemplate | null {
  const templates = getAllTemplates()
  return templates.find((t) => t.id === id) || null
}

/**
 * Save a new template
 */
export function saveTemplate(
  name: string,
  exercises: Array<{
    exerciseId: string
    name: string
    category: ExerciseCategory
  }>
): WorkoutTemplate {
  const templates = getAllTemplates()

  const newTemplate: WorkoutTemplate = {
    id: crypto.randomUUID(),
    name,
    exercises,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  templates.push(newTemplate)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))

  return newTemplate
}

/**
 * Update an existing template
 */
export function updateTemplate(
  id: string,
  updates: {
    name?: string
    exercises?: Array<{
      exerciseId: string
      name: string
      category: ExerciseCategory
    }>
  }
): WorkoutTemplate | null {
  const templates = getAllTemplates()
  const index = templates.findIndex((t) => t.id === id)

  if (index === -1) return null

  const updated: WorkoutTemplate = {
    ...templates[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  templates[index] = updated
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))

  return updated
}

/**
 * Delete a template
 */
export function deleteTemplate(id: string): boolean {
  const templates = getAllTemplates()
  const filtered = templates.filter((t) => t.id !== id)

  if (filtered.length === templates.length) return false // Template not found

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Check if template name already exists
 */
export function templateNameExists(name: string, excludeId?: string): boolean {
  const templates = getAllTemplates()
  return templates.some((t) => t.name.toLowerCase() === name.toLowerCase() && t.id !== excludeId)
}

/**
 * Get template count
 */
export function getTemplateCount(): number {
  return getAllTemplates().length
}
