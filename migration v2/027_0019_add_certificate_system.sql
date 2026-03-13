-- ==========================================
-- Migration: Add Certificate Generation & Verification System
-- Creates tables for certificate templates and issued certificates
-- Supports QR-based verification and dynamic field placement
-- ==========================================

-- ==========================================
-- certificate_templates - Template configuration per event
-- ==========================================

CREATE TABLE IF NOT EXISTS certificate_templates (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    template_url TEXT NOT NULL,  -- Supabase storage URL for template image/PDF
    qr_region JSON NOT NULL DEFAULT '{"x": 80, "y": 80, "width": 15, "height": 15}',  -- Position as percentages
    text_regions JSON NOT NULL DEFAULT '[]',  -- Array of TEXT field configurations
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id)  -- One template per event
);

COMMENT ON TABLE certificate_templates IS 'Stores certificate template configuration for events';
COMMENT ON COLUMN certificate_templates.template_url IS 'URL to the template image/PDF in Supabase storage';
COMMENT ON COLUMN certificate_templates.qr_region IS 'QR code position: {x, y, width, height} as percentages (0-100)';
COMMENT ON COLUMN certificate_templates.text_regions IS 'Array of TEXT fields: [{field, x, y, fontSize, color, fontWeight, alignment}]';

-- ==========================================
-- certificates - Issued certificates
-- ==========================================

CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    certificate_id TEXT NOT NULL UNIQUE,  -- Short 8-char display ID
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL,  -- References users.id
    template_id VARCHAR(36) REFERENCES certificate_templates(id) ON DELETE SET NULL,
    issued_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
    revoked_at timestamptz,
    revoked_reason TEXT,
    downloaded_count int DEFAULT 0,  -- Track downloads for analytics
    UNIQUE(event_id, user_id)  -- One certificate per user per event
);

COMMENT ON TABLE certificates IS 'Stores issued certificates with verification data';
COMMENT ON COLUMN certificates.certificate_id IS 'Short 8-character unique ID for display and verification';
COMMENT ON COLUMN certificates.status IS 'Certificate status: valid or revoked';
COMMENT ON COLUMN certificates.downloaded_count IS 'Number of times certificate was downloaded';

-- ==========================================
-- Add certificate release columns to events
-- ==========================================

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS certificates_released BOOLEAN DEFAULT false;

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS certificates_released_at timestamptz;

COMMENT ON COLUMN events.certificates_released IS 'Whether certificates have been released for this event';
COMMENT ON COLUMN events.certificates_released_at IS 'When certificates were released';

-- ==========================================
-- Enable Row Level Security
-- ==========================================




-- Service role full access policies
-- CREATE POLICY REMOVED:  ON certificate_templates
    FOR ALL USING (true) WITH CHECK (true);

-- CREATE POLICY REMOVED:  ON certificates
    FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_certificate_templates_event ON certificate_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_event ON certificates(event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);

-- ==========================================
-- Function to generate short certificate ID
-- ==========================================

CREATE OR REPLACE FUNCTION generate_certificate_id() RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- Exclude confusing chars (0,O,1,I)
    result TEXT := '';
    i int;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Trigger to auto-generate certificate_id
-- ==========================================

CREATE OR REPLACE FUNCTION set_certificate_id() RETURNS trigger AS $$
DECLARE
    new_id TEXT;
    exists_count int;
BEGIN
    IF NEW.certificate_id IS NULL THEN
        LOOP
            new_id := generate_certificate_id();
            SELECT COUNT(*) INTO exists_count FROM certificates WHERE certificate_id = new_id;
            EXIT WHEN exists_count = 0;
        END LOOP;
        NEW.certificate_id := new_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_certificate_id ON certificates;
CREATE TRIGGER trigger_set_certificate_id
    BEFORE INSERT ON certificates
    FOR EACH ROW
    EXECUTE FUNCTION set_certificate_id();

-- ==========================================
-- Grant permissions
-- ==========================================






