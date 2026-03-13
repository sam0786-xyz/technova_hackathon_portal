-- Official @auth/supabase-adapter schema from authjs.dev
-- https://authjs.dev/getting-started/adapters/supabase

-- Create next_auth schema





-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    name TEXT,
    email TEXT,
    "emailVerified" DATETIME,
    image TEXT,
    -- Custom columns for Technova
    role TEXT DEFAULT 'student',
    xp_points int DEFAULT 0,
    system_id TEXT UNIQUE,
    year int,
    branch TEXT,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);




-- uid() function for RLS policies
CREATE OR REPLACE FUNCTION uid() RETURNS VARCHAR(36)
    LANGUAGE sql STABLE
    AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::JSON ->> 'sub')
    )::VARCHAR(36)
$$;

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    expires DATETIME NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" VARCHAR(36),
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessionToken_unique UNIQUE ("sessionToken"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);




-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(36) NOT NULL DEFAULT (UUID()),
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    oauth_token_secret TEXT,
    oauth_token TEXT,
    "userId" VARCHAR(36),
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES users (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE CASCADE
);




-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT,
    token TEXT,
    expires DATETIME NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);



