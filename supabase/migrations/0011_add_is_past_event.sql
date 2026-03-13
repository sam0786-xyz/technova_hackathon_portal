-- ==========================================
-- Add is_past_event flag to events table
-- Allows admins to explicitly mark events as "past" for club timeline display
-- ==========================================

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_past_event boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.events.is_past_event IS 'Flag to explicitly mark event as past for display in club timeline. Can be set by admins after event completion.';
