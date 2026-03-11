-- IMPORTANT: Run this SQL in Supabase Dashboard to create the event-banners bucket

-- Go to Supabase Dashboard -> Storage -> Create new bucket

-- Bucket Name: event-banners
-- Public: Yes (so images can be accessed publicly)

-- OR run this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-banners', 'event-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policy to allow uploads
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'event-banners');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'event-banners');

CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (bucket_id = 'event-banners');

CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'event-banners');
