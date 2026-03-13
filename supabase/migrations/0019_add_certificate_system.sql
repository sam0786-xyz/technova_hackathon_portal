-- ==========================================
-- Migration: Add Certificate Generation & Verification System
-- Creates tables for certificate templates and issued certificates
-- Supports QR-based verification and dynamic field placement
-- ==========================================

-- ==========================================
-- certificate_templates - Template configuration per event
-- ==========================================

CREATE TABLE IF NOT EXISTS public.certificate_templates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    template_url text NOT NULL,  -- Supabase storage URL for template image/PDF
    qr_region jsonb NOT NULL DEFAULT '{"x": 80, "y": 80, "width": 15, "height": 15}',  -- Position as percentages
    text_regions jsonb NOT NULL DEFAULT '[]',  -- Array of text field configurations
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(event_id)  -- One template per event
);

COMMENT ON TABLE public.certificate_templates IS 'Stores certificate template configuration for events';
COMMENT ON COLUMN public.certificate_templates.template_url IS 'URL to the template image/PDF in Supabase storage';
COMMENT ON COLUMN public.certificate_templates.qr_region IS 'QR code position: {x, y, width, height} as percentages (0-100)';
COMMENT ON COLUMN public.certificate_templates.text_regions IS 'Array of text fields: [{field, x, y, fontSize, color, fontWeight, alignment}]';

-- ==========================================
-- certificates - Issued certificates
-- ==========================================

CREATE TABLE IF NOT EXISTS public.certificates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    certificate_id text NOT NULL UNIQUE,  -- Short 8-char display ID
    event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id uuid NOT NULL,  -- References next_auth.users.id
    template_id uuid REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
    issued_at timestamptz DEFAULT now(),
    status text DEFAULT 'valid' CHECK (status IN ('valid', 'revoked')),
    revoked_at timestamptz,
    revoked_reason text,
    downloaded_count int DEFAULT 0,  -- Track downloads for analytics
    UNIQUE(event_id, user_id)  -- One certificate per user per event
);

COMMENT ON TABLE public.certificates IS 'Stores issued certificates with verification data';
COMMENT ON COLUMN public.certificates.certificate_id IS 'Short 8-character unique ID for display and verification';
COMMENT ON COLUMN public.certificates.status IS 'Certificate status: valid or revoked';
COMMENT ON COLUMN public.certificates.downloaded_count IS 'Number of times certificate was downloaded';

-- ==========================================
-- Add certificate release columns to events
-- ==========================================

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS certificates_released boolean DEFAULT false;

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS certificates_released_at timestamptz;

COMMENT ON COLUMN public.events.certificates_released IS 'Whether certificates have been released for this event';
COMMENT ON COLUMN public.events.certificates_released_at IS 'When certificates were released';

-- ==========================================
-- Enable Row Level Security
-- ==========================================

ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Service role full access policies
CREATE POLICY "Service role full access to certificate_templates" ON public.certificate_templates
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access to certificates" ON public.certificates
    FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- Indexes for performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_certificate_templates_event ON public.certificate_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_event ON public.certificates(event_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON public.certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);

-- ==========================================
-- Function to generate short certificate ID
-- ==========================================

CREATE OR REPLACE FUNCTION generate_certificate_id() RETURNS text AS $$
DECLARE
    chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- Exclude confusing chars (0,O,1,I)
    result text := '';
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
    new_id text;
    exists_count int;
BEGIN
    IF NEW.certificate_id IS NULL THEN
        LOOP
            new_id := generate_certificate_id();
            SELECT COUNT(*) INTO exists_count FROM public.certificates WHERE certificate_id = new_id;
            EXIT WHEN exists_count = 0;
        END LOOP;
        NEW.certificate_id := new_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_certificate_id ON public.certificates;
CREATE TRIGGER trigger_set_certificate_id
    BEFORE INSERT ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION set_certificate_id();

-- ==========================================
-- Grant permissions
-- ==========================================

GRANT ALL ON TABLE public.certificate_templates TO postgres;
GRANT ALL ON TABLE public.certificate_templates TO service_role;

GRANT ALL ON TABLE public.certificates TO postgres;
GRANT ALL ON TABLE public.certificates TO service_role;
