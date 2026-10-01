// language: javascript
// filename: App.js
// platform: React Native (Expo Go)
// target: iOS & Android via Expo Go

import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
  Platform,
  Animated,
  KeyboardAvoidingView,
} from 'react-native';
import { INITIAL_PROFILES, INITIAL_MATCHES, INITIAL_DATE_DROPS, INITIAL_LIKES_YOU } from './data/mockProfiles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ──────────────── COLOR PALETTE ────────────────
const C = {
  bg: '#090b10',
  card: '#12151e',
  cardLight: '#1a1e2d',
  surface: '#161922',
  accent: '#FFB800',
  red: '#E03638',
  green: '#008751',
  emerald: '#10B981',
  blue: '#3B82F6',
  text: '#F1F5F9',
  textSoft: '#94A3B8',
  textMuted: '#64748B',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',
};

// ══════════════════════════════════════════════════
//  AGE GATE SCREEN
// ══════════════════════════════════════════════════
function AgeGateScreen({ onVerified }) {
  const [step, setStep] = useState('welcome');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    const y = parseInt(year);
    if (!y || y < 1920 || y > new Date().getFullYear()) {
      setError('Enter a valid birth year.');
      return;
    }
    const age = new Date().getFullYear() - y;
    if (age < 18) {
      setStep('blocked');
    } else {
      onVerified();
    }
  };

  if (step === 'blocked') {
    return (
      <View style={[s.fullCenter, { backgroundColor: C.bg }]}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🛡️</Text>
        <Text style={[s.heading, { color: C.text }]}>Age Requirement Not Met</Text>
        <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginHorizontal: 40, marginTop: 8 }]}>
          Behind The Scenes is exclusively for users aged 18 and above.
        </Text>
      </View>
    );
  }

  if (step === 'welcome') {
    return (
      <View style={[s.fullCenter, { backgroundColor: C.bg }]}>
        <View style={s.logoBox}>
          <Text style={s.logoStar}>★</Text>
        </View>
        <Text style={s.brandTitle}>BEHIND THE SCENES</Text>
        <Text style={[s.bodySmall, { color: C.textMuted, letterSpacing: 2, marginTop: 4 }]}>
          REAL VIBES • NO FAKE LIFE
        </Text>
        <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginHorizontal: 40, marginTop: 20 }]}>
          Connect with authentic singles across Africa's safest nations.
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <Text style={{ fontSize: 28 }}>🇬🇭</Text>
          <Text style={{ fontSize: 28 }}>🇲🇺</Text>
          <Text style={{ fontSize: 28 }}>🇧🇼</Text>
          <Text style={{ fontSize: 28 }}>🇳🇦</Text>
          <Text style={{ fontSize: 28 }}>🇲🇦</Text>
        </View>
        <TouchableOpacity style={[s.btnPrimary, { marginTop: 32 }]} onPress={() => setStep('dob')}>
          <Text style={s.btnPrimaryText}>Get Started →</Text>
        </TouchableOpacity>
        <Text style={[s.bodyTiny, { color: C.textMuted, textAlign: 'center', marginHorizontal: 40, marginTop: 16 }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy. You must be 18+ to use BTS.
        </Text>
      </View>
    );
  }

  return (
    <View style={[s.fullCenter, { backgroundColor: C.bg }]}>
      <Text style={{ fontSize: 36, marginBottom: 12 }}>🛡️</Text>
      <Text style={[s.heading, { color: C.text }]}>Verify Your Age</Text>
      <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginHorizontal: 40, marginTop: 6 }]}>
        Enter your birth year. You must be 18+.
      </Text>
      <TextInput
        style={s.textInput}
        placeholder="e.g. 1996"
        placeholderTextColor={C.textMuted}
        keyboardType="number-pad"
        maxLength={4}
        value={year}
        onChangeText={(t) => { setYear(t); setError(''); }}
      />
      {error ? <Text style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</Text> : null}
      <TouchableOpacity style={[s.btnPrimary, { marginTop: 20 }]} onPress={handleVerify}>
        <Text style={s.btnPrimaryText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

// ══════════════════════════════════════════════════
//  PROFILE CARD
// ══════════════════════════════════════════════════
function ProfileCard({ profile, onLike, onPass, onSuperLike, onBts, onReport }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);

  if (!profile) {
    return (
      <View style={[s.emptyCard]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>✨</Text>
        <Text style={[s.heading, { color: C.text }]}>You've Caught Up!</Text>
        <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginTop: 8 }]}>
          No more profiles matching your filters. Pull down to refresh.
        </Text>
      </View>
    );
  }

  const nextPhoto = () => setPhotoIdx((photoIdx + 1) % profile.mainPhotos.length);

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Photo */}
      <TouchableOpacity activeOpacity={0.95} onPress={nextPhoto}>
        <View style={s.photoContainer}>
          <Image source={{ uri: profile.mainPhotos[photoIdx] }} style={s.mainPhoto} />
          
          {/* Photo dots */}
          <View style={s.photoDots}>
            {profile.mainPhotos.map((_, i) => (
              <View key={i} style={[s.dot, i === photoIdx && s.dotActive]} />
            ))}
          </View>

          {/* Country + Tribe badges */}
          <View style={s.badgeRow}>
            <View style={s.badgeDark}>
              <Text style={s.badgeText}>{profile.countryFlag} {profile.country}</Text>
            </View>
            <View style={s.badgeGold}>
              <Text style={[s.badgeText, { color: C.accent }]}>🇬🇭 {profile.tribe}</Text>
            </View>
          </View>

          {/* BTS Button */}
          <TouchableOpacity style={s.btsFloatBtn} onPress={() => onBts(profile)}>
            <Text style={s.btsFloatText}>👁 See BTS</Text>
          </TouchableOpacity>

          {/* Gradient overlay */}
          <View style={s.photoGradient} />

          {/* Name overlay */}
          <View style={s.nameOverlay}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={s.nameText}>{profile.name}, {profile.age}</Text>
              {profile.verified && <Text style={{ fontSize: 16 }}>✅</Text>}
            </View>
            <Text style={[s.bodySmall, { color: '#E2E8F0', fontWeight: '600' }]}>{profile.occupation}</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
              <View style={s.locPill}>
                <Text style={s.locText}>📍 {profile.currentCity}</Text>
              </View>
              <View style={s.locPill}>
                <Text style={s.locText}>🧭 {profile.homeTown}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Voice Note */}
      <View style={s.section}>
        <View style={s.voiceBox}>
          <View style={{ flex: 1 }}>
            <Text style={[s.bodyTiny, { color: C.accent, fontWeight: '800', textTransform: 'uppercase' }]}>
              🎙 {profile.voiceNote.title}
            </Text>
            <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 2 }]}>
              {profile.voiceNote.duration} • Voice Note
            </Text>
          </View>
          <TouchableOpacity
            style={s.playBtn}
            onPress={() => setAudioPlaying(!audioPlaying)}
          >
            <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>
              {audioPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[s.bodySmall, { color: C.textSoft, fontStyle: 'italic', marginTop: 8 }]}>
          "{profile.voiceNote.transcript}"
        </Text>
      </View>

      {/* BTS Teaser */}
      <TouchableOpacity style={s.btsTeaser} onPress={() => onBts(profile)}>
        <Image source={{ uri: profile.behindTheScenes.thumbnail }} style={s.btsTeaserImg} blurRadius={3} />
        <View style={{ flex: 1 }}>
          <Text style={[s.bodyTiny, { color: C.accent, fontWeight: '800', textTransform: 'uppercase' }]}>
            ✨ Behind The Scenes
          </Text>
          <Text style={[s.bodySmall, { color: '#E2E8F0', marginTop: 2 }]} numberOfLines={2}>
            {profile.behindTheScenes.caption}
          </Text>
          <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 2 }]}>
            Tap to unlock candid
          </Text>
        </View>
        <Text style={{ fontSize: 18, color: C.textMuted }}>›</Text>
      </TouchableOpacity>

      {/* Cultural Prompts */}
      {profile.culturalPrompts.map((cp, i) => (
        <View key={i} style={s.promptBox}>
          <Text style={[s.bodyTiny, { color: C.textMuted, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }]}>
            {cp.question}
          </Text>
          <Text style={[s.bodySmall, { color: '#E2E8F0', marginTop: 4, fontWeight: '600' }]}>
            "{cp.answer}"
          </Text>
        </View>
      ))}

      {/* Tags */}
      <View style={[s.section, { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }]}>
        <View style={s.tag}><Text style={s.tagText}>🎯 {profile.intent}</Text></View>
        <View style={s.tag}><Text style={s.tagText}>🗣 {profile.languages.join(', ')}</Text></View>
      </View>

      {/* Report */}
      <TouchableOpacity style={s.reportBtn} onPress={() => onReport(profile.name)}>
        <Text style={s.reportText}>🚩 Report Profile</Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={s.actionBar}>
        <TouchableOpacity style={[s.actionCircle, { borderColor: 'rgba(239,68,68,0.4)' }]} onPress={onPass}>
          <Text style={{ fontSize: 24, color: '#EF4444' }}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionCircle, { borderColor: 'rgba(255,184,0,0.4)' }]} onPress={() => onBts(profile)}>
          <Text style={{ fontSize: 20, color: C.accent }}>👁</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionCircle, { borderColor: 'rgba(59,130,246,0.4)' }]} onPress={onSuperLike}>
          <Text style={{ fontSize: 20, color: C.blue }}>⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionCirclePrimary]} onPress={onLike}>
          <Text style={{ fontSize: 24, color: '#000' }}>♥</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════
