/**
 * Behind The Scenes (BTS) Database Layer
 * Supabase (PostgreSQL + PostGIS + Realtime WebSockets)
 */

import { INITIAL_PROFILES, INITIAL_MATCHES } from '../data/mockProfiles';
import { INITIAL_DATE_DROPS, INITIAL_LIKES_YOU } from '../data/dateDropsData';
import { INITIAL_REPORTS, INITIAL_REFUNDS, INITIAL_SPONSORED_ADS } from '../data/adminData';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Fetch profiles from PostgreSQL via Supabase or Local Cache
 */
export async function getProfilesFromDb(filters = {}) {
  if (isSupabaseConfigured) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('[BTS DB] Remote Supabase connection failed, using local seed dataset', err);
    }
  }

  // Local persistent storage fallback
  const local = localStorage.getItem('bts_profiles');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_PROFILES;
}

/**
 * Save user swipe (Double opt-in match evaluation in PostgreSQL)
 */
export async function recordSwipeInDb({ swiperId, targetId, isLike, isSuperLike }) {
  const swipePayload = {
    swiper_id: swiperId,
    target_id: targetId,
    is_like: isLike,
    is_super_like: isSuperLike,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/swipes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(swipePayload)
      });
    } catch (err) {
      console.warn('[BTS DB] Swipe sync error', err);
    }
  }

  // Persist locally
  const currentSwipes = JSON.parse(localStorage.getItem('bts_swipes') || '[]');
  currentSwipes.push(swipePayload);
  localStorage.setItem('bts_swipes', JSON.stringify(currentSwipes));
  return true;
}

/**
 * Fetch Date Drops (Community real date posts)
 */
export async function getDateDropsFromDb() {
  if (isSupabaseConfigured) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/date_drops?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch (err) {
      console.warn('[BTS DB] Remote DateDrops fetch failed', err);
    }
  }

  const local = localStorage.getItem('bts_date_drops');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  return INITIAL_DATE_DROPS;
}

/**
 * Post a new Date Drop to the database
 */
export async function insertDateDropInDb(drop) {
  if (isSupabaseConfigured) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/date_drops`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(drop)
      });
    } catch (err) {
      console.warn('[BTS DB] DateDrop sync failed', err);
    }
  }

  const current = JSON.parse(localStorage.getItem('bts_date_drops') || JSON.stringify(INITIAL_DATE_DROPS));
  const updated = [drop, ...current];
  localStorage.setItem('bts_date_drops', JSON.stringify(updated));
  return updated;
}

/**
 * File a Safety / Catfish Report in the database
 */
export async function submitReportToDb(report) {
  if (isSupabaseConfigured) {
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
    } catch (err) {}
  }
  const current = JSON.parse(localStorage.getItem('bts_reports') || JSON.stringify(INITIAL_REPORTS));
  localStorage.setItem('bts_reports', JSON.stringify([report, ...current]));
  return true;
}
