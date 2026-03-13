-- ==========================================
-- Migration: Add Multi-Day Event Scheduling
-- Adds support for events spanning multiple days with daily time slots
-- ==========================================

-- Add columns for multi-day scheduling
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_multi_day boolean DEFAULT false;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS daily_start_time time;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS daily_end_time time;

-- Add comment for documentation
COMMENT ON COLUMN public.events.is_multi_day IS 'Flag indicating if event spans multiple days with recurring daily schedule';
COMMENT ON COLUMN public.events.daily_start_time IS 'Daily start time for multi-day events (e.g., 10:00:00)';
COMMENT ON COLUMN public.events.daily_end_time IS 'Daily end time for multi-day events (e.g., 12:00:00)';
