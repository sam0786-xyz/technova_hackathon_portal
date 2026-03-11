-- ==========================================
-- Migration: Add XP System
-- Adds event_type, difficulty_level columns and xp_awards table
-- for tracking XP rewards based on event participation
-- ==========================================

-- Add event_type column to events table
-- Values: talk_seminar, workshop, hackathon, competition
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'workshop'
CHECK (event_type IN ('talk_seminar', 'workshop', 'hackathon', 'competition'));

-- Add difficulty_level column to events table
-- Values: easy, moderate, hard, elite
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS difficulty_level text DEFAULT 'easy'
CHECK (difficulty_level IN ('easy', 'moderate', 'hard', 'elite'));

-- Add comments for documentation
COMMENT ON COLUMN public.events.event_type IS 'Type of event: talk_seminar (50 XP), workshop (80 XP), hackathon (150 XP), competition (100 XP)';
COMMENT ON COLUMN public.events.difficulty_level IS 'Difficulty level: easy (x1.0), moderate (x1.3), hard (x1.6), elite (x2.0)';

-- ==========================================
-- XP Awards Table - Tracks awarded XP to prevent duplicates
-- ==========================================
CREATE TABLE IF NOT EXISTS public.xp_awards (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,  -- References next_auth.users.id
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    xp_amount int NOT NULL,
    awarded_at timestamptz DEFAULT now(),
    UNIQUE(user_id, event_id)
);

-- Enable RLS on xp_awards
ALTER TABLE public.xp_awards ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (server-side operations only)
CREATE POLICY "Service role full access to xp_awards" ON public.xp_awards
    FOR ALL USING (true) WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_xp_awards_user_event ON public.xp_awards(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_xp_awards_user ON public.xp_awards(user_id);

-- Grant permissions
GRANT ALL ON TABLE public.xp_awards TO postgres;
GRANT ALL ON TABLE public.xp_awards TO service_role;
