// filename: scripts/seedSupabase.js
// Description: Seeds Supabase PostgreSQL database with complete 12 pan-African profiles and community date drops

const SUPABASE_URL = 'https://mbeuauxvofhnwigpzmdl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZXVhdXh2b2ZobndpZ3B6bWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjY2OTgsImV4cCI6MjEwNjQ0MjY5OH0.ExE7r4PTcw4_b25fwlU4z84P3nlxU6UBXk5KmqT43FY';

const PROFILES = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    email: 'nana.ama@bts.africa',
    full_name: 'Nana Ama',
    gender: 'female',
    interested_in_gender: 'male',
    age: 27,
    occupation: 'Architect & Interior Designer',
    current_city: 'Accra (Airport Residential)',
    home_town: 'Kumasi',
    tribe: 'Asante',
    languages: ['English', 'Twi'],
    intent: 'Long-term leading to marriage',
    detty_december_ready: true,
    verified: true,
    liveness_verified: true,
    country: 'Ghana',
    country_flag: '🇬🇭',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'sunday_cooking',
    bts_caption: 'Behind the scenes: Making Sunday Omotuo with groundnut soup while arguing over Premier League.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: "Mom's kitchen, Kumasi",
    bts_habit: 'I listen to Kojo Antwi and Daddy Lumba on repeat every single Sunday morning.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    voice_note_duration: '0:14',
    voice_note_transcript: "Charlie, if you can't handle high energy on a Friday night at Bloom Bar or quiet beach walks in Kokrobite, we won't survive two days!",
    is_online: true
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    email: 'kweku.boateng@bts.africa',
    full_name: 'Kweku Boateng',
    gender: 'male',
    interested_in_gender: 'female',
    age: 29,
    occupation: 'Software Engineer (Fintech)',
    current_city: 'London (Canary Wharf)',
    home_town: 'Mampong / Kumasi',
    tribe: 'Asante',
    languages: ['English', 'Twi', 'French'],
    intent: 'Serious relationship',
    detty_december_ready: true,
    verified: true,
    liveness_verified: true,
    country: 'Ghana',
    country_flag: '🇬🇭',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'tech_session',
    bts_caption: 'Behind the scenes: 2 AM coding debug session with shito on plantain chips.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'London Flat',
    bts_habit: 'I will find a Ghanaian restaurant in literally any city on earth within 30 minutes of landing.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    voice_note_duration: '0:18',
    voice_note_transcript: 'Look, London winter is not it. Counting down the weeks until December landing at Kotoka.',
    is_online: true
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    email: 'enyonam.ewe@bts.africa',
    full_name: 'Enyonam (Enyo)',
    gender: 'female',
    interested_in_gender: 'male',
    age: 26,
    occupation: 'Medical Doctor / Resident',
    current_city: 'Accra (Cantonments)',
    home_town: 'Keta / Ho',
    tribe: 'Ewe',
    languages: ['English', 'Ewe', 'Twi', 'Ga'],
    intent: 'Long-term / Open to marriage',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Ghana',
    country_flag: '🇬🇭',
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'hospital_rounds',
    bts_caption: 'Behind the scenes: Post-36hr hospital shift still smiling because the ward survived.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Korle-Bu Teaching Hospital',
    bts_habit: 'I eat spicy tilapia with banku at 10 PM to decompress from hospital rounds.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    voice_note_duration: '0:12',
    voice_note_transcript: "Efo, if you think life is too serious, come let's go sit by Keta lagoon and eat fresh oysters.",
    is_online: false
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    email: 'fiifi.yankson@bts.africa',
    full_name: 'Fiifi Yankson',
    gender: 'male',
    interested_in_gender: 'female',
    age: 28,
    occupation: 'Investment Banker & Highlife Guitarist',
    current_city: 'Accra (Ridge)',
    home_town: 'Cape Coast',
    tribe: 'Fante',
    languages: ['English', 'Fante', 'Twi'],
    intent: 'Serious relationship',
    detty_december_ready: true,
    verified: true,
    liveness_verified: true,
    country: 'Ghana',
    country_flag: '🇬🇭',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'acoustic_jam',
    bts_caption: 'Behind the scenes: Tuning my vintage acoustic guitar while eating hot bofrot in Cape Coast.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Cape Coast Castle Beach',
    bts_habit: 'I play Osibisa and Ebo Taylor riffs to clear my head after tough financial modeling days.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    voice_note_duration: '0:15',
    voice_note_transcript: "If you have never sat on the Cape Coast rocks watching the Atlantic waves with fresh coconut, let me show you how it's done.",
    is_online: true
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    email: 'priya.doorgakant@bts.africa',
    full_name: 'Priya Doorgakant',
    gender: 'female',
    interested_in_gender: 'male',
    age: 26,
    occupation: 'Marine Biologist & Coral Reef Researcher',
    current_city: 'Port Louis',
    home_town: 'Flic en Flac',
    tribe: 'Indo-Mauritian',
    languages: ['English', 'French', 'Kreol Morisien', 'Hindi'],
    intent: 'Serious relationship',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Mauritius',
    country_flag: '🇲🇺',
    photos: [
      'https://images.unsplash.com/photo-1616766098956-c81f12114571?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'ocean_life',
    bts_caption: 'Behind the scenes: Tagging sea turtles at sunrise before the tourists wake up.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Blue Bay Marine Park',
    bts_habit: 'I eat dholl puri with chutneys for breakfast almost every morning.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    voice_note_duration: '0:16',
    voice_note_transcript: 'If you cannot handle sandy feet, salty hair, and impromptu beach picnics at sunset, we will not last a week!',
    is_online: true
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    email: 'yannick.roussety@bts.africa',
    full_name: 'Yannick Roussety',
    gender: 'male',
    interested_in_gender: 'female',
    age: 30,
    occupation: 'Hotel Manager & Sega Musician',
    current_city: 'Grand Baie',
    home_town: 'Mahebourg',
    tribe: 'Creole',
    languages: ['Kreol Morisien', 'French', 'English'],
    intent: 'Long-term leading to marriage',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Mauritius',
    country_flag: '🇲🇺',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'music_session',
    bts_caption: 'Behind the scenes: Late-night Sega jam session on ravanne drums with the crew in Mahebourg.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Beachside Mahebourg',
    bts_habit: 'I cook vindaye poisson every Sunday and argue with my grandmother about who makes it better.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    voice_note_duration: '0:14',
    voice_note_transcript: 'Mo dir ou, if you can dance Sega and appreciate a good rougaille, we already halfway there!',
    is_online: true
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    email: 'kele.motswana@bts.africa',
    full_name: 'Kelebogile (Kele)',
    gender: 'female',
    interested_in_gender: 'male',
    age: 28,
    occupation: 'Wildlife Conservationist & Safari Guide',
    current_city: 'Gaborone',
    home_town: 'Maun',
    tribe: 'Tswana',
    languages: ['Setswana', 'English'],
    intent: 'Long-term leading to marriage',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Botswana',
    country_flag: '🇧🇼',
    photos: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'bush_life',
    bts_caption: 'Behind the scenes: Tracking elephants at dawn in the Okavango Delta.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1516426122078-c23e76b4f3e7?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Okavango Delta, Maun',
    bts_habit: 'I wake up at 4:30 AM for bush drives and fall asleep by 9 PM. Unapologetically.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
    voice_note_duration: '0:18',
    voice_note_transcript: 'Dumela! If you think Gaborone nightlife is the whole of Botswana, let me take you to Maun.',
    is_online: false
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    email: 'tebogo.kgosi@bts.africa',
    full_name: 'Tebogo Kgosi',
    gender: 'male',
    interested_in_gender: 'female',
    age: 31,
    occupation: 'Diamond Mining Engineer & Part-time DJ',
    current_city: 'Gaborone (Block 8)',
    home_town: 'Francistown',
    tribe: 'Kalanga',
    languages: ['Setswana', 'Ikalanga', 'English'],
    intent: 'Serious relationship',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Botswana',
    country_flag: '🇧🇼',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'weekend_grind',
    bts_caption: 'Behind the scenes: Saturday afternoon braai with the boys in Block 8 arguing about Zebras FC.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Gaborone Block 8',
    bts_habit: 'I DJ every other Friday at Bull & Bush but still call my mother in Francistown every morning.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    voice_note_duration: '0:15',
    voice_note_transcript: 'Ee mma, I am simple. Good music, good company, and seswaa on the weekend. Everything else we figure out together.',
    is_online: true
  },
  {
    id: 'a7777777-7777-7777-7777-777777777777',
    email: 'uja.mbango@bts.africa',
    full_name: 'Uakondjisa (Uja)',
    gender: 'female',
    interested_in_gender: 'male',
    age: 27,
    occupation: 'Photographer & Cultural Tourism Guide',
    current_city: 'Windhoek',
    home_town: 'Swakopmund',
    tribe: 'Herero',
    languages: ['Otjiherero', 'English', 'Afrikaans', 'German'],
    intent: 'Dating to explore & vibe',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Namibia',
    country_flag: '🇳🇦',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'desert_shoot',
    bts_caption: 'Behind the scenes: Golden hour at Deadvlei with 900-year-old camel thorn trees.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Sossusvlei, Namib Desert',
    bts_habit: 'I wear my ohorokova dress every Sunday to church. Heritage is daily life.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
    voice_note_duration: '0:13',
    voice_note_transcript: 'Come eat Kapana with me at the open market!',
    is_online: false
  },
  {
    id: 'a8888888-8888-8888-8888-888888888888',
    email: 'joh.shilongo@bts.africa',
    full_name: 'Johannes (Joh)',
    gender: 'male',
    interested_in_gender: 'female',
    age: 29,
    occupation: 'Software Developer & Tech Builder',
    current_city: 'Windhoek',
    home_town: 'Oshakati',
    tribe: 'Ovambo',
    languages: ['Oshiwambo', 'English', 'Afrikaans'],
    intent: 'Serious relationship',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Namibia',
    country_flag: '🇳🇦',
    photos: [
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'tech_grind',
    bts_caption: 'Behind the scenes: Mentoring young developers at the Windhoek tech hub while eating fat cakes.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Windhoek Innovation Hub',
    bts_habit: 'Every December I drive 8 hours north to Oshakati for Efundja festival. No excuses.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
    voice_note_duration: '0:17',
    voice_note_transcript: 'I build apps by day and braai by night. If you can handle someone who talks about both APIs and oshifima, we are good.',
    is_online: true
  },
  {
    id: 'a9999999-9999-9999-9999-999999999999',
    email: 'amina.elfassi@bts.africa',
    full_name: 'Amina El Fassi',
    gender: 'female',
    interested_in_gender: 'male',
    age: 25,
    occupation: 'Fashion Designer & Zellige Artisan',
    current_city: 'Marrakech (Gueliz)',
    home_town: 'Fès',
    tribe: 'Amazigh (Berber)',
    languages: ['Darija', 'Arabic', 'French', 'English', 'Tamazight'],
    intent: 'Long-term / Open to marriage',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Morocco',
    country_flag: '🇲🇦',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'artisan_studio',
    bts_caption: 'Behind the scenes: Hand-cutting zellige tiles while mint tea gets cold for the third time.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Fès Medina Workshop',
    bts_habit: 'Six glasses of mint tea a day minimum.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    voice_note_duration: '0:15',
    voice_note_transcript: 'Come get lost in the medina with me, I promise I know the way out... mostly.',
    is_online: false
  },
  {
    id: 'baaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    email: 'youssef.benjelloun@bts.africa',
    full_name: 'Youssef Benjelloun',
    gender: 'male',
    interested_in_gender: 'female',
    age: 32,
    occupation: 'Architect & Riad Specialist',
    current_city: 'Casablanca',
    home_town: 'Chefchaouen',
    tribe: 'Jebala (Riffian)',
    languages: ['Darija', 'Arabic', 'French', 'Spanish', 'English'],
    intent: 'Marriage & family',
    detty_december_ready: false,
    verified: true,
    liveness_verified: true,
    country: 'Morocco',
    country_flag: '🇲🇦',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=80'
    ],
    bts_type: 'restoration',
    bts_caption: 'Behind the scenes: Restoring a 200-year-old riad in the Fès medina covered in tadelakt plaster dust.',
    bts_thumbnail: 'https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?auto=format&fit=crop&w=900&q=80',
    bts_location_tag: 'Fès Medina Restoration',
    bts_habit: 'I escape to Chefchaouen every month to sit in the blue streets, eat pastilla, and recharge.',
    voice_note_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    voice_note_duration: '0:19',
    voice_note_transcript: 'Casablanca has the hustle but Chefchaouen has the peace. I need someone who appreciates both speeds of life.',
    is_online: true
  }
];

