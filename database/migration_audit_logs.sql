-- Migration: Create audit_logs table for security monitoring
-- Run this in your Supabase SQL Editor

-- Create the audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying by user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Create index for querying by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Create index for querying by timestamp
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
ON audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow authenticated users to insert audit logs
-- The insert check uses a function to allow both self-logging and null user_id for failed logins
CREATE POLICY "Allow audit log inserts"
ON audit_logs
FOR INSERT
WITH CHECK (
  -- Allow logging for authenticated users (their own logs)
  (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()))
  OR
  -- Allow logging for failed login attempts (no auth required)
  (user_id IS NULL AND action IN ('login_failed', 'signup_failed'))
);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO authenticated;

-- Comment on table
COMMENT ON TABLE audit_logs IS 'Audit log for security-relevant user actions';
COMMENT ON COLUMN audit_logs.action IS 'Action type: login, logout, login_failed, etc.';
COMMENT ON COLUMN audit_logs.resource IS 'Resource affected: auth, workout, template, etc.';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context as JSON';
