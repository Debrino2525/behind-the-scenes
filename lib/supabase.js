// language: javascript
// filename: lib/supabase.js
// platform: React Native (Expo)
// target: Supabase Cloud Database

import { INITIAL_PROFILES } from '../data/mockProfiles';

export const SUPABASE_URL = 'https://mbeuauxvofhnwigpzmdl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZXVhdXh2b2ZobndpZ3B6bWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjY2OTgsImV4cCI6MjEwNjQ0MjY5OH0.ExE7r4PTcw4_b25fwlU4z84P3nlxU6UBXk5KmqT43FY';

/**
 * 1. DISCOVER FEED — Fetch profiles from Supabase PostgreSQL table
 */
export async function getProfilesFromDb() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Supabase DB] Failed to fetch profiles:', err?.message);
  }
  return INITIAL_PROFILES;
}

/**
 * 2. LIKES YOU & SWIPES — Record a swipe (Like, Pass, SuperLike) in Supabase
 */
export async function recordSwipeInDb({ swiperId, targetId, isLike, isSuperLike }) {
  try {
    const payload = {
      swiper_id: swiperId,
      target_id: targetId,
      is_like: isLike,
      is_super_like: isSuperLike || false,
      created_at: new Date().toISOString()
    };
    await fetch(`${SUPABASE_URL}/rest/v1/swipes`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('[Supabase DB] Swipe sync error:', err?.message);
    return false;
  }
}

/**
 * 2. LIKES YOU — Query inbound likes for a user
 */
export async function getInboundLikesFromDb(userId) {
  try {
    if (!userId) return [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/swipes?target_id=eq.${userId}&is_like=eq.true&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[Supabase DB] Inbound likes query error:', err?.message);
  }
  return [];
}

/**
 * 3. DATE DROPS — Fetch community date drops from Supabase
 */
export async function getDateDropsFromDb() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/date_drops?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('[Supabase DB] DateDrops fetch error:', err?.message);
  }
  return [];
}

/**
 * 3. DATE DROPS — Insert a new date drop into Supabase
 */
export async function insertDateDropInDb(drop) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/date_drops`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(drop)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Supabase DB] Insert DateDrop error:', err?.message);
  }
  return null;
}

/**
 * 4. MATCHES — Fetch active user matches from Supabase
 */
export async function getMatchesFromDb(userId) {
  try {
    if (!userId) return [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/matches?or=(user1_id.eq.${userId},user2_id.eq.${userId})&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[Supabase DB] Matches fetch error:', err?.message);
  }
  return [];
}

/**
 * 4. MATCHES — Create a confirmed match in Supabase
 */
export async function createMatchInDb(user1Id, user2Id) {
  try {
    const payload = {
      user1_id: user1Id,
      user2_id: user2Id,
      bts_unlocked: true,
      created_at: new Date().toISOString()
    };
    await fetch(`${SUPABASE_URL}/rest/v1/matches`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('[Supabase DB] Create match error:', err?.message);
    return false;
  }
}

/**
 * 4. CHAT — Fetch messages for a match
 */
export async function getMessagesFromDb(matchId) {
  try {
    if (!matchId) return [];
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages?match_id=eq.${matchId}&order=created_at.asc&select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[Supabase DB] Messages fetch error:', err?.message);
  }
  return [];
}

/**
 * 4. CHAT — Send a message (text or voice note) in Supabase
 */
export async function sendMessageToDb({ matchId, senderId, content, audioUrl, isMomoGift, momoAmount }) {
  try {
    const payload = {
      match_id: matchId,
      sender_id: senderId,
      content: content || '',
      audio_url: audioUrl || null,
      is_momo_gift: Boolean(isMomoGift),
      momo_amount: momoAmount || null,
      read: false,
      created_at: new Date().toISOString()
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Supabase DB] Send message error:', err?.message);
  }
  return null;
}

/**
 * 5. SAFETY & CATFISH REPORTS — Submit report to Supabase
 */
export async function submitReportToDb(report) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    });
    return true;
  } catch (err) {
    console.warn('[Supabase DB] Report submission error:', err?.message);
    return false;
  }
}
