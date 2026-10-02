-- ==============================================================================
-- BEHIND THE SCENES (BTS) — COMPLETE PRODUCTION DATABASE SETUP & SEED
-- Target: Supabase Cloud PostgreSQL
-- Paste and run this script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Add matchmaking columns to profiles table if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'female';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interested_in_gender TEXT DEFAULT 'male';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_min_age INTEGER DEFAULT 18;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_max_age INTEGER DEFAULT 55;

-- 3. Configure Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop old restrictive policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by registered users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles read access" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert update access" ON public.profiles;
DROP POLICY IF EXISTS "Swipes full access" ON public.swipes;
DROP POLICY IF EXISTS "Matches full access" ON public.matches;
DROP POLICY IF EXISTS "Messages full access" ON public.messages;
DROP POLICY IF EXISTS "Date drops full access" ON public.date_drops;
DROP POLICY IF EXISTS "Reports full access" ON public.reports;

-- Profiles: Anyone can view profiles, authenticated & onboarding users can create/update
CREATE POLICY "Profiles read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insert update access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Swipes: Users can record their likes and passes
CREATE POLICY "Swipes full access" ON public.swipes FOR ALL USING (true) WITH CHECK (true);

-- Matches: Users can view and create mutual matches
CREATE POLICY "Matches full access" ON public.matches FOR ALL USING (true) WITH CHECK (true);

-- Messages: Users can read and send chat messages / voice memos
CREATE POLICY "Messages full access" ON public.messages FOR ALL USING (true) WITH CHECK (true);

-- Date Drops: Community feed is public, registered singles can drop verified date stories
CREATE POLICY "Date drops full access" ON public.date_drops FOR ALL USING (true) WITH CHECK (true);

-- Reports: Anyone can report safety or catfish issues
CREATE POLICY "Reports full access" ON public.reports FOR ALL USING (true) WITH CHECK (true);

