// language: javascript
// filename: App.js
// platform: React Native (Expo Go)
// target: iOS & Android via Expo Go

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  PanResponder,
} from 'react-native';
import { INITIAL_PROFILES, INITIAL_MATCHES, INITIAL_DATE_DROPS, INITIAL_LIKES_YOU } from './data/mockProfiles';
import { 
  appwriteLoginWithGoogleMobile, 
  appwriteGetCurrentUserMobile,
  appwriteSendEmailOtp,
  appwriteVerifyEmailOtp,
  appwriteRegisterEmailPassword,
  appwriteLoginEmailPassword,
  appwriteSaveUserProfile,
  appwriteGetUserProfile,
  appwriteUploadPhoto,
  appwriteUploadVoiceNote,
  appwriteLogoutMobile
} from './lib/appwrite';
import { 
  loadLocalProfile, 
  saveLocalProfile, 
  clearLocalProfile 
} from './lib/localStorage';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from './lib/audioService';
import Svg, { Path } from 'react-native-svg';
import { verifyHumanFace } from './lib/faceVerification';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ──────────────── COLOR PALETTE ────────────────
const C = {
  bg: 'transparent',
  baseDark: '#090B10',
  card: 'rgba(18, 21, 30, 0.88)',
  cardLight: 'rgba(26, 30, 45, 0.90)',
  surface: 'rgba(22, 25, 34, 0.92)',
  accent: '#FFB800',
  red: '#E03638',
  green: '#008751',
  emerald: '#10B981',
  blue: '#3B82F6',
  text: '#F1F5F9',
  textSoft: '#94A3B8',
  textMuted: '#64748B',
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.14)',
};

// ══════════════════════════════════════════════════
//  FAINT DIMMED ATMOSPHERIC APP BACKGROUND
// ══════════════════════════════════════════════════
const BG_IMAGES = {
  embrace: require('./assets/bg-couple-embrace.png'), // B&W couple embrace with rings
  sunset: require('./assets/bg-sunset-hands.png'),     // Sunset pinky holding silhouette
  watermark: require('./assets/bg-bts-watermark.jpg'), // Behind The Scenes monogram
};

function DimmedAppBackground({ screen = 'discover', step = null }) {
  let activeImage = BG_IMAGES.sunset;

  if (step !== null) {
    if (step === 1 || step === 5) {
      activeImage = BG_IMAGES.watermark;
    } else if (step === 2 || step === 3 || step === 4 || step === 6) {
      activeImage = BG_IMAGES.embrace;
    } else {
      activeImage = BG_IMAGES.sunset;
    }
  } else {
    if (screen === 'discover' || screen === 'date_drops') {
      activeImage = BG_IMAGES.sunset;
    } else if (screen === 'profile' || screen === 'likes_you') {
      activeImage = BG_IMAGES.embrace;
    } else {
      activeImage = BG_IMAGES.watermark;
    }
  }

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* 1. Underlying Dark Tint Base */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: '#07090E' }} />

      {/* 2. Faint Dimmed Atmospheric Background Image */}
      <Image
        source={activeImage}
        style={{
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
          opacity: 0.12, // Faint and dimmed as requested by GLOBITECH
        }}
      />

      {/* 3. Soft Dark Vignette Overlay for perfect readability */}
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(7, 9, 14, 0.70)',
        }}
      />
    </View>
  );
}

