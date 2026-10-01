// language: javascript
// filename: lib/supabaseAuth.js
// platform: React Native (Expo)
// target: Supabase Cloud (PostgreSQL + Auth + Storage)

import { createClient } from '@supabase/supabase-js';
import * as FileSystem from 'expo-file-system';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export const SUPABASE_URL = 'https://mbeuauxvofhnwigpzmdl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZXVhdXh2b2ZobndpZ3B6bWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjY2OTgsImV4cCI6MjEwNjQ0MjY5OH0.ExE7r4PTcw4_b25fwlU4z84P3nlxU6UBXk5KmqT43FY';

const AUTH_STORAGE_PATH = `${FileSystem.documentDirectory}bts_supabase_session.json`;

// Custom Expo FileSystem storage adapter for Supabase session persistence
const ExpoStorageAdapter = {
  getItem: async (key) => {
    try {
      const file = `${FileSystem.documentDirectory}sp_${key}.json`;
      const info = await FileSystem.getInfoAsync(file);
      if (!info.exists) return null;
      return await FileSystem.readAsStringAsync(file);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      const file = `${FileSystem.documentDirectory}sp_${key}.json`;
      await FileSystem.writeAsStringAsync(file, value);
    } catch (e) {
      console.warn('[Supabase Storage setItem error]', e);
    }
  },
  removeItem: async (key) => {
    try {
      const file = `${FileSystem.documentDirectory}sp_${key}.json`;
      const info = await FileSystem.getInfoAsync(file);
      if (info.exists) {
        await FileSystem.deleteAsync(file);
      }
    } catch (e) {
      console.warn('[Supabase Storage removeItem error]', e);
    }
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

/**
 * Get the currently authenticated user
 */
export async function supabaseGetCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (err) {
    console.warn('[Supabase] getUser error:', err?.message);
    return null;
  }
}

/**
 * Get profile record for a user
 */
export async function supabaseGetProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] getProfile error:', error?.message);
      return null;
    }
    if (!data) return null;

    return {
      id: data.id,
      name: data.full_name || data.name || '',
      age: data.age || 25,
      gender: data.gender || 'male',
      country: data.country || 'Ghana',
      countryFlag: data.country_flag || data.countryFlag || '🇬🇭',
      currentCity: data.current_city || data.currentCity || '',
      homeTown: data.home_town || data.homeTown || '',
      tribe: data.tribe || '',
      intent: data.intent || 'Serious relationship',
      verified: Boolean(data.verified || data.liveness_verified),
      photos: Array.isArray(data.photos) ? data.photos : [],
      photo: (data.photos && data.photos[0]) || '',
      btsCaption: data.bts_caption || data.btsCaption || '',
      btsHabit: data.bts_habit || data.btsHabit || '',
      voiceNoteUrl: data.voice_note_url || data.voiceNoteUrl || null,
      voiceNoteDuration: data.voice_note_duration || data.voiceNoteDuration || null,
      voiceNoteTranscript: data.voice_note_transcript || data.voiceNoteTranscript || null,
      interestedInGender: data.interested_in_gender || (data.gender === 'male' ? 'female' : 'male'),
      preferredMinAge: data.preferred_min_age || 18,
      preferredMaxAge: data.preferred_max_age || 55
    };
  } catch (err) {
    console.warn('[Supabase] getProfile exception:', err?.message);
    return null;
  }
}

/**
 * Save / Upsert user profile record
 */
