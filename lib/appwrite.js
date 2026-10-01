// language: javascript
// filename: lib/appwrite.js
// platform: React Native (Expo)
// target: Appwrite Cloud (Frankfurt)

import { Client, Account, Databases, Storage, Avatars, OAuthProvider, ID } from 'react-native-appwrite';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

// Ensure any existing auth browser session cleans up cleanly
WebBrowser.maybeCompleteAuthSession();

/**
 * Official Appwrite Client Initialization (React Native / Expo)
 * Project: Behind The Scenes
 * Project ID: 6abe3070001255c51a32
 * Endpoint: https://fra.cloud.appwrite.io/v1
 */

export const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('6abe3070001255c51a32');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export { OAuthProvider, ID };

export const APPWRITE_CONFIG = {
  endpoint: 'https://fra.cloud.appwrite.io/v1',
  projectId: '6abe3070001255c51a32',
  databaseId: 'bts_main',
  collections: {
    profiles: 'profiles',
    matches: 'matches',
    messages: 'messages',
    dateDrops: 'date_drops',
    reports: 'reports',
    refunds: 'refunds'
  }
};

/**
 * Mobile Google OAuth using Expo WebBrowser & Appwrite OAuth Token
 * Handles active session collisions seamlessly
 */
export async function appwriteLoginWithGoogleMobile() {
  try {
    // 1. If user already has an active session on device, reuse it directly
    try {
      const existingUser = await account.get();
      if (existingUser && existingUser.$id) {
        return existingUser;
      }
    } catch (checkErr) {
      // No active session, proceed to authenticate
    }

    const redirectUrl = Linking.createURL('oauth');
    const tokenUrl = account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUrl,
      redirectUrl
    );

    const result = await WebBrowser.openAuthSessionAsync(tokenUrl.toString(), redirectUrl);
    if (result.type === 'success' && result.url) {
      const parsed = Linking.parse(result.url);
      const userId = parsed.queryParams?.userId;
      const secret = parsed.queryParams?.secret;

      if (userId && secret) {
        // Clear any previous/stale session to avoid collision
        try {
          await account.deleteSession('current');
        } catch (delErr) {
          // No active session to delete
        }

        await account.createSession(userId, secret);
        return await account.get();
      }
    }
    return null;
  } catch (err) {
    // If Appwrite throws "Creation of a session is prohibited when a session is active"
    if (err?.message?.includes('prohibited when a session is active') || err?.code === 400 || err?.code === 401) {
      try {
        const currentUser = await account.get();
        if (currentUser) return currentUser;
      } catch (e) {
        // Session query failed, try purge and re-login
        try {
          await account.deleteSession('current');
        } catch (pErr) {}
      }
    }
    console.warn('[Appwrite Mobile OAuth]', err?.message || err);
    throw err;
  }
}

/**
 * Send 6-Digit Email Authentication Code (Appwrite Email Token)
 * Dispatches code directly to user inbox
 */
export async function appwriteSendEmailOtp(email) {
  try {
    const userId = ID.unique();
    const token = await account.createEmailToken(userId, email.trim().toLowerCase());
    return { userId: token.userId, email: email.trim().toLowerCase() };
  } catch (err) {
    console.error('[Appwrite Email OTP]', err);
    throw err;
  }
}

/**
 * Verify 6-Digit Email Code and Create Active Appwrite Session
 */
export async function appwriteVerifyEmailOtp(userId, secretCode) {
  try {
    // Delete any stale session first
    try {
      await account.deleteSession('current');
    } catch (e) {}

    await account.createSession(userId, secretCode.trim());
    return await account.get();
  } catch (err) {
    console.error('[Appwrite Verify OTP]', err);
    throw err;
  }
}

/**
 * Register account with Email & Password
 */
export async function appwriteRegisterEmailPassword(email, password, name) {
  try {
    const userId = ID.unique();
    // 1. Create account
    await account.create(userId, email.trim().toLowerCase(), password, name.trim());
    // 2. Clear stale session
    try {
      await account.deleteSession('current');
    } catch (e) {}
    // 3. Log in with session
    await account.createEmailPasswordSession(email.trim().toLowerCase(), password);
    return await account.get();
  } catch (err) {
    // If account already exists, sign in directly
    if (err?.message?.includes('already exists') || err?.code === 409) {
      try {
        await account.deleteSession('current');
      } catch (e) {}
      await account.createEmailPasswordSession(email.trim().toLowerCase(), password);
      return await account.get();
    }
    throw err;
  }
}