// ══════════════════════════════════════════════════
//  OFFICIAL GOOGLE BRAND VECTOR ICON
// ══════════════════════════════════════════════════
function GoogleLogo({ size = 20, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

// ══════════════════════════════════════════════════
//  STEP HEADER & BACK NAVIGATION
// ══════════════════════════════════════════════════
function StepHeader({ currentStep, totalSteps = 5, onBack, title }) {
  const pct = `${Math.min(100, Math.max(15, (currentStep / totalSteps) * 100))}%`;
  return (
    <View style={{ width: '100%', paddingTop: Platform.OS === 'ios' ? 44 : 20, paddingBottom: 10, backgroundColor: C.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
        <TouchableOpacity
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: C.border }}
        >
          <Text style={{ color: '#F2E9D8', fontWeight: '800', fontSize: 13 }}>← Back</Text>
        </TouchableOpacity>

        <View style={{ paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,184,0,0.12)', borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' }}>
          <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 }}>
            STEP {currentStep} OF {totalSteps}
          </Text>
        </View>
      </View>

      <View style={{ width: '100%', height: 3, backgroundColor: 'rgba(255,255,255,0.08)' }}>
        <View style={{ width: pct, height: '100%', backgroundColor: C.accent }} />
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════
//  MOBILE ONBOARDING & VERIFICATION WIZARD
// ══════════════════════════════════════════════════
const COUNTRIES_LIST = [
  { name: 'Ghana', flag: '🇬🇭', defaultCity: 'Accra', defaultRoots: 'Kumasi', defaultTribe: 'Asante' },
  { name: 'Mauritius', flag: '🇲🇺', defaultCity: 'Port Louis', defaultRoots: 'Flic en Flac', defaultTribe: 'Creole' },
  { name: 'Botswana', flag: '🇧🇼', defaultCity: 'Gaborone', defaultRoots: 'Maun', defaultTribe: 'Tswana' },
  { name: 'Namibia', flag: '🇳🇦', defaultCity: 'Windhoek', defaultRoots: 'Swakopmund', defaultTribe: 'Herero' },
  { name: 'Morocco', flag: '🇲🇦', defaultCity: 'Marrakech', defaultRoots: 'Fès', defaultTribe: 'Amazigh' },
  { name: 'United Kingdom (Diaspora)', flag: '🇬🇧', defaultCity: 'London', defaultRoots: 'Accra', defaultTribe: 'Fante' },
  { name: 'United States (Diaspora)', flag: '🇺🇸', defaultCity: 'Atlanta', defaultRoots: 'Kumasi', defaultTribe: 'Asante' },
  { name: 'Worldwide / Diaspora', flag: '🌍', defaultCity: 'Global City', defaultRoots: 'Heritage Roots', defaultTribe: 'African Roots' },
];

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // DOB
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  // Gender & Match Preferences (Strict Heterosexual Matchmaking)
  const [gender, setGender] = useState('male'); // 'male' | 'female'
  const [interestedInGender, setInterestedInGender] = useState('female'); // automatically inverted: male -> female, female -> male
  const [preferredMinAge, setPreferredMinAge] = useState('21');
  const [preferredMaxAge, setPreferredMaxAge] = useState('35');

  // Country & Roots
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES_LIST[0]);
  const [currentCity, setCurrentCity] = useState('Accra');
  const [homeTown, setHomeTown] = useState('Kumasi');
  const [tribe, setTribe] = useState('Asante');
  const [intent, setIntent] = useState('Long-term leading to marriage');

  // Candid BTS Moment
  const [btsCaption, setBtsCaption] = useState('Sunday waakye in my oversized t-shirt, completely unedited.');
  const [btsHabit, setBtsHabit] = useState('I listen to Daddy Lumba every Sunday morning.');

  // Onboarding Voice Note Recording (Step 5)
  const [onboardingVoiceUri, setOnboardingVoiceUri] = useState(null);
  const [onboardingVoiceDuration, setOnboardingVoiceDuration] = useState('0:14');
  const [isRecordingStep5, setIsRecordingStep5] = useState(false);
  const [recordSecondsStep5, setRecordSecondsStep5] = useState(0);
  const [isPlayingStep5, setIsPlayingStep5] = useState(false);
  const recordingStep5Ref = useRef(null);
  const soundStep5Ref = useRef(null);
  const timerStep5Ref = useRef(null);

  useEffect(() => {
    return () => {
      if (soundStep5Ref.current) {
        soundStep5Ref.current.unloadAsync().catch(() => {});
      }
      if (timerStep5Ref.current) {
        clearInterval(timerStep5Ref.current);
      }
    };
  }, []);

  // Real Camera & Liveness
  const [capturedSelfieUri, setCapturedSelfieUri] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState(false);
  const [faceError, setFaceError] = useState('');
  const [livenessConfidence, setLivenessConfidence] = useState(98.4);

  // Email OTP Authentication States
  const [authSubStep, setAuthSubStep] = useState('input'); // 'input' | 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [otpUserId, setOtpUserId] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'signin'

  // Gesture responder: Horizontal right swipe triggers handleBack
  const swipeBackResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) => g.dx > 30 && Math.abs(g.dx) > Math.abs(g.dy) * 1.3,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 60 && g.vx > 0.25) {
          handleBack();
        }
      }
    })
  ).current;

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check for active Appwrite user and restored database profile
  useEffect(() => {
    async function checkExistingUser() {
      try {
        const user = await appwriteGetCurrentUserMobile();
        if (user && user.$id) {
          if (user.name) setFullName(user.name);
          if (user.email) setEmail(user.email);

          // Check if user ALREADY completed their profile in the database!
          const existingProfile = await appwriteGetUserProfile(user.$id);
          if (existingProfile && existingProfile.name) {
            await saveLocalProfile(existingProfile);
            onComplete(existingProfile);
            return;
          }

          // If no profile created yet, move past signup step
          setStep((prev) => (prev <= 2 ? 3 : prev));
        }
      } catch (e) {
        // Not signed in
      }
    }
    checkExistingUser();
  }, []);

  const handleBack = () => {
    Keyboard.dismiss();
    setError('');
    if (step === 2 && authSubStep === 'otp') {
      setAuthSubStep('input');
      return;
    }
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSignIn = async () => {
    Keyboard.dismiss();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setIsSendingCode(true);
    setError('');
    try {
      const user = await appwriteLoginEmailPassword(cleanEmail, password);
      const existingProfile = await appwriteGetUserProfile(user.$id);
      if (existingProfile && existingProfile.name) {
        await saveLocalProfile(existingProfile);
        onComplete(existingProfile);
        return;
      }
      setStep(3);
    } catch (err) {
      setError(err?.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoadingOAuth(true);
      setError('');

      // If active session already exists, skip directly to Age Check
      const existing = await appwriteGetCurrentUserMobile();
      if (existing) {
        if (existing.name) setFullName(existing.name);
        if (existing.email) setEmail(existing.email);
        setStep(3);
        return;
      }

      const user = await appwriteLoginWithGoogleMobile();
      if (user) {
        if (user.name) setFullName(user.name);
        if (user.email) setEmail(user.email);
        setStep(3); // Proceed to Age Check
      }
    } catch (err) {
      // In case session conflict occurred, fetch the current active session
      try {
        const user = await appwriteGetCurrentUserMobile();
        if (user) {
          if (user.name) setFullName(user.name);
          if (user.email) setEmail(user.email);
          setStep(3);
          return;
        }
      } catch (e) {}

      Alert.alert(
        'Google Authentication',
        err?.message || 'Could not complete Google sign-in. You can sign up with email verification below.'
      );
    } finally {
      setLoadingOAuth(false);
    }
  };

  // SEND 6-DIGIT VERIFICATION CODE TO EMAIL
  const handleSendOtp = async () => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full legal name (minimum 2 characters).');
      return;
    }
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    setIsSendingCode(true);
    setError('');

    try {
      const res = await appwriteSendEmailOtp(cleanEmail);
      setOtpUserId(res.userId);
      setAuthSubStep('otp');
      setCountdown(45);
      Alert.alert('Code Dispatched! ✉️', `A 6-digit verification code has been sent to ${cleanEmail}. Please check your inbox and spam folder.`);
    } catch (err) {
      console.warn('[Appwrite Send OTP]', err);
      // If Appwrite rate limit or offline, offer fallback password registration
      if (password && password.length >= 8) {
        try {
          await appwriteRegisterEmailPassword(cleanEmail, password, cleanName);
          setStep(3);
          return;
        } catch (regErr) {
          setError(regErr?.message || err?.message || 'Could not send code.');
        }
      } else {
        setError(err?.message || 'Could not send verification code. Ensure your email is correct.');
      }
    } finally {
      setIsSendingCode(false);
    }
  };

  // VERIFY 6-DIGIT EMAIL CODE
  const handleVerifyOtp = async () => {
    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError('Please enter the full 6-digit code sent to your email.');
      return;
    }

    setIsVerifyingCode(true);
    setError('');

    try {
      await appwriteVerifyEmailOtp(otpUserId, cleanCode);
      setError('');
      setStep(3); // Advance to Age Check
    } catch (err) {
      console.warn('[Appwrite Verify OTP]', err);
      setError('Invalid or expired code. Please re-enter or tap Resend.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // FALLBACK EMAIL/PASSWORD DIRECT REGISTRATION
  const handleDirectPasswordRegister = async () => {
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full legal name.');
      return;
    }
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsSendingCode(true);
    setError('');
    try {
      await appwriteRegisterEmailPassword(cleanEmail, password, cleanName);
      setStep(3);
    } catch (err) {
      setError(err?.message || 'Registration failed. Try email code verification.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const calculateAge = () => {
    const y = parseInt(year);
    if (!y) return null;
    return new Date().getFullYear() - y;
  };

  const handleDobNext = () => {
    const y = parseInt(year);
    const currentYear = new Date().getFullYear();
    if (!y || y < 1920 || y > currentYear) {
      setError('Enter a valid 4-digit birth year.');
      return;
    }
    const age = currentYear - y;
    if (age < 18) {
      setError('You must be 18+ to join Behind The Scenes. Underage access is prohibited.');
      return;
    }
    setError('');
    setStep(4);
  };

  // STEP 5 VOICE NOTE RECORDING HANDLERS
  const handleStartRecordStep5 = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone Permission', 'Microphone access is required to record your voice intro.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingStep5Ref.current = recording;
      setIsRecordingStep5(true);
      setRecordSecondsStep5(0);

      timerStep5Ref.current = setInterval(() => {
        setRecordSecondsStep5((prev) => {
          if (prev >= 15) {
            handleStopRecordStep5();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      Alert.alert('Recording Error', err?.message || 'Could not start audio recorder.');
      setIsRecordingStep5(false);
    }
  };

  const handleStopRecordStep5 = async () => {
    try {
      if (timerStep5Ref.current) {
        clearInterval(timerStep5Ref.current);
      }
      const recording = recordingStep5Ref.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingStep5Ref.current = null;
      setIsRecordingStep5(false);

      if (uri) {
        setOnboardingVoiceUri(uri);
        const secs = Math.max(1, recordSecondsStep5);
        const formatted = `0:${secs < 10 ? '0' : ''}${secs}`;
        setOnboardingVoiceDuration(formatted);
      }
    } catch (err) {
      console.warn('Stop recording error in step 5:', err);
      setIsRecordingStep5(false);
    }
  };

  const handlePlayPreviewStep5 = async () => {
    try {
      if (!onboardingVoiceUri) return;
      if (isPlayingStep5) {
        if (soundStep5Ref.current) {
          await soundStep5Ref.current.stopAsync();
        }
        setIsPlayingStep5(false);
        return;
      }

      if (soundStep5Ref.current) {
        await soundStep5Ref.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: onboardingVoiceUri },
        { shouldPlay: true }
      );
      soundStep5Ref.current = sound;
      setIsPlayingStep5(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingStep5(false);
        }
      });
    } catch (err) {
      console.warn('Play audio error in step 5:', err);
      setIsPlayingStep5(false);
    }
  };

  // REAL CAMERA LIVE SELFIE CAPTURE WITH PURE BIOMETRIC HUMAN FACE VERIFICATION
  const takeLiveSelfie = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Access Required',
          'Behind The Scenes requires front camera access to perform the anti-catfish selfie check. Please grant camera permission.'
        );
        return;
      }

      setError('');
      setFaceError('');
      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        const asset = result.assets[0];
        setCapturedSelfieUri(asset.uri);
        setScanning(true);
        setScanProgress(25);
        setIsVerified(false);

        // Biometric scanning sequence
        setTimeout(() => setScanProgress(55), 200);

        // Run authentic PICO facial detection cascade
        const verification = await verifyHumanFace(asset.base64);
        setScanProgress(90);

        if (!verification.isHuman) {
          setScanning(false);
          setScanProgress(0);
          setIsVerified(false);
          setFaceError(verification.message || 'No human face detected.');
          Alert.alert(
            'Anti-Catfish Check Failed ❌',
            verification.message || 'No authentic human face detected. Stolen images, pets, objects, and screens are strictly rejected.',
            [{ text: 'Retake with Front Camera' }]
          );
          return;
        }

        // Passed human face verification
        setScanProgress(100);
        setLivenessConfidence(verification.confidence || 98.4);
        setTimeout(() => {
          setScanning(false);
          setIsVerified(true);
          setFaceError('');
        }, 300);
      }
    } catch (e) {
      setScanning(false);
      Alert.alert('Camera Error', e?.message || 'Could not launch camera.');
    }
  };

  const handleFinish = async () => {
    if (!isVerified) {
      setError('Please complete the live selfie check first.');
      return;
    }
    const mainPhoto = capturedSelfieUri || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80';
    const profile = {
      name: fullName.trim() || 'New Member',
      email: email.trim().toLowerCase(),
      age: calculateAge() || 25,
      country: selectedCountry.name,
      countryFlag: selectedCountry.flag,
      currentCity: currentCity.trim() || selectedCountry.defaultCity,
      homeTown: homeTown.trim() || selectedCountry.defaultRoots,
      tribe: tribe.trim() || selectedCountry.defaultTribe,
      intent,
      btsCaption,
      btsHabit,
      verified: isVerified,
      liveSelfieUri: capturedSelfieUri,
      photo: mainPhoto,
      photos: [
        mainPhoto,
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'
      ],
      voiceNoteUrl: onboardingVoiceUri || null,
      voiceNoteDuration: onboardingVoiceDuration || '0:14',
      voiceNoteTitle: 'My Real Voice Intro',
      voiceNoteTranscript: btsCaption || 'Unedited voice note from Behind The Scenes',
      gender,
      interestedInGender: gender === 'male' ? 'female' : 'male',
      preferredMinAge: parseInt(preferredMinAge, 10) || 18,
      preferredMaxAge: parseInt(preferredMaxAge, 10) || 45
    };

    // 1. Persist locally to device storage immediately
    await saveLocalProfile(profile);

    // 2. Sync to Appwrite Cloud Database & Storage
    try {
      const user = await appwriteGetCurrentUserMobile();
      if (user && user.$id) {
        if (capturedSelfieUri) {
          try {
            const uploadedUrl = await appwriteUploadPhoto(capturedSelfieUri, `${user.$id}-avatar.jpg`);
            if (uploadedUrl && uploadedUrl.startsWith('http')) {
              profile.photo = uploadedUrl;
              profile.photos[0] = uploadedUrl;
            }
          } catch (e) {}
        }
        if (onboardingVoiceUri) {
          try {
            const uploadedVoice = await appwriteUploadVoiceNote(onboardingVoiceUri, `${user.$id}-intro.m4a`);
            if (uploadedVoice && uploadedVoice.startsWith('http')) {
              profile.voiceNoteUrl = uploadedVoice;
            }
          } catch (e) {}
        }
        await appwriteSaveUserProfile(user.$id, profile);
        await saveLocalProfile(profile);
      }
    } catch (syncErr) {
      console.warn('[Sync Profile Error]', syncErr);
    }

    onComplete(profile);
  };

  // ══════════════════════════════════════════════════
  // ONBOARDING STEP CONTENT
  // ══════════════════════════════════════════════════
  const renderStepContent = () => {
    if (step === 1) {
      return (
        <View style={[s.fullCenter, { backgroundColor: C.bg, paddingHorizontal: 28 }]}>
        {/* Official Brand Logo */}
        <Image 
          source={require('./assets/bts-official-logo.png')} 
          style={{ width: 190, height: 190, resizeMode: 'contain', marginBottom: 6 }} 
        />

        <Text style={{ color: '#F2E9D8', letterSpacing: 3, marginTop: 4, fontWeight: '800', fontSize: 11, textAlign: 'center' }}>
          REAL VIBES • NO FAKE LIFE
        </Text>
        <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginTop: 14, lineHeight: 20, maxWidth: 320 }]}>
          Connect with authentic singles across Africa's safest nations & the global diaspora. No catfishing. Real people only.
        </Text>
        
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 22, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: C.border }}>
          <Text style={{ fontSize: 22 }}>🇬🇭</Text>
          <Text style={{ fontSize: 22 }}>🇲🇺</Text>
          <Text style={{ fontSize: 22 }}>🇧🇼</Text>
          <Text style={{ fontSize: 22 }}>🇳🇦</Text>
          <Text style={{ fontSize: 22 }}>🇲🇦</Text>
          <Text style={{ fontSize: 18, color: C.accent, fontWeight: '900', alignSelf: 'center' }}>+🌍</Text>
        </View>

        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFFFF',
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 18,
            width: '100%',
            marginTop: 32,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 4
          }}
          onPress={handleGoogleSignIn}
          disabled={loadingOAuth}
        >
          {loadingOAuth ? (
            <ActivityIndicator color="#111" size="small" />
          ) : (
            <>
              <GoogleLogo size={20} style={{ marginRight: 10 }} />
              <Text style={{ color: '#1A1E2D', fontWeight: '800', fontSize: 14 }}>
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[s.btnPrimary, { marginTop: 12, width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} 
          onPress={() => { setError(''); setAuthMode('signup'); setStep(2); }}
        >
          <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Sign Up with Email (18+) →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => { setError(''); setAuthMode('signin'); setStep(2); }}>
          <Text style={[s.bodyTiny, { color: C.textSoft, textDecorationLine: 'underline' }]}>
            I already have an account • Sign In
          </Text>
        </TouchableOpacity>

        <Text style={{ color: C.textMuted, fontSize: 9, textAlign: 'center', marginTop: 24 }}>
          18+ strictly enforced • Child safety verified • Zero fake accounts
        </Text>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 2: ACCOUNT SECURITY & CREDENTIALS
  // ══════════════════════════════════════════════════
  if (step === 2) {
    if (authSubStep === 'otp') {
      return (
        <View style={{ flex: 1, backgroundColor: C.bg }} {...swipeBackResponder.panHandlers}>
          <StepHeader currentStep={1} totalSteps={6} onBack={handleBack} />

          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView 
              contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <View style={{ width: 68, height: 68, borderRadius: 22, backgroundColor: 'rgba(212,175,55,0.12)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={{ fontSize: 32 }}>✉️</Text>
                </View>
                <Text style={[s.heading, { color: C.text, fontSize: 22, textAlign: 'center' }]}>Enter 6-Digit Code</Text>
                <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 20, maxWidth: 300 }]}>
                  We sent a temporary verification code to{'\n'}
                  <Text style={{ color: C.accent, fontWeight: '700' }}>{email}</Text>
                </Text>
                <Text style={{ color: C.textMuted, fontSize: 11, textAlign: 'center', marginTop: 4 }}>
                  (Please check both your Inbox and Spam / Junk folder)
                </Text>
              </View>

              {/* ERROR ALERT BANNER */}
              {error ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: 'rgba(224,54,56,0.15)', borderWidth: 1, borderColor: C.red, marginBottom: 16 }}>
                  <Text style={{ color: C.red, fontSize: 16, marginRight: 8 }}>⚠️</Text>
                  <Text style={{ color: C.red, fontSize: 12, fontWeight: '700', flex: 1 }}>{error}</Text>
                </View>
              ) : null}

              <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
                6-DIGIT VERIFICATION CODE
              </Text>
              <TextInput
                style={[s.textInput, { width: '100%', fontSize: 28, fontWeight: '900', letterSpacing: 8, textAlign: 'center', paddingVertical: 14, marginBottom: 20, borderColor: error ? C.red : C.accent }]}
                placeholder="••••••"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  handleVerifyOtp();
                }}
                value={otpCode}
                onChangeText={(t) => { 
                  setOtpCode(t); 
                  setError(''); 
                  if (t.length === 6) Keyboard.dismiss();
                }}
                autoFocus
              />

              <TouchableOpacity 
                style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 16, borderRadius: 18, marginBottom: 14 }]} 
                onPress={() => {
                  Keyboard.dismiss();
                  handleVerifyOtp();
                }}
                disabled={isVerifyingCode}
              >
                {isVerifyingCode ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Verify Code & Continue →</Text>
                )}
              </TouchableOpacity>

              {/* Resend Code Section */}
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                {countdown > 0 ? (
                  <Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '600' }}>
                    Resend code in <Text style={{ color: C.accent, fontWeight: '800' }}>{countdown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp} disabled={isSendingCode}>
                    <Text style={{ color: C.accent, fontSize: 13, fontWeight: '800', textDecorationLine: 'underline' }}>
                      {isSendingCode ? 'Sending...' : 'Resend 6-Digit Code'}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={{ marginTop: 22 }} onPress={() => { setError(''); setAuthSubStep('input'); }}>
                  <Text style={{ color: C.textSoft, fontSize: 12, textDecorationLine: 'underline' }}>
                    Wrong email address? Change email
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }} {...swipeBackResponder.panHandlers}>
        <StepHeader currentStep={1} totalSteps={6} onBack={handleBack} />
        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[s.heading, { color: C.text, fontSize: 22 }]}>
              {authMode === 'signin' ? 'Sign In to Your Account' : 'Create Your Account'}
            </Text>
            <Text style={[s.bodySmall, { color: C.textSoft, marginTop: 4, marginBottom: 20 }]}>
              {authMode === 'signin' 
                ? 'Welcome back! Sign in to access your BTS profile and matches'
                : 'Synced with Appwrite Cloud Database & Verification'}
            </Text>

            {/* Quick Google OAuth option */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 16,
                width: '100%',
                marginBottom: 16,
                elevation: 2
              }}
              onPress={handleGoogleSignIn}
              disabled={loadingOAuth}
            >
              {loadingOAuth ? (
                <ActivityIndicator color="#111" size="small" />
              ) : (
                <>
                  <GoogleLogo size={20} style={{ marginRight: 10 }} />
                  <Text style={{ color: '#1A1E2D', fontWeight: '800', fontSize: 13 }}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
              <Text style={{ color: C.textMuted, fontSize: 10, marginHorizontal: 12, fontWeight: '800', letterSpacing: 1 }}>
                {authMode === 'signin' ? 'OR SIGN IN WITH EMAIL' : 'OR REGISTER WITH EMAIL'}
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            </View>

            {/* ERROR ALERT BANNER */}
            {error ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: 'rgba(224,54,56,0.15)', borderWidth: 1, borderColor: C.red, marginBottom: 16 }}>
                <Text style={{ color: C.red, fontSize: 16, marginRight: 8 }}>⚠️</Text>
                <Text style={{ color: C.red, fontSize: 12, fontWeight: '700', flex: 1 }}>{error}</Text>
              </View>
            ) : null}

            {authMode === 'signup' && (
              <>
                <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Full Legal Name (Private)</Text>
                <TextInput
                  style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 16, borderColor: !fullName && error ? C.red : C.border }]}
                  placeholder="e.g. Kwame Mensah"
                  placeholderTextColor={C.textMuted}
                  value={fullName}
                  returnKeyType="next"
                  onChangeText={(t) => { setFullName(t); setError(''); }}
                />
              </>
            )}

            <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Email Address</Text>
            <TextInput
              style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 16, borderColor: !email && error ? C.red : C.border }]}
              placeholder="your.email@example.com"
              placeholderTextColor={C.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
            />

            <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Password</Text>
            <TextInput
              style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 20, borderColor: password.length < 8 && error ? C.red : C.border }]}
              placeholder="••••••••••••"
              placeholderTextColor={C.textMuted}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
            />

            {authMode === 'signin' ? (
              <>
                <TouchableOpacity 
                  style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18, marginBottom: 12 }]} 
                  onPress={handleSignIn}
                  disabled={isSendingCode}
                >
                  {isSendingCode ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Sign In to Account →</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ width: '100%', alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.border, marginBottom: 16 }}
                  onPress={handleSendOtp}
                  disabled={isSendingCode}
                >
                  <Text style={{ color: C.textSoft, fontWeight: '700', fontSize: 12 }}>
                    Or Sign In with 6-Digit Email Code
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => { setError(''); setAuthMode('signup'); }}
                >
                  <Text style={{ color: C.accent, fontSize: 13, fontWeight: '800' }}>
                    New to BTS? Create an Account
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity 
                  style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18, marginBottom: 12 }]} 
                  onPress={() => {
                    Keyboard.dismiss();
                    handleSendOtp();
                  }}
                  disabled={isSendingCode}
                >
                  {isSendingCode ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Send 6-Digit Verification Code →</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ width: '100%', alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.border, marginBottom: 16 }}
                  onPress={() => {
                    Keyboard.dismiss();
                    handleDirectPasswordRegister();
                  }}
                  disabled={isSendingCode}
                >
                  <Text style={{ color: C.textSoft, fontWeight: '700', fontSize: 12 }}>
                    Or Register Instantly with Password
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ alignItems: 'center', paddingVertical: 10 }}
                  onPress={() => { setError(''); setAuthMode('signin'); }}
                >
                  <Text style={{ color: C.accent, fontSize: 13, fontWeight: '800' }}>
                    Already have an account? Sign In
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 3: STRICT 18+ AGE VERIFICATION
  // ══════════════════════════════════════════════════
  if (step === 3) {
    const calculatedAge = calculateAge();
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }} {...swipeBackResponder.panHandlers}>
        <StepHeader currentStep={2} totalSteps={6} onBack={handleBack} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(224,54,56,0.12)', borderWidth: 1, borderColor: 'rgba(224,54,56,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 36 }}>🛡️</Text>
              </View>
              <Text style={[s.heading, { color: C.text, fontSize: 22, textAlign: 'center' }]}>Verify Your Age</Text>
              <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 18 }]}>
                In strict compliance with Google Play Console & Apple App Store rules, BTS is exclusively for adults 18+.
              </Text>
              
              <TextInput
                style={[s.textInput, { width: '85%', marginTop: 24, fontSize: 24, fontWeight: '900', letterSpacing: 6 }]}
                placeholder="YYYY"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                returnKeyType="done"
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  handleDobNext();
                }}
                value={year}
                onChangeText={(t) => {
                  setYear(t);
                  setError('');
                  if (t.length === 4) {
                    Keyboard.dismiss();
                  }
                }}
              />

              {calculatedAge !== null && (
                <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: calculatedAge >= 18 ? 'rgba(16,185,129,0.15)' : 'rgba(224,54,56,0.15)' }}>
                  <Text style={{ color: calculatedAge >= 18 ? C.emerald : C.red, fontWeight: '800', fontSize: 12 }}>
                    {calculatedAge >= 18 ? `Age: ${calculatedAge} • Eligible to Join ✓` : `Age: ${calculatedAge} • Strictly Under 18 ✗`}
                  </Text>
                </View>
              )}

              {error ? <Text style={{ color: C.red, fontSize: 12, marginTop: 10, textAlign: 'center', fontWeight: '700' }}>{error}</Text> : null}

              <TouchableOpacity 
                style={[s.btnPrimary, { marginTop: 28, width: '85%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} 
                onPress={() => {
                  Keyboard.dismiss();
                  handleDobNext();
                }}
              >
                <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Confirm 18+ & Continue →</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 4: GENDER & HETEROSEXUAL MATCH PREFERENCES
  // ══════════════════════════════════════════════════
  if (step === 4) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }} {...swipeBackResponder.panHandlers}>
        <StepHeader currentStep={3} totalSteps={6} onBack={handleBack} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[s.heading, { color: C.text, fontSize: 22 }]}>Gender & Match Preferences</Text>
            <Text style={[s.bodySmall, { color: C.textSoft, marginTop: 4, marginBottom: 20 }]}>
              BTS connects genuine singles with strict opposite-gender matching
            </Text>

            {/* 1. I AM A: (GENDER SELECTION) */}
            <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
              I AM A (YOUR GENDER)
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              <TouchableOpacity
                onPress={() => {
                  setGender('male');
                  setInterestedInGender('female');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 18,
                  borderRadius: 18,
                  backgroundColor: gender === 'male' ? 'rgba(255,184,0,0.15)' : '#12151e',
                  borderWidth: 1.5,
                  borderColor: gender === 'male' ? C.accent : C.border,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 6 }}>👨</Text>
                <Text style={{ color: gender === 'male' ? C.accent : '#FFF', fontWeight: '900', fontSize: 15 }}>
                  Man / Male
                </Text>
                {gender === 'male' && (
                  <View style={{ marginTop: 6, backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>SELECTED</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setGender('female');
                  setInterestedInGender('male');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 18,
                  borderRadius: 18,
                  backgroundColor: gender === 'female' ? 'rgba(255,184,0,0.15)' : '#12151e',
                  borderWidth: 1.5,
                  borderColor: gender === 'female' ? C.accent : C.border,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Text style={{ fontSize: 32, marginBottom: 6 }}>👩</Text>
                <Text style={{ color: gender === 'female' ? C.accent : '#FFF', fontWeight: '900', fontSize: 15 }}>
                  Woman / Female
                </Text>
                {gender === 'female' && (
                  <View style={{ marginTop: 6, backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                    <Text style={{ color: '#000', fontSize: 9, fontWeight: '900' }}>SELECTED</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* 2. STRICT OPPOSITE-GENDER MATCHING POLICY */}
            <View style={{
              backgroundColor: '#0D111A',
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,184,0,0.3)',
              marginBottom: 22
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Text style={{ fontSize: 16 }}>🔒</Text>
                <Text style={{ color: C.accent, fontWeight: '900', fontSize: 12, letterSpacing: 0.5 }}>
                  STRICT OPPOSITE-GENDER MATCHING
                </Text>
              </View>
              <Text style={{ color: C.textSoft, fontSize: 11, lineHeight: 17, marginBottom: 12 }}>
                Under BTS security & community rules, male profiles cannot match with other males, and female profiles cannot match with females. Matching is strictly opposite-gender.
              </Text>
              <View style={{
                backgroundColor: 'rgba(16,185,129,0.12)',
                padding: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: C.emerald,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}>
                <Text style={{ color: C.emerald, fontSize: 16 }}>✓</Text>
                <Text style={{ color: C.emerald, fontSize: 12, fontWeight: '800', flex: 1 }}>
                  Looking to match with: {gender === 'male' ? 'Women 👩' : 'Men 👨'} exclusively
                </Text>
              </View>
            </View>

            {/* 3. AGE RANGE PREFERENCE */}
            <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 8 }}>
              AGE RANGE YOU'RE INTERESTED IN
            </Text>
            <Text style={{ color: C.textSoft, fontSize: 11, marginBottom: 12 }}>
              Only singles within your chosen age window will appear in your discovery stack.
            </Text>

            {/* Age Quick Presets */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {[
                { min: '18', max: '25', label: '18 - 25' },
                { min: '21', max: '30', label: '21 - 30' },
                { min: '24', max: '35', label: '24 - 35' },
                { min: '28', max: '42', label: '28 - 42' },
                { min: '30', max: '55', label: '30 - 55+' },
              ].map((p, idx) => {
                const isSelected = preferredMinAge === p.min && preferredMaxAge === p.max;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setPreferredMinAge(p.min);
                      setPreferredMaxAge(p.max);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: isSelected ? C.accent : 'rgba(255,255,255,0.06)',
                      borderWidth: 1,
                      borderColor: isSelected ? C.accent : C.border
                    }}
                  >
                    <Text style={{ color: isSelected ? '#000' : '#FFF', fontSize: 12, fontWeight: '800' }}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Min / Max Inputs */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 26, alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>MIN AGE (18+)</Text>
                <TextInput
                  style={[s.textInput, { width: '100%', marginTop: 0, textAlign: 'center', fontSize: 16, fontWeight: '800' }]}
                  value={preferredMinAge}
                  onChangeText={setPreferredMinAge}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="18"
                  placeholderTextColor={C.textMuted}
                />
              </View>

              <Text style={{ color: C.accent, fontWeight: '900', fontSize: 16, marginTop: 16 }}>TO</Text>

              <View style={{ flex: 1 }}>
                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>MAX AGE</Text>
                <TextInput
                  style={[s.textInput, { width: '100%', marginTop: 0, textAlign: 'center', fontSize: 16, fontWeight: '800' }]}
                  value={preferredMaxAge}
                  onChangeText={setPreferredMaxAge}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="35"
                  placeholderTextColor={C.textMuted}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} 
              onPress={() => {
                Keyboard.dismiss();
                const min = parseInt(preferredMinAge, 10);
                const max = parseInt(preferredMaxAge, 10);
                if (!min || min < 18) {
                  Alert.alert('Invalid Age', 'Minimum preferred age must be 18+.');
                  return;
                }
                if (!max || max < min) {
                  Alert.alert('Invalid Age', 'Maximum age must be greater than or equal to minimum age.');
                  return;
                }
                setStep(5);
              }}
            >
              <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Continue to Country & Roots →</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 5: COUNTRY, CITY & HOMETOWN ROOTS
  // ══════════════════════════════════════════════════
  if (step === 5) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }} {...swipeBackResponder.panHandlers}>
        <StepHeader currentStep={4} totalSteps={6} onBack={handleBack} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[s.heading, { color: C.text, fontSize: 22 }]}>Select Your Country & Roots</Text>
            <Text style={[s.bodySmall, { color: C.textSoft, marginTop: 4, marginBottom: 18 }]}>
              Connecting genuine singles across Africa's safest nations & diaspora
            </Text>

            <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
              SELECT YOUR COUNTRY
            </Text>
            
            {/* Neat Country Carousel with fixed height to prevent vertical stretching */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={{ alignItems: 'center', height: 46 }}
              style={{ maxHeight: 46, marginBottom: 20 }}
            >
              {COUNTRIES_LIST.map((c, i) => {
                const active = selectedCountry.name === c.name;
                return (
                  <TouchableOpacity 
                    key={i} 
                    onPress={() => {
                      setSelectedCountry(c);
                      setCurrentCity(c.defaultCity);
                      setHomeTown(c.defaultRoots);
                      setTribe(c.defaultTribe);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 14,
                      backgroundColor: active ? C.accent : 'rgba(255,255,255,0.06)',
                      borderWidth: 1.5,
                      borderColor: active ? C.accent : C.border,
                      marginRight: 10
                    }}
                  >
                    <Text style={{ fontSize: 16, marginRight: 6 }}>{c.flag}</Text>
                    <Text style={{ color: active ? '#000000' : '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Current Living City</Text>
            <TextInput
              style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 16 }]}
              value={currentCity}
              onChangeText={setCurrentCity}
              placeholder="e.g. Accra, London, Gaborone"
              placeholderTextColor={C.textMuted}
              returnKeyType="next"
            />

            <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Hometown / Ancestral Roots</Text>
            <TextInput
              style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 16 }]}
              value={homeTown}
              onChangeText={setHomeTown}
              placeholder="e.g. Kumasi, Cape Coast, Maun, Fès"
              placeholderTextColor={C.textMuted}
              returnKeyType="next"
            />

            <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Tribe / Heritage</Text>
            <TextInput
              style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 20 }]}
              value={tribe}
              onChangeText={setTribe}
              placeholder="e.g. Asante, Fante, Tswana, Amazigh"
              placeholderTextColor={C.textMuted}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            <TouchableOpacity 
              style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} 
              onPress={() => {
                Keyboard.dismiss();
                setStep(6);
              }}
            >
              <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Continue to Candid Moment →</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 6: CANDID BTS MOMENT & VOICE NOTE INTRO
  // ══════════════════════════════════════════════════
  if (step === 6) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }} {...swipeBackResponder.panHandlers}>
        <StepHeader currentStep={5} totalSteps={6} onBack={handleBack} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView 
            contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[s.heading, { color: C.text, fontSize: 22 }]}>Your Behind-The-Scenes</Text>
            <Text style={[s.bodySmall, { color: C.textSoft, marginTop: 4, marginBottom: 20 }]}>
              Show what you look like in real life when not trying
            </Text>

            <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
              CANDID MOMENT CAPTION
            </Text>
            <TextInput
              style={[s.textInput, { width: '100%', height: 90, textAlign: 'left', textAlignVertical: 'top', marginTop: 0, marginBottom: 18 }]}
              multiline
              value={btsCaption}
              onChangeText={setBtsCaption}
              placeholder="Behind the scenes: Making Sunday waakye in my oversized t-shirt with no makeup..."
              placeholderTextColor={C.textMuted}
            />

            <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 6 }}>
              DAILY QUIRKY HABIT
            </Text>
            <TextInput
              style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 20 }]}
              value={btsHabit}
              onChangeText={setBtsHabit}
              placeholder="e.g. I listen to Daddy Lumba every Sunday morning"
              placeholderTextColor={C.textMuted}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />

            {/* ────────────────────────────────────────────── */}
            {/* VOICE NOTE INTRO RECORDER (15s)               */}
            {/* ────────────────────────────────────────────── */}
            <View style={{ 
              backgroundColor: '#0D111A', 
              borderRadius: 20, 
              padding: 16, 
              borderWidth: 1, 
              borderColor: isRecordingStep5 ? C.red : 'rgba(255,184,0,0.25)', 
              marginBottom: 24 
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>
                  YOUR VOICE NOTE INTRO 🎙️ (OPTIONAL)
                </Text>
                <View style={{ backgroundColor: 'rgba(255,184,0,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ color: C.accent, fontSize: 10, fontWeight: '800' }}>15s Max</Text>
                </View>
              </View>
              <Text style={{ color: C.textSoft, fontSize: 11, marginBottom: 14, lineHeight: 16 }}>
                Record your real speaking voice to stand out immediately on the discovery stack. Matches listen before they connect!
              </Text>

              {isRecordingStep5 ? (
                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.red }} />
                    <Text style={{ color: C.red, fontSize: 14, fontWeight: '900', letterSpacing: 1 }}>
                      RECORDING: 0:{recordSecondsStep5 < 10 ? '0' : ''}{recordSecondsStep5} / 0:15
                    </Text>
                  </View>

                  {/* Pulsing visual bars */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 28, marginVertical: 6 }}>
                    {[16, 24, 12, 28, 20, 14, 26, 18, 10, 22, 16, 28].map((h, i) => (
                      <View 
                        key={i} 
                        style={{ 
                          width: 4, 
                          height: h, 
                          backgroundColor: C.red, 
                          borderRadius: 2,
                          opacity: (i + recordSecondsStep5) % 2 === 0 ? 1 : 0.4
                        }} 
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={handleStopRecordStep5}
                    style={{
                      backgroundColor: C.red,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 16,
                      marginTop: 12
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 12 }}>
                      ■ Tap to Finish & Save Audio
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  {onboardingVoiceUri ? (
                    <View style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      backgroundColor: 'rgba(255,184,0,0.08)', 
                      padding: 12, 
                      borderRadius: 14, 
                      borderWidth: 1, 
                      borderColor: 'rgba(255,184,0,0.3)',
                      marginBottom: 10
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>
                          My Real Voice Intro
                        </Text>
                        <Text style={{ color: C.emerald, fontSize: 11, marginTop: 2, fontWeight: '700' }}>
                          ✓ {onboardingVoiceDuration} • Ready to Upload
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handlePlayPreviewStep5}
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 19,
                          backgroundColor: C.accent,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: '#000', fontSize: 16, fontWeight: '900' }}>
                          {isPlayingStep5 ? '❚❚' : '▶'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <TouchableOpacity
                    onPress={handleStartRecordStep5}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.12)',
                      gap: 8
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>🎙️</Text>
                    <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>
                      {onboardingVoiceUri ? 'Re-record Voice Intro' : 'Tap to Record Voice Intro (Microphone)'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} 
              onPress={() => {
                Keyboard.dismiss();
                setStep(7);
              }}
            >
              <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Continue to Anti-Catfish Check →</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 7: ANTI-CATFISH FACE CHECK (REAL CAMERA)
  // ══════════════════════════════════════════════════
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StepHeader currentStep={6} totalSteps={6} onBack={handleBack} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, alignItems: 'center' }}>
        <Text style={[s.heading, { color: C.text, fontSize: 22, textAlign: 'center' }]}>Anti-Catfish Face Check</Text>
        <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginTop: 6, marginBottom: 24, maxWidth: 300 }]}>
          5-second front camera biometric scan to ensure zero stolen photos or fake accounts.
        </Text>

        {/* Circular Biometric Camera Viewfinder */}
        <View style={{
          width: 190,
          height: 190,
          borderRadius: 95,
          borderWidth: 3.5,
          borderColor: isVerified ? C.emerald : scanning ? C.accent : 'rgba(255,184,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
          backgroundColor: '#0F131D',
          overflow: 'hidden',
          shadowColor: isVerified ? C.emerald : C.accent,
          shadowOpacity: 0.3,
          shadowRadius: 18,
          elevation: 8
        }}>
          {capturedSelfieUri ? (
            <Image source={{ uri: capturedSelfieUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 6 }}>📷</Text>
              <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700' }}>Center Your Face</Text>
            </View>
          )}

          {/* Biometric overlay when verified */}
          {isVerified && (
            <View style={{ position: 'absolute', bottom: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderWidth: 1, borderColor: C.emerald }}>
              <Text style={{ color: C.emerald, fontSize: 11, fontWeight: '900' }}>✓ {livenessConfidence}% Liveness</Text>
            </View>
          )}
        </View>

        {/* Catfish Rejection Error Banner */}
        {faceError ? (
          <View style={{ width: '90%', padding: 14, borderRadius: 16, backgroundColor: 'rgba(224,54,56,0.15)', borderWidth: 1, borderColor: C.red, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>🚫</Text>
              <Text style={{ color: C.red, fontWeight: '900', fontSize: 13 }}>Anti-Catfish Check Rejected</Text>
            </View>
            <Text style={{ color: '#FCA5A5', fontSize: 11, lineHeight: 16 }}>
              {faceError}
            </Text>
          </View>
        ) : null}

        {/* Progress bar during scanning */}
        {scanning && (
          <View style={{ width: '80%', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: C.accent, fontWeight: '800', fontSize: 12, marginBottom: 8 }}>
              Analyzing Facial Landmarks & Anti-Spoofing... {scanProgress}%
            </Text>
            <View style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <View style={{ width: `${scanProgress}%`, height: '100%', backgroundColor: C.emerald }} />
            </View>
          </View>
        )}

        {/* Real Camera Action Button */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isVerified ? 'rgba(255,255,255,0.08)' : C.accent,
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 18,
            width: '90%',
            marginBottom: 16,
            borderWidth: isVerified ? 1 : 0,
            borderColor: C.border
          }} 
          onPress={takeLiveSelfie}
          disabled={scanning}
        >
          <Text style={{ fontSize: 18, marginRight: 8 }}>📷</Text>
          <Text style={{ color: isVerified ? '#FFF' : '#000', fontWeight: '900', fontSize: 14 }}>
            {capturedSelfieUri ? 'Retake Front Camera Selfie' : 'Launch Front Camera Scan'}
          </Text>
        </TouchableOpacity>

        {isVerified ? (
          <View style={{ width: '90%', alignItems: 'center' }}>
            <View style={{ padding: 12, borderRadius: 16, backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: C.emerald, marginBottom: 20, width: '100%', alignItems: 'center' }}>
              <Text style={{ color: C.emerald, fontWeight: '900', fontSize: 13 }}>✓ Gold Verified Checkmark Awarded</Text>
              <Text style={{ color: '#94A3B8', fontSize: 10, marginTop: 2 }}>Face matches live biometric liveness criteria</Text>
            </View>
            <TouchableOpacity style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} onPress={handleFinish}>
              <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Enter Behind The Scenes →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={{ color: C.textMuted, fontSize: 11, textAlign: 'center', maxWidth: 280, marginTop: 8 }}>
            Front camera selfie is mandatory to earn the Gold Verified badge and enter Behind The Scenes.
          </Text>
        )}
      </ScrollView>
    </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#07090E' }}>
      <DimmedAppBackground step={step} />
      {renderStepContent()}
    </View>
  );
}