const DATE_DROPS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    user_id: 'a2222222-2222-2222-2222-222222222222',
    couple_title: 'Kweku & Nana Ama',
    match_tag: 'Matched on Behind The Scenes • Ghana Connection',
    photo_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
    venue: 'Buka Restaurant, Osu, Accra',
    caption: 'First date eating hot waakye with fried fish and Kelewele. Started as an argument over Premier League on BTS, turned into a 4-hour dinner! 🇬🇭✨',
    vibe_rating: '⭐⭐⭐⭐⭐ Pure Chemistry',
    likes_count: 142,
    cheers_count: 38
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    user_id: 'a4444444-4444-4444-4444-444444444444',
    couple_title: 'Yannick & Priya',
    match_tag: 'Matched on Behind The Scenes • Island Vibes',
    photo_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80',
    venue: 'Le Morne Beachfront, Mauritius',
    caption: 'Sunset beach picnic with Sega ravanne drums, hot gateau piment and fresh coconut! Connected on BTS over our love for the ocean. 🇲🇺🌊',
    vibe_rating: '⭐⭐⭐⭐⭐ Magical Energy',
    likes_count: 218,
    cheers_count: 64
  }
];

async function seed() {
  console.log('--- Starting Supabase Remote DB Seeding ---');
  
  // 1. Upsert Profiles
  for (const profile of PROFILES) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(profile)
    });
    console.log(`Profile: ${profile.full_name} (${profile.country}) -> Status: ${res.status}`);
  }

  // 2. Upsert Date Drops
  for (const drop of DATE_DROPS) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/date_drops`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(drop)
    });
    console.log(`Date Drop: ${drop.couple_title} -> Status: ${res.status}`);
  }

  console.log('--- Supabase Remote DB Seeding Complete ---');
}

seed().catch(console.error);
