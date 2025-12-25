-- ============================================
-- CLEANUP TEST USER DATA
-- ============================================
-- This removes ALL data for the test user so we can start fresh
-- Replace YOUR_USER_ID_HERE with your actual UUID
-- ============================================

-- Delete all workout logs for this user
DELETE FROM workout_logs WHERE user_id = 'YOUR_USER_ID_HERE';

-- Delete all templates for this user
DELETE FROM workout_templates WHERE user_id = 'YOUR_USER_ID_HERE';

-- Delete all goals for this user
DELETE FROM user_goals WHERE user_id = 'YOUR_USER_ID_HERE';

-- Verify cleanup
SELECT
  (SELECT COUNT(*) FROM workout_logs WHERE user_id = 'YOUR_USER_ID_HERE') as remaining_logs,
  (SELECT COUNT(*) FROM workout_templates WHERE user_id = 'YOUR_USER_ID_HERE') as remaining_templates,
  (SELECT COUNT(*) FROM user_goals WHERE user_id = 'YOUR_USER_ID_HERE') as remaining_goals;
