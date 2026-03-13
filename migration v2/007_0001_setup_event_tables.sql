-- ==========================================
-- Phase 2: Event & Club tables (in public schema)
-- Depends on: Migration 0000 (users table) - but linked via sessions, not FK
-- ==========================================

-- Enable VARCHAR(36) extension if not enabled


-- ==========================================
-- clubs
-- ==========================================
CREATE TABLE IF NOT EXISTS clubs (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- events
-- ==========================================
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  club_id VARCHAR(36) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  venue TEXT,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  capacity int DEFAULT 100,
  price numeric(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- admin_roles
-- Map next_auth users to clubs for admin access
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_roles (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL, -- References users.id (but we can't FK across schemas easily)
  club_id VARCHAR(36) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, club_id)
);

-- ==========================================
-- registrations
-- ==========================================
CREATE TABLE IF NOT EXISTS registrations (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL, -- References users.id
  event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'free', 'refunded')),
  qr_token_id TEXT UNIQUE,
  attended BOOLEAN DEFAULT false,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, event_id)
);

-- ==========================================
-- RLS Policies (for client-side Supabase calls)
-- ==========================================




-- Public read for clubs and live events
-- CREATE POLICY REMOVED:  ON clubs FOR SELECT USING (true);
-- CREATE POLICY REMOVED:  ON events FOR SELECT USING (status = 'live');

-- Registrations: Users can read their own (would need auth.uid() from Supabase Auth, but using NextAuth we might need different approach)
-- For now, allow service_role full access (server-side actions)
