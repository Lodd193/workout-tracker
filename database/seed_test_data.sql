-- ============================================
-- GYM BESTIE - TEST DATA SEED SCRIPT
-- ============================================
-- This script creates realistic test data for a user over 6 months
-- Run this AFTER creating a test user account
--
-- INSTRUCTIONS:
-- 1. Sign up a test account: testuser@example.com
-- 2. Get the user_id from Supabase Auth dashboard
-- 3. Find/Replace ALL instances of 'YOUR_USER_ID_HERE' with your actual UUID
-- 4. Run this script in Supabase SQL Editor
-- ============================================

-- IMPORTANT: Replace 'YOUR_USER_ID_HERE' throughout this ENTIRE file
-- Use Find & Replace (Ctrl+H or Cmd+H) to replace all at once:
--   Find: YOUR_USER_ID_HERE
--   Replace: 0eb7cd78-4cf9-47d1-9a6a-833ea4256515

-- NOTE: If you get constraint errors, run fix_workout_type_constraint.sql FIRST

-- ============================================
-- WORKOUT TEMPLATES
-- ============================================

-- Push Day Template
INSERT INTO workout_templates (user_id, name, exercises, created_at, updated_at)
VALUES (
  'YOUR_USER_ID_HERE',
  'Push Day',
  '[
    {"exerciseId": "flat-bb-press", "name": "Flat Barbell Bench Press", "category": "chest_mid"},
    {"exerciseId": "incline-db-press", "name": "Incline Dumbbell Bench Press", "category": "chest_upper"},
    {"exerciseId": "db-shoulder-press", "name": "Dumbbell Shoulder Press", "category": "shoulders"},
    {"exerciseId": "lateral-raise", "name": "Lateral Raises", "category": "shoulders"},
    {"exerciseId": "tricep-pushdown", "name": "Tricep Pushdown", "category": "arms_triceps"},
    {"exerciseId": "overhead-tricep-ext", "name": "Overhead Tricep Extension", "category": "arms_triceps"}
  ]'::jsonb,
  NOW() - INTERVAL '180 days',
  NOW() - INTERVAL '180 days'
);

-- Pull Day Template
INSERT INTO workout_templates (user_id, name, exercises, created_at, updated_at)
VALUES (
  'YOUR_USER_ID_HERE',
  'Pull Day',
  '[
    {"exerciseId": "pull-ups", "name": "Pull-Ups", "category": "back_vertical"},
    {"exerciseId": "bb-row", "name": "Barbell Row", "category": "back_horizontal"},
    {"exerciseId": "wide-lat-pulldown", "name": "Wide-Grip Lat Pulldown", "category": "back_vertical"},
    {"exerciseId": "seated-cable-row", "name": "Seated Cable Row", "category": "back_horizontal"},
    {"exerciseId": "bb-curl", "name": "Barbell Curl", "category": "arms_biceps"},
    {"exerciseId": "hammer-curl", "name": "Hammer Curl", "category": "arms_biceps"},
    {"exerciseId": "face-pull", "name": "Face Pulls", "category": "shoulders"}
  ]'::jsonb,
  NOW() - INTERVAL '180 days',
  NOW() - INTERVAL '180 days'
);

-- Leg Day Template
INSERT INTO workout_templates (user_id, name, exercises, created_at, updated_at)
VALUES (
  'YOUR_USER_ID_HERE',
  'Leg Day',
  '[
    {"exerciseId": "bb-squat", "name": "Barbell Squat", "category": "legs_quad"},
    {"exerciseId": "romanian-deadlift", "name": "Romanian Deadlift", "category": "legs_hamstring"},
    {"exerciseId": "leg-press", "name": "Leg Press", "category": "legs_quad"},
    {"exerciseId": "hamstring-curl", "name": "Hamstring Curl", "category": "legs_hamstring"},
    {"exerciseId": "hip-thrust", "name": "Hip Thrust", "category": "legs_glutes"},
    {"exerciseId": "standing-calf-raise", "name": "Standing Calf Raise", "category": "legs_calves"}
  ]'::jsonb,
  NOW() - INTERVAL '180 days',
  NOW() - INTERVAL '180 days'
);