-- 4. Seed Initial 12 African Singles (Ghana, Mauritius, Botswana, Namibia, Morocco)
INSERT INTO public.profiles (
    id, email, full_name, age, gender, country, country_flag, current_city, home_town, 
    tribe, languages, occupation, intent, detty_december_ready, verified, liveness_verified, 
    photos, bts_type, bts_caption, bts_thumbnail, bts_location_tag, bts_habit, 
    voice_note_url, voice_note_duration, voice_note_transcript
) VALUES 
-- Ghana Female (Nana Ama)
(
    'a1111111-1111-1111-1111-111111111111', 'nana.ama@bts.africa', 'Nana Ama', 27, 'female', 'Ghana', '🇬🇭',
    'Accra (Airport Residential)', 'Kumasi', 'Asante', ARRAY['English', 'Twi'],
    'Architect & Interior Designer', 'Long-term leading to marriage', true, true, true,
    ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'],
    'sunday_cooking', 'Behind the scenes: Making Sunday Omotuo with groundnut soup while arguing over Premier League.',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
    'Mom''s kitchen, Kumasi', 'I listen to Kojo Antwi and Daddy Lumba on repeat every single Sunday morning.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:14',
    'Charlie, if you can''t handle high energy on a Friday night at Bloom Bar or quiet beach walks in Kokrobite, we won''t survive two days!'
),
-- Ghana Male (Kweku Boateng)
(
    'a2222222-2222-2222-2222-222222222222', 'kweku.boateng@bts.africa', 'Kweku Boateng', 29, 'male', 'Ghana', '🇬🇭',
    'London (Canary Wharf)', 'Mampong / Kumasi', 'Asante', ARRAY['English', 'Twi', 'French'],
    'Software Engineer (Fintech)', 'Serious relationship', true, true, true,
    ARRAY['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'],
    'gym_session', 'Behind the scenes: Deadlifts at 6am before Jira tickets destroy my sanity.',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80',
    'Third Space Canary Wharf', 'I order waakye from North London every Saturday morning without missing a single week.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:18',
    'Chale, I''m simple oh. Let''s eat good food, build generational wealth, and travel to Accra every single December.'
),
-- Mauritius Female (Priya Doorgakant)
(
    'a3333333-3333-3333-3333-333333333333', 'priya.doorgakant@bts.africa', 'Priya Doorgakant', 26, 'female', 'Mauritius', '🇲🇺',
    'Port Louis', 'Flic en Flac', 'Indo-Mauritian', ARRAY['English', 'French', 'Kreol Morisien', 'Hindi'],
    'Marine Biologist & Coral Reef Researcher', 'Serious relationship', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1616766098956-c81f12114571?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80'],
    'ocean_life', 'Behind the scenes: Tagging sea turtles at sunrise before the tourists wake up.',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    'Blue Bay Marine Park', 'I eat dholl puri with chutneys for breakfast almost every morning, even on fieldwork days.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:16',
    'If you cannot handle sandy feet, salty hair, and impromptu beach picnics at sunset, we will not last a week!'
),
-- Mauritius Male (Yannick Roussety)
(
    'a4444444-4444-4444-4444-444444444444', 'yannick.roussety@bts.africa', 'Yannick Roussety', 30, 'male', 'Mauritius', '🇲🇺',
    'Grand Baie', 'Mahebourg', 'Creole', ARRAY['Kreol Morisien', 'French', 'English'],
    'Hotel Manager & Sega Musician', 'Long-term leading to marriage', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'],
    'music_session', 'Behind the scenes: Late-night Sega jam session on ravanne drums with the crew in Mahebourg.',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    'Beachside Mahebourg', 'I cook vindaye poisson every Sunday and argue with my grandmother about who makes it better.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:14',
    'Mo dir ou, if you can dance Sega and appreciate a good rougaille, we already halfway there!'
),
-- Botswana Female (Kelebogile Motswana)
(
    'a5555555-5555-5555-5555-555555555555', 'kelebogile@bts.africa', 'Kelebogile (Kele)', 28, 'female', 'Botswana', '🇧🇼',
    'Gaborone', 'Maun', 'Tswana', ARRAY['Setswana', 'English'],
    'Wildlife Conservationist & Safari Guide', 'Long-term leading to marriage', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'],
    'bush_life', 'Behind the scenes: Tracking elephants at dawn in the Okavango Delta before the mokoro cruise.',
    'https://images.unsplash.com/photo-1516426122078-c23e76b4f3e7?auto=format&fit=crop&w=900&q=80',
    'Okavango Delta, Maun', 'I wake up at 4:30 AM for bush drives and I am completely unapologetic about falling asleep by 9 PM.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:18',
    'Dumela! If you think Gaborone nightlife is the whole of Botswana, let me take you to Maun and show you the real magic.'
),
-- Botswana Male (Tebogo Kgosi)
(
    'a6666666-6666-6666-6666-666666666666', 'tebogo.kgosi@bts.africa', 'Tebogo Kgosi', 31, 'male', 'Botswana', '🇧🇼',
    'Gaborone (Block 8)', 'Francistown', 'Kalanga', ARRAY['Setswana', 'Ikalanga', 'English'],
    'Diamond Mining Engineer & Part-time DJ', 'Serious relationship', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'],
    'weekend_grind', 'Behind the scenes: Saturday afternoon braai with the boys in Block 8 arguing about Zebras FC.',
    'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=900&q=80',
    'Gaborone Block 8', 'I DJ every other Friday at Bull & Bush but still call my mother in Francistown every morning.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:15',
    'Ee mma, I am simple. Good music, good company, and seswaa on the weekend. Everything else we figure out together.'
),
-- Namibia Female (Uakondjisa Mbango)
(
    'a7777777-7777-7777-7777-777777777777', 'uakondjisa@bts.africa', 'Uakondjisa (Uja)', 27, 'female', 'Namibia', '🇳🇦',
    'Windhoek (Klein Windhoek)', 'Swakopmund', 'Herero', ARRAY['Otjiherero', 'English', 'Afrikaans', 'German'],
    'Photographer & Cultural Tourism Guide', 'Dating to explore & vibe', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'],
    'desert_shoot', 'Behind the scenes: Golden hour photoshoot at Deadvlei with 900-year-old camel thorn trees.',
    'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80',
    'Sossusvlei, Namib Desert', 'I wear my ohorokova dress every Sunday to church without exception.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:13',
    'Windhoek has the vibes but Swakopmund has my heart. Come eat Kapana with me at the open market!'
),
-- Namibia Male (Johannes Shilongo)
(
    'a8888888-8888-8888-8888-888888888888', 'johannes@bts.africa', 'Johannes (Joh)', 29, 'male', 'Namibia', '🇳🇦',
    'Windhoek', 'Oshakati', 'Ovambo', ARRAY['Oshiwambo', 'English', 'Afrikaans'],
    'Software Developer & Tech Community Builder', 'Serious relationship', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'],
    'tech_grind', 'Behind the scenes: Mentoring young developers at the Windhoek tech hub while eating fat cakes.',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    'Windhoek Innovation Hub', 'Every December I drive 8 hours north to Oshakati for Efundja festival.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:17',
    'I build apps by day and braai by night. If you can handle someone who talks about APIs and oshifima, we are good.'
),
-- Morocco Female (Amina El Fassi)
(
    'a9999999-9999-9999-9999-999999999999', 'amina.elfassi@bts.africa', 'Amina El Fassi', 25, 'female', 'Morocco', '🇲🇦',
    'Marrakech (Gueliz)', 'Fès', 'Amazigh (Berber)', ARRAY['Darija', 'Arabic', 'French', 'English', 'Tamazight'],
    'Fashion Designer & Zellige Artisan', 'Long-term / Open to marriage', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'],
    'artisan_studio', 'Behind the scenes: Hand-cutting zellige tiles in my Fès workshop while mint tea gets cold.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=900&q=80',
    'Fès Medina Workshop', 'I drink at least six glasses of mint tea a day and judge anyone who puts sugar in coffee instead.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:15',
    'Marrakech is beautiful but Fès is where the soul lives. Come get lost in the medina with me!'
),
-- Morocco Male (Youssef Benjelloun)
(
    'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'youssef@bts.africa', 'Youssef Benjelloun', 32, 'male', 'Morocco', '🇲🇦',
    'Casablanca', 'Chefchaouen', 'Jebala (Riffian)', ARRAY['Darija', 'Arabic', 'French', 'Spanish', 'English'],
    'Architect & Riad Restoration Specialist', 'Marriage & building family', false, true, true,
    ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'],
    'restoration', 'Behind the scenes: Restoring a 200-year-old riad in the Fès medina, covered in plaster dust.',
    'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?auto=format&fit=crop&w=900&q=80',
    'Fès Medina Restoration Site', 'I escape to Chefchaouen every month to sit in the blue streets and eat pastilla.',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', '0:19',
    'Casablanca has the hustle but Chefchaouen has the peace. I need someone who appreciates both speeds of life.'
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    age = EXCLUDED.age,
    gender = EXCLUDED.gender,
    country = EXCLUDED.country,
    country_flag = EXCLUDED.country_flag,
    current_city = EXCLUDED.current_city,
    home_town = EXCLUDED.home_town,
    tribe = EXCLUDED.tribe,
    photos = EXCLUDED.photos,
    bts_caption = EXCLUDED.bts_caption,
    voice_note_transcript = EXCLUDED.voice_note_transcript;

-- 5. Seed Initial Verified Date Drops
INSERT INTO public.date_drops (
    id, user_id, couple_title, match_tag, photo_url, venue, caption, vibe_rating, likes_count, cheers_count
) VALUES
(
    'd1111111-1111-1111-1111-111111111111',
    'a2222222-2222-2222-2222-222222222222',
    'Kweku & Nana Ama',
    'Matched on Behind The Scenes • Ghana Connection',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
    'Buka Restaurant, Osu, Accra',
    'First date eating hot waakye with fried fish and Kelewele. Started as an argument over Premier League on BTS, turned into a 4-hour dinner!',
    '⭐⭐⭐⭐⭐ Pure Chemistry',
    24, 18
),
(
    'd2222222-2222-2222-2222-222222222222',
    'a4444444-4444-4444-4444-444444444444',
    'Yannick & Priya',
    'Matched on Behind The Scenes • Island Vibes',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80',
    'Trou aux Biches Beachfront, Mauritius',
    'Sunset beach picnic with Sega ravanne drums and hot gateau piment! Connected on BTS over our love for the ocean.',
    '⭐⭐⭐⭐⭐ Unmatched Vibes',
    42, 31
)
ON CONFLICT (id) DO NOTHING;
