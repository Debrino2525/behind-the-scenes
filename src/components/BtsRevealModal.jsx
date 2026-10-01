import React from 'react';
import { X, Sparkles, MapPin, Smile, MessageCircle, Heart, Flame } from 'lucide-react';

export default function BtsRevealModal({ profile, onClose, onLike }) {
  if (!profile) return null;

  const bts = profile.behindTheScenes;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#141721] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-all border border-white/20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black text-xs">
            BTS
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{profile.name}'s Behind The Scenes</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400">
              Unfiltered, no posture, real Ghanaian life
            </p>
          </div>
        </div>

        {/* Media / Candid Viewer */}
        <div className="relative w-full h-80 bg-slate-950 overflow-hidden">
          <img 
            src={bts.thumbnail} 
            alt="BTS candid" 
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/15 flex items-center gap-1.5 text-xs text-amber-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{bts.locationTag}</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">The Candid Reality</h4>
            <p className="text-sm font-semibold text-slate-100 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
              "{bts.caption}"
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">My Daily Quirky Habit</h4>
            <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-2xl border border-white/10">
              "{bts.realLifeHabit}"
            </p>
          </div>

          {/* Quick Reaction Prompts */}
          <div className="pt-2">
            <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-2">Send a quick BTS reaction:</h5>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => {
                  onClose();
                  onLike();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-300 flex items-center gap-1.5 transition-all"
              >
                😂 "Realest caption ever"
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onLike();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5 transition-all"
              >
                🍲 "Now I'm hungry for this"
              </button>
              <button 
                onClick={() => {
                  onClose();
                  onLike();
                }}
                className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-bold text-red-300 flex items-center gap-1.5 transition-all"
              >
                🇬🇭 "Standard Ghana vibes"
              </button>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0e1017] flex items-center justify-between">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Back to profile
          </button>
          
          <button 
            onClick={() => {
              onClose();
              onLike();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
          >
            <Heart className="w-4 h-4 fill-black" />
            <span>Connect with {profile.name}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