//  BTS REVEAL MODAL
// ══════════════════════════════════════════════════
function BtsModal({ profile, visible, onClose, onLike }) {
  if (!profile) return null;
  const bts = profile.behindTheScenes;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          <TouchableOpacity style={s.modalClose} onPress={onClose}>
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>

          <View style={s.modalHeader}>
            <View style={s.btsTag}><Text style={{ color: '#000', fontWeight: '900', fontSize: 11 }}>BTS</Text></View>
            <View>
              <Text style={[s.bodySmall, { color: C.text, fontWeight: '800' }]}>{profile.name}'s Behind The Scenes</Text>
              <Text style={[s.bodyTiny, { color: C.textMuted }]}>Unfiltered, no posture, real life</Text>
            </View>
          </View>

          <Image source={{ uri: bts.thumbnail }} style={s.btsFullImg} />
          <View style={s.btsLocBadge}>
            <Text style={[s.bodyTiny, { color: C.accent }]}>📍 {bts.locationTag}</Text>
          </View>

          <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            <Text style={[s.bodyTiny, { color: C.textMuted, fontWeight: '800', textTransform: 'uppercase', marginBottom: 6 }]}>
              The Candid Reality
            </Text>
            <View style={s.promptBox}>
              <Text style={[s.bodySmall, { color: '#E2E8F0', fontWeight: '600' }]}>"{bts.caption}"</Text>
            </View>

            <Text style={[s.bodyTiny, { color: C.textMuted, fontWeight: '800', textTransform: 'uppercase', marginTop: 12, marginBottom: 6 }]}>
              Daily Quirky Habit
            </Text>
            <View style={s.promptBox}>
              <Text style={[s.bodySmall, { color: '#CBD5E1' }]}>"{bts.realLifeHabit}"</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
              <TouchableOpacity style={s.reactionChip} onPress={() => { onClose(); onLike(); }}>
                <Text style={[s.bodyTiny, { color: C.accent }]}>😂 "Realest caption ever"</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.reactionChip, { borderColor: 'rgba(16,185,129,0.4)' }]} onPress={() => { onClose(); onLike(); }}>
                <Text style={[s.bodyTiny, { color: C.emerald }]}>🍲 "Now I'm hungry"</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.reactionChip, { borderColor: 'rgba(224,54,56,0.4)' }]} onPress={() => { onClose(); onLike(); }}>
                <Text style={[s.bodyTiny, { color: C.red }]}>🇬🇭 "Standard vibes"</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={s.modalFooter}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[s.bodySmall, { color: C.textMuted, fontWeight: '700' }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.btnPrimary} onPress={() => { onClose(); onLike(); }}>
              <Text style={s.btnPrimaryText}>♥ Connect with {profile.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════
//  MATCHES & CHAT SCREEN
// ══════════════════════════════════════════════════
function MatchesScreen({ matches, onSelectMatch, onBack }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={s.screenHeader}>
        <TouchableOpacity onPress={onBack}>
          <Text style={[s.bodySmall, { color: C.accent, fontWeight: '800' }]}>← Discover</Text>
        </TouchableOpacity>
        <Text style={[s.bodySmall, { color: C.text, fontWeight: '800' }]}>✨ Matches & Chats</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginTop: 12 }}>
        {matches.map((m, idx) => (
          <TouchableOpacity key={`${m.id}-${idx}`} onPress={() => onSelectMatch(m)} style={{ alignItems: 'center', marginRight: 16 }}>
            <View style={s.matchAvatarRing}>
              <Image source={{ uri: m.photo }} style={s.matchAvatar} />
              {m.online && <View style={s.onlineDot} />}
            </View>
            <Text style={[s.bodyTiny, { color: C.text, fontWeight: '700', marginTop: 4 }]}>{m.name.split(' ')[0]}</Text>
            <Text style={[s.bodyTiny, { color: C.textMuted }]}>{m.country}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={[s.bodyTiny, { color: C.textMuted, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 20, marginTop: 24, marginBottom: 8 }]}>
        Conversations
      </Text>

      <FlatList
        data={matches}
        keyExtractor={(m, idx) => `${m.id}-${idx}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.chatRow} onPress={() => onSelectMatch(item)}>
            <Image source={{ uri: item.photo }} style={s.chatAvatar} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[s.bodySmall, { color: C.text, fontWeight: '700' }]}>{item.name}</Text>
                <Text style={[s.bodyTiny, { color: C.textMuted }]}>{item.time}</Text>
              </View>
              <Text style={[s.bodyTiny, { color: item.unread ? '#E2E8F0' : C.textMuted, fontWeight: item.unread ? '700' : '400', marginTop: 2 }]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread && <View style={s.unreadDot} />}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════
//  CHAT MODAL
// ══════════════════════════════════════════════════
function ChatScreen({ match, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: match.lastMessage || "Hey! Nice to connect. How's your week going?", time: '12:04 PM' }
  ]);
  const [input, setInput] = useState('');

  const send = (txt) => {
    const content = txt || input;
    if (!content.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: content, time: now }]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'them',
        text: content.toLowerCase().includes('food') || content.toLowerCase().includes('jollof')
          ? "Say no more! If it has extra spice, I am already on my way."
          : "Ah charlie! You have jokes! Are we doing Buka in Osu or somewhere quiet?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  return (
    <Modal visible animationType="slide">
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Chat Header */}
          <View style={s.chatHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: C.textSoft, fontSize: 22 }}>←</Text>
            </TouchableOpacity>
            <Image source={{ uri: match.photo }} style={{ width: 36, height: 36, borderRadius: 18, marginLeft: 12 }} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={[s.bodySmall, { color: C.text, fontWeight: '800' }]}>{match.name}</Text>
              <Text style={[s.bodyTiny, { color: match.online ? C.emerald : C.textMuted }]}>
                {match.online ? 'Online now' : 'Active today'}
              </Text>
            </View>
          </View>

          {/* Messages */}
          <FlatList
            data={messages}
            keyExtractor={m => String(m.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            renderItem={({ item }) => (
              <View style={[s.msgBubbleWrap, item.sender === 'me' && { alignItems: 'flex-end' }]}>
                <View style={[s.msgBubble, item.sender === 'me' ? s.msgMe : s.msgThem]}>
                  <Text style={[s.bodySmall, { color: item.sender === 'me' ? '#000' : '#E2E8F0' }]}>{item.text}</Text>
                </View>
                <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 2, marginHorizontal: 4 }]}>{item.time}</Text>
              </View>
            )}
          />

          {/* Icebreakers */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 12, paddingVertical: 6, borderTopWidth: 1, borderTopColor: C.border }}>
            <TouchableOpacity style={s.iceChip} onPress={() => send("Are we having jollof or waakye? 🍛")}>
              <Text style={[s.bodyTiny, { color: C.textSoft }]}>🍛 Jollof or Waakye?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.iceChip} onPress={() => send("Loved the voice note! Tell me more.")}>
              <Text style={[s.bodyTiny, { color: C.textSoft }]}>🎙 Loved the voice note!</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Input */}
          <View style={s.chatInput}>
            <TextInput
              style={s.chatTextInput}
              placeholder={`Message ${match.name}...`}
              placeholderTextColor={C.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => send()}
              returnKeyType="send"
            />
            <TouchableOpacity style={s.sendBtn} onPress={() => send()} disabled={!input.trim()}>
              <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>→</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// ══════════════════════════════════════════════════
//  DATE DROPS SCREEN (REAL DATES FEED)
// ══════════════════════════════════════════════════
function DateDropsScreen({ onPostDate }) {
  const [drops, setDrops] = useState(INITIAL_DATE_DROPS);

  const cheer = (id) => {
    setDrops(prev => prev.map(d => d.id === id ? { ...d, cheersCount: d.cheersCount + 1 } : d));
    Alert.alert('🥂 Cheers Sent!', 'You cheered on this date connection!');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={s.screenHeader}>
        <Text style={[s.bodySmall, { color: C.text, fontWeight: '800' }]}>🥂 BTS Date Drops</Text>
        <TouchableOpacity style={s.btnPrimarySm} onPress={onPostDate}>
          <Text style={{ color: '#000', fontWeight: '900', fontSize: 11 }}>+ Drop Date</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={drops}
        keyExtractor={(d, idx) => `${d.id}-${idx}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={s.dateDropCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12 }}>
              <View>
                <Text style={[s.bodySmall, { color: C.text, fontWeight: '800' }]}>{item.couple}</Text>
                <Text style={[s.bodyTiny, { color: C.accent }]}>{item.matchTag}</Text>
              </View>
              <Text style={[s.bodyTiny, { color: C.textMuted }]}>{item.timestamp}</Text>
            </View>

            <Image source={{ uri: item.photo }} style={{ width: '100%', height: 220 }} />

            <View style={{ padding: 12 }}>
              <View style={s.venuePill}>
                <Text style={[s.bodyTiny, { color: '#CBD5E1', fontWeight: '700' }]}>📍 {item.venue}</Text>
              </View>

              <Text style={[s.bodySmall, { color: '#E2E8F0', marginTop: 8 }]}>"{item.caption}"</Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border }}>
                <Text style={[s.bodyTiny, { color: C.accent, fontWeight: '700' }]}>{item.vibeRating}</Text>
                <TouchableOpacity style={s.cheerBtn} onPress={() => cheer(item.id)}>
                  <Text style={{ color: C.accent, fontWeight: '800', fontSize: 11 }}>🎉 {item.cheersCount} Cheers</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════
//  LIKES YOU SCREEN
// ══════════════════════════════════════════════════
function LikesYouScreen({ onMatchBack }) {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={[s.heading, { color: C.text }]}>Interested In You</Text>
        <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 2 }]}>Singles who swiped right on your profile</Text>
      </View>

      <FlatList
        data={INITIAL_LIKES_YOU}
        keyExtractor={(p, idx) => `${p.id}-${idx}`}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={s.likesCard}>
            <Image source={{ uri: item.photo }} style={{ width: '100%', height: 150, borderRadius: 16 }} />
            <View style={{ padding: 10 }}>
              <Text style={[s.bodySmall, { color: C.text, fontWeight: '800' }]}>{item.name}, {item.age}</Text>
              <Text style={[s.bodyTiny, { color: C.textMuted }]}>{item.city}</Text>
              <Text style={[s.bodyTiny, { color: C.accent, fontStyle: 'italic', marginTop: 4 }]} numberOfLines={2}>
                "{item.note}"
              </Text>
              <TouchableOpacity style={[s.btnPrimary, { paddingVertical: 8, marginTop: 8 }]} onPress={() => onMatchBack(item)}>
                <Text style={[s.btnPrimaryText, { fontSize: 11 }]}>♥ Match Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════
