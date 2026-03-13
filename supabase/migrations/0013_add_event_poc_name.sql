-- Add optional POC name text column for events (for cases without user id)
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS poc_name text;