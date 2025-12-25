-- ============================================
-- FIX ALL WORKOUT_TYPE VALUES (ALL USERS)
-- ============================================
-- This checks and fixes invalid workout_type values for ALL users
-- Run this to see what invalid values exist
-- ============================================

-- Step 1: See what workout_type values currently exist in the ENTIRE table
SELECT DISTINCT workout_type, COUNT(*) as count
FROM workout_logs
GROUP BY workout_type
ORDER BY workout_type;

-- Step 2: Update invalid values to valid ones
-- Common mappings from old/invalid values to new valid values:

UPDATE workout_logs SET workout_type = 'chest_mid' WHERE workout_type = 'chest';
UPDATE workout_logs SET workout_type = 'back_horizontal' WHERE workout_type = 'back';
UPDATE workout_logs SET workout_type = 'legs_quad' WHERE workout_type = 'legs';
UPDATE workout_logs SET workout_type = 'arms_biceps' WHERE workout_type = 'biceps';
UPDATE workout_logs SET workout_type = 'arms_triceps' WHERE workout_type = 'triceps';
UPDATE workout_logs SET workout_type = 'shoulders' WHERE workout_type = 'shoulder';
UPDATE workout_logs SET workout_type = 'core' WHERE workout_type = 'abs';

-- Step 3: Check if there are any remaining invalid values
SELECT DISTINCT workout_type
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
);

-- Step 4: Now drop and recreate the constraint
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

-- Step 5: Verify success
SELECT 'Constraint updated successfully!' as status;