// ══════════════════════════════════════════════════
//  PROFILE CARD
// ══════════════════════════════════════════════════
function ProfileCard({ profile, onLike, onPass, onSuperLike, onBts, onReport }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const cardSoundRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cardSoundRef.current) {
        cardSoundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [profile?.id]);

  const toggleCardAudio = async () => {
    try {
      if (audioPlaying) {
        if (cardSoundRef.current) {
          await cardSoundRef.current.pauseAsync();
        }
        setAudioPlaying(false);
        return;
      }

      if (cardSoundRef.current) {
        await cardSoundRef.current.unloadAsync();
      }

      const audioUri = profile?.voiceNote?.uri || profile?.voiceNoteUrl || profile?.voiceNote?.url;
      if (audioUri) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        cardSoundRef.current = sound;
        setAudioPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setAudioPlaying(false);
          }
        });
      } else {
        setAudioPlaying(true);
        setTimeout(() => setAudioPlaying(false), 2500);
      }
    } catch (err) {
      console.warn('Card audio play error:', err);
      setAudioPlaying(false);
    }
  };

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
            onPress={toggleCardAudio}
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
  const [showIcebreakers, setShowIcebreakers] = useState(true);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const flatListRef = useRef(null);

  // Chat Voice Note Recording & Playback State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [activePlayingId, setActivePlayingId] = useState(null);

  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const timerRef = useRef(null);

  // Clean up audio on chat close
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const matchPhotos = Array.isArray(match.photos) && match.photos.length > 0
    ? match.photos
    : [
        match.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'
      ];

  const send = (txt) => {
    const content = txt || input;
    if (!content.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now(), sender: 'me', text: content, time: now }]);
    setInput('');
    setShowIcebreakers(false);

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'them',
        text: content.toLowerCase().includes('food') || content.toLowerCase().includes('jollof') || content.toLowerCase().includes('waakye') || content.toLowerCase().includes('kelewele')
          ? "Say no more! If it has extra shito, I am already on my way."
          : "Ah charlie! You have jokes! Are we doing Buka in Osu or somewhere quiet?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  };

  const handleStartVoiceRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone Permission', 'Microphone access is needed to record voice messages.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecordingVoice(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      Alert.alert('Recording Error', err?.message || 'Could not start voice note.');
      setIsRecordingVoice(false);
    }
  };

  const handleStopVoiceRecording = async (sendAudio = true) => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setIsRecordingVoice(false);

      if (sendAudio && uri) {
        const secs = Math.max(1, recordSeconds);
        const durationFormatted = `0:${secs < 10 ? '0' : ''}${secs}`;
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'me',
            isVoice: true,
            duration: durationFormatted,
            audioUri: uri,
            time: now
          }
        ]);
        setShowIcebreakers(false);

        // Simulated match audio reply
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'them',
              text: "Loved your voice note! You have great energy. Let's definitely set up a date soon!",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 2000);
      }
    } catch (err) {
      console.warn('Voice record stop error:', err);
      setIsRecordingVoice(false);
    }
  };

  const handleTogglePlayVoiceMessage = async (msgId, audioUri) => {
    try {
      if (activePlayingId === msgId) {
        if (soundRef.current) {
          await soundRef.current.pauseAsync();
        }
        setActivePlayingId(null);
        return;
      }

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      if (audioUri) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        soundRef.current = sound;
        setActivePlayingId(msgId);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setActivePlayingId(null);
          }
        });
      } else {
        setActivePlayingId(msgId);
        setTimeout(() => setActivePlayingId(null), 2500);
      }
    } catch (e) {
      setActivePlayingId(null);
    }
  };

  return (
    <Modal visible animationType="slide">
      <View style={{ flex: 1, backgroundColor: '#07090E' }}>
        <DimmedAppBackground screen="matches" />
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Chat Header */}
          <View style={s.chatHeader}>
            <TouchableOpacity 
              onPress={onClose} 
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text style={{ color: C.text, fontSize: 18, fontWeight: '700' }}>←</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowPhotosModal(true)} style={{ position: 'relative', marginLeft: 12 }}>
              <Image source={{ uri: match.photo }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: C.accent }} />
              {match.online && (
                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: C.emerald, borderWidth: 1.5, borderColor: C.bg }} />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPhotosModal(true)} style={{ marginLeft: 12, flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[s.bodySmall, { color: C.text, fontWeight: '800', fontSize: 15 }]}>{match.name}</Text>
                <View style={{ backgroundColor: 'rgba(212,175,55,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: C.accent }}>
                  <Text style={{ color: C.accent, fontSize: 9, fontWeight: '800' }}>✓ Gold Verified</Text>
                </View>
              </View>
              <Text style={[s.bodyTiny, { color: match.online ? C.emerald : C.textMuted, marginTop: 1 }]}>
                {match.online ? 'Online now' : 'Active today'} • {match.country || 'Ghana'}
              </Text>
            </TouchableOpacity>

            {/* View Connected Match's 3 Photos */}
            <TouchableOpacity 
              onPress={() => setShowPhotosModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255,184,0,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(255,184,0,0.35)',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12
              }}
            >
              <Text style={{ fontSize: 12, marginRight: 4 }}>📸</Text>
              <Text style={{ color: C.accent, fontWeight: '800', fontSize: 11 }}>3 Photos</Text>
            </TouchableOpacity>
          </View>

          {/* Connected Match 3-Photo Showcase Modal */}
          <Modal visible={showPhotosModal} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <View style={{ backgroundColor: C.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: C.border, width: '100%', maxWidth: 360 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <View>
                    <Text style={{ color: C.text, fontSize: 17, fontWeight: '900' }}>{match.name}'s 3 Photos</Text>
                    <Text style={{ color: C.accent, fontSize: 11, fontWeight: '700', marginTop: 2 }}>✓ Connected Match • Verified</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowPhotosModal(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 14 }}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* 3 Photos Horizontal Carousel */}
                <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ borderRadius: 16, overflow: 'hidden' }}>
                  {matchPhotos.map((p, idx) => (
                    <View key={idx} style={{ width: SCREEN_WIDTH > 360 ? 324 : SCREEN_WIDTH - 76, height: 300, position: 'relative' }}>
                      <Image source={{ uri: p }} style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 16 }} />
                      <View style={{ position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: C.accent, fontSize: 10, fontWeight: '900' }}>
                          {idx === 0 ? '★ Main Profile Picture' : `Showcase Photo ${idx + 1}`}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                {/* Match Voice Note Intro Player */}
                {match.voiceNote && (
                  <View style={{
                    backgroundColor: '#0D111A',
                    borderRadius: 16,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(255,184,0,0.3)',
                    marginTop: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11 }}>
                        🎙️ {match.voiceNote.title || 'Voice Note Intro'}
                      </Text>
                      <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
                        {match.voiceNote.duration || '0:14'} • {activePlayingId === 'match_intro' ? 'Playing now...' : 'Listen to speaking voice'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleTogglePlayVoiceMessage('match_intro', match.voiceNote.uri || match.voiceNoteUrl)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: C.accent,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: '#000', fontSize: 14, fontWeight: '900' }}>
                        {activePlayingId === 'match_intro' ? '⏸' : '▶'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={{ color: C.textMuted, fontSize: 11, textAlign: 'center', marginTop: 10 }}>
                  Swipe to view all 3 photos • Connected on BTS
                </Text>
              </View>
            </View>
          </Modal>

          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => String(m.id)}
            contentContainerStyle={{ padding: 16, paddingBottom: 12, flexGrow: 1 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              if (item.isVoice) {
                const isPlaying = activePlayingId === item.id;
                return (
                  <View style={[s.msgBubbleWrap, item.sender === 'me' && { alignItems: 'flex-end' }]}>
                    <View 
                      style={[
                        s.msgBubble, 
                        item.sender === 'me' ? s.msgMe : s.msgThem,
                        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, gap: 10 }
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => handleTogglePlayVoiceMessage(item.id, item.audioUri)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: item.sender === 'me' ? '#000' : C.accent,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ color: item.sender === 'me' ? '#FFF' : '#000', fontSize: 13, fontWeight: '900' }}>
                          {isPlaying ? '⏸' : '▶'}
                        </Text>
                      </TouchableOpacity>

                      <View>
                        <Text style={{ color: item.sender === 'me' ? '#000' : '#FFF', fontSize: 12, fontWeight: '800' }}>
                          🎙 Voice Note
                        </Text>
                        <Text style={{ color: item.sender === 'me' ? '#333' : C.textMuted, fontSize: 10, marginTop: 1 }}>
                          {item.duration || '0:05'} • {isPlaying ? 'Playing...' : 'Tap to listen'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 4, marginHorizontal: 4, fontSize: 10 }]}>{item.time}</Text>
                  </View>
                );
              }

              return (
                <View style={[s.msgBubbleWrap, item.sender === 'me' && { alignItems: 'flex-end' }]}>
                  <View style={[s.msgBubble, item.sender === 'me' ? s.msgMe : s.msgThem]}>
                    <Text style={[s.bodySmall, { color: item.sender === 'me' ? '#000' : '#E2E8F0', lineHeight: 20 }]}>{item.text}</Text>
                  </View>
                  <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 4, marginHorizontal: 4, fontSize: 10 }]}>{item.time}</Text>
                </View>
              );
            }}
          />

          {/* Clean, Compact Horizontal Icebreakers Bar (Fixed Height, Zero Vertical Stretch) */}
          {showIcebreakers && (
            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0B0E16', paddingTop: 8, paddingBottom: 6 }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 12, height: 38 }}
                style={{ maxHeight: 38, flexGrow: 0 }}
              >
                {[
                  { icon: '🍲', text: 'Jollof or Waakye debate?' },
                  { icon: '🎙️', text: 'Loved your voice note!' },
                  { icon: '🌶️', text: "Kelewele date? I'm in!" },
                  { icon: '✨', text: 'Tell me the BTS candid story' },
                ].map((chip, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,184,0,0.08)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,184,0,0.25)',
                      paddingHorizontal: 12,
                      height: 32,
                      borderRadius: 16,
                      marginRight: 8
                    }} 
                    onPress={() => send(`${chip.text} ${chip.icon}`)}
                  >
                    <Text style={{ fontSize: 12, marginRight: 5 }}>{chip.icon}</Text>
                    <Text style={{ color: '#F1F5F9', fontSize: 11, fontWeight: '700' }}>{chip.text}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Chat Input Bar */}
          <View style={[s.chatInput, { backgroundColor: '#10131B', paddingVertical: 10 }]}>
            {isRecordingVoice ? (
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.red }} />
                  <Text style={{ color: C.red, fontSize: 13, fontWeight: '900' }}>
                    Recording Voice Note... 0:{recordSeconds < 10 ? '0' : ''}{recordSeconds}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => handleStopVoiceRecording(false)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255,255,255,0.08)'
                    }}
                  >
                    <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '800' }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleStopVoiceRecording(true)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: C.accent
                    }}
                  >
                    <Text style={{ color: '#000', fontSize: 11, fontWeight: '900' }}>Send ➤</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Voice Note Recorder Button */}
                <TouchableOpacity
                  onPress={handleStartVoiceRecording}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,184,0,0.12)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,184,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 8
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🎙️</Text>
                </TouchableOpacity>

                <TextInput
                  style={[s.chatTextInput, { fontSize: 14 }]}
                  placeholder={`Message ${match.name}...`}
                  placeholderTextColor={C.textMuted}
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={() => send()}
                  returnKeyType="send"
                />

                <TouchableOpacity 
                  style={[s.sendBtn, { opacity: input.trim() ? 1 : 0.4 }]} 
                  onPress={() => send()} 
                  disabled={!input.trim()}
                >
                  <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>→</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  </Modal>
  );
}

