// shared data — identical to web version
// language: javascript
// filename: data/mockProfiles.js
// platform: React Native (Expo)

export const INITIAL_PROFILES = [
  {
    id: "gh-1",
    name: "Nana Ama",
    age: 27,
    occupation: "Architect & Interior Designer",
    currentCity: "Accra (Airport Residential)",
    homeTown: "Kumasi",
    tribe: "Asante",
    languages: ["English", "Twi"],
    intent: "Long-term leading to marriage",
    dettyDecemberReady: true,
    verified: true,
    country: "Ghana",
    countryFlag: "🇬🇭",
    mainPhotos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80"
    ],
    behindTheScenes: {
      caption: "Behind the scenes: Making Sunday Omotuo with groundnut soup while arguing over Premier League.",
      thumbnail: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=80",
      locationTag: "Mom's kitchen, Kumasi",
      realLifeHabit: "I listen to Kojo Antwi and Daddy Lumba on repeat every single Sunday morning."
    },
    voiceNote: {
      duration: "0:14",
      title: "My actual voice: Roast me if you dare",
      transcript: "Charlie, if you can't handle high energy on a Friday night at Bloom Bar or quiet beach walks in Kokrobite, we won't survive two days!",
    },
    culturalPrompts: [
      { question: "Best Jollof in West Africa?", answer: "Ghana jollof, smoked basmati, no debate." },
      { question: "My perfect Sunday in Ghana:", answer: "Early church, waakye from Auntie Muni, deep nap, and highlife tunes with breeze." }
    ]
  },
  {
    id: "gh-2",
    name: "Kweku Boateng",
    age: 29,
    occupation: "Software Engineer (Fintech)",
    currentCity: "London (Canary Wharf)",
    homeTown: "Mampong / Kumasi",
    tribe: "Asante",
    languages: ["English", "Twi", "French"],
    intent: "Serious relationship",
    dettyDecemberReady: true,
    verified: true,
    country: "Ghana",
    countryFlag: "🇬🇭",
    mainPhotos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80"
    ],
    behindTheScenes: {
      caption: "Behind the scenes: 2 AM coding debug session with shito on plantain chips.",
      thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
      locationTag: "London Flat",
      realLifeHabit: "I will find a Ghanaian restaurant in literally any city on earth within 30 minutes of landing."
    },
    voiceNote: {
      duration: "0:18",
      title: "The diaspora dilemma",
      transcript: "Look, London winter is not it. Counting down the weeks until December landing at Kotoka.",
    },
    culturalPrompts: [
      { question: "Dealbreaker:", answer: "If you don't like kelewele hot with roasted groundnuts on a rainy night." },
      { question: "Two truths and a lie:", answer: "I can pound fufu with rhythm, I negotiated down art at Arts Centre, and I've never had indomie at midnight." }
    ]
  },
  {
    id: "mu-1",
    name: "Priya Doorgakant",
    age: 26,
    occupation: "Marine Biologist & Coral Reef Researcher",
    currentCity: "Port Louis",
    homeTown: "Flic en Flac",
    tribe: "Indo-Mauritian",
    languages: ["English", "French", "Kreol Morisien", "Hindi"],
    intent: "Serious relationship",
    dettyDecemberReady: false,
    verified: true,
    country: "Mauritius",
    countryFlag: "🇲🇺",
    mainPhotos: [
      "https://images.unsplash.com/photo-1616766098956-c81f12114571?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80"
    ],
    behindTheScenes: {
      caption: "Behind the scenes: Tagging sea turtles at sunrise before the tourists wake up.",
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
      locationTag: "Blue Bay Marine Park",
      realLifeHabit: "I eat dholl puri with chutneys for breakfast almost every morning."
    },
    voiceNote: {
      duration: "0:16",
      title: "Island calm energy",
      transcript: "If you cannot handle sandy feet, salty hair, and impromptu beach picnics at sunset, we will not last a week!",
    },
    culturalPrompts: [
      { question: "Perfect weekend:", answer: "Morning dive at Trou aux Biches, roti chaud roadside, Sega dancing at Grand Baie by night." },
      { question: "Dealbreaker:", answer: "If you have never tasted gateau piment, I am personally fixing that on our first date." }
    ]
  },
  {
    id: "bw-1",
    name: "Kelebogile (Kele)",
    age: 28,
    occupation: "Wildlife Conservationist & Safari Guide",
    currentCity: "Gaborone",
    homeTown: "Maun",
    tribe: "Tswana",
    languages: ["Setswana", "English"],
    intent: "Long-term leading to marriage",
    dettyDecemberReady: false,
    verified: true,
    country: "Botswana",
    countryFlag: "🇧🇼",
    mainPhotos: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
    ],
    behindTheScenes: {
      caption: "Behind the scenes: Tracking elephants at dawn in the Okavango Delta.",
      thumbnail: "https://images.unsplash.com/photo-1516426122078-c23e76b4f3e7?auto=format&fit=crop&w=900&q=80",
      locationTag: "Okavango Delta, Maun",
      realLifeHabit: "I wake up at 4:30 AM for bush drives and fall asleep by 9 PM. Unapologetically."
    },
    voiceNote: {
      duration: "0:18",
      title: "Delta girl energy",
      transcript: "Dumela! If you think Gaborone nightlife is the whole of Botswana, let me take you to Maun.",
    },
    culturalPrompts: [
      { question: "My proudest flex:", answer: "Tracked the Big Five on foot and make the best seswaa with pap." },
      { question: "Date night idea:", answer: "Sundowner cruise on the Chobe River, watching hippos, sipping amarula on ice." }
    ]
  },
  {
    id: "na-1",
    name: "Uakondjisa (Uja)",
    age: 27,
    occupation: "Photographer & Cultural Tourism Guide",
    currentCity: "Windhoek",
    homeTown: "Swakopmund",
    tribe: "Herero",
    languages: ["Otjiherero", "English", "Afrikaans", "German"],
    intent: "Dating to explore & vibe",
    dettyDecemberReady: false,
    verified: true,
    country: "Namibia",
    countryFlag: "🇳🇦",
    mainPhotos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80"
    ],
    behindTheScenes: {
      caption: "Behind the scenes: Golden hour at Deadvlei with 900-year-old camel thorn trees.",
      thumbnail: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80",
      locationTag: "Sossusvlei, Namib Desert",
      realLifeHabit: "I wear my ohorokova dress every Sunday to church. Heritage is daily life."
    },
    voiceNote: {
      duration: "0:13",
      title: "Desert soul",
      transcript: "Come eat Kapana with me at the open market!",
    },
    culturalPrompts: [
      { question: "I won't shut up about:", answer: "Namibian sunsets, Kapana street meat with chili salt, and the Namib Desert." },
      { question: "Perfect date:", answer: "Drive to Spitzkoppe, camp under the Milky Way, braai boerewors, talk until sunrise." }
    ]
  },
  {
    id: "ma-1",
    name: "Amina El Fassi",
    age: 25,
    occupation: "Fashion Designer & Zellige Artisan",
    currentCity: "Marrakech (Gueliz)",
    homeTown: "Fès",
    tribe: "Amazigh (Berber)",
    languages: ["Darija", "Arabic", "French", "English", "Tamazight"],
    intent: "Long-term / Open to marriage",
    dettyDecemberReady: false,
    verified: true,
    country: "Morocco",
    countryFlag: "🇲🇦",
    mainPhotos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
    ],
    behindTheScenes: {
      caption: "Behind the scenes: Hand-cutting zellige tiles while mint tea gets cold for the third time.",
      thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=900&q=80",
      locationTag: "Fès Medina Workshop",
      realLifeHabit: "Six glasses of mint tea a day minimum."
    },
    voiceNote: {
      duration: "0:15",
      title: "Medina energy",
      transcript: "Come get lost in the medina with me, I promise I know the way out... mostly.",
    },
    culturalPrompts: [
      { question: "Dealbreaker:", answer: "If you think couscous is just a side dish and not a sacred Friday family tradition." },
      { question: "My perfect Friday:", answer: "Family couscous lunch, afternoon in the souk, rooftop with Atlas Mountain views and Gnawa music." }
    ]
  }
];