/**
 * Login with Email & Password
 */
export async function appwriteLoginEmailPassword(email, password) {
  try {
    try {
      await account.deleteSession('current');
    } catch (e) {}
    await account.createEmailPasswordSession(email.trim().toLowerCase(), password);
    return await account.get();
  } catch (err) {
    console.error('[Appwrite Login Email/Password]', err);
    throw err;
  }
}

/**
 * Save or Update User Profile in Appwrite Database (bts_main.profiles)
 */
export async function appwriteSaveUserProfile(userId, profile) {
  try {
    const payload = {
      name: profile.name || '',
      age: profile.age ? parseInt(profile.age, 10) : 25,
      country: profile.country || 'Ghana',
      countryFlag: profile.countryFlag || '🇬🇭',
      currentCity: profile.currentCity || '',
      homeTown: profile.homeTown || '',
      tribe: profile.tribe || '',
      intent: profile.intent || 'Long-term leading to marriage',
      btsCaption: profile.btsCaption || '',
      btsHabit: profile.btsHabit || '',
      verified: !!profile.verified,
      photo: profile.photo || '',
      photos: Array.isArray(profile.photos) ? JSON.stringify(profile.photos) : '[]',
      voiceNoteTitle: profile.voiceNoteTitle || '',
      voiceNoteDuration: profile.voiceNoteDuration || '',
      voiceNoteTranscript: profile.voiceNoteTranscript || '',
      voiceNoteUrl: profile.voiceNoteUrl || ''
    };

    try {
      // Try updating existing document
      return await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        userId,
        payload
      );
    } catch (updateErr) {
      // If document doesn't exist, create it
      return await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        userId,
        payload
      );
    }
  } catch (err) {
    console.warn('[Appwrite Save Profile]', err?.message);
    return null;
  }
}

/**
 * Fetch User Profile from Appwrite Database (bts_main.profiles)
 */
export async function appwriteGetUserProfile(userId) {
  try {
    const doc = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      userId
    );
    if (!doc) return null;
    let photos = [];
    try {
      photos = typeof doc.photos === 'string' ? JSON.parse(doc.photos) : (doc.photos || []);
    } catch (e) {
      photos = [doc.photo];
    }
    return {
      ...doc,
      photos: photos.length > 0 ? photos : [doc.photo]
    };
  } catch (err) {
    return null;
  }
}

/**
 * Upload Photo to Appwrite Storage Bucket (bts_photos)
 */
export async function appwriteUploadPhoto(fileUri, filename = 'photo.jpg') {
  try {
    const file = {
      name: filename,
      type: 'image/jpeg',
      size: 1000,
      uri: fileUri
    };
    const response = await storage.createFile('bts_photos', ID.unique(), file);
    return `${APPWRITE_CONFIG.endpoint}/storage/buckets/bts_photos/files/${response.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
  } catch (err) {
    console.warn('[Appwrite Upload Photo]', err?.message);
    return fileUri;
  }
}

/**
 * Upload Voice Note to Appwrite Storage Bucket
 */
export async function appwriteUploadVoiceNote(fileUri, filename = 'voicenote.m4a') {
  try {
    const file = {
      name: filename,
      type: 'audio/m4a',
      size: 1000,
      uri: fileUri
    };
    const response = await storage.createFile('bts_photos', ID.unique(), file);
    return `${APPWRITE_CONFIG.endpoint}/storage/buckets/bts_photos/files/${response.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
  } catch (err) {
    console.warn('[Appwrite Upload Voice Note]', err?.message);
    return fileUri;
  }
}

/**
 * Retrieve currently logged-in user in mobile
 */
export async function appwriteGetCurrentUserMobile() {
  try {
    return await account.get();
  } catch (err) {
    return null;
  }
}

/**
 * Logout mobile session
 */
export async function appwriteLogoutMobile() {
  try {
    await account.deleteSession('current');
  } catch (err) {
    console.info('[Appwrite Mobile Logout]', err?.message);
  }
}

export default client;