export default function App() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [tab, setTab] = useState('discover');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [btsProfile, setBtsProfile] = useState(null);
  const [chatMatch, setChatMatch] = useState(null);
  const profiles = INITIAL_PROFILES;
  const currentProfile = profiles[currentIdx] || null;

  const handleLike = () => {
    if (!currentProfile) return;
    const newMatch = {
      id: currentProfile.id,
      name: currentProfile.name,
      photo: currentProfile.mainPhotos[0],
      lastMessage: "You both connected through Behind The Scenes!",
      time: "Just now",
      unread: true,
      online: true,
      hometown: currentProfile.homeTown,
      currentCity: currentProfile.currentCity.split(' ')[0],
      country: currentProfile.country
    };
    setMatches(prev => [newMatch, ...prev.filter(m => m.id !== currentProfile.id)]);
    Alert.alert('🎉 It\'s a Match!', `You and ${currentProfile.name} connected through BTS!`);
    setCurrentIdx(prev => prev + 1);
  };

  const handlePass = () => setCurrentIdx(prev => prev + 1);
  const handleReport = (name) => Alert.alert('Report Submitted', `Your report about ${name} has been received. Our safety team will review within 24 hours.`);

  if (!ageVerified) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="light-content" />
        <AgeGateScreen onVerified={() => setAgeVerified(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setTab('discover')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={s.logoBoxSm}><Text style={{ color: '#000', fontWeight: '900', fontSize: 12 }}>★</Text></View>
          <View>
            <Text style={s.brandTitleSm}>BEHIND THE SCENES</Text>
            <Text style={[s.bodyTiny, { color: C.textMuted, letterSpacing: 1.5 }]}>REAL VIBES • AFRICA</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={s.headerBtn} onPress={() => setTab('matches')}>
            <Text style={{ fontSize: 16 }}>💬</Text>
            {matches.some(m => m.unread) && <View style={s.headerBadge} />}
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => Alert.alert('Safety Center', 'Community Guidelines, Privacy Policy, Terms of Service, and Account Deletion are available here.', [{ text: 'OK' }])}>
            <Text style={{ fontSize: 16 }}>🛡️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {tab === 'discover' && (
        <ProfileCard
          profile={currentProfile}
          onLike={handleLike}
          onPass={handlePass}
          onSuperLike={handleLike}
          onBts={(p) => setBtsProfile(p)}
          onReport={handleReport}
        />
      )}

      {tab === 'date_drops' && (
        <DateDropsScreen 
          onPostDate={() => Alert.alert('Post Your Date Story', 'Upload your date selfie/food photo and tag the spot (e.g. Buka Restaurant Osu) to cheer the community!')}
        />
      )}

      {tab === 'likes_you' && (
        <LikesYouScreen 
          onMatchBack={(p) => {
            const newMatch = {
              id: p.id,
              name: p.name,
              photo: p.photo,
              lastMessage: "You matched back! Say hi!",
              time: "Just now",
              unread: true,
              online: true,
              hometown: p.hometown,
              currentCity: p.city,
              country: "Ghana"
            };
            setMatches(prev => [newMatch, ...prev.filter(m => m.id !== p.id)]);
            setChatMatch(newMatch);
          }}
        />
      )}

      {tab === 'matches' && (
        <MatchesScreen
          matches={matches}
          onSelectMatch={(m) => setChatMatch(m)}
          onBack={() => setTab('discover')}
        />
      )}

      {/* Floating Bottom Navigation Bar */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.bottomTabBtn} onPress={() => setTab('discover')}>
          <Text style={[s.bottomTabIcon, tab === 'discover' && { transform: [{ scale: 1.2 }] }]}>🔥</Text>
          <Text style={[s.bottomTabText, tab === 'discover' && s.bottomTabActive]}>Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.bottomTabBtn} onPress={() => setTab('date_drops')}>
          <Text style={[s.bottomTabIcon, tab === 'date_drops' && { transform: [{ scale: 1.2 }] }]}>🥂</Text>
          <Text style={[s.bottomTabText, tab === 'date_drops' && s.bottomTabActive]}>Date Drops</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.bottomTabBtn} onPress={() => setTab('likes_you')}>
          <Text style={[s.bottomTabIcon, tab === 'likes_you' && { transform: [{ scale: 1.2 }] }]}>👁</Text>
          <Text style={[s.bottomTabText, tab === 'likes_you' && s.bottomTabActive]}>Likes You</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.bottomTabBtn} onPress={() => setTab('matches')}>
          <View>
            <Text style={[s.bottomTabIcon, tab === 'matches' && { transform: [{ scale: 1.2 }] }]}>💬</Text>
            {matches.some(m => m.unread) && <View style={s.bottomBadge} />}
          </View>
          <Text style={[s.bottomTabText, tab === 'matches' && s.bottomTabActive]}>Matches</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.bottomTabBtn} onPress={() => Alert.alert('Behind The Scenes Safety', '18+ Verified • Child Safety Standards Enforced • Account Deletion Available')}>
          <Text style={s.bottomTabIcon}>🛡️</Text>
          <Text style={s.bottomTabText}>Safety</Text>
        </TouchableOpacity>
      </View>

      {/* BTS Reveal Modal */}
      <BtsModal
        profile={btsProfile}
        visible={!!btsProfile}
        onClose={() => setBtsProfile(null)}
        onLike={() => { setBtsProfile(null); handleLike(); }}
      />

      {/* Chat Modal */}
      {chatMatch && (
        <ChatScreen match={chatMatch} onClose={() => setChatMatch(null)} />
      )}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════
