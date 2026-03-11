CREATE TABLE IF NOT EXISTS public.sponsorships (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  source text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  received_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsorships ENABLE ROW LEVEL SECURITY;

-- Allow admins to read/write (Service Role or Admin Policy)
-- For now, we'll allow public read (for dashboard) and authenticated write?
-- Actually, let's keep it simple: Service Role access is default for server actions.
-- We can add a policy for authenticated users if we want strictness.