-- Upper Body Template
INSERT INTO workout_templates (user_id, name, exercises, created_at, updated_at)
VALUES (
  'YOUR_USER_ID_HERE',
  'Upper Body',
  '[
    {"exerciseId": "flat-db-press", "name": "Flat Dumbbell Bench Press", "category": "chest_mid"},
    {"exerciseId": "db-row", "name": "Dumbbell Row", "category": "back_horizontal"},
    {"exerciseId": "ohp-bb", "name": "Overhead Press (Barbell)", "category": "shoulders"},
    {"exerciseId": "cable-curl", "name": "Cable Curl", "category": "arms_biceps"},
    {"exerciseId": "skull-crusher", "name": "Skull Crushers", "category": "arms_triceps"}
  ]'::jsonb,
  NOW() - INTERVAL '175 days',
  NOW() - INTERVAL '175 days'
);

-- ============================================
-- USER GOALS
-- ============================================

INSERT INTO user_goals (user_id, exercise_name, target_weight_kg, target_date, notes, is_active)
VALUES
  ('YOUR_USER_ID_HERE', 'Flat Barbell Bench Press', 130, (CURRENT_DATE + INTERVAL '90 days')::date, 'Goal: 130kg bench press by end of Q2', true),
  ('YOUR_USER_ID_HERE', 'Barbell Squat', 180, (CURRENT_DATE + INTERVAL '120 days')::date, 'Goal: 180kg squat - focusing on depth and form', true),
  ('YOUR_USER_ID_HERE', 'Romanian Deadlift', 150, (CURRENT_DATE + INTERVAL '100 days')::date, 'Build stronger hamstrings', true);

-- ============================================
-- WORKOUT LOGS - 6 MONTHS OF DATA
-- ============================================
-- Progressive overload across 24 weeks (6 months)
-- Push/Pull/Legs split, 6 days per week
-- Realistic progression with deload weeks at 4, 8, 12, 16, 20

-- MONTH 1 (Weeks 1-4): Building Foundation
-- ============================================

-- Week 1 - Day 1 (Push)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 80, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 80, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 80, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 80, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'chest_upper', 'Incline Dumbbell Bench Press', 1, 30, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'chest_upper', 'Incline Dumbbell Bench Press', 2, 30, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'chest_upper', 'Incline Dumbbell Bench Press', 3, 30, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'shoulders', 'Dumbbell Shoulder Press', 1, 25, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'shoulders', 'Dumbbell Shoulder Press', 2, 25, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'shoulders', 'Dumbbell Shoulder Press', 3, 25, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'shoulders', 'Lateral Raises', 1, 10, 15),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'shoulders', 'Lateral Raises', 2, 10, 14),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'shoulders', 'Lateral Raises', 3, 10, 13),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'arms_triceps', 'Tricep Pushdown', 1, 35, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'arms_triceps', 'Tricep Pushdown', 2, 35, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '168 days', 'arms_triceps', 'Tricep Pushdown', 3, 35, 10);

-- Week 1 - Day 2 (Pull)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_vertical', 'Pull-Ups', 1, 0, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_vertical', 'Pull-Ups', 2, 0, 7),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_vertical', 'Pull-Ups', 3, 0, 6),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_horizontal', 'Barbell Row', 1, 70, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_horizontal', 'Barbell Row', 2, 70, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_horizontal', 'Barbell Row', 3, 70, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_vertical', 'Wide-Grip Lat Pulldown', 1, 50, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_vertical', 'Wide-Grip Lat Pulldown', 2, 50, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'back_vertical', 'Wide-Grip Lat Pulldown', 3, 50, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'arms_biceps', 'Barbell Curl', 1, 30, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'arms_biceps', 'Barbell Curl', 2, 30, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'arms_biceps', 'Barbell Curl', 3, 30, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'arms_biceps', 'Hammer Curl', 1, 15, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'arms_biceps', 'Hammer Curl', 2, 15, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '167 days', 'arms_biceps', 'Hammer Curl', 3, 15, 10);

-- Week 1 - Day 3 (Legs)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_quad', 'Barbell Squat', 1, 100, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_quad', 'Barbell Squat', 2, 100, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_quad', 'Barbell Squat', 3, 100, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_quad', 'Barbell Squat', 4, 100, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_hamstring', 'Romanian Deadlift', 1, 80, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_hamstring', 'Romanian Deadlift', 2, 80, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_hamstring', 'Romanian Deadlift', 3, 80, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_quad', 'Leg Press', 1, 150, 15),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_quad', 'Leg Press', 2, 150, 14),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_quad', 'Leg Press', 3, 150, 13),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_glutes', 'Hip Thrust', 1, 80, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_glutes', 'Hip Thrust', 2, 80, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '166 days', 'legs_glutes', 'Hip Thrust', 3, 80, 10);

