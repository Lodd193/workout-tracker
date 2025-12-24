-- ============================================
-- WORKOUT TRACKER: Fix Exercise Name Mismatches
-- ============================================
-- This script updates abbreviated exercise names to match
-- the canonical names in the exercise library
-- Run this in your Supabase SQL Editor

-- First, let's see what unique exercise names you have
-- (Run this first to verify what needs updating)
-- SELECT DISTINCT exercise_name FROM workout_logs ORDER BY exercise_name;

-- ============================================
-- UPDATE CHEST EXERCISES
-- ============================================

-- Incline Dumbbell Bench Press
UPDATE workout_logs
SET exercise_name = 'Incline Dumbbell Bench Press'
WHERE exercise_name IN ('Incline DB Press', 'Incline DB Bench Press', 'Incline Dumbell Press');

-- Flat Dumbbell Bench Press
UPDATE workout_logs
SET exercise_name = 'Flat Dumbbell Bench Press'
WHERE exercise_name IN ('Flat DB Press', 'Flat DB Bench Press', 'Flat Dumbell Press');

-- Decline Dumbbell Bench Press
UPDATE workout_logs
SET exercise_name = 'Decline Dumbbell Bench Press'
WHERE exercise_name IN ('Decline DB Press', 'Decline DB Bench Press', 'Decline Dumbell Press');

-- Incline Barbell Bench Press
UPDATE workout_logs
SET exercise_name = 'Incline Barbell Bench Press'
WHERE exercise_name IN ('Incline BB Press', 'Incline BB Bench Press', 'Incline Barbell Press');

-- Flat Barbell Bench Press
UPDATE workout_logs
SET exercise_name = 'Flat Barbell Bench Press'
WHERE exercise_name IN ('Flat BB Press', 'Flat BB Bench Press', 'Flat Barbell Press');

-- Decline Barbell Bench Press
UPDATE workout_logs
SET exercise_name = 'Decline Barbell Bench Press'
WHERE exercise_name IN ('Decline BB Press', 'Decline BB Bench Press', 'Decline Barbell Press');

-- ============================================
-- UPDATE BACK EXERCISES
-- ============================================

-- Dumbbell Row
UPDATE workout_logs
SET exercise_name = 'Dumbbell Row'
WHERE exercise_name IN ('DB Row', 'Dumbell Row');

-- Barbell Row
UPDATE workout_logs
SET exercise_name = 'Barbell Row'
WHERE exercise_name IN ('BB Row', 'Barbell Rows');

-- Chest-Supported DB Rows
UPDATE workout_logs
SET exercise_name = 'Chest-Supported DB Rows'
WHERE exercise_name IN ('Chest Supported DB Rows', 'Chest-Supported Dumbbell Rows');

-- ============================================
-- UPDATE SHOULDER EXERCISES
-- ============================================

-- Overhead Press (Barbell)
UPDATE workout_logs
SET exercise_name = 'Overhead Press (Barbell)'
WHERE exercise_name IN ('Overhead Press BB', 'OHP', 'Overhead Press', 'Military Press');

-- Dumbbell Shoulder Press
UPDATE workout_logs
SET exercise_name = 'Dumbbell Shoulder Press'
WHERE exercise_name IN ('DB Shoulder Press', 'Dumbell Shoulder Press', 'DB Press');

-- ============================================
-- UPDATE ARM EXERCISES
-- ============================================

-- Barbell Curl
UPDATE workout_logs
SET exercise_name = 'Barbell Curl'
WHERE exercise_name IN ('BB Curl', 'Barbell Curls');

-- Dumbbell Curl
UPDATE workout_logs
SET exercise_name = 'Dumbbell Curl'
WHERE exercise_name IN ('DB Curl', 'Dumbell Curl', 'Dumbbell Curls');

-- ============================================
-- UPDATE LEG EXERCISES
-- ============================================

-- Barbell Squat
UPDATE workout_logs
SET exercise_name = 'Barbell Squat'
WHERE exercise_name IN ('BB Squat', 'Back Squat', 'Barbell Squats');

-- Bulgarian Split Squat
UPDATE workout_logs
SET exercise_name = 'Bulgarian Split Squat'
WHERE exercise_name IN ('Bulgarian Split Squats', 'BSS');

-- Romanian Deadlift
UPDATE workout_logs
SET exercise_name = 'Romanian Deadlift'
WHERE exercise_name IN ('RDL', 'Romanian Deadlifts', 'Romanian DL');

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this after the updates to verify everything is standardized:
-- SELECT DISTINCT exercise_name FROM workout_logs ORDER BY exercise_name;

-- ============================================
-- ALSO UPDATE GOALS TABLE
-- ============================================
-- Apply the same updates to user_goals table

-- Incline Dumbbell Bench Press
UPDATE user_goals
SET exercise_name = 'Incline Dumbbell Bench Press'
WHERE exercise_name IN ('Incline DB Press', 'Incline DB Bench Press', 'Incline Dumbell Press');

-- Flat Dumbbell Bench Press
UPDATE user_goals
SET exercise_name = 'Flat Dumbbell Bench Press'
WHERE exercise_name IN ('Flat DB Press', 'Flat DB Bench Press', 'Flat Dumbell Press');

-- (Add more goal updates as needed based on what you find)

-- ============================================
-- DONE!
-- ============================================