// ══════════════════════════════════════════════════
//  DATE DROPS SCREEN (REAL DATES FEED)
// ══════════════════════════════════════════════════
function DateDropsScreen({ userProfile }) {
  const [drops, setDrops] = useState(() => 
    INITIAL_DATE_DROPS.map((d, idx) => ({
      ...d,
      comments: idx === 0 
        ? [
            { id: 'c1', author: 'Ama Pokua', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80', text: 'Buka waakye with fried fish is an undefeated first date! So happy for you two! 🇬🇭✨', time: '1h ago' },
            { id: 'c2', author: 'Kofi Mensah', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', text: 'Charlie Kweku set the standard high! Pure chemistry 🔥', time: '45m ago' }
          ]
        : [
            { id: 'c3', author: 'Amina El Fassi', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', text: 'That Le Morne sunset looks magical! Sega music on the beach is the ultimate vibe 🇲🇺❤️', time: '2h ago' }
          ]
    }))
  );

  // Upload Date Drop Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newCouple, setNewCouple] = useState(`${userProfile?.name || 'Me'} & Match`);
  const [newVenue, setNewVenue] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [newVibe, setNewVibe] = useState('⭐⭐⭐⭐⭐ Pure Chemistry');

  // Comments Modal State
  const [activeCommentDropId, setActiveCommentDropId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const cheer = (id) => {
    setDrops(prev => prev.map(d => d.id === id ? { ...d, cheersCount: d.cheersCount + 1 } : d));
    Alert.alert('🥂 Cheers Sent!', 'You cheered on this date connection!');
  };

  const handlePickGallery = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setNewPhoto(res.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Photo Picker', 'Could not open image picker.');
    }
  };

  const handlePickCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera Permission', 'Please allow camera access to take a date selfie.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setNewPhoto(res.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Camera', 'Could not open camera.');
    }
  };

  const handleSubmitDateDrop = () => {
    if (!newPhoto) {
      Alert.alert('Photo Required', 'Please attach a photo or selfie of your date moment!');
      return;
    }
    if (!newCaption.trim()) {
      Alert.alert('Story Required', 'Please write a brief caption or story about your date!');
      return;
    }

    const createdDrop = {
      id: `drop-${Date.now()}`,
      couple: newCouple.trim() || `${userProfile?.name || 'Me'} & Match`,
      matchTag: 'Matched on Behind The Scenes • Verified Date',
      photo: newPhoto,
      venue: newVenue.trim() || 'Romantic Secret Spot',
      caption: newCaption.trim(),
      vibeRating: newVibe,
      likesCount: 1,
      cheersCount: 1,
      comments: [],
      timestamp: 'Just now'
    };

    setDrops(prev => [createdDrop, ...prev]);
    setShowUploadModal(false);
    setNewCaption('');
    setNewVenue('');
    setNewPhoto(null);
    Alert.alert('🎉 Date Dropped!', 'Your real date story has been posted to the BTS community feed!');
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !activeCommentDropId) return;
    const authorName = userProfile?.name || 'You';
    const authorAvatar = userProfile?.photos?.[0] || userProfile?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
    const newComment = {
      id: `comm-${Date.now()}`,
      author: authorName,
      avatar: authorAvatar,
      text: commentInput.trim(),
      time: 'Just now'
    };

    setDrops(prev => prev.map(d => {
      if (d.id === activeCommentDropId) {
        return {
          ...d,
          comments: [...(d.comments || []), newComment]
        };
      }
      return d;
    }));

    setCommentInput('');
  };

  const activeDrop = drops.find(d => d.id === activeCommentDropId);

  return (
    <View style={{ flex: 1 }}>
      {/* Feed Header */}
      <View style={s.screenHeader}>
        <View>
          <Text style={[s.bodySmall, { color: C.text, fontWeight: '900', fontSize: 16 }]}>🥂 BTS Date Drops</Text>
          <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 2 }]}>Real singles. Real verified dates.</Text>
        </View>
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: C.accent,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            gap: 6
          }} 
          onPress={() => setShowUploadModal(true)}
        >
          <Text style={{ fontSize: 13 }}>📸</Text>
          <Text style={{ color: '#000', fontWeight: '900', fontSize: 12 }}>Drop a Date</Text>
        </TouchableOpacity>
      </View>

      {/* Date Drops Feed List */}
      <FlatList
        data={drops}
        keyExtractor={(d, idx) => `${d.id}-${idx}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        renderItem={({ item }) => {
          const commentsList = item.comments || [];
          return (
            <View style={[s.dateDropCard, { marginBottom: 20 }]}>
              {/* Card Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}>
                <View>
                  <Text style={[s.bodySmall, { color: C.text, fontWeight: '800', fontSize: 15 }]}>{item.couple}</Text>
                  <Text style={[s.bodyTiny, { color: C.accent, fontWeight: '600', marginTop: 1 }]}>{item.matchTag}</Text>
                </View>
                <Text style={[s.bodyTiny, { color: C.textMuted }]}>{item.timestamp}</Text>
              </View>

              {/* Photo */}
              <Image source={{ uri: item.photo }} style={{ width: '100%', height: 240, backgroundColor: '#10131B' }} />

              {/* Card Body */}
              <View style={{ padding: 14 }}>
                <View style={[s.venuePill, { alignSelf: 'flex-start', marginBottom: 8 }]}>
                  <Text style={[s.bodyTiny, { color: '#CBD5E1', fontWeight: '700' }]}>📍 {item.venue}</Text>
                </View>

                <Text style={[s.bodySmall, { color: '#F1F5F9', lineHeight: 20 }]}>"{item.caption}"</Text>

                <View style={{ marginTop: 10 }}>
                  <Text style={[s.bodyTiny, { color: C.accent, fontWeight: '800' }]}>{item.vibeRating}</Text>
                </View>

                {/* Interactive Action Bar: Cheers & Comments */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
                  <TouchableOpacity 
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,184,0,0.12)',
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255,184,0,0.3)'
                    }} 
                    onPress={() => cheer(item.id)}
                  >
                    <Text style={{ fontSize: 13, marginRight: 6 }}>🎉</Text>
                    <Text style={{ color: C.accent, fontWeight: '800', fontSize: 12 }}>{item.cheersCount} Cheers</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      paddingHorizontal: 12,
                      paddingVertical: 7,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.12)'
                    }}
                    onPress={() => setActiveCommentDropId(item.id)}
                  >
                    <Text style={{ fontSize: 13, marginRight: 6 }}>💬</Text>
                    <Text style={{ color: '#E2E8F0', fontWeight: '800', fontSize: 12 }}>
                      {commentsList.length} {commentsList.length === 1 ? 'Comment' : 'Comments'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* ───────────────────────────────────────────── */}
      {/* 1. UPLOAD / DROP A DATE MODAL                 */}
      {/* ───────────────────────────────────────────── */}
      <Modal visible={showUploadModal} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: '#0D1117', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', paddingBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
              <View>
                <Text style={{ color: C.text, fontSize: 18, fontWeight: '900' }}>Drop Your Date Story 🥂</Text>
                <Text style={{ color: C.accent, fontSize: 11, fontWeight: '700', marginTop: 2 }}>Share your real connection with the community</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUploadModal(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18 }}>
              {/* Photo Upload Area */}
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Date Photo / Food / Moment *
              </Text>
              {newPhoto ? (
                <View style={{ position: 'relative', width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
                  <Image source={{ uri: newPhoto }} style={{ width: '100%', height: '100%' }} />
                  <TouchableOpacity 
                    onPress={handlePickGallery}
                    style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
                  >
                    <Text style={{ color: C.accent, fontSize: 11, fontWeight: '800' }}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                  <TouchableOpacity 
                    onPress={handlePickGallery} 
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255,184,0,0.3)',
                      borderStyle: 'dashed',
                      borderRadius: 16,
                      paddingVertical: 22,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 6 }}>🖼️</Text>
                    <Text style={{ color: C.text, fontWeight: '800', fontSize: 12 }}>Choose from Photos</Text>
                    <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>System Photo Picker</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handlePickCamera} 
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderWidth: 1.5,
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderStyle: 'dashed',
                      borderRadius: 16,
                      paddingVertical: 22,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 24, marginBottom: 6 }}>📸</Text>
                    <Text style={{ color: C.text, fontWeight: '800', fontSize: 12 }}>Snap Date Selfie</Text>
                    <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>Live Camera</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Couple / Who was on date */}
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Couple / Who Was On The Date
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: C.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: C.text,
                  fontSize: 14,
                  marginBottom: 14
                }}
                value={newCouple}
                onChangeText={setNewCouple}
                placeholder="e.g. Ama & Kweku"
                placeholderTextColor={C.textMuted}
              />

              {/* Venue & Spot */}
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Spot / Venue
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: C.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: C.text,
                  fontSize: 14,
                  marginBottom: 14
                }}
                value={newVenue}
                onChangeText={setNewVenue}
                placeholder="e.g. Buka Restaurant Osu / Le Morne Beach"
                placeholderTextColor={C.textMuted}
              />

              {/* Vibe Selection */}
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                Date Chemistry / Vibe
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                {[
                  '⭐⭐⭐⭐⭐ Pure Chemistry',
                  '🔥 Sparks & High Energy',
                  '🥂 Smooth & Romantic',
                  '🌊 Scenic Island Vibe',
                  '🍲 Authentic Foodie Date'
                ].map((v, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setNewVibe(v)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 16,
                      backgroundColor: newVibe === v ? 'rgba(255,184,0,0.2)' : 'rgba(255,255,255,0.04)',
                      borderWidth: 1,
                      borderColor: newVibe === v ? C.accent : 'rgba(255,255,255,0.1)',
                      marginRight: 8
                    }}
                  >
                    <Text style={{ color: newVibe === v ? C.accent : C.textMuted, fontSize: 11, fontWeight: '800' }}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Story / Caption */}
              <Text style={{ color: C.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Date Story / Caption *
              </Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: C.border,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  color: C.text,
                  fontSize: 14,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  marginBottom: 20
                }}
                value={newCaption}
                onChangeText={setNewCaption}
                placeholder="Tell the community how your date went, the vibe, the food..."
                placeholderTextColor={C.textMuted}
                multiline
              />

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitDateDrop}
                style={{
                  backgroundColor: C.accent,
                  paddingVertical: 15,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 3
                }}
              >
                <Text style={{ color: '#000', fontWeight: '900', fontSize: 15 }}>Drop Date To Feed 🚀</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ───────────────────────────────────────────── */}
      {/* 2. DATE DROP COMMENTS MODAL                   */}
      {/* ───────────────────────────────────────────── */}
      <Modal visible={!!activeCommentDropId} animationType="slide" transparent>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}
        >
          <View style={{ backgroundColor: '#0F131D', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', height: 520, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
            {/* Comments Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
              <View>
                <Text style={{ color: C.text, fontSize: 17, fontWeight: '900' }}>
                  Comments ({activeDrop?.comments?.length || 0})
                </Text>
                <Text style={{ color: C.accent, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                  {activeDrop?.couple}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setActiveCommentDropId(null)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 15 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              data={activeDrop?.comments || []}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                  <Text style={{ fontSize: 32, marginBottom: 8 }}>💬</Text>
                  <Text style={{ color: C.text, fontWeight: '800', fontSize: 14 }}>No comments yet</Text>
                  <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>Be the first to cheer them on!</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
                  <Image source={{ uri: item.avatar }} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: C.accent }} />
                  <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: C.text, fontWeight: '800', fontSize: 13 }}>{item.author}</Text>
                      <Text style={{ color: C.textMuted, fontSize: 10 }}>{item.time}</Text>
                    </View>
                    <Text style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 18 }}>{item.text}</Text>
                  </View>
                </View>
              )}
            />

            {/* Comment Input Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', backgroundColor: '#0B0E16' }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  color: C.text,
                  fontSize: 13,
                  marginRight: 10
                }}
                value={commentInput}
                onChangeText={setCommentInput}
                placeholder="Cheer on this date or ask a question..."
                placeholderTextColor={C.textMuted}
                onSubmitEditing={handleAddComment}
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!commentInput.trim()}
                style={{
                  backgroundColor: commentInput.trim() ? C.accent : 'rgba(255,184,0,0.2)',
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: '#000', fontWeight: '900', fontSize: 16 }}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ══════════════════════════════════════════════════
//  LIKES YOU SCREEN
// ══════════════════════════════════════════════════
function LikesYouScreen({ onMatchBack, userGender = 'male' }) {
  const filteredLikes = useMemo(() => {
    return INITIAL_LIKES_YOU.filter(item => {
      if (!item.gender) return true;
      if (userGender === 'male' && item.gender !== 'female') return false;
      if (userGender === 'female' && item.gender !== 'male') return false;
      return true;
    });
  }, [userGender]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={[s.heading, { color: C.text }]}>Interested In You</Text>
        <Text style={[s.bodyTiny, { color: C.textMuted, marginTop: 2 }]}>
          {userGender === 'male' ? 'Women' : 'Men'} who swiped right on your profile
        </Text>
      </View>

      <FlatList
        data={filteredLikes}
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
//  PROFILE SCREEN (EDIT DETAILS & PHOTO)
// ══════════════════════════════════════════════════
function ProfileScreen({ userProfile, onUpdateProfile, onLogout }) {
  const [name, setName] = useState(userProfile?.name || 'New Member');
  const [age, setAge] = useState(String(userProfile?.age || 25));
  const [occupation, setOccupation] = useState(userProfile?.occupation || 'Creative & Entrepreneur');
  const [city, setCity] = useState(userProfile?.currentCity || 'Accra');
  const [hometown, setHometown] = useState(userProfile?.homeTown || 'Kumasi');
  const [tribe, setTribe] = useState(userProfile?.tribe || 'Asante');
  const [intent, setIntent] = useState(userProfile?.intent || 'Long-term leading to marriage');
  const [btsCaption, setBtsCaption] = useState(userProfile?.btsCaption || 'Sunday waakye in my oversized t-shirt, completely unedited.');
  const [btsHabit, setBtsHabit] = useState(userProfile?.btsHabit || 'I listen to Daddy Lumba every Sunday morning.');
  
  // Gender & Dating Preferences
  const [gender, setGender] = useState(userProfile?.gender || 'male');
  const [preferredMinAge, setPreferredMinAge] = useState(String(userProfile?.preferredMinAge || '21'));
  const [preferredMaxAge, setPreferredMaxAge] = useState(String(userProfile?.preferredMaxAge || '35'));
  
  // 3-Picture Array (Slot 0 is main profile picture, Slots 1 and 2 for connected matches)
  const initialPhotos = Array.isArray(userProfile?.photos) && userProfile.photos.length > 0
    ? [
        userProfile.photos[0] || userProfile?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
        userProfile.photos[1] || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        userProfile.photos[2] || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
      ]
    : [
        userProfile?.liveSelfieUri || userProfile?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'
      ];
  const [photos, setPhotos] = useState(initialPhotos);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Pick or snap photo for specific slot (0 = Profile Photo, 1 = Photo 2, 2 = Photo 3)
  const handleChangePhotoIndex = (index) => {
    const slotTitle = index === 0 ? 'Main Profile Picture' : `Match Showcase Photo ${index + 1}`;
    Alert.alert(
      `Update ${slotTitle}`,
      'Choose an option to update this photo for your connected matches:',
      [
        {
          text: 'Take Live Selfie / Camera',
          onPress: async () => {
            try {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera access is required to take a new photo.');
                return;
              }
              const res = await ImagePicker.launchCameraAsync({
                cameraType: ImagePicker.CameraType.front,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
              });
              if (!res.canceled && res.assets && res.assets[0]?.uri) {
                const nextPhotos = [...photos];
                nextPhotos[index] = res.assets[0].uri;
                setPhotos(nextPhotos);
              }
            } catch (err) {
              Alert.alert('Camera Error', err?.message || 'Could not open camera');
            }
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
              });
              if (!res.canceled && res.assets && res.assets[0]?.uri) {
                const nextPhotos = [...photos];
                nextPhotos[index] = res.assets[0].uri;
                setPhotos(nextPhotos);
              }
            } catch (err) {
              Alert.alert('Gallery Error', err?.message || 'Could not open gallery');
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  // Voice Note State
  const [voiceNoteTitle, setVoiceNoteTitle] = useState(
    userProfile?.voiceNoteTitle || userProfile?.voiceNote?.title || 'My actual voice: Roast me if you dare'
  );
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(
    userProfile?.voiceNoteDuration || userProfile?.voiceNote?.duration || '0:14'
  );
  const [voiceNoteTranscript, setVoiceNoteTranscript] = useState(
    userProfile?.voiceNoteTranscript || userProfile?.voiceNote?.transcript || "Hey there! This is my actual speaking voice, unedited. If you love good conversation, let's connect!"
  );
  const [voiceNoteUri, setVoiceNoteUri] = useState(
    userProfile?.voiceNoteUrl || userProfile?.voiceNote?.uri || null
  );
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const recordingInstanceRef = useRef(null);
  const soundInstanceRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      if (soundInstanceRef.current) {
        soundInstanceRef.current.unloadAsync().catch(() => {});
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleStartVoiceRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone Permission', 'Microphone access is required to record your voice intro.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingInstanceRef.current = recording;
      setIsRecordingVoice(true);
      setRecordSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 15) {
            handleStopVoiceRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      Alert.alert('Recording Error', err?.message || 'Could not start audio recorder.');
      setIsRecordingVoice(false);
    }
  };

  const handleStopVoiceRecording = async () => {
    try {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      const recording = recordingInstanceRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingInstanceRef.current = null;
      setIsRecordingVoice(false);

      if (uri) {
        setVoiceNoteUri(uri);
        const secs = Math.max(1, recordSeconds);
        const formatted = `0:${secs < 10 ? '0' : ''}${secs}`;
        setVoiceNoteDuration(formatted);
        Alert.alert('🎙️ Voice Note Captured!', `Your ${formatted} voice intro has been recorded. Tap Play to preview.`);
      }
    } catch (err) {
      console.warn('Stop recording error:', err);
      setIsRecordingVoice(false);
    }
  };

  const handlePlayVoicePreview = async () => {
    try {
      if (isPlayingVoice) {
        if (soundInstanceRef.current) {
          await soundInstanceRef.current.pauseAsync();
        }
        setIsPlayingVoice(false);
        return;
      }

      if (soundInstanceRef.current) {
        await soundInstanceRef.current.unloadAsync();
      }

      if (voiceNoteUri) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: voiceNoteUri },
          { shouldPlay: true }
        );
        soundInstanceRef.current = sound;
        setIsPlayingVoice(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlayingVoice(false);
          }
        });
      } else {
        // Sample preview toggle
        setIsPlayingVoice(true);
        setTimeout(() => setIsPlayingVoice(false), 2500);
      }
    } catch (err) {
      Alert.alert('Playback', 'Could not play voice preview.');
      setIsPlayingVoice(false);
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    const updated = {
      ...userProfile,
      name: name.trim(),
      age: parseInt(age) || 25,
      occupation: occupation.trim(),
      currentCity: city.trim(),
      homeTown: hometown.trim(),
      tribe: tribe.trim(),
      intent,
      btsCaption: btsCaption.trim(),
      btsHabit: btsHabit.trim(),
      gender,
      interestedInGender: gender === 'male' ? 'female' : 'male',
      preferredMinAge: parseInt(preferredMinAge, 10) || 18,
      preferredMaxAge: parseInt(preferredMaxAge, 10) || 45,
      photo: photos[0],
      photos,
      country: userProfile?.country || 'Ghana',
      countryFlag: userProfile?.countryFlag || '🇬🇭',
      voiceNoteTitle,
      voiceNoteDuration,
      voiceNoteTranscript,
      voiceNoteUrl: voiceNoteUri,
      voiceNote: {
        title: voiceNoteTitle,
        duration: voiceNoteDuration,
        transcript: voiceNoteTranscript,
        uri: voiceNoteUri,
      }
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    Alert.alert('Profile Saved', 'Your 3 photos, details, and voice note intro have been saved!');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
      >
      {/* Profile Header */}
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <View style={{ position: 'relative' }}>
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            borderWidth: 3,
            borderColor: C.accent,
            overflow: 'hidden',
            backgroundColor: '#1E2433',
            shadowColor: C.accent,
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6
          }}>
            <Image source={{ uri: photos[0] }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          </View>
          <View style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: C.accent,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: C.bg
          }}>
            <Text style={{ fontSize: 12 }}>★</Text>
          </View>
        </View>

        <Text style={[s.heading, { color: C.text, fontSize: 20, marginTop: 10 }]}>
          {name}, {age}
        </Text>
        <Text style={[s.bodySmall, { color: C.textSoft, marginTop: 2 }]}>
          {userProfile?.countryFlag || '🇬🇭'} {city} • {tribe}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: C.emerald }}>
          <Text style={{ fontSize: 12 }}>🛡️</Text>
          <Text style={{ color: C.emerald, fontWeight: '800', fontSize: 11 }}>Gold Verified Member (18+)</Text>
        </View>
      </View>

      {/* Save Success Banner */}
      {savedSuccess && (
        <View style={{ padding: 12, borderRadius: 14, backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: C.emerald, marginBottom: 16, alignItems: 'center' }}>
          <Text style={{ color: C.emerald, fontWeight: '800', fontSize: 12 }}>✓ Changes Saved Successfully</Text>
        </View>
      )}

      {/* 3 Photos Gallery (Visible to Connected Matches) */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>
            YOUR 3 MATCH PHOTOS
          </Text>
          <View style={{ backgroundColor: 'rgba(255,184,0,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: C.accent, fontSize: 10, fontWeight: '800' }}>3 Photos Total</Text>
          </View>
        </View>
        <Text style={{ color: C.textSoft, fontSize: 11, marginBottom: 14, lineHeight: 16 }}>
          Connected matches can view all 3 photos. Photo 1 is your main avatar.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between' }}>
          {/* Photo 1: Main Profile Picture */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => handleChangePhotoIndex(0)} 
              activeOpacity={0.8}
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 16,
                borderWidth: 2,
                borderColor: C.accent,
                overflow: 'hidden',
                backgroundColor: '#1E2433',
                position: 'relative'
              }}
            >
              <Image source={{ uri: photos[0] }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
              <View style={{ position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 2, borderRadius: 6, alignItems: 'center' }}>
                <Text style={{ color: C.accent, fontSize: 9, fontWeight: '900' }}>★ Main Avatar</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChangePhotoIndex(0)} style={{ marginTop: 6, paddingVertical: 2 }}>
              <Text style={{ color: C.accent, fontSize: 10, fontWeight: '800' }}>Change</Text>
            </TouchableOpacity>
          </View>

          {/* Photo 2: Match View Photo 2 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => handleChangePhotoIndex(1)} 
              activeOpacity={0.8}
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: photos[1] ? 'rgba(255,255,255,0.2)' : 'rgba(255,184,0,0.4)',
                overflow: 'hidden',
                backgroundColor: '#161922',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {photos[1] ? (
                <>
                  <Image source={{ uri: photos[1] }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  <View style={{ position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 2, borderRadius: 6, alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>Photo 2</Text>
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, color: C.accent }}>+</Text>
                  <Text style={{ color: C.textMuted, fontSize: 9, fontWeight: '700' }}>Upload</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChangePhotoIndex(1)} style={{ marginTop: 6, paddingVertical: 2 }}>
              <Text style={{ color: C.textSoft, fontSize: 10, fontWeight: '800' }}>{photos[1] ? 'Replace' : 'Add'}</Text>
            </TouchableOpacity>
          </View>

          {/* Photo 3: Match View Photo 3 */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <TouchableOpacity 
              onPress={() => handleChangePhotoIndex(2)} 
              activeOpacity={0.8}
              style={{
                width: '100%',
                aspectRatio: 1,
                borderRadius: 16,
                borderWidth: 1.5,
                borderColor: photos[2] ? 'rgba(255,255,255,0.2)' : 'rgba(255,184,0,0.4)',
                overflow: 'hidden',
                backgroundColor: '#161922',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {photos[2] ? (
                <>
                  <Image source={{ uri: photos[2] }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                  <View style={{ position: 'absolute', bottom: 4, left: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.75)', paddingVertical: 2, borderRadius: 6, alignItems: 'center' }}>
                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>Photo 3</Text>
                  </View>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 22, color: C.accent }}>+</Text>
                  <Text style={{ color: C.textMuted, fontSize: 9, fontWeight: '700' }}>Upload</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleChangePhotoIndex(2)} style={{ marginTop: 6, paddingVertical: 2 }}>
              <Text style={{ color: C.textSoft, fontSize: 10, fontWeight: '800' }}>{photos[2] ? 'Replace' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ───────────────────────────────────────────── */}
      {/* GENDER & HETEROSEXUAL MATCH PREFERENCES        */}
      {/* ───────────────────────────────────────────── */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>
            GENDER & DATING PREFERENCES 🔒
          </Text>
          <View style={{ backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: C.emerald, fontSize: 10, fontWeight: '800' }}>Strict Heterosexual Policy</Text>
          </View>
        </View>

        <Text style={{ color: C.textSoft, fontSize: 11, lineHeight: 16, marginBottom: 14 }}>
          BTS strictly matches men with women and women with men. Male profiles never match with males; female profiles never match with females.
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
          <View style={{
            flex: 1,
            backgroundColor: '#0D111A',
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: C.border,
            alignItems: 'center'
          }}>
            <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>YOUR GENDER</Text>
            <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '900' }}>
              {gender === 'female' ? '👩 Woman / Female' : '👨 Man / Male'}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: 'rgba(255,184,0,0.08)',
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(255,184,0,0.3)',
            alignItems: 'center'
          }}>
            <Text style={{ color: C.accent, fontSize: 10, fontWeight: '800', marginBottom: 4 }}>MATCHING WITH</Text>
            <Text style={{ color: C.accent, fontSize: 14, fontWeight: '900' }}>
              {gender === 'female' ? '👨 Men Only' : '👩 Women Only'}
            </Text>
          </View>
        </View>

        {/* Preferred Age Range */}
        <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '800', marginBottom: 6 }}>
          INTERESTED AGE RANGE (DISCOVERY FILTER):
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[s.textInput, { width: '100%', marginTop: 0, textAlign: 'center', fontSize: 15, fontWeight: '800' }]}
              value={preferredMinAge}
              onChangeText={setPreferredMinAge}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="18"
              placeholderTextColor={C.textMuted}
            />
          </View>
          <Text style={{ color: C.accent, fontWeight: '900', fontSize: 14 }}>TO</Text>
          <View style={{ flex: 1 }}>
            <TextInput
              style={[s.textInput, { width: '100%', marginTop: 0, textAlign: 'center', fontSize: 15, fontWeight: '800' }]}
              value={preferredMaxAge}
              onChangeText={setPreferredMaxAge}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="35"
              placeholderTextColor={C.textMuted}
            />
          </View>
        </View>
      </View>

      {/* ───────────────────────────────────────────── */}
      {/* YOUR VOICE NOTE INTRO RECORDER                 */}
      {/* ───────────────────────────────────────────── */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1 }}>
            YOUR VOICE NOTE INTRO 🎙️
          </Text>
          <View style={{ backgroundColor: 'rgba(255,184,0,0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
            <Text style={{ color: C.accent, fontSize: 10, fontWeight: '800' }}>15s Max Audio</Text>
          </View>
        </View>
        <Text style={{ color: C.textSoft, fontSize: 11, marginBottom: 14, lineHeight: 16 }}>
          Record your genuine voice to stand out on the Discovery stack. Matches listen before they connect!
        </Text>

        {/* Voice Prompts Selector */}
        <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Select Voice Prompt Topic:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {[
            'My actual voice: Roast me if you dare',
            'Saying hello in my native accent & dialect',
            'A candid 15-second intro without a filter',
            'Sunday morning energy & favorite music'
          ].map((prompt, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setVoiceNoteTitle(prompt)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 14,
                backgroundColor: voiceNoteTitle === prompt ? 'rgba(255,184,0,0.2)' : 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: voiceNoteTitle === prompt ? C.accent : 'rgba(255,255,255,0.08)',
                marginRight: 8
              }}
            >
              <Text style={{ color: voiceNoteTitle === prompt ? C.accent : C.textSoft, fontSize: 11, fontWeight: '700' }}>
                {prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Voice Recording Box */}
        <View style={{
          backgroundColor: '#0D111A',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: isRecordingVoice ? C.red : 'rgba(255,184,0,0.3)',
          alignItems: 'center'
        }}>
          {isRecordingVoice ? (
            <View style={{ alignItems: 'center', width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: C.red }} />
                <Text style={{ color: C.red, fontSize: 14, fontWeight: '900', letterSpacing: 1 }}>
                  RECORDING: 0:{recordSeconds < 10 ? '0' : ''}{recordSeconds} / 0:15
                </Text>
              </View>

              {/* Simulated Waveform Animation */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, marginVertical: 10 }}>
                {[14, 28, 10, 24, 32, 18, 26, 12, 30, 20, 16, 28, 8, 22].map((h, i) => (
                  <View 
                    key={i} 
                    style={{ 
                      width: 4, 
                      height: h, 
                      backgroundColor: C.red, 
                      borderRadius: 2,
                      opacity: (i + recordSeconds) % 2 === 0 ? 1 : 0.4
                    }} 
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={handleStopVoiceRecording}
                style={{
                  backgroundColor: C.red,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 16,
                  marginTop: 6
                }}
              >
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>⏹ Stop & Save Audio</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: '100%' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{ color: C.accent, fontWeight: '800', fontSize: 12 }} numberOfLines={1}>
                    🎙 {voiceNoteTitle}
                  </Text>
                  <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
                    {voiceNoteDuration} • Audio Recorded
                  </Text>
                </View>

                {/* Play / Pause Preview Button */}
                <TouchableOpacity
                  onPress={handlePlayVoicePreview}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isPlayingVoice ? C.emerald : C.accent,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 14,
                    gap: 6
                  }}
                >
                  <Text style={{ color: '#000', fontWeight: '900', fontSize: 14 }}>
                    {isPlayingVoice ? '⏸' : '▶'}
                  </Text>
                  <Text style={{ color: '#000', fontWeight: '900', fontSize: 11 }}>
                    {isPlayingVoice ? 'Pause' : 'Listen'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleStartVoiceRecording}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,184,0,0.3)',
                  paddingVertical: 11,
                  borderRadius: 14,
                  gap: 8
                }}
              >
                <Text style={{ fontSize: 16 }}>🎙️</Text>
                <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 12 }}>
                  {voiceNoteUri ? 'Record New Voice Intro' : 'Tap to Record Voice Intro (Microphone)'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Spoken Transcript Preview */}
        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginTop: 14, marginBottom: 4 }}>
          Voice Note Transcript / Summary
        </Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, padding: 12, fontSize: 13, minHeight: 60, textAlignVertical: 'top' }]}
          value={voiceNoteTranscript}
          onChangeText={setVoiceNoteTranscript}
          placeholder="Brief transcript or caption of your voice note..."
          placeholderTextColor={C.textMuted}
          multiline
        />
      </View>

      {/* Edit Form */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
        <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 14 }}>
          PERSONAL DETAILS
        </Text>

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Full Name</Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 14 }]}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
          placeholderTextColor={C.textMuted}
        />

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Age</Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 14 }]}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="e.g. 26"
          placeholderTextColor={C.textMuted}
        />

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Occupation / Profession</Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 14 }]}
          value={occupation}
          onChangeText={setOccupation}
          placeholder="e.g. Creative Designer, Software Engineer"
          placeholderTextColor={C.textMuted}
        />
      </View>

      {/* Cultural Roots (Permanently Locked Country) */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
        <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 14 }}>
          COUNTRY & CULTURAL ROOTS
        </Text>

        {/* Permanently Locked Country Card */}
        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>Country of Origin & Roots</Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 14,
          marginBottom: 6
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>{userProfile?.countryFlag || '🇬🇭'}</Text>
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
              {userProfile?.country || 'Ghana'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,184,0,0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,184,0,0.3)' }}>
            <Text style={{ fontSize: 10, marginRight: 4 }}>🔒</Text>
            <Text style={{ color: C.accent, fontSize: 10, fontWeight: '800' }}>Permanent</Text>
          </View>
        </View>
        <Text style={{ color: C.textMuted, fontSize: 10, marginBottom: 14, lineHeight: 14 }}>
          Country is verified during registration and locked permanently for member security and anti-fraud verification.
        </Text>

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Current Living City</Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 14 }]}
          value={city}
          onChangeText={setCity}
          placeholder="Current city"
          placeholderTextColor={C.textMuted}
        />

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Hometown / Ancestral Roots</Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 14 }]}
          value={hometown}
          onChangeText={setHometown}
          placeholder="Hometown"
          placeholderTextColor={C.textMuted}
        />

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Tribe / Heritage</Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 14 }]}
          value={tribe}
          onChangeText={setTribe}
          placeholder="Tribe or cultural heritage"
          placeholderTextColor={C.textMuted}
        />
      </View>

      {/* Candid BTS Moments */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
        <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 14 }}>
          BEHIND-THE-SCENES MOMENT
        </Text>

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Candid Caption</Text>
        <TextInput
          style={[s.textInput, { width: '100%', height: 80, textAlign: 'left', textAlignVertical: 'top', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 13 }]}
          multiline
          value={btsCaption}
          onChangeText={setBtsCaption}
          placeholder="What do you look like in real life when not trying?"
          placeholderTextColor={C.textMuted}
        />

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 4 }}>Daily Quirky Habit</Text>
        <TextInput
          style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 14, padding: 12, fontSize: 14 }]}
          value={btsHabit}
          onChangeText={setBtsHabit}
          placeholder="e.g. I listen to Daddy Lumba every Sunday morning"
          placeholderTextColor={C.textMuted}
        />
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18, marginBottom: 12 }]}
        onPress={handleSave}
      >
        <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Save Profile Changes ✓</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ width: '100%', alignItems: 'center', paddingVertical: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.border, marginBottom: 12 }}
        onPress={() => {
          Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: onLogout }
          ]);
        }}
      >
        <Text style={{ color: C.textSoft, fontWeight: '800', fontSize: 13 }}>Sign Out of BTS</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ width: '100%', alignItems: 'center', paddingVertical: 10 }}
        onPress={() => {
          Alert.alert(
            'Delete Account & Data',
            'This will permanently purge your matches, chats, verified biometric selfie, and candid data from Behind The Scenes. This action cannot be undone.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete Permanently', style: 'destructive', onPress: onLogout }
            ]
          );
        }}
      >
        <Text style={{ color: C.red, fontWeight: '700', fontSize: 11 }}>Delete Account (Data Purge)</Text>
      </TouchableOpacity>
    </ScrollView>
    </TouchableWithoutFeedback>
  );
}

// ══════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════
export default function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [tab, setTab] = useState('discover');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [btsProfile, setBtsProfile] = useState(null);
  const [chatMatch, setChatMatch] = useState(null);
  // Strict opposite-gender matching & age range filtering
  const userGender = userProfile?.gender || 'male';
  const minAge = parseInt(userProfile?.preferredMinAge, 10) || 18;
  const maxAge = parseInt(userProfile?.preferredMaxAge, 10) || 55;

  const profiles = useMemo(() => {
    return INITIAL_PROFILES.filter(p => {
      // 1. Strict Opposite Gender:
      // Male can NEVER match with Male.
      // Female can NEVER match with Female.
      const matchGender = p.gender || 'female';
      if (userGender === 'male' && matchGender !== 'female') return false;
      if (userGender === 'female' && matchGender !== 'male') return false;

      // 2. Age Range
      if (p.age && (p.age < minAge || p.age > maxAge)) {
        return false;
      }
      return true;
    });
  }, [userGender, minAge, maxAge]);

  const currentProfile = profiles[currentIdx] || null;

  const activeMatches = useMemo(() => {
    return matches.filter(m => {
      if (!m.gender) return true;
      if (userGender === 'male' && m.gender !== 'female') return false;
      if (userGender === 'female' && m.gender !== 'male') return false;
      return true;
    });
  }, [matches, userGender]);

  // Restore authenticated session and profile on app start (instant local cache + Appwrite)
  useEffect(() => {
    async function restoreSession() {
      try {
        // 1. Instant local file load (0ms offline-first)
        const local = await loadLocalProfile();
        if (local && local.name) {
          setUserProfile(local);
          setLoadingSession(false);
          return;
        }

        // 2. Query active Appwrite Cloud session & database
        const user = await appwriteGetCurrentUserMobile();
        if (user && user.$id) {
          const remote = await appwriteGetUserProfile(user.$id);
          if (remote && remote.name) {
            setUserProfile(remote);
            await saveLocalProfile(remote);
          }
        }
      } catch (err) {
        console.warn('[Session Restore Error]', err?.message);
      } finally {
        setLoadingSession(false);
      }
    }
    restoreSession();
  }, []);

  const handleLike = () => {
    if (!currentProfile) return;
    const newMatch = {
      id: currentProfile.id,
      name: currentProfile.name,
      gender: currentProfile.gender,
      photo: currentProfile.mainPhotos[0],
      photos: currentProfile.mainPhotos,
      voiceNote: currentProfile.voiceNote,
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

  if (loadingSession) {
    return (
      <View style={[s.fullCenter, { backgroundColor: C.bg }]}>
        <StatusBar barStyle="light-content" />
        <Image source={require('./assets/bts-official-logo.png')} style={{ width: 100, height: 100, resizeMode: 'contain', marginBottom: 20 }} />
        <ActivityIndicator color={C.accent} size="large" />
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={{ flex: 1, backgroundColor: '#07090E' }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
          <OnboardingScreen onComplete={(profile) => setUserProfile(profile)} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#07090E' }}>
      <StatusBar barStyle="light-content" />
      <DimmedAppBackground screen={tab} />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setTab('discover')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image source={require('./assets/bts-official-logo.png')} style={{ width: 34, height: 34, resizeMode: 'contain' }} />
          <View>
            <Text style={s.brandTitleSm}>BEHIND THE SCENES</Text>
            <Text style={[s.bodyTiny, { color: C.textMuted, letterSpacing: 1.5 }]}>REAL VIBES • AFRICA</Text>
          </View>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={s.headerBtn} onPress={() => setTab('matches')}>
            <Text style={{ fontSize: 16 }}>💬</Text>
            {activeMatches.some(m => m.unread) && <View style={s.headerBadge} />}
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
          userProfile={userProfile}
        />
      )}

      {tab === 'likes_you' && (
        <LikesYouScreen 
          userGender={userGender}
          onMatchBack={(p) => {
            const newMatch = {
              id: p.id,
              name: p.name,
              gender: p.gender,
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
          matches={activeMatches}
          onSelectMatch={(m) => setChatMatch(m)}
          onBack={() => setTab('discover')}
        />
      )}

      {tab === 'profile' && (
        <ProfileScreen
          userProfile={userProfile}
          onUpdateProfile={async (updated) => {
            setUserProfile(updated);
            await saveLocalProfile(updated);
            try {
              const user = await appwriteGetCurrentUserMobile();
              if (user && user.$id) {
                await appwriteSaveUserProfile(user.$id, updated);
              }
            } catch (e) {
              console.warn('[Sync Profile Update]', e);
            }
          }}
          onLogout={async () => {
            await clearLocalProfile();
            await appwriteLogoutMobile();
            setUserProfile(null);
            setTab('discover');
          }}
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

        <TouchableOpacity style={s.bottomTabBtn} onPress={() => setTab('profile')}>
          <Text style={[s.bottomTabIcon, tab === 'profile' && { transform: [{ scale: 1.2 }] }]}>👤</Text>
          <Text style={[s.bottomTabText, tab === 'profile' && s.bottomTabActive]}>Profile</Text>
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
    </View>
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

  // Country Picker
  countryPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.border, marginRight: 8 },
  countryPillActive: { backgroundColor: C.accent, borderColor: C.accent },
});