export const INITIAL_MATCHES = [
  {
    id: "gh-1",
    name: "Nana Ama",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    lastMessage: "Chale you know you're owing me a Kelewele date right? 🌶️",
    time: "10m ago",
    unread: true,
    online: true,
    hometown: "Kumasi",
    currentCity: "Accra",
    country: "Ghana"
  },
  {
    id: "mu-1",
    name: "Priya",
    photo: "https://images.unsplash.com/photo-1616766098956-c81f12114571?auto=format&fit=crop&w=300&q=80",
    lastMessage: "Have you ever tried dholl puri? Making some this weekend!",
    time: "1h ago",
    unread: true,
    online: true,
    hometown: "Flic en Flac",
    currentCity: "Port Louis",
    country: "Mauritius"
  }
];

export const INITIAL_DATE_DROPS = [
  {
    id: "drop-1",
    couple: "Nana Ama & Kweku",
    matchTag: "Matched on BTS • 3 weeks ago",
    photo: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    venue: "Buka Restaurant, Osu (Accra)",
    caption: "He promised authentic waakye with all the works if I agreed to meet in Osu... and charlie he delivered! 10/10 date vibes! 🇬🇭✨",
    vibeRating: "⭐⭐⭐⭐⭐ Pure Chemistry",
    likesCount: 142,
    cheersCount: 38,
    commentsCount: 19,
    timestamp: "Yesterday at 9:45 PM"
  },
  {
    id: "drop-2",
    couple: "Priya & Yannick",
    matchTag: "Matched on BTS • 1 month ago",
    photo: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    venue: "Le Morne Beach Sunset, Mauritius",
    caption: "First official date outside our research labs: Roti chaud roadside, acoustic guitar, and unreal sunset. He dances Sega! 🇲🇺🌊",
    vibeRating: "⭐⭐⭐⭐⭐ Magical Energy",
    likesCount: 218,
    cheersCount: 64,
    commentsCount: 27,
    timestamp: "2 days ago"
  }
];

export const INITIAL_LIKES_YOU = [
  {
    id: "like-1",
    name: "Ama Pokua",
    age: 26,
    city: "Accra",
    hometown: "Kumasi",
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    time: "20m ago",
    superLike: true,
    btsUnlocked: true,
    note: "Liked your Behind The Scenes kitchen video!"
  },
  {
    id: "like-2",
    name: "Farah Cherkaoui",
    age: 28,
    city: "Casablanca",
    hometown: "Marrakech",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    time: "2h ago",
    superLike: false,
    btsUnlocked: false,
    note: "Liked your music playlist prompt"
  }
];

