-- Migration: Create account_lockouts table for brute force protection
-- Run this in your Supabase SQL Editor

-- Create the account_lockouts table
-- Tracks failed login attempts and lockout status by email
CREATE TABLE IF NOT EXISTS account_lockouts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  failed_attempts INT DEFAULT 0,
  locked_until TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);

-- Create index for finding expired lockouts
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON account_lockouts(locked_until);

-- Enable Row Level Security
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to check lockout status (needed before login)
-- This is read-only and only exposes lockout info, not sensitive data
CREATE POLICY "Anyone can check lockout status"
ON account_lockouts
FOR SELECT
USING (true);

-- Policy: Allow inserts/updates for lockout tracking
-- Since this happens before auth, we allow it for anon role
CREATE POLICY "Allow lockout tracking"
ON account_lockouts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow lockout updates"
ON account_lockouts
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Grant permissions to both anon and authenticated users
GRANT SELECT, INSERT, UPDATE ON account_lockouts TO anon;
GRANT SELECT, INSERT, UPDATE ON account_lockouts TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE account_lockouts_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE account_lockouts_id_seq TO authenticated;

-- Function to record a failed login attempt
CREATE OR REPLACE FUNCTION record_failed_login(user_email VARCHAR(255))
RETURNS TABLE(is_locked BOOLEAN, attempts INT, unlock_at TIMESTAMPTZ) AS $$
DECLARE
  max_attempts INT := 10;
  lockout_duration INTERVAL := '1 hour';
  current_attempts INT;
  current_locked_until TIMESTAMPTZ;
BEGIN
  -- Insert or update the lockout record
  INSERT INTO account_lockouts (email, failed_attempts, last_failed_at, updated_at)
  VALUES (user_email, 1, NOW(), NOW())
  ON CONFLICT (email) DO UPDATE SET
    failed_attempts = CASE
      -- Reset if lockout has expired
      WHEN account_lockouts.locked_until IS NOT NULL AND account_lockouts.locked_until < NOW() THEN 1
      ELSE account_lockouts.failed_attempts + 1
    END,
    locked_until = CASE
      -- Lock if reaching max attempts
      WHEN account_lockouts.failed_attempts + 1 >= max_attempts THEN NOW() + lockout_duration
      -- Keep existing lockout if still valid
      WHEN account_lockouts.locked_until IS NOT NULL AND account_lockouts.locked_until > NOW() THEN account_lockouts.locked_until
      ELSE NULL
    END,
    last_failed_at = NOW(),
    updated_at = NOW()
  RETURNING account_lockouts.failed_attempts, account_lockouts.locked_until
  INTO current_attempts, current_locked_until;

  RETURN QUERY SELECT
    (current_locked_until IS NOT NULL AND current_locked_until > NOW()) AS is_locked,
    current_attempts AS attempts,
    current_locked_until AS unlock_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if an account is locked
CREATE OR REPLACE FUNCTION check_account_lockout(user_email VARCHAR(255))
RETURNS TABLE(is_locked BOOLEAN, attempts INT, unlock_at TIMESTAMPTZ, minutes_remaining INT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (al.locked_until IS NOT NULL AND al.locked_until > NOW()) AS is_locked,
    al.failed_attempts AS attempts,
    al.locked_until AS unlock_at,
    CASE
      WHEN al.locked_until IS NOT NULL AND al.locked_until > NOW()
      THEN CEIL(EXTRACT(EPOCH FROM (al.locked_until - NOW())) / 60)::INT
      ELSE 0
    END AS minutes_remaining
  FROM account_lockouts al
  WHERE al.email = user_email;

  -- If no record found, return unlocked status
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, NULL::TIMESTAMPTZ, 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear lockout on successful login
CREATE OR REPLACE FUNCTION clear_account_lockout(user_email VARCHAR(255))
RETURNS VOID AS $$
BEGIN
  UPDATE account_lockouts
  SET
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION record_failed_login(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION record_failed_login(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION check_account_lockout(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION check_account_lockout(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_account_lockout(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION clear_account_lockout(VARCHAR) TO authenticated;

-- Comment on table and functions
COMMENT ON TABLE account_lockouts IS 'Tracks failed login attempts and account lockout status';
COMMENT ON FUNCTION record_failed_login IS 'Records a failed login attempt and returns lockout status';
COMMENT ON FUNCTION check_account_lockout IS 'Checks if an account is currently locked';
COMMENT ON FUNCTION clear_account_lockout IS 'Clears lockout status after successful login';
