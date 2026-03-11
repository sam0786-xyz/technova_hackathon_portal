-- Migration to add evaluation_rounds to hackathon_settings

ALTER TABLE public.hackathon_settings 
ADD COLUMN evaluation_rounds INTEGER DEFAULT 2 NOT NULL;
