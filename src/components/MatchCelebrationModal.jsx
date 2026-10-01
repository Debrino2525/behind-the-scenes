import React from 'react';
import { Heart, Sparkles, MessageCircle, ArrowRight, Eye } from 'lucide-react';

export default function MatchCelebrationModal({ match, onStartChat, onContinue }) {
  if (!match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#1a1e2d] to-[#0e1017] rounded-3xl p-6 border border-amber-400/40 shadow-2xl text-center space-y-5">
        
        {/* Top Glow & Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Behind The Scenes Match!</span>
        </div>

        {/* Overlapping Photos */}
        <div className="relative flex items-center justify-center py-2">
          {/* User's profile (sample placeholder) */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl -rotate-6 transform z-10">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80" 
              alt="You" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Matched Profile */}
          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl rotate-6 transform -ml-6 z-20">
            <img 
              src={match.mainPhotos[0]} 
              alt={match.name} 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center font-black text-xs z-30 shadow-lg border-2 border-[#1a1e2d]">
            🇬🇭
          </div>
        </div>

        <div>
          <h3 className="text-xl font-black text-white">
            You and {match.name} connected!
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
            You both unlocked each other's unfiltered Behind The Scenes moments.
          </p>
        </div>

        {/* Cultural Common Ground Pill */}
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-amber-300 font-semibold flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Roots in {match.homeTown} • {match.tribe} heritage</span>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-2">
          <button 
            onClick={onStartChat}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 text-black font-black text-sm shadow-xl shadow-amber-400/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Drop a Message to {match.name.split(' ')[0]}</span>
          </button>

          <button 
            onClick={onContinue}
            className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            Keep Exploring
          </button>
        </div>

      </div>
    </div>
  );
}
