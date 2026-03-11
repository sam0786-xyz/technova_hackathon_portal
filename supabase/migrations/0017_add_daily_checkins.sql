-- ==========================================
-- Migration: Add Daily Check-ins Table
-- Tracks daily XP awards for multi-day events
-- Participants receive XP chunk per day of check-in
-- ==========================================

-- Daily check-ins table - tracks per-day attendance and XP
CREATE TABLE IF NOT EXISTS public.daily_checkins (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL,  -- References next_auth.users.id
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    checkin_date date NOT NULL,  -- Just the date portion
    xp_awarded int NOT NULL,
    created_at timestamptz DEFAULT now(),
    -- One check-in per user per event per day
    UNIQUE(user_id, event_id, checkin_date)
);

-- Add comments for documentation
COMMENT ON TABLE public.daily_checkins IS 'Tracks daily check-ins for XP distribution. Each day awards a chunk of total event XP.';
COMMENT ON COLUMN public.daily_checkins.checkin_date IS 'The calendar date of check-in (not time). Used to limit one check-in per day.';
COMMENT ON COLUMN public.daily_checkins.xp_awarded IS 'The XP chunk awarded for this specific day check-in.';

-- Enable RLS on daily_checkins
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (server-side operations only)
CREATE POLICY "Service role full access to daily_checkins" ON public.daily_checkins
    FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_event ON public.daily_checkins(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_event_date ON public.daily_checkins(user_id, event_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON public.daily_checkins(user_id);

-- Grant permissions
GRANT ALL ON TABLE public.daily_checkins TO postgres;
GRANT ALL ON TABLE public.daily_checkins TO service_role;
