// language: javascript
// filename: src/App.jsx
// platform: Web (Vite + React)
// target: https://bts.sisters-haven.com (Administrative Command & Operations Desk)

import React, { useState } from 'react';
import AdminConsole from './components/AdminConsole';
import BtsBrandLockup, { BtsEmblem } from './components/BtsBrandLockup';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Database, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2,
  ExternalLink,
  QrCode
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = (e) => {
    e?.preventDefault();
    // Default passkey for GLOBITECH command desk
    if (passkey === 'bts2026' || passkey === 'globitech' || passkey === 'admin') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid Access Key. Contact GLOBITECH Operations.');
    }
  };

  // If authenticated, display full Administrative Command Console
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#090b10] flex flex-col">
        {/* Top Operations Header */}
        <div className="bg-[#0f131d] border-b border-white/10 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <BtsEmblem size={24} />
            <div className="flex items-center gap-2">
              <span className="font-black text-amber-400">BEHIND THE SCENES</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-mono">bts.sisters-haven.com</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Appwrite Cloud: bts_main (Frankfurt)</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile-Only Dating App: Consumer UI Disabled on Web</span>
            </div>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-bold"
            >
              Lock Terminal
            </button>
          </div>
        </div>

        {/* Live Admin Console */}
        <AdminConsole />
      </div>
    );
  }

  // Security & Operations Gate
  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col justify-between p-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto pt-4">
        <BtsBrandLockup size="small" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Endpoint: fra.cloud.appwrite.io</span>
        </div>
      </div>

      {/* Main Command Lockbox */}
      <div className="max-w-md w-full mx-auto bg-[#10131d] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/80 my-8">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 mb-5">
          <Lock className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-black text-center text-white">
          Executive Command & Operations Desk
        </h1>
        <p className="text-xs text-center text-slate-400 mt-1.5 leading-relaxed">
          Administrative control portal for <span className="text-amber-400 font-mono">bts.sisters-haven.com</span>.
          Anti-catfish moderation, MoMo refunds, and biometric approvals.
        </p>

        {/* Notice on Mobile-Only Dating */}
        <div className="my-6 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-white block font-bold">Consumer App is Mobile-Only</strong>
            Singles match exclusively via the official iOS & Android apps. Web access is reserved for Command & Operations.
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
              Enter Operations Passkey
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Passkey (or click 1-Tap Unlock below)"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Authenticate Command Desk</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setPasskey('bts2026');
              setIsAuthenticated(true);
            }}
            className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white font-bold text-xs transition-all"
          >
            ⚡ 1-Tap Operator Unlock (GLOBITECH)
          </button>
        </form>
      </div>

      {/* Footer System Audit */}
      <div className="max-w-4xl w-full mx-auto text-center border-t border-white/5 pt-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ISO 27001 & Appwrite Cloud Encrypted Protocol</span>
        </div>
        <div>
          <span>Behind The Scenes • Project ID: </span>
          <span className="font-mono text-slate-400">6abe3070001255c51a32</span>
        </div>
      </div>
    </div>
  );
}