const s = StyleSheet.create({
  fullCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  heading: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  bodySmall: { fontSize: 12, lineHeight: 18 },
  bodyTiny: { fontSize: 10, lineHeight: 14 },

  logoBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, backgroundColor: C.accent },
  logoStar: { color: '#000', fontWeight: '900', fontSize: 28 },
  brandTitle: { fontSize: 22, fontWeight: '900', color: C.accent, letterSpacing: 2 },

  btnPrimary: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20, backgroundColor: C.accent },
  btnPrimaryText: { color: '#000', fontWeight: '900', fontSize: 13 },

  textInput: { width: '80%', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border, color: C.text, fontSize: 16, textAlign: 'center', marginTop: 20 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  logoBoxSm: { width: 28, height: 28, borderRadius: 10, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  brandTitleSm: { fontSize: 13, fontWeight: '900', color: C.accent, letterSpacing: 1.5 },
  headerBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border, justifyContent: 'center', alignItems: 'center' },
  headerBadge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: C.emerald },

  // Card
  photoContainer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.2, backgroundColor: '#0a0c10' },
  mainPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoDots: { position: 'absolute', top: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4, zIndex: 10 },
  dot: { width: 24, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#FFF' },
  badgeRow: { position: 'absolute', top: 24, left: 12, flexDirection: 'row', gap: 6, zIndex: 10 },
  badgeDark: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  badgeGold: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.4)' },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  btsFloatBtn: { position: 'absolute', top: 24, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.accent, zIndex: 10 },
  btsFloatText: { color: '#000', fontWeight: '900', fontSize: 11 },
  photoGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 180, backgroundColor: 'rgba(18,21,30,0.9)' },
  nameOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16, zIndex: 10 },
  nameText: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  locPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: C.border },
  locText: { fontSize: 10, color: '#CBD5E1' },

  section: { paddingHorizontal: 16, paddingVertical: 12 },
  voiceBox: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: C.border },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },

  btsTeaser: { marginHorizontal: 16, padding: 12, borderRadius: 16, backgroundColor: 'rgba(255,184,0,0.06)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.25)', flexDirection: 'row', alignItems: 'center', gap: 10 },
  btsTeaserImg: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },

  promptBox: { marginHorizontal: 16, marginTop: 8, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: C.border },

  tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: C.border },
  tagText: { fontSize: 10, color: C.textSoft, fontWeight: '600' },

  reportBtn: { marginHorizontal: 16, marginTop: 12, padding: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', alignItems: 'center' },
  reportText: { fontSize: 10, color: C.textMuted, fontWeight: '600' },

  actionBar: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, paddingVertical: 20, paddingHorizontal: 16 },
  actionCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(15,23,42,0.9)', borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  actionCirclePrimary: { width: 56, height: 56, borderRadius: 28, backgroundColor: C.emerald, justifyContent: 'center', alignItems: 'center' },

  emptyCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

  // Matches
  screenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  matchAvatarRing: { width: 60, height: 60, borderRadius: 18, padding: 2, borderWidth: 2, borderColor: C.accent, overflow: 'hidden' },
  matchAvatar: { width: '100%', height: '100%', borderRadius: 14 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: C.emerald, borderWidth: 2, borderColor: C.bg },
  chatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  chatAvatar: { width: 46, height: 46, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent },

  // Chat
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  msgBubbleWrap: { marginBottom: 10 },
  msgBubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  msgMe: { backgroundColor: C.accent, borderBottomRightRadius: 4 },
  msgThem: { backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 },
  iceChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border, marginRight: 8 },
  chatInput: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border },
  chatTextInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: C.border, color: C.text, fontSize: 13 },
  sendBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: SCREEN_HEIGHT * 0.9, overflow: 'hidden' },
  modalClose: { position: 'absolute', top: 16, right: 16, zIndex: 20, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: C.border },
  btsTag: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center' },
  btsFullImg: { width: '100%', height: 260, resizeMode: 'cover' },
  btsLocBadge: { position: 'absolute', top: 300, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderWidth: 1, borderColor: C.border },
  reactionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,184,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' },

  // Date Drops
  dateDropCard: { backgroundColor: C.surface, borderRadius: 24, borderWidth: 1, borderColor: C.border, marginBottom: 16, overflow: 'hidden' },
  venuePill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1, borderColor: C.border },
  cheerBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(255,184,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' },
  btnPrimarySm: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: C.accent },

  // Likes You
  likesCard: { flex: 1, backgroundColor: C.surface, borderRadius: 20, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },

  // Bottom Navigation Bar
  bottomBar: { position: 'absolute', bottom: 12, left: 16, right: 16, height: 60, borderRadius: 30, backgroundColor: 'rgba(15,18,26,0.95)', borderWidth: 1, borderColor: C.borderLight, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  bottomTabBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  bottomTabIcon: { fontSize: 18 },
  bottomTabText: { fontSize: 9, color: C.textMuted, marginTop: 2, fontWeight: '700' },
  bottomTabActive: { color: C.accent, fontWeight: '900' },
  bottomBadge: { position: 'absolute', top: -2, right: -4, width: 8, height: 8, borderRadius: 4, backgroundColor: C.emerald },
});