-- Week 1 - Day 4 (Push)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 82.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 82.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 82.5, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 82.5, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'chest_upper', 'Incline Dumbbell Bench Press', 1, 32.5, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'chest_upper', 'Incline Dumbbell Bench Press', 2, 32.5, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'chest_upper', 'Incline Dumbbell Bench Press', 3, 32.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'shoulders', 'Dumbbell Shoulder Press', 1, 27.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'shoulders', 'Dumbbell Shoulder Press', 2, 27.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '165 days', 'shoulders', 'Dumbbell Shoulder Press', 3, 27.5, 8);

-- Continue with Week 2-4... (I'll add more weeks with progressive overload)

-- Week 2 - Day 1 (Push) - Small weight increase
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '161 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '161 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 85, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '161 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 85, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '161 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 85, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '161 days', 'chest_upper', 'Incline Dumbbell Bench Press', 1, 32.5, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '161 days', 'chest_upper', 'Incline Dumbbell Bench Press', 2, 32.5, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '161 days', 'chest_upper', 'Incline Dumbbell Bench Press', 3, 32.5, 11);

-- Week 3 - Progressive Overload
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '154 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 87.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '154 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 87.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '154 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 87.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '154 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 87.5, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '154 days', 'legs_quad', 'Barbell Squat', 1, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '152 days', 'legs_quad', 'Barbell Squat', 2, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '152 days', 'legs_quad', 'Barbell Squat', 3, 110, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '152 days', 'legs_quad', 'Barbell Squat', 4, 110, 8);

-- Week 4 - Deload Week (lighter weight, maintain reps)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '147 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 70, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '147 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 70, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '147 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 70, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '145 days', 'legs_quad', 'Barbell Squat', 1, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '145 days', 'legs_quad', 'Barbell Squat', 2, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '145 days', 'legs_quad', 'Barbell Squat', 3, 85, 10);

-- MONTH 2 (Weeks 5-8): Building Strength
-- ============================================

-- Week 5 - Back to progressive overload
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '140 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 90, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '140 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 90, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '140 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 90, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '140 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 90, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '138 days', 'legs_quad', 'Barbell Squat', 1, 120, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '138 days', 'legs_quad', 'Barbell Squat', 2, 120, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '138 days', 'legs_quad', 'Barbell Squat', 3, 120, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '138 days', 'legs_quad', 'Barbell Squat', 4, 120, 8);

-- Week 6 - Continuing progression
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '133 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 92.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '133 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 92.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '133 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 92.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '133 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 92.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '131 days', 'legs_quad', 'Barbell Squat', 1, 125, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '131 days', 'legs_quad', 'Barbell Squat', 2, 125, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '131 days', 'legs_quad', 'Barbell Squat', 3, 125, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '131 days', 'legs_quad', 'Barbell Squat', 4, 125, 8);

-- Week 7 - Hitting PRs
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '126 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '126 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '126 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '126 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 95, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '124 days', 'legs_quad', 'Barbell Squat', 1, 130, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '124 days', 'legs_quad', 'Barbell Squat', 2, 130, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '124 days', 'legs_quad', 'Barbell Squat', 3, 130, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '124 days', 'legs_quad', 'Barbell Squat', 4, 130, 8);

-- Week 8 - Second Deload
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '119 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 75, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '119 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 75, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '119 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 75, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '117 days', 'legs_quad', 'Barbell Squat', 1, 100, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '117 days', 'legs_quad', 'Barbell Squat', 2, 100, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '117 days', 'legs_quad', 'Barbell Squat', 3, 100, 10);

-- MONTH 3 (Weeks 9-12): Peak Performance
-- ============================================

-- Week 9 - Strong comeback
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '112 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 97.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '112 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 97.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '112 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 97.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '112 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 97.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '110 days', 'legs_quad', 'Barbell Squat', 1, 135, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '110 days', 'legs_quad', 'Barbell Squat', 2, 135, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '110 days', 'legs_quad', 'Barbell Squat', 3, 135, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '110 days', 'legs_quad', 'Barbell Squat', 4, 135, 9);

