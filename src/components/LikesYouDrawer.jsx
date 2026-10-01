import React from 'react';
import { Heart, Sparkles, Eye, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import { INITIAL_LIKES_YOU } from '../data/dateDropsData';

export default function LikesYouDrawer({ onInstantMatch, onBackToDiscover }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 animate-in fade-in select-none">
      
      {/* Header Banner */}
      <div className="p-4 rounded-3xl glass-panel border border-amber-400/30 flex items-center justify-between shadow-xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interested In You</span>
          </div>
          <h2 className="text-sm font-extrabold text-white">Behind The Curtain</h2>
          <p className="text-[11px] text-slate-400">
            {INITIAL_LIKES_YOU.length} singles swiped right on your profile or BTS video
          </p>
        </div>

        <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-sm">
          {INITIAL_LIKES_YOU.length}
        </div>
      </div>

      {/* Grid of Admirers */}
      <div className="grid grid-cols-2 gap-3">
        {INITIAL_LIKES_YOU.map(person => (
          <div 
            key={person.id}
            className="group relative rounded-3xl overflow-hidden glass-panel border border-white/10 hover:border-amber-400/50 transition-all flex flex-col bg-[#11141d]"
          >
            {/* Photo with Overlay */}
            <div className="relative h-56 w-full bg-slate-900">
              <img 
                src={person.photo} 
                alt={person.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {person.superLike && (
                <div className="absolute top-2.5 left-2.5 bg-blue-500 text-black px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-md">
                  Super Like
                </div>
              )}

              {person.btsUnlocked && (
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md p-1 rounded-lg border border-amber-400/40" title="Unlocked your BTS moment">
                  <Eye className="w-3 h-3 text-amber-400" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#11141d] via-[#11141d]/70 to-transparent" />

              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <h3 className="text-sm font-black text-white">{person.name}, {person.age}</h3>
                <div className="flex items-center gap-1 text-[10px] text-slate-300">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{person.city} • {person.hometown}</span>
                </div>
              </div>
            </div>

            {/* Note & Match CTA */}
            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
              <p className="text-[10px] text-slate-400 italic">
                "{person.note}"
              </p>

              <button 
                onClick={() => onInstantMatch(person)}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-[11px] flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Heart className="w-3.5 h-3.5 fill-black" />
                <span>Match Back</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
