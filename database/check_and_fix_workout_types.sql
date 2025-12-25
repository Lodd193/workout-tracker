-- ============================================
-- CHECK AND FIX WORKOUT_TYPE VALUES
-- ============================================
-- This script checks existing workout_type values and fixes them
-- Run this BEFORE trying to add the constraint
-- ============================================

-- Step 1: See what workout_type values currently exist
SELECT DISTINCT workout_type, COUNT(*) as count
FROM workout_logs
GROUP BY workout_type
ORDER BY workout_type;

-- Step 2: Check if any values are invalid
-- Valid values are:
-- 'chest_upper', 'chest_mid', 'chest_lower',
-- 'back_vertical', 'back_horizontal',
-- 'shoulders', 'arms_biceps', 'arms_triceps',
-- 'legs_quad', 'legs_hamstring', 'legs_glutes', 'legs_calves',
-- 'core', 'cardio'

-- Step 3: OPTION A - Delete ALL existing workout logs (if you want to start fresh)
-- Uncomment the line below to delete all workout logs:
-- DELETE FROM workout_logs;

-- Step 4: OPTION B - Update invalid values to valid ones (if you want to keep data)
-- Examples of common invalid values and their corrections:
-- UPDATE workout_logs SET workout_type = 'chest_mid' WHERE workout_type = 'chest';
-- UPDATE workout_logs SET workout_type = 'back_horizontal' WHERE workout_type = 'back';
-- UPDATE workout_logs SET workout_type = 'legs_quad' WHERE workout_type = 'legs';
-- UPDATE workout_logs SET workout_type = 'arms_biceps' WHERE workout_type = 'biceps';
-- UPDATE workout_logs SET workout_type = 'arms_triceps' WHERE workout_type = 'triceps';

-- Step 5: After cleaning data, drop and recreate the constraint
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_workout_type_check;

ALTER TABLE workout_logs ADD CONSTRAINT workout_logs_workout_type_check
  CHECK (workout_type IN (
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
  ));

-- Step 6: Verify success
SELECT 'Constraint updated successfully!' as status;
