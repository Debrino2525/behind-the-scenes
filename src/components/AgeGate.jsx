import React, { useState } from 'react';
import { Shield, ChevronRight, Sparkles } from 'lucide-react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => currentYear - 18 - i);

export default function AgeGate({ onVerified }) {
  const [step, setStep] = useState('welcome'); // 'welcome' | 'dob' | 'blocked'
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (!month || !day || !year) {
      setError('Please enter your full date of birth.');
      return;
    }

    const dob = new Date(parseInt(year), MONTHS.indexOf(month), parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      setStep('blocked');
    } else {
      onVerified();
    }
  };

  if (step === 'blocked') {
    return (
      <div className="min-h-screen bg-[#090b10] flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-black text-white">Age Requirement Not Met</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Behind The Scenes is exclusively for users aged 18 and above. 
            This is in compliance with app store policies and our commitment to user safety.
          </p>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
            If you believe this is an error, please contact us at{' '}
            <span className="text-amber-400 font-semibold">safety@behindthescenes.app</span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#090b10] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-8">
          {/* Logo */}
          <div>
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-amber-500/20 mx-auto mb-4">
              <span className="text-black font-extrabold text-2xl">★</span>
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
              BEHIND THE SCENES
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase mt-1">
              Real Vibes • No Fake Life • Africa's Finest
            </p>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            Connect with authentic singles across Africa's safest nations. 
            See the real person behind the profile.
          </p>

          {/* Country Flags Row */}
          <div className="flex items-center justify-center gap-3 text-2xl">
            <span title="Ghana">🇬🇭</span>
            <span title="Mauritius">🇲🇺</span>
            <span title="Botswana">🇧🇼</span>
            <span title="Namibia">🇳🇦</span>
            <span title="Morocco">🇲🇦</span>
          </div>

          <button 
            onClick={() => setStep('dob')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-red-500 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-slate-500 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-amber-400 underline cursor-pointer">Terms of Service</span>,{' '}
            <span className="text-amber-400 underline cursor-pointer">Privacy Policy</span>, and{' '}
            <span className="text-amber-400 underline cursor-pointer">Community Guidelines</span>.
            You must be 18+ to use Behind The Scenes.
          </p>
        </div>
      </div>
    );
  }

  // DOB Entry Step
  return (
    <div className="min-h-screen bg-[#090b10] flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-lg font-black text-white">Verify Your Age</h2>
          <p className="text-xs text-slate-400 mt-1">
            Behind The Scenes is for adults 18 and older. 
            Your date of birth will not be shown publicly.
          </p>
        </div>

        {/* DOB Selectors */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Month</label>
            <select 
              value={month}
              onChange={(e) => { setMonth(e.target.value); setError(''); }}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#141721]">Select month</option>
              {MONTHS.map(m => (
                <option key={m} value={m} className="bg-[#141721]">{m}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Day</label>
              <select 
                value={day}
                onChange={(e) => { setDay(e.target.value); setError(''); }}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#141721]">Day</option>
                {DAYS.map(d => (
                  <option key={d} value={d} className="bg-[#141721]">{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Year</label>
              <select 
                value={year}
                onChange={(e) => { setYear(e.target.value); setError(''); }}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#141721]">Year</option>
                {YEARS.map(y => (
                  <option key={y} value={y} className="bg-[#141721]">{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 font-semibold text-center">{error}</p>
        )}

        <button 
          onClick={handleVerify}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
        >
          Continue
        </button>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          We verify age to comply with Google Play and Apple App Store policies. 
          Your birth date is encrypted and never shared with other users.
        </p>
      </div>
    </div>
  );
}
