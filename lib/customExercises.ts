import { CustomExercise, ExerciseCategory } from './types'
import { supabase } from './supabase'

// ============ CUSTOM EXERCISE CRUD OPERATIONS ============

/**
 * Get all custom exercises for the current user
 */
export async function getAllCustomExercises(): Promise<CustomExercise[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('custom_exercises')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    return data.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      name: row.name,
      category: row.category as ExerciseCategory,
      created_at: row.created_at,
    }))
  } catch (error) {
    console.error('Error loading custom exercises:', error)
    return []
  }
}

/**
 * Create a new custom exercise
 */
export async function createCustomExercise(
  name: string,
  category: ExerciseCategory
): Promise<CustomExercise | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('custom_exercises')
      .insert({
        user_id: user.id,
        name: name.trim(),
        category,
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      category: data.category as ExerciseCategory,
      created_at: data.created_at,
    }
  } catch (error) {
    console.error('Error creating custom exercise:', error)
    return null
  }
}

/**
 * Delete a custom exercise
 */
export async function deleteCustomExercise(id: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('custom_exercises')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting custom exercise:', error)
    return false
  }
}

/**
 * Check if a custom exercise name already exists for the current user
 */
export async function customExerciseExists(name: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase
      .from('custom_exercises')
      .select('id')
      .ilike('name', name.trim())

    if (error) throw error
    return data.length > 0
  } catch (error) {
    console.error('Error checking custom exercise name:', error)
    return false
  }
}
