import { Client, Account, Databases, Storage, Avatars } from 'appwrite';

/**
 * Official Appwrite Client Initialization
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
    refunds: 'refunds',
    sponsoredAds: 'sponsored_ads'
  },
  buckets: {
    photos: 'bts_photos',
    voiceNotes: 'bts_voice_notes',
    dateProof: 'bts_date_proof'
  }
};

export default client;
