// language: javascript
// filename: lib/supabase.js
// platform: React Native (Expo)
// target: Supabase Cloud Database

import { INITIAL_PROFILES } from '../data/mockProfiles';

export const SUPABASE_URL = 'https://mbeuauxvofhnwigpzmdl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZXVhdXh2b2ZobndpZ3B6bWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjY2OTgsImV4cCI6MjEwNjQ0MjY5OH0.ExE7r4PTcw4_b25fwlU4z84P3nlxU6UBXk5KmqT43FY';

/**
 * Fetch profiles from Supabase PostgreSQL table
 */
export async function getProfilesFromDb(filters = {}) {
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
 * Record a swipe (Like, Pass, SuperLike) in Supabase
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
 * Fetch Date Drops from Supabase
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
 * Submit report to Supabase
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
