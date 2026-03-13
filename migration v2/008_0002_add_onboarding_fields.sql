-- Add course and section columns to users

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS section TEXT;
