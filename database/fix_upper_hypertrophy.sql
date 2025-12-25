-- ============================================
-- FIX upper_hypertrophy WORKOUT TYPE
-- ============================================
-- Updates the old "upper_hypertrophy" value to a valid category
-- Then applies the constraint
-- ============================================

-- Update upper_hypertrophy to chest_mid (general upper body category)
UPDATE workout_logs
SET workout_type = 'chest_mid'
WHERE workout_type = 'upper_hypertrophy';

-- Verify no invalid values remain
SELECT DISTINCT workout_type as remaining_invalid_values
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

-- Should return 0 rows if all fixed

-- Now add the constraint (it was already dropped by the diagnostic script)
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

-- Verify success
SELECT 'Constraint fixed! upper_hypertrophy updated to chest_mid' as status;
