-- ============================================
-- DIAGNOSE WORKOUT_TYPE VALUES
-- ============================================
-- This script ONLY shows what values exist
-- Does NOT make any changes
-- Run this first to see what we're dealing with
-- ============================================

-- Drop the constraint temporarily so we can see all data
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_workout_type_check;

-- Show ALL distinct workout_type values in the table
SELECT
  workout_type,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as num_users,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM workout_logs
GROUP BY workout_type
ORDER BY workout_type;

-- Show which values are INVALID (not in the allowed list)
SELECT DISTINCT workout_type as invalid_values
FROM workout_logs
WHERE workout_type NOT IN (
    'chest_upper',
    'chest_mid',
    'chest_lower',
    'back_vertical',
    'back_horizontal',
    'shoulders',
    'arms_biceps',
    'arms_triceps',
    'legs_quad',
    'legs_hamstring',
    'legs_glutes',
    'legs_calves',
    'core',
    'cardio'
)
ORDER BY workout_type;
