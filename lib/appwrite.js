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
