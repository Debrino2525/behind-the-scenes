-- ==============================================================================
-- BEHIND THE SCENES (BTS) — PRODUCTION DATABASE SCHEMA
-- Target Engine: PostgreSQL 15+ (Supabase)
-- Extensions: PostGIS (Geospatial proximity), pgvector (Compatibility embeddings)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Profiles Table (Users & Cultural Identifiers)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18), -- Mandatory 18+ store rule
    country TEXT NOT NULL DEFAULT 'Ghana',
    country_flag TEXT NOT NULL DEFAULT '🇬🇭',
    current_city TEXT NOT NULL,
    home_town TEXT NOT NULL,
    tribe TEXT,
    languages TEXT[] DEFAULT '{}',
    occupation TEXT,
    intent TEXT NOT NULL DEFAULT 'Serious relationship',
    detty_december_ready BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    liveness_verified BOOLEAN DEFAULT FALSE, -- Anti-Catfish Gold Badge
    photos TEXT[] DEFAULT '{}',
    bts_type TEXT DEFAULT 'candid_clip',
    bts_caption TEXT,
    bts_thumbnail TEXT,
    bts_location_tag TEXT,
    bts_habit TEXT,
    voice_note_url TEXT,
    voice_note_duration TEXT,
    voice_note_transcript TEXT,
    location GEOGRAPHY(Point, 4326), -- PostGIS for distance calculations
    embedding VECTOR(1536), -- Vector for matching chemistry
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant spatial radius queries (e.g. singles within 50km)
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_hometown ON public.profiles(home_town);

-- 3. Swipes & Double Opt-in Match Queue
CREATE TABLE IF NOT EXISTS public.swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    swiper_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL DEFAULT TRUE,
    is_super_like BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(swiper_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON public.swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_swipes_target ON public.swipes(target_id);

-- 4. Matches Table
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    bts_unlocked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- 5. Real-Time Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    audio_url TEXT,
    is_momo_gift BOOLEAN DEFAULT FALSE,
    momo_amount NUMERIC(10,2),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_match ON public.messages(match_id, created_at);

-- 6. Date Drops (Real Community Dates Feed)
CREATE TABLE IF NOT EXISTS public.date_drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    couple_title TEXT NOT NULL,
    match_tag TEXT NOT NULL,
    photo_url TEXT NOT NULL,
    venue TEXT NOT NULL,
    caption TEXT NOT NULL,
    vibe_rating TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    cheers_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Safety, Abuse & Catfish Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reported_user_name TEXT NOT NULL,
    reported_user_id TEXT,
    reason TEXT NOT NULL,
    evidence TEXT,
    status TEXT DEFAULT 'Pending Review', -- Pending Review, Resolved (Ban), Resolved (Warning), Dismissed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MoMo & Card Refunds
CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_name TEXT NOT NULL,
    amount TEXT NOT NULL,
    channel TEXT NOT NULL, -- MTN Mobile Money, Telecel Cash, Stripe
    phone_or_card TEXT NOT NULL,
    product TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Approval',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Sponsored Entertainment Ads
CREATE TABLE IF NOT EXISTS public.sponsored_ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sponsor_name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    badge TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    dates TEXT NOT NULL,
    perk TEXT NOT NULL,
    cta_text TEXT NOT NULL,
    cta_url TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_drops ENABLE ROW LEVEL SECURITY;

-- Basic Public Read Access for active profiles
CREATE POLICY "Public profiles are viewable by registered users" 
ON public.profiles FOR SELECT USING (true);

-- Date drops are community readable
CREATE POLICY "Date drops are publicly viewable" 
ON public.date_drops FOR SELECT USING (true);
