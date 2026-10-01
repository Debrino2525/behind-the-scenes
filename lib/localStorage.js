// language: javascript
// filename: lib/localStorage.js
// platform: React Native (Expo)
// purpose: Fast, robust local file persistence for BTS user profile & session

import * as FileSystem from 'expo-file-system';

const PROFILE_FILE_URI = `${FileSystem.documentDirectory}bts_user_profile.json`;

/**
 * Save user profile to persistent device storage
 */
export async function saveLocalProfile(profile) {
  try {
    const data = JSON.stringify(profile);
    await FileSystem.writeAsStringAsync(PROFILE_FILE_URI, data);
    return true;
  } catch (err) {
    console.warn('[LocalStorage] Save failed:', err?.message);
    return false;
  }
}

/**
 * Load user profile from persistent device storage
 */
export async function loadLocalProfile() {
  try {
    const info = await FileSystem.getInfoAsync(PROFILE_FILE_URI);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(PROFILE_FILE_URI);
    return JSON.parse(content);
  } catch (err) {
    console.warn('[LocalStorage] Load failed:', err?.message);
    return null;
  }
}

/**
 * Clear user profile on logout
 */
export async function clearLocalProfile() {
  try {
    const info = await FileSystem.getInfoAsync(PROFILE_FILE_URI);
    if (info.exists) {
      await FileSystem.deleteAsync(PROFILE_FILE_URI);
    }
    return true;
  } catch (err) {
    console.warn('[LocalStorage] Clear failed:', err?.message);
    return false;
  }
}
