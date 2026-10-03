// Supabase Edge Function: delete-account
// Permanently deletes the calling user's account and associated data.
// Required by Apple App Store Guideline 5.1.1(v) and Google Play's account deletion policy.
//
// The caller is identified ONLY from their own access token (Authorization header),
// so a user can never delete someone else's account.

import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const BUCKETS = ['bts_photos', 'bts_voice_notes', 'bts_date_drops'];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Converts a public storage URL into { bucket, path } if it belongs to one of our buckets.
function parseStorageUrl(url: string | null | undefined): { bucket: string; path: string } | null {
  if (!url || typeof url !== 'string') return null;
  const marker = '/storage/v1/object/public/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rest = decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
  const slash = rest.indexOf('/');
  if (slash === -1) return null;
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  if (!BUCKETS.includes(bucket) || !path) return null;
  return { bucket, path };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1. Identify the caller from their JWT
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Missing access token' }, 401);
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: 'Invalid or expired session' }, 401);
  const uid = userData.user.id;

  const errors: string[] = [];

  // 2. Collect every storage file that belongs to this user
  const filesByBucket: Record<string, Set<string>> = {};
  const addFile = (url: string | null | undefined) => {
    const parsed = parseStorageUrl(url);
    if (!parsed) return;
    (filesByBucket[parsed.bucket] ??= new Set()).add(parsed.path);
  };

  const { data: profile } = await admin
    .from('profiles')
    .select('photos, voice_note_url, bts_thumbnail')
    .eq('id', uid)
    .maybeSingle();
  if (profile) {
    (profile.photos ?? []).forEach(addFile);
    addFile(profile.voice_note_url);
    addFile(profile.bts_thumbnail);
  }

  const { data: drops } = await admin.from('date_drops').select('photo_url').eq('user_id', uid);
  (drops ?? []).forEach((d: { photo_url: string }) => addFile(d.photo_url));

  const { data: voiceMsgs } = await admin
    .from('messages')
    .select('audio_url')
    .eq('sender_id', uid)
    .not('audio_url', 'is', null);
  (voiceMsgs ?? []).forEach((m: { audio_url: string }) => addFile(m.audio_url));

  // Files uploaded under the user's own folder (`<uid>/...`)
  for (const bucket of BUCKETS) {
    const { data: listed } = await admin.storage.from(bucket).list(uid, { limit: 1000 });
    (listed ?? []).forEach((f: { name: string }) => {
      (filesByBucket[bucket] ??= new Set()).add(`${uid}/${f.name}`);
    });
  }

  // 3. Delete storage files
  for (const [bucket, paths] of Object.entries(filesByBucket)) {
    const list = [...paths];
    if (!list.length) continue;
    const { error } = await admin.storage.from(bucket).remove(list);
    if (error) errors.push(`storage:${bucket}:${error.message}`);
  }

  // 4. Delete database rows explicitly (does not rely on FK cascades being present)
  const { data: myMatches } = await admin
    .from('matches')
    .select('id')
    .or(`user1_id.eq.${uid},user2_id.eq.${uid}`);
  const matchIds = (myMatches ?? []).map((m: { id: string }) => m.id);

  const steps: Array<[string, () => PromiseLike<{ error: { message: string } | null }>]> = [
    ['messages_sent', () => admin.from('messages').delete().eq('sender_id', uid)],
    ['messages_in_matches', () =>
      matchIds.length
        ? admin.from('messages').delete().in('match_id', matchIds)
        : Promise.resolve({ error: null })],
    ['matches', () => admin.from('matches').delete().or(`user1_id.eq.${uid},user2_id.eq.${uid}`)],
    ['swipes', () => admin.from('swipes').delete().or(`swiper_id.eq.${uid},target_id.eq.${uid}`)],
    ['date_drops', () => admin.from('date_drops').delete().eq('user_id', uid)],
    // Reports the user filed are kept for safety review but de-identified
    ['reports_deidentify', () => admin.from('reports').update({ reporter_id: null }).eq('reporter_id', uid)],
    ['profile', () => admin.from('profiles').delete().eq('id', uid)],
  ];

  for (const [name, run] of steps) {
    const { error } = await run();
    if (error) errors.push(`${name}:${error.message}`);
  }

  // Stop before removing the login if any user data could not be deleted,
  // so the user can retry and nothing is left orphaned.
  if (errors.length) {
    console.error('[delete-account] partial failure', uid, errors);
    return json({ error: 'Some data could not be deleted. Please try again.', details: errors }, 500);
  }

  // 5. Delete the authentication account itself
  const { error: authErr } = await admin.auth.admin.deleteUser(uid);
  if (authErr) {
    console.error('[delete-account] auth delete failed', uid, authErr.message);
    return json({ error: 'Account data removed, but login could not be deleted. Please try again.' }, 500);
  }

  return json({ success: true });
});
