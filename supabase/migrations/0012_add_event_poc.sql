-- ==========================================
-- Add poc_user_id to events table (Point of Contact)
-- Stores selected POC from hosting club; references next_auth.users.id (no FK across schemas)
-- ==========================================

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS poc_user_id uuid;

COMMENT ON COLUMN public.events.poc_user_id IS 'User ID for event point of contact; should belong to hosting club admins/members.';