-- Week 10 - Pushing limits
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '105 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 100, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '105 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 100, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '105 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 100, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '105 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 100, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '103 days', 'legs_quad', 'Barbell Squat', 1, 140, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '103 days', 'legs_quad', 'Barbell Squat', 2, 140, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '103 days', 'legs_quad', 'Barbell Squat', 3, 140, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '103 days', 'legs_quad', 'Barbell Squat', 4, 140, 8);

-- Week 11 - Peak week
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '98 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 102.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '98 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 102.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '98 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 102.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '98 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 102.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '96 days', 'legs_quad', 'Barbell Squat', 1, 145, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '96 days', 'legs_quad', 'Barbell Squat', 2, 145, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '96 days', 'legs_quad', 'Barbell Squat', 3, 145, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '96 days', 'legs_quad', 'Barbell Squat', 4, 145, 9);

-- Week 12 - Deload Week (Third deload)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '91 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '91 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '91 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '89 days', 'legs_quad', 'Barbell Squat', 1, 115, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '89 days', 'legs_quad', 'Barbell Squat', 2, 115, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '89 days', 'legs_quad', 'Barbell Squat', 3, 115, 10);

-- MONTH 4 (Weeks 13-16): Intermediate Progression
-- ============================================

-- Week 13 - Back to training, slower progression
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '84 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 107.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '84 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 107.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '84 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 107.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '84 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 107.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '82 days', 'legs_quad', 'Barbell Squat', 1, 150, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '82 days', 'legs_quad', 'Barbell Squat', 2, 150, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '82 days', 'legs_quad', 'Barbell Squat', 3, 150, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '82 days', 'legs_quad', 'Barbell Squat', 4, 150, 9);

-- Week 14 - Steady progress
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '77 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '77 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '77 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 110, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '77 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 110, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '75 days', 'legs_quad', 'Barbell Squat', 1, 155, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '75 days', 'legs_quad', 'Barbell Squat', 2, 155, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '75 days', 'legs_quad', 'Barbell Squat', 3, 155, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '75 days', 'legs_quad', 'Barbell Squat', 4, 155, 8);

-- Week 15 - Continuing gains
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '70 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 112.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '70 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 112.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '70 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 112.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '70 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 112.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '68 days', 'legs_quad', 'Barbell Squat', 1, 160, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '68 days', 'legs_quad', 'Barbell Squat', 2, 160, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '68 days', 'legs_quad', 'Barbell Squat', 3, 160, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '68 days', 'legs_quad', 'Barbell Squat', 4, 160, 8);

-- Week 16 - Fourth Deload
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '63 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 90, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '63 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 90, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '63 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 90, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '61 days', 'legs_quad', 'Barbell Squat', 1, 125, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '61 days', 'legs_quad', 'Barbell Squat', 2, 125, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '61 days', 'legs_quad', 'Barbell Squat', 3, 125, 10);

-- MONTH 5 (Weeks 17-20): Advanced Strength
-- ============================================

-- Week 17 - Strong return
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '56 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 115, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '56 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 115, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '56 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 115, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '56 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 115, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '54 days', 'legs_quad', 'Barbell Squat', 1, 162.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '54 days', 'legs_quad', 'Barbell Squat', 2, 162.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '54 days', 'legs_quad', 'Barbell Squat', 3, 162.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '54 days', 'legs_quad', 'Barbell Squat', 4, 162.5, 9);

-- Week 18 - Grinding
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '49 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 117.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '49 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 117.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '49 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 117.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '49 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 117.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '47 days', 'legs_quad', 'Barbell Squat', 1, 165, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '47 days', 'legs_quad', 'Barbell Squat', 2, 165, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '47 days', 'legs_quad', 'Barbell Squat', 3, 165, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '47 days', 'legs_quad', 'Barbell Squat', 4, 165, 8);

-- Week 19 - Peak before deload
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '42 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 120, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '42 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 120, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '42 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 120, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '42 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 120, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '40 days', 'legs_quad', 'Barbell Squat', 1, 167.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '40 days', 'legs_quad', 'Barbell Squat', 2, 167.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '40 days', 'legs_quad', 'Barbell Squat', 3, 167.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '40 days', 'legs_quad', 'Barbell Squat', 4, 167.5, 9);

