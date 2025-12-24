import { supabase } from '@/lib/supabase'
import { UserGoal, GoalProgress, GoalFormData } from '@/lib/types'
import { fetchPersonalRecords, fetchProgressRate } from '@/lib/api/analytics'

// ============ CRUD OPERATIONS ============

/**
 * Fetch all active goals for the current user
 */
export async function fetchUserGoals(): Promise<UserGoal[]> {
  const { data, error } = await supabase
    .from('user_goals')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching goals:', error)
    throw error
  }

  return data || []
}

/**
 * Fetch all goals (including achieved and inactive)
 */
export async function fetchAllUserGoals(): Promise<UserGoal[]> {
  const { data, error} = await supabase
    .from('user_goals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all goals:', error)
    throw error
  }

  return data || []
}

/**
 * Create a new goal
 */
export async function createGoal(goalData: GoalFormData): Promise<UserGoal> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_goals')
    .insert({
      user_id: user.id,
      exercise_name: goalData.exercise_name,
      target_weight_kg: goalData.target_weight_kg,
      target_date: goalData.target_date,
      notes: goalData.notes,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating goal:', error)
    throw error
  }

  return data
}

/**
 * Update an existing goal
 */
export async function updateGoal(goalId: number, updates: Partial<GoalFormData>): Promise<UserGoal> {
  const { data, error } = await supabase
    .from('user_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    console.error('Error updating goal:', error)
    throw error
  }

  return data
}

/**
 * Delete a goal (soft delete by marking as inactive)
 */
export async function deleteGoal(goalId: number): Promise<boolean> {
  const { error } = await supabase
    .from('user_goals')
    .update({ is_active: false })
    .eq('id', goalId)

  if (error) {
    console.error('Error deleting goal:', error)
    return false
  }

  return true
}

/**
 * Mark a goal as achieved
 */
export async function markGoalAchieved(goalId: number): Promise<UserGoal> {
  const { data, error } = await supabase
    .from('user_goals')
    .update({ achieved_at: new Date().toISOString() })
    .eq('id', goalId)
    .select()
    .single()

  if (error) {
    console.error('Error marking goal as achieved:', error)
    throw error
  }

  return data
}

// ============ PROGRESS CALCULATIONS ============

/**
 * Calculate progress for a single goal
 */
export async function calculateGoalProgress(goal: UserGoal): Promise<GoalProgress> {
  // Get current PR for this exercise
  const personalRecords = await fetchPersonalRecords()
  const exercisePR = personalRecords.find(pr => pr.exercise_name === goal.exercise_name)

  const currentWeight = exercisePR?.max_weight || 0
  const currentWeightDate = exercisePR?.date_achieved || new Date().toISOString().split('T')[0]
  const progressPercentage = goal.target_weight_kg > 0
    ? Math.round((currentWeight / goal.target_weight_kg) * 100 * 10) / 10
    : 0
  const weightRemaining = Math.max(0, goal.target_weight_kg - currentWeight)
  const isAchieved = currentWeight >= goal.target_weight_kg

  // Calculate days remaining until target date
  let daysRemaining: number | null = null
  if (goal.target_date) {
    const targetDate = new Date(goal.target_date)
    const today = new Date()
    daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Get progress rate (kg/week) from last 30 days
  let progressRate = 0
  let recentTrend: 'improving' | 'plateau' | 'declining' = 'plateau'

  try {
    const progressMetrics = await fetchProgressRate(goal.exercise_name, 30)
    progressRate = progressMetrics.weeklyRate

    // Determine recent trend
    recentTrend =
      progressMetrics.trend === 'Gaining' ? 'improving' :
      progressMetrics.trend === 'Declining' ? 'declining' : 'plateau'
  } catch (error) {
    // If no data or error, keep defaults
    console.log('No progress data for:', goal.exercise_name)
  }

  // Calculate on-track status
  let onTrackStatus: 'ahead' | 'on-track' | 'behind' | 'unknown' = 'unknown'
  let estimatedCompletion: string | null = null

  if (isAchieved) {
    onTrackStatus = 'ahead'
  } else if (goal.target_date && daysRemaining !== null && weightRemaining > 0) {
    // Calculate required progress rate to hit goal
    const weeksRemaining = daysRemaining / 7
    const requiredRate = weightRemaining / weeksRemaining

    // If we have good historical data (progressRate > 0)
    if (progressRate > 0) {
      // Estimate weeks to complete based on current rate
      const weeksToComplete = weightRemaining / progressRate
      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + (weeksToComplete * 7))
      estimatedCompletion = estimatedDate.toISOString().split('T')[0]

      // Compare actual rate vs required rate
      if (weeksToComplete <= weeksRemaining * 0.8) {
        onTrackStatus = 'ahead'
      } else if (weeksToComplete <= weeksRemaining * 1.2) {
        onTrackStatus = 'on-track'
      } else {
        onTrackStatus = 'behind'
      }
    } else {
      // Insufficient historical data - use required rate to determine feasibility
      // Consider goals requiring <2kg/week as reasonable/on-track
      // Goals requiring 2-3kg/week as challenging but possible
      // Goals requiring >3kg/week as unrealistic/behind
      if (requiredRate <= 2.0) {
        onTrackStatus = 'on-track'
      } else if (requiredRate <= 3.0) {
        onTrackStatus = 'behind'
      } else {
        onTrackStatus = 'behind'
      }

      // Set estimated completion based on required rate
      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + (weeksRemaining * 7))
      estimatedCompletion = estimatedDate.toISOString().split('T')[0]
    }
  } else if (!goal.target_date && weightRemaining > 0) {
    // No deadline - check if making progress
    if (progressRate > 0 && recentTrend === 'improving') {
      onTrackStatus = 'on-track'
      // Estimate completion based on current rate
      const weeksToComplete = weightRemaining / progressRate
      const estimatedDate = new Date()
      estimatedDate.setDate(estimatedDate.getDate() + (weeksToComplete * 7))
      estimatedCompletion = estimatedDate.toISOString().split('T')[0]
    } else if (currentWeight > 0) {
      // Has data but no clear progress
      onTrackStatus = 'behind'
    }
  }

  return {
    goal,
    currentWeight,
    currentWeightDate,
    progressPercentage,
    weightRemaining,
    isAchieved,
    onTrackStatus,
    estimatedCompletion,
    daysRemaining,
    progressRate,
    recentTrend,
  }
}

/**
 * Calculate progress for all active goals
 */
export async function fetchAllGoalsProgress(): Promise<GoalProgress[]> {
  const goals = await fetchUserGoals()
  const progressData = await Promise.all(
    goals.map(goal => calculateGoalProgress(goal))
  )
  return progressData
}

/**
 * Check if a goal should be automatically marked as achieved
 */
export async function checkAndMarkAchievedGoals(): Promise<number> {
  const progressData = await fetchAllGoalsProgress()
  let markedCount = 0

  for (const progress of progressData) {
    if (progress.isAchieved && !progress.goal.achieved_at) {
      await markGoalAchieved(progress.goal.id)
      markedCount++
    }
  }

  return markedCount
}
