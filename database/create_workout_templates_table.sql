-- ============================================
-- WORKOUT TEMPLATES TABLE
-- ============================================
-- Stores user-created workout templates that sync across devices
-- Replaces localStorage-based template storage

-- Create the workout_templates table
CREATE TABLE IF NOT EXISTS public.workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure template names are unique per user
  CONSTRAINT unique_template_name_per_user UNIQUE (user_id, name)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_workout_templates_user_id ON public.workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_templates_created_at ON public.workout_templates(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own templates
CREATE POLICY "Users can view own templates"
  ON public.workout_templates
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- Policy: Users can create their own templates
CREATE POLICY "Users can create own templates"
  ON public.workout_templates
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON public.workout_templates
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON public.workout_templates
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.workout_templates IS 'User-created workout templates with exercise lists';
COMMENT ON COLUMN public.workout_templates.id IS 'Unique template identifier';
COMMENT ON COLUMN public.workout_templates.user_id IS 'User who owns this template';
COMMENT ON COLUMN public.workout_templates.name IS 'Template name (e.g., "Push Day", "Pull Day")';
COMMENT ON COLUMN public.workout_templates.exercises IS 'JSON array of exercises with exerciseId, name, and category';
COMMENT ON COLUMN public.workout_templates.created_at IS 'Timestamp when template was created';
COMMENT ON COLUMN public.workout_templates.updated_at IS 'Timestamp when template was last modified';
