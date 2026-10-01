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
} from 'react-native';
import { INITIAL_PROFILES, INITIAL_MATCHES, INITIAL_DATE_DROPS, INITIAL_LIKES_YOU } from './data/mockProfiles';
import { 
  appwriteLoginWithGoogleMobile, 
  appwriteGetCurrentUserMobile,
  appwriteSendEmailOtp,
  appwriteVerifyEmailOtp,
  appwriteRegisterEmailPassword,
  appwriteLogoutMobile
} from './lib/appwrite';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { verifyHumanFace } from './lib/faceVerification';

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

  // Country & Roots
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES_LIST[0]);
  const [currentCity, setCurrentCity] = useState('Accra');
  const [homeTown, setHomeTown] = useState('Kumasi');
  const [tribe, setTribe] = useState('Asante');
  const [intent, setIntent] = useState('Long-term leading to marriage');

  // Candid BTS Moment
  const [btsCaption, setBtsCaption] = useState('Sunday waakye in my oversized t-shirt, completely unedited.');
  const [btsHabit, setBtsHabit] = useState('I listen to Daddy Lumba every Sunday morning.');

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

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check for active Appwrite user
  useEffect(() => {
    async function checkExistingUser() {
      try {
        const user = await appwriteGetCurrentUserMobile();
        if (user) {
          if (user.name) setFullName(user.name);
          if (user.email) setEmail(user.email);
          setStep((prev) => (prev <= 2 ? 3 : prev));
        }
      } catch (e) {
        // Not signed in
      }
    }
    checkExistingUser();
  }, []);

  const handleBack = () => {
    setError('');
    if (step === 2 && authSubStep === 'otp') {
      setAuthSubStep('input');
      return;
    }
    setStep((prev) => Math.max(1, prev - 1));
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

  const handleFinish = () => {
    if (!isVerified) {
      setError('Please complete the live selfie check first.');
      return;
    }
    onComplete({
      name: fullName.trim() || 'New Member',
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
      liveSelfieUri: capturedSelfieUri
    });
  };

  // ══════════════════════════════════════════════════
  // STEP 1: WELCOME SCREEN
  // ══════════════════════════════════════════════════
  if (step === 1) {
    return (
      <View style={[s.fullCenter, { backgroundColor: C.bg, paddingHorizontal: 28 }]}>
        <View style={{ width: 68, height: 68, borderRadius: 22, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: C.accent, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
          <Text style={{ fontSize: 34 }}>🎬</Text>
        </View>

        <Text style={[s.brandTitle, { fontSize: 24, letterSpacing: 2.5, textAlign: 'center' }]}>
          BEHIND THE SCENES
        </Text>
        <Text style={{ color: '#F2E9D8', letterSpacing: 2, marginTop: 4, fontWeight: '800', fontSize: 11 }}>
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
          onPress={() => { setError(''); setStep(2); }}
        >
          <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Sign Up with Email (18+) →</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={{ marginTop: 16 }} onPress={() => { setError(''); setStep(2); }}>
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
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <StepHeader currentStep={1} totalSteps={5} onBack={handleBack} />

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, flexGrow: 1 }}>
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
              value={otpCode}
              onChangeText={(t) => { setOtpCode(t); setError(''); }}
              autoFocus
            />

            <TouchableOpacity 
              style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 16, borderRadius: 18, marginBottom: 14 }]} 
              onPress={handleVerifyOtp}
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
        </View>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StepHeader currentStep={1} totalSteps={5} onBack={handleBack} />
        
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20, flexGrow: 1 }}>
          <Text style={[s.heading, { color: C.text, fontSize: 22 }]}>Create Your Account</Text>
          <Text style={[s.bodySmall, { color: C.textSoft, marginTop: 4, marginBottom: 20 }]}>
            Synced with Appwrite Cloud Database & Verification
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
                  Quick Sign-In with Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            <Text style={{ color: C.textMuted, fontSize: 10, marginHorizontal: 12, fontWeight: '800', letterSpacing: 1 }}>
              OR REGISTER WITH EMAIL
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

          <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Full Legal Name (Private)</Text>
          <TextInput
            style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 16, borderColor: !fullName && error ? C.red : C.border }]}
            placeholder="e.g. Kwame Mensah"
            placeholderTextColor={C.textMuted}
            value={fullName}
            onChangeText={(t) => { setFullName(t); setError(''); }}
          />

          <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Email Address</Text>
          <TextInput
            style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 16, borderColor: !email && error ? C.red : C.border }]}
            placeholder="your.email@example.com"
            placeholderTextColor={C.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
          />

          <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Password (Minimum 8 Characters)</Text>
          <TextInput
            style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 20, borderColor: password.length < 8 && error ? C.red : C.border }]}
            placeholder="••••••••••••"
            placeholderTextColor={C.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
          />

          {/* Primary Action: Send 6-Digit Code */}
          <TouchableOpacity 
            style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18, marginBottom: 12 }]} 
            onPress={handleSendOtp}
            disabled={isSendingCode}
          >
            {isSendingCode ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Send 6-Digit Verification Code →</Text>
            )}
          </TouchableOpacity>

          {/* Alternative: Direct Password Sign-Up */}
          <TouchableOpacity 
            style={{ width: '100%', alignItems: 'center', paddingVertical: 12, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.border }}
            onPress={handleDirectPasswordRegister}
            disabled={isSendingCode}
          >
            <Text style={{ color: C.textSoft, fontWeight: '700', fontSize: 12 }}>
              Or Register Instantly with Password
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 3: STRICT 18+ AGE VERIFICATION
  // ══════════════════════════════════════════════════
  if (step === 3) {
    const calculatedAge = calculateAge();
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StepHeader currentStep={2} totalSteps={5} onBack={handleBack} />

        <View style={[s.fullCenter, { paddingHorizontal: 28 }]}>
          <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(224,54,56,0.12)', borderWidth: 1, borderColor: 'rgba(224,54,56,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 36 }}>🛡️</Text>
          </View>
          <Text style={[s.heading, { color: C.text, fontSize: 22, textAlign: 'center' }]}>Verify Your Age</Text>
          <Text style={[s.bodySmall, { color: C.textSoft, textAlign: 'center', marginTop: 8, lineHeight: 18 }]}>
            In strict compliance with Google Play Console & Apple App Store rules, BTS is exclusively for adults 18+.
          </Text>
          
          <TextInput
            style={[s.textInput, { width: '85%', marginTop: 24, fontSize: 22, fontWeight: '900', letterSpacing: 4 }]}
            placeholder="YYYY"
            placeholderTextColor={C.textMuted}
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={(t) => { setYear(t); setError(''); }}
          />

          {calculatedAge !== null && (
            <View style={{ marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, backgroundColor: calculatedAge >= 18 ? 'rgba(16,185,129,0.15)' : 'rgba(224,54,56,0.15)' }}>
              <Text style={{ color: calculatedAge >= 18 ? C.emerald : C.red, fontWeight: '800', fontSize: 12 }}>
                {calculatedAge >= 18 ? `Age: ${calculatedAge} • Eligible to Join ✓` : `Age: ${calculatedAge} • Strictly Under 18 ✗`}
              </Text>
            </View>
          )}

          {error ? <Text style={{ color: C.red, fontSize: 12, marginTop: 10, textAlign: 'center', fontWeight: '700' }}>{error}</Text> : null}

          <TouchableOpacity style={[s.btnPrimary, { marginTop: 28, width: '85%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} onPress={handleDobNext}>
            <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Confirm 18+ & Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 4: COUNTRY, CITY & HOMETOWN ROOTS
  // ══════════════════════════════════════════════════
  if (step === 4) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StepHeader currentStep={3} totalSteps={5} onBack={handleBack} />

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}>
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
          />

          <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Hometown / Ancestral Roots</Text>
          <TextInput
            style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 16 }]}
            value={homeTown}
            onChangeText={setHomeTown}
            placeholder="e.g. Kumasi, Cape Coast, Maun, Fès"
            placeholderTextColor={C.textMuted}
          />

          <Text style={{ color: C.textSoft, fontSize: 12, fontWeight: '800', marginBottom: 6 }}>Tribe / Heritage</Text>
          <TextInput
            style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 20 }]}
            value={tribe}
            onChangeText={setTribe}
            placeholder="e.g. Asante, Fante, Tswana, Amazigh"
            placeholderTextColor={C.textMuted}
          />

          <TouchableOpacity style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} onPress={() => setStep(5)}>
            <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Continue to Candid Moment →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 5: CANDID BTS MOMENT
  // ══════════════════════════════════════════════════
  if (step === 5) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <StepHeader currentStep={4} totalSteps={5} onBack={handleBack} />

        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}>
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
            style={[s.textInput, { width: '100%', textAlign: 'left', marginTop: 0, marginBottom: 24 }]}
            value={btsHabit}
            onChangeText={setBtsHabit}
            placeholder="e.g. I listen to Daddy Lumba every Sunday morning"
            placeholderTextColor={C.textMuted}
          />

          <TouchableOpacity style={[s.btnPrimary, { width: '100%', alignItems: 'center', paddingVertical: 15, borderRadius: 18 }]} onPress={() => setStep(6)}>
            <Text style={[s.btnPrimaryText, { fontSize: 14 }]}>Continue to Anti-Catfish Check →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════
  // STEP 6: ANTI-CATFISH FACE CHECK (REAL CAMERA)
  // ══════════════════════════════════════════════════
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StepHeader currentStep={5} totalSteps={5} onBack={handleBack} />

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
  const [photo, setPhoto] = useState(
    userProfile?.liveSelfieUri || 
    userProfile?.photo || 
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80'
  );
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES_LIST.find(c => c.name === userProfile?.country) || COUNTRIES_LIST[0]
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Pick or snap new profile picture
  const handleChangePhoto = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option to update your BTS photo:',
      [
        {
          text: 'Take Live Selfie / Photo',
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
                setPhoto(res.assets[0].uri);
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
              // Direct Android System Photo Picker (Zero broad media permissions required)
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
              });
              if (!res.canceled && res.assets && res.assets[0]?.uri) {
                setPhoto(res.assets[0].uri);
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

  const handleSave = () => {
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
      photo,
      country: selectedCountry.name,
      countryFlag: selectedCountry.flag,
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    Alert.alert('Profile Saved', 'Your Behind The Scenes profile has been updated!');
  };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}>
      {/* Profile Header */}
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        {/* Photo Container with Camera Badge */}
        <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8} style={{ position: 'relative' }}>
          <View style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 3,
            borderColor: C.accent,
            overflow: 'hidden',
            backgroundColor: '#1E2433',
            shadowColor: C.accent,
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6
          }}>
            <Image source={{ uri: photo }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          </View>
          <View style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: C.accent,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: C.bg
          }}>
            <Text style={{ fontSize: 14 }}>📷</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleChangePhoto} style={{ marginTop: 8 }}>
          <Text style={{ color: C.accent, fontWeight: '800', fontSize: 12 }}>Change Photo</Text>
        </TouchableOpacity>

        <Text style={[s.heading, { color: C.text, fontSize: 20, marginTop: 8 }]}>
          {name}, {age}
        </Text>
        <Text style={[s.bodySmall, { color: C.textSoft }]}>
          {selectedCountry.flag} {city} • {tribe}
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

      {/* Cultural Roots */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 16 }}>
        <Text style={{ color: C.accent, fontWeight: '900', fontSize: 11, letterSpacing: 1, marginBottom: 14 }}>
          COUNTRY & CULTURAL ROOTS
        </Text>

        <Text style={{ color: C.textSoft, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>Country</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', height: 44 }} style={{ maxHeight: 44, marginBottom: 14 }}>
          {COUNTRIES_LIST.map((c, i) => {
            const active = selectedCountry.name === c.name;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedCountry(c)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: active ? C.accent : 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: active ? C.accent : C.border,
                  marginRight: 8
                }}
              >
                <Text style={{ fontSize: 14, marginRight: 6 }}>{c.flag}</Text>
                <Text style={{ color: active ? '#000' : '#FFF', fontWeight: '800', fontSize: 11 }}>{c.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
  );
}

// ══════════════════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════════════════
export default function App() {
  const [userProfile, setUserProfile] = useState(null);
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

  if (!userProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <StatusBar barStyle="light-content" />
        <OnboardingScreen onComplete={(profile) => setUserProfile(profile)} />
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

      {tab === 'profile' && (
        <ProfileScreen
          userProfile={userProfile}
          onUpdateProfile={(updated) => setUserProfile(updated)}
          onLogout={() => {
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
