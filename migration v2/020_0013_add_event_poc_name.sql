-- Add optional POC name TEXT column for events (for cases without user id)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS poc_name TEXT;