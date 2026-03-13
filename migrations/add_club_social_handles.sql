-- Add social media fields to clubs table

ALTER TABLE clubs ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE clubs ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add comments for documentation
COMMENT ON COLUMN clubs.linkedin_url IS 'LinkedIn profile or page URL for the club';
COMMENT ON COLUMN clubs.instagram_url IS 'Instagram profile URL for the club';
COMMENT ON COLUMN clubs.contact_email IS 'Primary contact email for the club';
