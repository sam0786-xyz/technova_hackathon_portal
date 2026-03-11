-- Add magic_token to hackathon_evaluators for direct links
ALTER TABLE public.hackathon_evaluators 
ADD COLUMN IF NOT EXISTS magic_token UUID DEFAULT gen_random_uuid() NOT NULL;
