-- ============================================
-- CUSTOM EXERCISES TABLE
-- ============================================
-- Stores user-created custom exercises that appear alongside the built-in library
-- These exercises are user-specific and sync across devices

-- Create the custom_exercises table
CREATE TABLE IF NOT EXISTS public.custom_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure exercise names are unique per user
  CONSTRAINT unique_exercise_name_per_user UNIQUE (user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_exercises_user_id ON public.custom_exercises(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_exercises_created_at ON public.custom_exercises(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.custom_exercises ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own custom exercises
CREATE POLICY "Users can view own custom exercises"
  ON public.custom_exercises
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- Policy: Users can create their own custom exercises
CREATE POLICY "Users can create own custom exercises"
  ON public.custom_exercises
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Policy: Users can update their own custom exercises
CREATE POLICY "Users can update own custom exercises"
  ON public.custom_exercises
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Policy: Users can delete their own custom exercises
CREATE POLICY "Users can delete own custom exercises"
  ON public.custom_exercises
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.custom_exercises IS 'User-created custom exercises that appear alongside the built-in library';
COMMENT ON COLUMN public.custom_exercises.id IS 'Unique exercise identifier';
COMMENT ON COLUMN public.custom_exercises.user_id IS 'User who created this exercise';
COMMENT ON COLUMN public.custom_exercises.name IS 'Exercise name (e.g., "My Custom Press")';
COMMENT ON COLUMN public.custom_exercises.category IS 'Exercise category (matches ExerciseCategory type)';
COMMENT ON COLUMN public.custom_exercises.created_at IS 'Timestamp when exercise was created';
