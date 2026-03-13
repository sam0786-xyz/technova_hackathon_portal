-- Add gallery column to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS gallery JSON DEFAULT '{}';
