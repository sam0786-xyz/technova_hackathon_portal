-- Add mobile column to next_auth.users
ALTER TABLE next_auth.users
ADD COLUMN IF NOT EXISTS mobile text;
