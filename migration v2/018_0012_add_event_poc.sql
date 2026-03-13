-- ==========================================
-- Add poc_user_id to events table (Point of Contact)
-- Stores selected POC from hosting club; references users.id (no FK across schemas)
-- ==========================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS poc_user_id VARCHAR(36);

COMMENT ON COLUMN events.poc_user_id IS 'User ID for event point of contact; should belong to hosting club admins/members.';