CREATE TABLE IF NOT EXISTS sponsorships (
  id VARCHAR(36) DEFAULT (UUID()) PRIMARY KEY,
  source TEXT NOT NULL,
  amount numeric(10, 2) NOT NULL,
  received_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS


-- Allow admins to read/write (Service Role or Admin Policy)
-- For now, we'll allow public read (for dashboard) and authenticated write?
-- Actually, let's keep it simple: Service Role access is default for server actions.
-- We can add a policy for authenticated users if we want strictness.
