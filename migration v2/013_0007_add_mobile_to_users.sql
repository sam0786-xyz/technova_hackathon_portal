-- Add mobile column to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS mobile TEXT;
