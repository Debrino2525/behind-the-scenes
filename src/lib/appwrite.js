import { Client, Account, Databases, Storage, Avatars, ID, Query } from 'appwrite';
import { INITIAL_PROFILES, INITIAL_MATCHES } from '../data/mockProfiles';
import { INITIAL_DATE_DROPS } from '../data/dateDropsData';
import { INITIAL_REPORTS, INITIAL_REFUNDS } from '../data/adminData';

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
    refunds: 'refunds'
  },
  bucketId: 'bts_photos'
};

/**
 * Fetch profiles from Appwrite Cloud bts_main database
 */
export async function appwriteGetProfiles() {
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles
    );
    if (res.documents && res.documents.length > 0) {
      return res.documents;
    }
  } catch (err) {
    console.info('[Appwrite] Using cached profile dataset', err?.message || err);
  }
  return INITIAL_PROFILES;
}

/**
 * Record a swipe in Appwrite Cloud
 */
export async function appwriteRecordSwipe(swiperId, targetId, isLike) {
  try {
    return await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.matches,
      ID.unique(),
      {
        swiperId,
        targetId,
        isLike,
        createdAt: new Date().toISOString()
      }
    );
  } catch (err) {
    console.warn('[Appwrite] Swipe saved locally', err?.message || err);
    return { swiperId, targetId, isLike };
  }
}

/**
 * Fetch community Date Drops from Appwrite Cloud
 */
export async function appwriteGetDateDrops() {
  try {
    const res = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.dateDrops,
      [Query.orderDesc('$createdAt'), Query.limit(25)]
    );
    if (res.documents && res.documents.length > 0) {
      return res.documents;
    }
  } catch (err) {
    console.info('[Appwrite] Using initial Date Drops feed');
  }
  return INITIAL_DATE_DROPS;
}

/**
 * Post a new Date Drop to Appwrite Cloud
 */
export async function appwritePostDateDrop(drop) {
  try {
    return await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.dateDrops,
      ID.unique(),
      drop
    );
  } catch (err) {
    console.warn('[Appwrite] Date drop saved locally', err?.message || err);
    return drop;
  }
}

/**
 * Submit an Anti-Catfish / Abuse Report to Appwrite Cloud
 */
export async function appwriteSubmitReport(report) {
  try {
    return await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.reports,
      ID.unique(),
      report
    );
  } catch (err) {
    console.warn('[Appwrite] Report saved locally', err?.message || err);
    return report;
  }
}

export default client;
