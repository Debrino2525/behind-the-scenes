import { AppState } from 'react-native';
import { supabase } from './supabaseAuth';

/**
 * Live Presence Tracker using Supabase Realtime Channels
 * Synchronizes online/offline status in real-time across all mobile users.
 */
export function subscribeToLivePresence(currentUserId, onOnlineUsersChange) {
  if (!supabase) return () => {};

  const myId = String(currentUserId || 'guest_' + Math.random().toString(36).substring(7));
  const channel = supabase.channel('bts_presence_room', {
    config: {
      presence: { key: myId }
    }
  });

  const syncState = () => {
    try {
      const state = channel.presenceState();
      const onlineIds = new Set();
      Object.keys(state).forEach((key) => {
        onlineIds.add(String(key));
        const entries = state[key];
        if (Array.isArray(entries)) {
          entries.forEach((e) => {
            if (e.userId) onlineIds.add(String(e.userId));
            if (e.id) onlineIds.add(String(e.id));
          });
        }
      });
      onOnlineUsersChange(onlineIds);
    } catch (err) {
      console.warn('[Presence syncState error]', err);
    }
  };

  channel
    .on('presence', { event: 'sync' }, syncState)
    .on('presence', { event: 'join' }, syncState)
    .on('presence', { event: 'leave' }, syncState)
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try {
          await channel.track({
            userId: myId,
            onlineAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[Presence track error]', e);
        }
      }
    });

  // Track app foreground / background transitions
  const appStateSub = AppState.addEventListener('change', async (nextState) => {
    try {
      if (nextState === 'active') {
        await channel.track({
          userId: myId,
          onlineAt: new Date().toISOString()
        });
      } else if (nextState.match(/inactive|background/)) {
        await channel.untrack();
      }
    } catch (_) {}
  });

  return () => {
    appStateSub.remove();
    channel.untrack().catch(() => {});
    supabase.removeChannel(channel);
  };
}
