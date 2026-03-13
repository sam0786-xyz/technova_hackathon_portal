-- ==========================================
-- Phase 2: Event & Club tables (in public schema)
-- Depends on: Migration 0000 (users table) - but linked via sessions, not FK
-- ==========================================

-- Enable uuid extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- public.clubs
-- ==========================================
CREATE TABLE IF NOT EXISTS public.clubs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  logo_url text,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- public.events
-- ==========================================
CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  banner_url text,
  venue text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  capacity int DEFAULT 100,
  price numeric(10, 2) DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- public.admin_roles
-- Map next_auth users to clubs for admin access
-- ==========================================
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL, -- References next_auth.users.id (but we can't FK across schemas easily)
  club_id uuid NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, club_id)
);

-- ==========================================
-- public.registrations
-- ==========================================
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL, -- References next_auth.users.id
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
  qr_token_id text UNIQUE,
  attended boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- ==========================================
-- RLS Policies (for client-side Supabase calls)
-- ==========================================
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Public read for clubs and live events
CREATE POLICY "Public read clubs" ON public.clubs FOR SELECT USING (true);
CREATE POLICY "Public read live events" ON public.events FOR SELECT USING (status = 'live');

-- Registrations: Users can read their own (would need auth.uid() from Supabase Auth, but using NextAuth we might need different approach)
-- For now, allow service_role full access (server-side actions)