export async function supabaseSaveProfile(userId, profile) {
  try {
    const payload = {
      id: userId,
      full_name: profile.name || profile.full_name || '',
      age: parseInt(profile.age, 10) || 18,
      country: profile.country || 'Ghana',
      country_flag: profile.countryFlag || profile.country_flag || '🇬🇭',
      current_city: profile.currentCity || profile.current_city || '',
      home_town: profile.homeTown || profile.home_town || '',
      tribe: profile.tribe || '',
      intent: profile.intent || 'Serious relationship',
      verified: Boolean(profile.verified),
      photos: Array.isArray(profile.photos) ? profile.photos : (profile.photo ? [profile.photo] : []),
      bts_caption: profile.btsCaption || profile.bts_caption || '',
      bts_habit: profile.btsHabit || profile.bts_habit || '',
      voice_note_url: profile.voiceNoteUrl || profile.voice_note_url || null,
      voice_note_duration: profile.voiceNoteDuration || profile.voice_note_duration || null,
      voice_note_transcript: profile.voiceNoteTranscript || profile.voice_note_transcript || null,
      gender: profile.gender || 'male',
      interested_in_gender: profile.interestedInGender || profile.interested_in_gender || (profile.gender === 'male' ? 'female' : 'male'),
      preferred_min_age: parseInt(profile.preferredMinAge, 10) || 18,
      preferred_max_age: parseInt(profile.preferredMaxAge, 10) || 55,
      updated_at: new Date().toISOString()
    };

    if (profile.email) {
      payload.email = profile.email;
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] saveProfile error:', error?.message);
      return false;
    }
    return data || true;
  } catch (err) {
    console.warn('[Supabase] saveProfile exception:', err?.message);
    return false;
  }
}

/**
 * Email & Password Sign In
 */
export async function supabaseLoginWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });
  if (error) throw error;
  return data.user;
}

/**
 * Email & Password Sign Up
 */
export async function supabaseSignUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password
  });
  if (error) throw error;
  return data.user;
}

/**
 * Send OTP (Magic Link / Code)
 */
export async function supabaseSendOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: true
    }
  });
  if (error) throw error;
  return true;
}

/**
 * Verify Email OTP code
 */
export async function supabaseVerifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'email'
  });
  if (error) throw error;
  return data.user;
}

/**
 * Google OAuth Sign In for Mobile using WebBrowser & Linking
 */
export async function supabaseLoginWithGoogleMobile() {
  try {
    const redirectUrl = Linking.createURL('auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true
      }
    });

    if (error) throw error;
    if (!data?.url) return null;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success' && result.url) {
      // Parse tokens from URL hash or query params
      const parsed = Linking.parse(result.url);
      let accessToken = parsed.queryParams?.access_token;
      let refreshToken = parsed.queryParams?.refresh_token;

      // Also check hash fragment if tokens were passed in anchor
      if (!accessToken && result.url.includes('#')) {
        const hash = result.url.split('#')[1];
        const params = new URLSearchParams(hash);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
      }

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
      }

      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }

    return null;
  } catch (err) {
    console.warn('[Supabase Google Auth Error]', err);
    throw err;
  }
}

/**
 * Sign Out
 */
export async function supabaseSignOut() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('[Supabase] signOut error:', err?.message);
  }
}

/**
 * Upload Photo (returns public URL or local URI fallback)
 */
export async function supabaseUploadPhoto(fileUri) {
  try {
    if (!fileUri) return null;
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64
    });

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const { data, error } = await supabase.storage
      .from('bts_photos')
      .upload(fileName, byteArray, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.warn('[Supabase Storage] Photo upload failed, using local URI:', error?.message);
      return fileUri;
    }

    const { data: pubData } = supabase.storage
      .from('bts_photos')
      .getPublicUrl(data.path);

    return pubData?.publicUrl || fileUri;
  } catch (err) {
    console.warn('[Supabase Storage] Photo upload exception, using local URI:', err?.message);
    return fileUri;
  }
}

/**
 * Upload Voice Note (returns public URL or local URI fallback)
 */
export async function supabaseUploadVoiceNote(fileUri) {
  try {
    if (!fileUri) return null;
    const fileName = `voice_${Date.now()}_${Math.random().toString(36).substring(7)}.m4a`;
    
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64
    });

    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const { data, error } = await supabase.storage
      .from('bts_audio')
      .upload(fileName, byteArray, {
        contentType: 'audio/m4a',
        upsert: true
      });

    if (error) {
      console.warn('[Supabase Storage] Voice upload failed, using local URI:', error?.message);
      return fileUri;
    }

    const { data: pubData } = supabase.storage
      .from('bts_audio')
      .getPublicUrl(data.path);

    return pubData?.publicUrl || fileUri;
  } catch (err) {
    console.warn('[Supabase Storage] Voice upload exception, using local URI:', err?.message);
    return fileUri;
  }
}
