-- ============================================
-- WORKOUT TRACKER: Authentication Migration
-- ============================================
-- This script adds user authentication and Row Level Security (RLS)
-- Run this in your Supabase SQL Editor

-- Step 1: Add user_id column to workout_logs table
-- ============================================
ALTER TABLE workout_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index on user_id for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS workout_logs_user_id_idx ON workout_logs(user_id);

-- Step 3: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies if they exist (in case you're re-running this)
-- ============================================
DROP POLICY IF EXISTS "Users can view own workouts" ON workout_logs;
DROP POLICY IF EXISTS "Users can create own workouts" ON workout_logs;
DROP POLICY IF EXISTS "Users can update own workouts" ON workout_logs;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workout_logs;

-- Step 5: Create RLS policies
-- ============================================

-- Policy 1: Users can only view their own workouts
CREATE POLICY "Users can view own workouts"
ON workout_logs FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can only insert workouts for themselves
CREATE POLICY "Users can create own workouts"
ON workout_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own workouts
CREATE POLICY "Users can update own workouts"
ON workout_logs FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can only delete their own workouts
CREATE POLICY "Users can delete own workouts"
ON workout_logs FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- IMPORTANT: Migrate existing data
-- ============================================
-- After creating your first user account, run this command
-- to assign all existing workout logs to your account:
--
-- UPDATE workout_logs 
-- SET user_id = 'YOUR_USER_ID_HERE'
-- WHERE user_id IS NULL;
--
-- To find your user_id, sign up first, then run:
-- SELECT id, email FROM auth.users;
--
-- Then copy your user ID and replace 'YOUR_USER_ID_HERE' above.
-- ============================================

-- Step 6: Make user_id required for future inserts
-- ============================================
-- Uncomment this AFTER migrating existing data:
-- ALTER TABLE workout_logs ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify everything is set up correctly:

-- 1. Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'workout_logs';

-- 2. View all policies:
-- SELECT * FROM pg_policies WHERE tablename = 'workout_logs';

-- 3. Check user_id column exists:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'workout_logs' AND column_name = 'user_id';

-- ============================================
-- DONE!
-- ============================================
-- Your database is now secure with authentication!
