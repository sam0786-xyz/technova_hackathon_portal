-- ==========================================
-- Migration: Add Daily Check-ins Table
-- Tracks daily XP awards for multi-day events
-- Participants receive XP chunk per day of check-in
-- ==========================================

-- Daily check-ins table - tracks per-day attendance and XP
CREATE TABLE IF NOT EXISTS daily_checkins (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,  -- References users.id
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    checkin_date date NOT NULL,  -- Just the date portion
    xp_awarded int NOT NULL,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    -- One check-in per user per event per day
    UNIQUE(user_id, event_id, checkin_date)
);

-- Add comments for documentation
COMMENT ON TABLE daily_checkins IS 'Tracks daily check-ins for XP distribution. Each day awards a chunk of total event XP.';
COMMENT ON COLUMN daily_checkins.checkin_date IS 'The calendar date of check-in (not time). Used to limit one check-in per day.';
COMMENT ON COLUMN daily_checkins.xp_awarded IS 'The XP chunk awarded for this specific day check-in.';

-- Enable RLS on daily_checkins


-- Allow service_role full access (server-side operations only)
-- CREATE POLICY REMOVED:  ON daily_checkins
    FOR ALL USING (true) WITH CHECK (true);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_event ON daily_checkins(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_event_date ON daily_checkins(user_id, event_id, checkin_date);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user ON daily_checkins(user_id);

-- Grant permissions


