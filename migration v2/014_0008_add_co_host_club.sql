-- Add co_host_club_id to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS co_host_club_id VARCHAR(36) REFERENCES clubs(id) ON DELETE SET NULL;
