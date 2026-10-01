export const INITIAL_SPONSORED_ADS = [
  {
    id: "ad-1",
    isSponsored: true,
    sponsorName: "AfroFuture Festival 2026",
    title: "AfroFuture Detty December Pass",
    category: "Music & Cultural Festival",
    badge: "Official Festival Partner",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80",
    description: "The biggest December celebration in Accra. 2 days of Afrobeats, Amapiano, art installations, and culinary experiences at El Wak Stadium.",
    location: "Accra, Ghana",
    dates: "Dec 28 - Dec 29",
    perk: "Special BTS Duo Discount: 15% off Couples VIP Passes",
    ctaText: "Get Festival Passes",
    ctaUrl: "https://afrofuture.com",
    active: true
  },
  {
    id: "ad-2",
    isSponsored: true,
    sponsorName: "Polo Beach Club Osu",
    title: "Sunset Highlife & Seafood Sundays",
    category: "Nightlife & Fine Dining",
    badge: "Trending Date Spot",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    description: "Oceanfront cabanas, live acoustic highlife bands, grilled lobster, and signature cocktails. The premier Sunday date experience in Accra.",
    location: "Labadi / Osu Beachfront, Accra",
    dates: "Every Sunday from 4 PM",
    perk: "Free Welcome Sobolo Cocktail with BTS Match Confirmation",
    ctaText: "Reserve a Cabana",
    ctaUrl: "https://polobeachclub.com",
    active: true
  }
];

export const INITIAL_REPORTS = [
  {
    id: "rep-101",
    reportedUser: "Marcus V.",
    reportedUserId: "usr-942",
    reportedBy: "Nana Ama (Accra)",
    reason: "Suspected Catfish / Stolen Photos",
    evidence: "Photos look like a French fashion model from Instagram. Refuses to send voice note or show BTS video.",
    status: "Pending Review",
    timestamp: "2026-10-01 08:30 GMT",
    severity: "High"
  },
  {
    id: "rep-102",
    reportedUser: "CryptoKing99",
    reportedUserId: "usr-881",
    reportedBy: "Kelebogile (Gaborone)",
    reason: "Financial Solicitation / Forex Scam",
    evidence: "Direct messaged asking to invest in a Telegram trading scheme after matching for 10 minutes.",
    status: "Pending Review",
    timestamp: "2026-10-01 07:15 GMT",
    severity: "Critical"
  },
  {
    id: "rep-103",
    reportedUser: "David K.",
    reportedUserId: "usr-710",
    reportedBy: "Priya (Port Louis)",
    reason: "Inappropriate Messages",
    evidence: "Unsolicited explicit language after matching.",
    status: "Resolved - User Warned",
    timestamp: "2026-09-30 19:40 GMT",
    severity: "Medium"
  }
];

export const INITIAL_REFUNDS = [
  {
    id: "ref-501",
    user: "Kwame Asante",
    amount: "GHS 150.00",
    channel: "MTN Mobile Money",
    phoneOrCard: "+233 24 555 0192",
    product: "BTS VIP 1-Month Passport",
    reason: "Accidental double-charge during network timeout",
    status: "Pending Approval",
    date: "2026-10-01"
  },
  {
    id: "ref-502",
    user: "Chloe Martin (London)",
    amount: "£24.99",
    channel: "Stripe / Apple Pay",
    phoneOrCard: "•••• 4242",
    product: "Detty December Super Boost Pack",
    reason: "Travel plans cancelled, requested refund within 24h",
    status: "Approved & Processed",
    date: "2026-09-30"
  }
];

export const INITIAL_SUPPORT_TICKETS = [
  {
    id: "tkt-801",
    user: "Enyonam (Accra)",
    subject: "Video verification upload stuck on 95%",
    category: "Technical Issue",
    priority: "Normal",
    status: "Open",
    lastMessage: "I tried recording my 10s liveness video on mobile Chrome and it froze."
  },
  {
    id: "tkt-802",
    user: "Tebogo (Gaborone)",
    subject: "How do I switch my base city from Gaborone to Francistown?",
    category: "Account & Profile",
    priority: "Low",
    status: "Resolved",
    lastMessage: "Resolved by updating profile settings."
  }
];
