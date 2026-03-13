-- Add course and section columns to next_auth.users

ALTER TABLE next_auth.users 
ADD COLUMN IF NOT EXISTS course text,
ADD COLUMN IF NOT EXISTS section text;
