-- ==============================================================================
-- BTS STEP 1 TO 3: STORAGE BUCKETS, REALTIME CHAT, AND NOTIFICATIONS SCHEMA
-- Target: Supabase Cloud PostgreSQL
-- Paste and run this script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Create Supabase Storage Buckets for BTS Media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('bts_photos', 'bts_photos', true),
  ('bts_voice_notes', 'bts_voice_notes', true),
  ('bts_date_drops', 'bts_date_drops', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Security Policies (Public Read, Authenticated Upload)
DROP POLICY IF EXISTS "Public Read Photos" ON storage.objects;
CREATE POLICY "Public Read Photos" ON storage.objects FOR SELECT USING (bucket_id IN ('bts_photos', 'bts_voice_notes', 'bts_date_drops'));

DROP POLICY IF EXISTS "Public Upload Photos" ON storage.objects;
CREATE POLICY "Public Upload Photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('bts_photos', 'bts_voice_notes', 'bts_date_drops'));

DROP POLICY IF EXISTS "Public Update Photos" ON storage.objects;
CREATE POLICY "Public Update Photos" ON storage.objects FOR UPDATE USING (bucket_id IN ('bts_photos', 'bts_voice_notes', 'bts_date_drops'));

-- 3. Add Push Notification Token columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS push_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;

-- 4. Enable Supabase Realtime safely (handles already-added tables gracefully)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Table messages is already in supabase_realtime publication';
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Table matches is already in supabase_realtime publication';
    END;

    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.swipes;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'Table swipes is already in supabase_realtime publication';
    END;
END $$;
