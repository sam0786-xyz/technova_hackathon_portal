-- Add co_host_club_id to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS co_host_club_id uuid REFERENCES public.clubs(id) ON DELETE SET NULL;
