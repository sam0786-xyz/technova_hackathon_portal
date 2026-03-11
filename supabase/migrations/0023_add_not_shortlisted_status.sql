-- Add 'not_shortlisted' to hackathon_team_status enum
ALTER TYPE public.hackathon_team_status ADD VALUE IF NOT EXISTS 'not_shortlisted';
