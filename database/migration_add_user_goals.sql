-- ============================================
-- WORKOUT TRACKER: User Goals Migration
-- ============================================
-- This script adds custom exercise-specific weight goals
-- Run this in your Supabase SQL Editor

-- Step 1: Create user_goals table
-- ============================================
CREATE TABLE user_goals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_name TEXT NOT NULL,
  target_weight_kg NUMERIC NOT NULL,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  achieved_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- Step 2: Create indexes for better query performance
-- ============================================
CREATE INDEX user_goals_user_id_idx ON user_goals(user_id);
CREATE INDEX user_goals_exercise_name_idx ON user_goals(exercise_name);
CREATE INDEX user_goals_active_idx ON user_goals(is_active) WHERE is_active = TRUE;

-- Step 3: Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
-- ============================================

-- Policy 1: Users can only view their own goals
CREATE POLICY "Users can view own goals"
ON user_goals FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Users can only insert goals for themselves
CREATE POLICY "Users can create own goals"
ON user_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own goals
CREATE POLICY "Users can update own goals"
ON user_goals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can only delete their own goals
CREATE POLICY "Users can delete own goals"
ON user_goals FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify everything is set up correctly:

-- 1. Check if RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_goals';

-- 2. View all policies:
-- SELECT * FROM pg_policies WHERE tablename = 'user_goals';

-- 3. Check table structure:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'user_goals';

-- ============================================
-- DONE!
-- ============================================