-- Week 20 - Fifth Deload
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '35 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '35 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '35 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '33 days', 'legs_quad', 'Barbell Squat', 1, 130, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '33 days', 'legs_quad', 'Barbell Squat', 2, 130, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '33 days', 'legs_quad', 'Barbell Squat', 3, 130, 10);

-- MONTH 6 (Weeks 21-24): Peak Performance
-- ============================================

-- Week 21 - Final push begins
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '28 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 122.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '28 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 122.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '28 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 122.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '28 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 122.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 'legs_quad', 'Barbell Squat', 1, 170, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 'legs_quad', 'Barbell Squat', 2, 170, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 'legs_quad', 'Barbell Squat', 3, 170, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 'legs_quad', 'Barbell Squat', 4, 170, 9);

-- Week 22 - Strength peaks
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '21 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 125, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '21 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 125, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '21 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 125, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '21 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 125, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '19 days', 'legs_quad', 'Barbell Squat', 1, 172.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '19 days', 'legs_quad', 'Barbell Squat', 2, 172.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '19 days', 'legs_quad', 'Barbell Squat', 3, 172.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '19 days', 'legs_quad', 'Barbell Squat', 4, 172.5, 9);

-- Week 23 - Maintaining PRs
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '14 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 127.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '14 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 127.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '14 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 127.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '14 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 127.5, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 'legs_quad', 'Barbell Squat', 1, 175, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 'legs_quad', 'Barbell Squat', 2, 175, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 'legs_quad', 'Barbell Squat', 3, 175, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 'legs_quad', 'Barbell Squat', 4, 175, 9);

-- Week 24 - Current week (most recent workouts)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '7 days', 'chest_mid', 'Flat Barbell Bench Press', 1, 127.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '7 days', 'chest_mid', 'Flat Barbell Bench Press', 2, 127.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '7 days', 'chest_mid', 'Flat Barbell Bench Press', 3, 127.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '7 days', 'chest_mid', 'Flat Barbell Bench Press', 4, 127.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 'legs_quad', 'Barbell Squat', 1, 177.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 'legs_quad', 'Barbell Squat', 2, 177.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 'legs_quad', 'Barbell Squat', 3, 177.5, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 'legs_quad', 'Barbell Squat', 4, 177.5, 9);

-- Add some recent cardio
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 'cardio', 'Bike', 1, 0, 30),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 'cardio', 'Run', 1, 0, 25),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 'cardio', 'Bike', 1, 0, 35),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '1 day', 'cardio', 'Walk', 1, 0, 45);

