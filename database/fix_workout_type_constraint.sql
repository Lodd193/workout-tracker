-- ============================================
-- FIX WORKOUT_TYPE CONSTRAINT
-- ============================================
-- Run this FIRST before running seed_test_data.sql
-- This fixes the CHECK constraint to allow all valid exercise categories
-- ============================================

-- Drop the old constraint
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_workout_type_check;

-- Add the correct constraint with all 14 valid exercise categories
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

-- Verify the constraint was updated
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'workout_logs'::regclass
  AND conname = 'workout_logs_workout_type_check';
