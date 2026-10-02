-- ==============================================================================
-- BEHIND THE SCENES (BTS) — TINDER ARCHITECTURE MIGRATION & REALTIME MATCH ENGINE
-- Target: Supabase Cloud PostgreSQL
-- Paste and run this script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure PostGIS and UUID extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Add performance & matchmaking indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_profiles_gender_age ON public.profiles (gender, age);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles (country);

-- 3. Fast Negative-Lookup Index on Swipes (Bilateral indexing)
CREATE UNIQUE INDEX IF NOT EXISTS idx_swipes_pair ON public.swipes (swiper_id, target_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target_like ON public.swipes (target_id, is_like);
CREATE INDEX IF NOT EXISTS idx_swipes_swiper_id ON public.swipes (swiper_id);

-- 4. Fast Index on Matches and Messages
CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches (user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages (match_id, created_at);

-- 5. ATOMIC MATCH ENGINE: Trigger that detects reciprocal likes and creates matches instantly
CREATE OR REPLACE FUNCTION handle_mutual_match()
RETURNS TRIGGER AS $$
DECLARE
    reciprocal_like BOOLEAN;
    user_a_name TEXT;
    user_b_name TEXT;
BEGIN
    -- Only evaluate if current action is a LIKE or SUPERLIKE
    IF NEW.is_like = TRUE THEN
        -- Check if target user has already liked the current swiper
        SELECT is_like INTO reciprocal_like 
        FROM public.swipes 
        WHERE swiper_id = NEW.target_id 
          AND target_id = NEW.swiper_id 
          AND is_like = TRUE;

        -- If mutual like exists, atomically create the bilateral match
        IF reciprocal_like = TRUE THEN
            INSERT INTO public.matches (user1_id, user2_id, bts_unlocked, created_at)
            VALUES (NEW.target_id, NEW.swiper_id, TRUE, NOW())
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to swipes table
DROP TRIGGER IF EXISTS tr_on_swipe_evaluate_match ON public.swipes;
CREATE TRIGGER tr_on_swipe_evaluate_match
AFTER INSERT OR UPDATE ON public.swipes
FOR EACH ROW
EXECUTE FUNCTION handle_mutual_match();

-- 6. TINDER-STYLE DISCOVERY ENGINE RPC FUNCTION
-- Returns filtered candidate cards excluding self, already swiped, and reported users
DROP FUNCTION IF EXISTS public.get_discovery_feed(UUID, TEXT, INT, INT, INT);
DROP FUNCTION IF EXISTS public.get_discovery_feed(TEXT, TEXT, INT, INT, INT);

CREATE OR REPLACE FUNCTION get_discovery_feed(
    p_user_id TEXT,
    p_target_gender TEXT,
    p_min_age INT DEFAULT 18,
    p_max_age INT DEFAULT 55,
    p_limit INT DEFAULT 30
)
RETURNS SETOF public.profiles AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.profiles p
    WHERE p.id::TEXT != p_user_id
      AND (p.gender = p_target_gender OR p_target_gender = 'all')
      AND p.age BETWEEN p_min_age AND p_max_age
      -- Exclude profiles already swiped by this user
      AND p.id::TEXT NOT IN (
          SELECT s.target_id::TEXT FROM public.swipes s WHERE s.swiper_id::TEXT = p_user_id
      )
      -- Exclude reported profiles
      AND p.id::TEXT NOT IN (
          SELECT r.reported_id::TEXT FROM public.reports r WHERE r.reporter_id::TEXT = p_user_id AND r.reported_id IS NOT NULL
      )
    ORDER BY p.verified DESC, p.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Ensure Supabase Realtime publication includes matches and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
