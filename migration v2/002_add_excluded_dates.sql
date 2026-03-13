-- Add excluded_dates column to events table for multi-day events
-- Run this in Supabase Dashboard -> SQL Editor

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS excluded_dates JSON DEFAULT '{}';

-- Add comment explaining the column
COMMENT ON COLUMN events.excluded_dates IS 'Array of YYYY-MM-DD date strings to exclude from multi-day events (holidays)';
