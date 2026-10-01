// language: javascript
// filename: lib/appwrite.js
// platform: React Native (Expo)
// target: Appwrite Cloud (Frankfurt)

import { Client, Account, Databases, Storage, Avatars, OAuthProvider } from 'react-native-appwrite';
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
export { OAuthProvider };

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
 */
export async function appwriteLoginWithGoogleMobile() {
  try {
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
        await account.createSession(userId, secret);
        return await account.get();
      }
    }
    return null;
  } catch (err) {
    console.warn('[Appwrite Mobile OAuth]', err?.message || err);
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

export default client;
