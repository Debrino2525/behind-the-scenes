// language: javascript
// filename: lib/supabaseAuth.js
// platform: React Native (Expo)
// target: Supabase Cloud (PostgreSQL + Auth + Storage)

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export const SUPABASE_URL = 'https://mbeuauxvofhnwigpzmdl.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZXVhdXh2b2ZobndpZ3B6bWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjY2OTgsImV4cCI6MjEwNjQ0MjY5OH0.ExE7r4PTcw4_b25fwlU4z84P3nlxU6UBXk5KmqT43FY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
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

    let gender = data.gender;
    if (!gender && data.bts_type && data.bts_type.includes('gender:')) {
      gender = data.bts_type.split('gender:')[1].split('|')[0].trim();
    }
    if (!gender) gender = 'male';

    return {
      id: data.id,
      name: data.full_name || data.name || '',
      age: data.age || 25,
      gender: gender,
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
      interestedInGender: data.interested_in_gender || (gender === 'male' ? 'female' : 'male'),
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

    let { data, error } = await supabase
      .from('profiles')
      .upsert(payload)
      .select()
      .maybeSingle();

    if (error && error.message?.includes('gender')) {
      const fallbackPayload = { ...payload };
      delete fallbackPayload.gender;
      delete fallbackPayload.interested_in_gender;
      delete fallbackPayload.preferred_min_age;
      delete fallbackPayload.preferred_max_age;
      fallbackPayload.bts_type = `gender:${profile.gender || 'male'}`;
      const res = await supabase.from('profiles').upsert(fallbackPayload).select().maybeSingle();
      data = res.data;
      error = res.error;
    }

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
 * Send OTP (6-Digit Code)
 */
export async function supabaseSendOtp(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const { error } = await supabase.auth.signInWithOtp({
    email: cleanEmail,
    options: {
      shouldCreateUser: true
    }
  });
  if (error) throw error;
  return true;
}

/**
 * Verify Email OTP code (supports email, signup, and magiclink token types)
 */
export async function supabaseVerifyOtp(email, token) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanToken = String(token || '').trim().replace(/[^a-zA-Z0-9]/g, '');

  console.log('[Supabase] Verifying OTP code for:', cleanEmail, 'Token length:', cleanToken.length);

  // 1. Primary: type 'email' (standard for signInWithOtp in Supabase v2)
  const res1 = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'email'
  });
  if (res1.data?.user) return res1.data.user;

  // 2. Fallback: type 'signup' (if user was newly created in auth.users)
  const res2 = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'signup'
  });
  if (res2.data?.user) return res2.data.user;

  // 3. Fallback: type 'magiclink'
  const res3 = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanToken,
    type: 'magiclink'
  });
  if (res3.data?.user) return res3.data.user;

  // If all failed, throw the primary error
  if (res1.error) throw res1.error;
  if (res2.error) throw res2.error;
  if (res3.error) throw res3.error;
  throw new Error('Invalid or expired code. Please re-enter or request a fresh code.');
}

/**
 * Google OAuth Sign In for Mobile using WebBrowser & Linking
 */
export async function supabaseLoginWithGoogleMobile() {
  try {
    // Deep link that opens THIS APP (btsapp://auth-callback in a built app,
    // exp://...--/auth-callback in Expo Go). Must be allowed in
    // Supabase -> Authentication -> URL Configuration -> Redirect URLs.
    const redirectUrl = Linking.createURL('auth-callback');
    console.log('[Google Auth] redirectTo =', redirectUrl);

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
      console.log('[Google Auth Return URL]:', result.url);
      const parsed = Linking.parse(result.url);
      const code = parsed.queryParams?.code;

      if (code) {
        const { data: sessionData, error: sessionErr } = await supabase.auth.exchangeCodeForSession(String(code));
        if (sessionErr) throw sessionErr;
        if (sessionData?.user) return sessionData.user;
      }

      let accessToken = parsed.queryParams?.access_token;
      let refreshToken = parsed.queryParams?.refresh_token;

      if (!accessToken && result.url.includes('#')) {
        const hash = result.url.split('#')[1];
        const params = new URLSearchParams(hash);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
      }

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
          access_token: String(accessToken),
          refresh_token: String(refreshToken)
        });
        if (sessionErr) throw sessionErr;
        if (sessionData?.user) return sessionData.user;
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
 * Facebook OAuth Sign In for Mobile using WebBrowser & Linking
 */
export async function supabaseLoginWithFacebookMobile() {
  try {
    const redirectUrl = Linking.createURL('auth-callback');
    console.log('[Facebook Auth] redirectTo =', redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectUrl,
        scopes: 'email,public_profile',
        skipBrowserRedirect: true
      }
    });

    if (error) throw error;
    if (!data?.url) return null;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === 'success' && result.url) {
      console.log('[Facebook Auth Return URL]:', result.url);
      const parsed = Linking.parse(result.url);
      const code = parsed.queryParams?.code;

      if (code) {
        const { data: sessionData, error: sessionErr } = await supabase.auth.exchangeCodeForSession(String(code));
        if (sessionErr) throw sessionErr;
        if (sessionData?.user) return sessionData.user;
      }

      let accessToken = parsed.queryParams?.access_token;
      let refreshToken = parsed.queryParams?.refresh_token;

      if (!accessToken && result.url.includes('#')) {
        const hash = result.url.split('#')[1];
        const params = new URLSearchParams(hash);
        accessToken = params.get('access_token');
        refreshToken = params.get('refresh_token');
      }

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
          access_token: String(accessToken),
          refresh_token: String(refreshToken)
        });
        if (sessionErr) throw sessionErr;
        if (sessionData?.user) return sessionData.user;
      }

      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }

    return null;
  } catch (err) {
    console.warn('[Supabase Facebook Auth Error]', err);
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
    if (!fileUri || fileUri.startsWith('http://') || fileUri.startsWith('https://')) return fileUri;
    const fileName = `photo_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

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
    if (!fileUri || fileUri.startsWith('http://') || fileUri.startsWith('https://')) return fileUri;
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
      .from('bts_voice_notes')
      .upload(fileName, byteArray, {
        contentType: 'audio/m4a',
        upsert: true
      });

    if (error) {
      console.warn('[Supabase Storage] Voice upload failed, using local URI:', error?.message);
      return fileUri;
    }

    const { data: pubData } = supabase.storage
      .from('bts_voice_notes')
      .getPublicUrl(data.path);

    return pubData?.publicUrl || fileUri;
  } catch (err) {
    console.warn('[Supabase Storage] Voice upload exception, using local URI:', err?.message);
    return fileUri;
  }
}