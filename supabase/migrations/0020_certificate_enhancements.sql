-- =====================================================
-- Migration: Certificate System Enhancements
-- Description: Add certificate types, analytics, digital signatures
-- =====================================================

-- 1. Add certificate_type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'certificate_type') THEN
        CREATE TYPE certificate_type AS ENUM ('participation', 'winner', 'speaker', 'coordinator', 'volunteer');
    END IF;
END $$;

-- 2. Add new columns to certificates table
ALTER TABLE public.certificates
ADD COLUMN IF NOT EXISTS certificate_type certificate_type DEFAULT 'participation',
ADD COLUMN IF NOT EXISTS role_title TEXT,
ADD COLUMN IF NOT EXISTS linkedin_shares INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 3. Add signature support to certificate_templates
ALTER TABLE public.certificate_templates
ADD COLUMN IF NOT EXISTS signature_url TEXT,
ADD COLUMN IF NOT EXISTS signature_region JSONB;

-- 4. Create certificate_analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS public.certificate_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID REFERENCES public.certificates(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'download', 'linkedin_share', 'verification')),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_certificate_analytics_certificate_id 
ON public.certificate_analytics(certificate_id);

CREATE INDEX IF NOT EXISTS idx_certificate_analytics_action_type 
ON public.certificate_analytics(action_type);

CREATE INDEX IF NOT EXISTS idx_certificate_analytics_created_at 
ON public.certificate_analytics(created_at);

-- 6. Create aggregate view for analytics
CREATE OR REPLACE VIEW public.certificate_stats_view AS
SELECT 
    c.id,
    c.certificate_id AS short_id,
    c.event_id,
    c.user_id,
    c.certificate_type,
    c.role_title,
    c.status,
    c.issued_at,
    c.downloaded_count,
    c.linkedin_shares,
    c.view_count,
    COALESCE(a.verification_count, 0) AS verification_count
FROM public.certificates c
LEFT JOIN (
    SELECT 
        certificate_id,
        COUNT(*) FILTER (WHERE action_type = 'verification') AS verification_count
    FROM public.certificate_analytics
    GROUP BY certificate_id
) a ON c.id = a.certificate_id;

-- 7. RLS for analytics table
ALTER TABLE public.certificate_analytics ENABLE ROW LEVEL SECURITY;

-- Public can insert (for tracking views)
CREATE POLICY "Anyone can insert analytics" ON public.certificate_analytics
    FOR INSERT WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view analytics" ON public.certificate_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM next_auth.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'super_admin')
        )
    );

-- 8. Function to increment linkedin shares
CREATE OR REPLACE FUNCTION public.increment_linkedin_shares(cert_id TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.certificates 
    SET linkedin_shares = COALESCE(linkedin_shares, 0) + 1
    WHERE certificate_id = cert_id;
    
    INSERT INTO public.certificate_analytics (certificate_id, action_type)
    SELECT id, 'linkedin_share' FROM public.certificates WHERE certificate_id = cert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Function to track verification
CREATE OR REPLACE FUNCTION public.track_certificate_verification(cert_id TEXT, ip TEXT DEFAULT NULL, ua TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE public.certificates 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE certificate_id = cert_id;
    
    INSERT INTO public.certificate_analytics (certificate_id, action_type, ip_address, user_agent)
    SELECT id, 'verification', ip, ua FROM public.certificates WHERE certificate_id = cert_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(identifier, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON public.rate_limits(identifier, endpoint);

-- Function to check and update rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_endpoint TEXT,
    p_max_requests INTEGER DEFAULT 10,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Get current state
    SELECT request_count, window_start INTO v_count, v_window_start
    FROM public.rate_limits
    WHERE identifier = p_identifier AND endpoint = p_endpoint;
    
    -- Check if window expired
    IF v_window_start IS NOT NULL AND v_window_start < NOW() - (p_window_seconds || ' seconds')::INTERVAL THEN
        -- Reset window
        UPDATE public.rate_limits 
        SET request_count = 1, window_start = NOW()
        WHERE identifier = p_identifier AND endpoint = p_endpoint;
        RETURN TRUE;
    END IF;
    
    -- No existing record, create one
    IF v_count IS NULL THEN
        INSERT INTO public.rate_limits (identifier, endpoint, request_count, window_start)
        VALUES (p_identifier, p_endpoint, 1, NOW())
        ON CONFLICT (identifier, endpoint) DO UPDATE SET request_count = rate_limits.request_count + 1;
        RETURN TRUE;
    END IF;
    
    -- Check if under limit
    IF v_count < p_max_requests THEN
        UPDATE public.rate_limits 
        SET request_count = request_count + 1
        WHERE identifier = p_identifier AND endpoint = p_endpoint;
        RETURN TRUE;
    END IF;
    
    -- Over limit
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