-- Add variety of other exercises (weeks 13-24 accessory work)
INSERT INTO workout_logs (user_id, date, workout_type, exercise_name, set_number, weight_kg, reps)
VALUES
  -- Week 13 accessories
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '83 days', 'back_horizontal', 'Barbell Row', 1, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '83 days', 'back_horizontal', 'Barbell Row', 2, 85, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '83 days', 'back_horizontal', 'Barbell Row', 3, 85, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '82 days', 'legs_hamstring', 'Romanian Deadlift', 1, 105, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '82 days', 'legs_hamstring', 'Romanian Deadlift', 2, 105, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '82 days', 'legs_hamstring', 'Romanian Deadlift', 3, 105, 10),

  -- Week 15 accessories
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '69 days', 'back_horizontal', 'Barbell Row', 1, 90, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '69 days', 'back_horizontal', 'Barbell Row', 2, 90, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '69 days', 'back_horizontal', 'Barbell Row', 3, 90, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '68 days', 'legs_hamstring', 'Romanian Deadlift', 1, 110, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '68 days', 'legs_hamstring', 'Romanian Deadlift', 2, 110, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '68 days', 'legs_hamstring', 'Romanian Deadlift', 3, 110, 10),

  -- Week 17 accessories
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '55 days', 'back_horizontal', 'Barbell Row', 1, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '55 days', 'back_horizontal', 'Barbell Row', 2, 95, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '55 days', 'back_horizontal', 'Barbell Row', 3, 95, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '54 days', 'legs_hamstring', 'Romanian Deadlift', 1, 115, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '54 days', 'legs_hamstring', 'Romanian Deadlift', 2, 115, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '54 days', 'legs_hamstring', 'Romanian Deadlift', 3, 115, 10),

  -- Week 19 accessories
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '41 days', 'back_horizontal', 'Barbell Row', 1, 100, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '41 days', 'back_horizontal', 'Barbell Row', 2, 100, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '41 days', 'back_horizontal', 'Barbell Row', 3, 100, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '40 days', 'legs_hamstring', 'Romanian Deadlift', 1, 120, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '40 days', 'legs_hamstring', 'Romanian Deadlift', 2, 120, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '40 days', 'legs_hamstring', 'Romanian Deadlift', 3, 120, 10),

  -- Week 21 accessories
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '27 days', 'back_horizontal', 'Barbell Row', 1, 105, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '27 days', 'back_horizontal', 'Barbell Row', 2, 105, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '27 days', 'back_horizontal', 'Barbell Row', 3, 105, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 'legs_hamstring', 'Romanian Deadlift', 1, 125, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 'legs_hamstring', 'Romanian Deadlift', 2, 125, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '26 days', 'legs_hamstring', 'Romanian Deadlift', 3, 125, 10),

  -- Week 23 accessories
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '13 days', 'back_horizontal', 'Barbell Row', 1, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '13 days', 'back_horizontal', 'Barbell Row', 2, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '13 days', 'back_horizontal', 'Barbell Row', 3, 110, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 'legs_hamstring', 'Romanian Deadlift', 1, 130, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 'legs_hamstring', 'Romanian Deadlift', 2, 130, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '12 days', 'legs_hamstring', 'Romanian Deadlift', 3, 130, 10),

  -- Most recent week accessories
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 'back_horizontal', 'Barbell Row', 1, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 'back_horizontal', 'Barbell Row', 2, 110, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 'back_horizontal', 'Barbell Row', 3, 110, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 'back_vertical', 'Pull-Ups', 1, 0, 15),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 'back_vertical', 'Pull-Ups', 2, 0, 14),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '6 days', 'back_vertical', 'Pull-Ups', 3, 0, 13),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 'legs_hamstring', 'Romanian Deadlift', 1, 130, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 'legs_hamstring', 'Romanian Deadlift', 2, 130, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '5 days', 'legs_hamstring', 'Romanian Deadlift', 3, 130, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 'shoulders', 'Dumbbell Shoulder Press', 1, 40, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 'shoulders', 'Dumbbell Shoulder Press', 2, 40, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 'shoulders', 'Dumbbell Shoulder Press', 3, 40, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 'shoulders', 'Lateral Raises', 1, 17.5, 15),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 'shoulders', 'Lateral Raises', 2, 17.5, 14),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '4 days', 'shoulders', 'Lateral Raises', 3, 17.5, 13),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 'arms_biceps', 'Barbell Curl', 1, 45, 10),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 'arms_biceps', 'Barbell Curl', 2, 45, 9),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 'arms_biceps', 'Barbell Curl', 3, 45, 8),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 'arms_triceps', 'Tricep Pushdown', 1, 50, 12),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 'arms_triceps', 'Tricep Pushdown', 2, 50, 11),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '3 days', 'arms_triceps', 'Tricep Pushdown', 3, 50, 10);

-- ============================================
-- SUMMARY STATISTICS
-- ============================================

SELECT 'Data seeding complete!' as status;
SELECT COUNT(*) as total_workout_logs FROM workout_logs WHERE user_id = 'YOUR_USER_ID_HERE';
SELECT COUNT(*) as total_templates FROM workout_templates WHERE user_id = 'YOUR_USER_ID_HERE';
SELECT COUNT(*) as total_goals FROM user_goals WHERE user_id = 'YOUR_USER_ID_HERE';

-- Show progression for Bench Press
SELECT
  date,
  MAX(weight_kg) as max_weight,
  AVG(reps)::numeric(10,1) as avg_reps
FROM workout_logs
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND exercise_name = 'Flat Barbell Bench Press'
GROUP BY date
ORDER BY date;

-- Show progression for Squat
SELECT
  date,
  MAX(weight_kg) as max_weight,
  AVG(reps)::numeric(10,1) as avg_reps
FROM workout_logs
WHERE user_id = 'YOUR_USER_ID_HERE'
  AND exercise_name = 'Barbell Squat'
GROUP BY date
ORDER BY date;
