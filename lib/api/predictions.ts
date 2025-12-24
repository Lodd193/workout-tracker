import { PRPrediction, PlateauAlert, MilestonePrediction } from '@/lib/types'
import { fetchPersonalRecords, fetchProgressRate, fetchWeightProgression } from '@/lib/api/analytics'

// ============ PR PREDICTIONS ============

/**
 * Generate PR predictions for exercises showing positive progress
 */
export async function generatePRPredictions(): Promise<PRPrediction[]> {
  try {
    const personalRecords = await fetchPersonalRecords()
    const predictions: PRPrediction[] = []

    for (const pr of personalRecords) {
      // Get progress rate for this exercise (last 60 days for better accuracy)
      try {
        const progressMetrics = await fetchProgressRate(pr.exercise_name, 60)

        // Only generate predictions for exercises showing improvement
        if (progressMetrics.weeklyRate > 0 && progressMetrics.trend === 'Gaining') {
          // Predict PR in next 30 days (4.3 weeks)
          const predictedGain = progressMetrics.weeklyRate * 4.3
          const predicted_pr = pr.max_weight + predictedGain

          // Calculate prediction date
          const predicted_date = new Date()
          predicted_date.setDate(predicted_date.getDate() + 30)

          // Determine confidence based on data consistency
          let confidence: 'high' | 'medium' | 'low' = 'low'
          if (pr.total_sessions >= 10 && progressMetrics.percentage > 0) {
            confidence = 'high'
          } else if (pr.total_sessions >= 5) {
            confidence = 'medium'
          }

          predictions.push({
            exercise_name: pr.exercise_name,
            current_pr: pr.max_weight,
            predicted_pr: Math.round(predicted_pr * 10) / 10,
            predicted_date: predicted_date.toISOString().split('T')[0],
            confidence,
            weekly_gain: Math.round(progressMetrics.weeklyRate * 10) / 10,
          })
        }
      } catch (error) {
        // Skip exercises with insufficient data
        continue
      }
    }

    // Sort by predicted gain (highest first)
    return predictions.sort((a, b) =>
      (b.predicted_pr - b.current_pr) - (a.predicted_pr - a.current_pr)
    )
  } catch (error) {
    console.error('Error generating PR predictions:', error)
    return []
  }
}

// ============ PLATEAU DETECTION ============

/**
 * Detect exercises that have plateaued (no progress in 2+ weeks)
 */
export async function detectPlateaus(): Promise<PlateauAlert[]> {
  try {
    const personalRecords = await fetchPersonalRecords()
    const alerts: PlateauAlert[] = []
    const today = new Date()

    for (const pr of personalRecords) {
      // Only check exercises with recent activity (at least 3 sessions)
      if (pr.total_sessions < 3) continue

      try {
        // Get weight progression to check recent progress
        const progression = await fetchWeightProgression(pr.exercise_name)

        if (progression.length === 0) continue

        // Find the date of the last PR
        const lastPRDate = new Date(pr.date_achieved)
        const daysSincePR = Math.floor((today.getTime() - lastPRDate.getTime()) / (1000 * 60 * 60 * 24))

        // Get progress rate to check trend
        const progressMetrics = await fetchProgressRate(pr.exercise_name, 30)

        // Plateau criteria:
        // 1. No PR in 14+ days AND
        // 2. At least 3 recent sessions AND
        // 3. Weekly rate is 0 or negative
        if (daysSincePR >= 14 && progressMetrics.weeklyRate <= 0) {
          let severity: 'warning' | 'concern' | 'critical' = 'warning'
          let recommendation = ''

          if (daysSincePR >= 42) {
            severity = 'critical'
            recommendation = 'Consider a deload week or switching to a variation exercise. Plateau for 6+ weeks.'
          } else if (daysSincePR >= 28) {
            severity = 'concern'
            recommendation = 'Try increasing training volume or changing rep ranges. 4+ weeks without progress.'
          } else {
            severity = 'warning'
            recommendation = 'Monitor closely. Consider progressive overload techniques or form check.'
          }

          alerts.push({
            exercise_name: pr.exercise_name,
            last_pr_date: pr.date_achieved,
            days_since_progress: daysSincePR,
            last_pr_weight: pr.max_weight,
            recommendation,
            severity,
          })
        }
      } catch (error) {
        // Skip exercises with insufficient data
        continue
      }
    }

    // Sort by severity (critical first) then by days since progress
    return alerts.sort((a, b) => {
      const severityOrder = { critical: 0, concern: 1, warning: 2 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return b.days_since_progress - a.days_since_progress
    })
  } catch (error) {
    console.error('Error detecting plateaus:', error)
    return []
  }
}

// ============ MILESTONE PREDICTIONS ============

/**
 * Predict when you'll hit major milestones (e.g., 100kg bench, 140kg squat)
 */
export async function predictMilestones(
  exerciseName: string,
  milestoneWeights: number[]
): Promise<MilestonePrediction[]> {
  try {
    const personalRecords = await fetchPersonalRecords()
    const exercisePR = personalRecords.find(pr => pr.exercise_name === exerciseName)

    if (!exercisePR) {
      return []
    }

    const currentWeight = exercisePR.max_weight
    const progressMetrics = await fetchProgressRate(exerciseName, 60)
    const predictions: MilestonePrediction[] = []

    for (const milestoneWeight of milestoneWeights) {
      // Skip milestones already achieved
      if (currentWeight >= milestoneWeight) continue

      const weightRemaining = milestoneWeight - currentWeight
      let estimated_date: string | null = null
      let weeks_remaining: number | null = null
      let is_achievable = false

      // Only predict if making positive progress
      if (progressMetrics.weeklyRate > 0) {
        weeks_remaining = Math.ceil(weightRemaining / progressMetrics.weeklyRate)

        // Only show predictions within a reasonable timeframe (2 years max)
        if (weeks_remaining <= 104) {
          is_achievable = true
          const estimatedDate = new Date()
          estimatedDate.setDate(estimatedDate.getDate() + (weeks_remaining * 7))
          estimated_date = estimatedDate.toISOString().split('T')[0]
        }
      }

      predictions.push({
        exercise_name: exerciseName,
        milestone_weight: milestoneWeight,
        current_weight: currentWeight,
        estimated_date,
        weeks_remaining,
        is_achievable,
      })
    }

    return predictions
  } catch (error) {
    console.error('Error predicting milestones:', error)
    return []
  }
}

/**
 * Generate common milestone predictions for popular exercises
 */
export async function generateCommonMilestones(): Promise<MilestonePrediction[]> {
  const commonMilestones: Record<string, number[]> = {
    'Flat Barbell Bench Press': [60, 80, 100, 120, 140],
    'Barbell Squat': [100, 120, 140, 160, 180, 200],
    'Romanian Deadlift': [80, 100, 120, 140, 160],
    'Overhead Press (Barbell)': [40, 50, 60, 70, 80],
  }

  const allPredictions: MilestonePrediction[] = []

  for (const [exercise, milestones] of Object.entries(commonMilestones)) {
    const predictions = await predictMilestones(exercise, milestones)
    allPredictions.push(...predictions)
  }

  // Return only achievable milestones, sorted by weeks remaining
  return allPredictions
    .filter(p => p.is_achievable && p.weeks_remaining !== null)
    .sort((a, b) => (a.weeks_remaining || 0) - (b.weeks_remaining || 0))
    .slice(0, 5) // Top 5 nearest milestones
}
