import React from 'react';
import { SlidersHorizontal, Flame, Sparkles, User, MessageCircleHeart, Shield, ShieldCheck, Wrench } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  onOpenFilters, 
  onOpenSafety,
  onOpenAdmin,
  onOpenVerify,
  unreadCount,
  dettyMode,
  setDettyMode,
  isUserVerified
}) {
  return (
    <header className="sticky top-0 z-30 w-full max-w-md mx-auto glass-panel px-4 py-3 border-b border-white/10 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('discover')}>
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-red-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <span className="text-black font-extrabold text-sm tracking-tight">★</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-400 bg-clip-text text-transparent">
              BEHIND THE SCENES
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-0.5">
            Real Vibes • No Fake Life
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Detty December Quick Toggle */}
        <button 
          onClick={() => setDettyMode(!dettyMode)}
          className={`px-2 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 border ${
            dettyMode 
              ? 'bg-red-500/20 border-red-500/60 text-red-400 shadow-sm shadow-red-500/30' 
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
          }`}
          title="Toggle Detty December / Ghana Homecoming Mode"
        >
          <Flame className={`w-3.5 h-3.5 ${dettyMode ? 'text-red-400 fill-red-400' : ''}`} />
          <span className="hidden sm:inline">Detty Dec</span>
        </button>

        {/* Filter Button */}
        <button 
          onClick={onOpenFilters}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
          title="Filter by Hometown, Tribe, or City"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Messages Drawer Trigger */}
        <button 
          onClick={() => setActiveTab('matches')}
          className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
          title="View Matches & Chats"
        >
          <MessageCircleHeart className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Anti-Catfish Gold Badge Trigger */}
        <button 
          onClick={onOpenVerify}
          className={`p-2 rounded-xl transition-all border ${
            isUserVerified 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
              : 'bg-amber-400/10 border-amber-400/40 text-amber-300 hover:bg-amber-400/20'
          }`}
          title={isUserVerified ? "Identity Verified" : "Verify Real You (Anti-Catfish)"}
        >
          <ShieldCheck className="w-4 h-4" />
        </button>

        {/* Safety Center */}
        <button 
          onClick={onOpenSafety}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
          title="Safety & Legal Center"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Admin Console */}
        <button 
          onClick={onOpenAdmin}
          className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-white transition-all border border-red-500/30"
          title="BTS Admin Console (Reports, Refunds, Ads)"
        >
          <Wrench className="w-4 h-4" />
        </button>

        {/* User Profile */}
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10"
          title="My Profile"
        >
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
