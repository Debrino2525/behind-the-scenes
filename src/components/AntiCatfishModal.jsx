import React, { useState } from 'react';
import { X, ShieldCheck, Camera, CheckCircle2, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AntiCatfishModal({ isOpen, onClose, onVerified }) {
  const [step, setStep] = useState('intro'); // intro | scanning | verified
  const [scanProgress, setScanProgress] = useState(0);

  if (!isOpen) return null;

  const startScan = () => {
    setStep('scanning');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('verified');
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#FFB800', '#10B981', '#3B82F6']
          });
          return 100;
        }
        return prev + 25;
      });
    }, 450);
  };

  const handleFinish = () => {
    onVerified();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-sm bg-[#131620] rounded-3xl overflow-hidden border border-amber-400/40 shadow-2xl flex flex-col p-6 text-center space-y-4">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 1: INTRO */}
        {step === 'intro' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Anti-Catfish Verification</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Behind The Scenes is built on zero fake life. Complete a quick 5-second video liveness scan to unlock your <strong>Gold Verified Badge</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Confirms your photos belong to the real you</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Boosts your match visibility by 3.5x</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Protected against AI face-swaps and stolen pictures</span>
              </div>
            </div>

            <button 
              onClick={startScan}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-extrabold text-sm shadow-xl shadow-amber-400/20 hover:scale-[1.02] transition-all"
            >
              Start 5-Second Scan
            </button>
          </div>
        )}

        {/* STEP 2: SCANNING */}
        {step === 'scanning' && (
          <div className="space-y-5 py-4">
            {/* Simulated Camera Feed Viewport */}
            <div className="relative w-48 h-48 rounded-full border-4 border-dashed border-amber-400 mx-auto overflow-hidden bg-slate-900 flex items-center justify-center animate-pulse">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80" 
                alt="Face check"
                className="w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute inset-0 bg-emerald-500/10" />
              <div className="absolute bottom-2 left-0 right-0 text-[10px] font-black uppercase text-amber-300 bg-black/60 py-1">
                {scanProgress < 50 ? 'Center Face & Smile...' : 'Turn Slightly Left...'}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">Analyzing Biometric Liveness...</h4>
              <p className="text-xs text-slate-400 mt-0.5">Matching skin texture, lighting depth, and micro-motion</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* STEP 3: VERIFIED SUCCESS */}
        {step === 'verified' && (
          <div className="space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Identity Verified!</h3>
              <p className="text-xs text-slate-300 mt-1">
                You have received the <strong>Gold Verified Checkmark</strong>. Catfishers cannot imitate your profile.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Full Behind The Scenes Access Unlocked</span>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full py-3 rounded-2xl bg-amber-400 text-black font-extrabold text-sm shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all"
            >
              Continue to Discover
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
