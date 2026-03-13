--SQL Migration #1: Add social media fields to clubs table

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_email TEXT;

COMMENT ON COLUMN clubs.linkedin_url IS 'LinkedIn profile or page URL for the club';
COMMENT ON COLUMN clubs.instagram_url IS 'Instagram profile URL for the club';
COMMENT ON COLUMN clubs.contact_email IS 'Primary contact email for the club';


-- SQL Migration #2: Add excluded_dates for multi-day event holidays

ALTER TABLE events ADD COLUMN IF NOT EXISTS excluded_dates JSON;

COMMENT ON COLUMN events.excluded_dates IS 'Array of dates (YYYY-MM-DD) to exclude from multi-day events (e.g., holidays)';


-- SQL Migration #3: Create bug_reports table

CREATE TABLE IF NOT EXISTS bug_reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('UI', 'Performance', 'Feature Request', 'Bug', 'Other')) DEFAULT 'Bug',
    status TEXT CHECK (status IN ('pending', 'in-progress', 'resolved', 'duplicate', 'wont-fix')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    browser_info JSON,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    xp_awarded BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

COMMENT ON TABLE bug_reports IS 'User-submitted bug reports and feature requests';
COMMENT ON COLUMN bug_reports.xp_awarded IS 'Whether XP has been awarded for this bug report';

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_bug_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bug_reports_updated_at
    BEFORE UPDATE ON bug_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_bug_reports_updated_at();
