-- Add gallery column to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}';
