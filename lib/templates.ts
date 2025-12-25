import { WorkoutTemplate, ExerciseCategory } from './types'
import { supabase } from './supabase'

const LEGACY_STORAGE_KEY = 'workout_templates' // For migration

// ============ TEMPLATE CRUD OPERATIONS ============

/**
 * Get all saved templates from Supabase
 */
export async function getAllTemplates(): Promise<WorkoutTemplate[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      exercises: row.exercises,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.error('Error loading templates:', error)
    return []
  }
}

/**
 * Get a specific template by ID
 */
export async function getTemplateById(id: string): Promise<WorkoutTemplate | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      exercises: data.exercises,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Error loading template:', error)
    return null
  }
}

/**
 * Save a new template
 */
export async function saveTemplate(
  name: string,
  exercises: Array<{
    exerciseId: string
    name: string
    category: ExerciseCategory
  }>
): Promise<WorkoutTemplate | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workout_templates')
      .insert({
        user_id: user.id,
        name,
        exercises,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      exercises: data.exercises,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Error saving template:', error)
    return null
  }
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  id: string,
  updates: {
    name?: string
    exercises?: Array<{
      exerciseId: string
      name: string
      category: ExerciseCategory
    }>
  }
): Promise<WorkoutTemplate | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workout_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      exercises: data.exercises,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  } catch (error) {
    console.error('Error updating template:', error)
    return null
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting template:', error)
    return false
  }
}

/**
 * Check if template name already exists
 */
export async function templateNameExists(name: string, excludeId?: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    let query = supabase
      .from('workout_templates')
      .select('id')
      .ilike('name', name)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error
    return data.length > 0
  } catch (error) {
    console.error('Error checking template name:', error)
    return false
  }
}

/**
 * Get template count
 */
export async function getTemplateCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    const { count, error } = await supabase
      .from('workout_templates')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting template count:', error)
    return 0
  }
}

// ============ MIGRATION FROM LOCALSTORAGE ============

/**
 * Migrate templates from localStorage to Supabase
 * Call this once when user logs in
 */
export async function migrateLocalStorageTemplates(): Promise<number> {
  if (typeof window === 'undefined') return 0

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0

    // Check if already migrated
    const existingCount = await getTemplateCount()
    if (existingCount > 0) {
      // User already has templates in Supabase, skip migration
      return 0
    }

    // Get templates from localStorage
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return 0

    const localTemplates = JSON.parse(stored)
    if (!Array.isArray(localTemplates) || localTemplates.length === 0) return 0

    // Migrate each template to Supabase
    let migratedCount = 0
    for (const template of localTemplates) {
      const result = await saveTemplate(template.name, template.exercises)
      if (result) migratedCount++
    }

    // Clear localStorage after successful migration
    if (migratedCount > 0) {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      console.log(`✅ Migrated ${migratedCount} templates from localStorage to Supabase`)
    }

    return migratedCount
  } catch (error) {
    console.error('Error migrating templates:', error)
    return 0
  }
}

/**
 * Check if user has localStorage templates that need migration
 */
export function hasLocalStorageTemplates(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return false

    const templates = JSON.parse(stored)
    return Array.isArray(templates) && templates.length > 0
  } catch (error) {
    return false
  }
}
