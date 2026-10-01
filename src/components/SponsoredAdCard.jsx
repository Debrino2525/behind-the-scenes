import React from 'react';
import { Megaphone, ExternalLink, Calendar, MapPin, Sparkles, X, Heart } from 'lucide-react';

export default function SponsoredAdCard({ ad, onPass, onLike }) {
  if (!ad) return null;

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center select-none pb-20 animate-in fade-in">
      <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-emerald-500/30 shadow-2xl bg-[#12151e]">
        
        {/* Ad Image Header */}
        <div className="relative h-[380px] w-full bg-slate-900 overflow-hidden">
          <img 
            src={ad.image} 
            alt={ad.title} 
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500 text-black flex items-center gap-1 shadow-md shadow-emerald-500/30 uppercase">
              <Megaphone className="w-3 h-3" />
              <span>Sponsored Experience</span>
            </span>
          </div>

          <div className="absolute top-4 right-4 z-20">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30">
              {ad.badge}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#12151e] via-[#12151e]/80 to-transparent" />

          {/* Title pinned over image */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
              {ad.sponsorName} • {ad.category}
            </span>
            <h2 className="text-2xl font-black text-white leading-tight mt-0.5">{ad.title}</h2>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{ad.dates}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-lg border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ad.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ad Details Body */}
        <div className="p-4 space-y-4">
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            {ad.description}
          </p>

          {/* BTS Exclusive Duo Perk Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-red-500/10 to-emerald-500/15 border border-amber-400/40 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-300 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BTS Community Privilege</span>
            </div>
            <p className="text-xs font-bold text-white">
              {ad.perk}
            </p>
          </div>

          {/* Action CTA */}
          <a
            href={ad.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
          >
            <span>{ad.ctaText}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Floating Skip / Save bar */}
      <div className="fixed bottom-5 max-w-md w-full px-12 flex items-center justify-between z-30">
        <button 
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-slate-900/90 border border-white/20 text-slate-400 hover:text-white flex items-center justify-center shadow-xl backdrop-blur-md transition-all"
          title="Skip Ad"
        >
          <X className="w-6 h-6" />
        </button>

        <button 
          onClick={onLike}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/30 hover:scale-105 transition-all font-bold"
          title="Save Event to Favorites"
        >
          <Heart className="w-6 h-6 fill-black stroke-black" />
        </button>
      </div>

    </div>
  );
}
