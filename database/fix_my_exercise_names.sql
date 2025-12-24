-- ============================================
-- Fix Exercise Names - Targeted Update
-- ============================================
-- Based on your current exercise names

-- 1. Fix: "Incline DB Bench Press" → "Incline Dumbbell Bench Press"
UPDATE workout_logs
SET exercise_name = 'Incline Dumbbell Bench Press'
WHERE exercise_name = 'Incline DB Bench Press';

-- Also update in goals table
UPDATE user_goals
SET exercise_name = 'Incline Dumbbell Bench Press'
WHERE exercise_name = 'Incline DB Bench Press';

-- 2. Fix: "Incline Cable Crossovers" → "Incline Cable Flyes"
-- (The exercise library uses "Flyes" not "Crossovers")
UPDATE workout_logs
SET exercise_name = 'Incline Cable Flyes'
WHERE exercise_name = 'Incline Cable Crossovers';

UPDATE user_goals
SET exercise_name = 'Incline Cable Flyes'
WHERE exercise_name = 'Incline Cable Crossovers';

-- ============================================
-- VERIFICATION - Run this after to confirm:
-- SELECT DISTINCT exercise_name FROM workout_logs ORDER BY exercise_name;
-- SELECT DISTINCT exercise_name FROM user_goals ORDER BY exercise_name;
-- ============================================

-- Expected results after update:
-- ✓ Chest-Supported DB Rows (already correct)
-- ✓ Hanging Knee Raises (already correct)
-- ✓ Incline Cable Flyes (updated from Crossovers)
-- ✓ Incline Dumbbell Bench Press (updated from Incline DB Bench Press)
-- ✓ Wide-Grip Lat Pulldown (already correct)
