-- ==========================================
-- Migration: Add XP System
-- Adds event_type, difficulty_level columns and xp_awards table
-- for tracking XP rewards based on event participation
-- ==========================================

-- Add event_type column to events table
-- Values: talk_seminar, workshop, hackathon, competition
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'workshop'
CHECK (event_type IN ('talk_seminar', 'workshop', 'hackathon', 'competition'));

-- Add difficulty_level column to events table
-- Values: easy, moderate, hard, elite
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'easy'
CHECK (difficulty_level IN ('easy', 'moderate', 'hard', 'elite'));

-- Add comments for documentation
COMMENT ON COLUMN events.event_type IS 'Type of event: talk_seminar (50 XP), workshop (80 XP), hackathon (150 XP), competition (100 XP)';
COMMENT ON COLUMN events.difficulty_level IS 'Difficulty level: easy (x1.0), moderate (x1.3), hard (x1.6), elite (x2.0)';

-- ==========================================
-- XP Awards Table - Tracks awarded XP to prevent duplicates
-- ==========================================
CREATE TABLE IF NOT EXISTS xp_awards (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,  -- References users.id
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    xp_amount int NOT NULL,
    awarded_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- Enable RLS on xp_awards


-- Allow service_role full access (server-side operations only)
-- CREATE POLICY REMOVED:  ON xp_awards
    FOR ALL USING (true) WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_xp_awards_user_event ON xp_awards(user_id, event_id);
CREATE INDEX IF NOT EXISTS idx_xp_awards_user ON xp_awards(user_id);

-- Grant permissions


