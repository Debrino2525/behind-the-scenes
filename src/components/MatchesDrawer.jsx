import React from 'react';
import { ArrowLeft, Sparkles, MessageSquare, Flame, CheckCheck, Eye } from 'lucide-react';

export default function MatchesDrawer({ 
  matches, 
  onSelectMatch, 
  onBackToDiscover 
}) {
  return (
    <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col bg-[#0e1017] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Top Bar */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between glass-panel">
        <button 
          onClick={onBackToDiscover}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Discover</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="font-extrabold text-sm text-white">Matches & Chats</h2>
        </div>

        <div className="w-16" /> {/* spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* New Behind The Scenes Matches Row */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>New Connections</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <span className="text-[11px] text-amber-400 font-semibold">
              {matches.length} active
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {matches.map(m => (
              <div 
                key={m.id}
                onClick={() => onSelectMatch(m)}
                className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-amber-400 via-red-500 to-emerald-500 shadow-md group-hover:scale-105 transition-all">
                  <img 
                    src={m.photo} 
                    alt={m.name} 
                    className="w-full h-full object-cover rounded-[14px]"
                  />
                  {m.online && (
                    <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0e1017]" />
                  )}
                  {m.btsUnlocked && (
                    <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm p-0.5 rounded-md" title="Behind The Scenes Unlocked">
                      <Eye className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors">
                  {m.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 -mt-1">
                  {m.hometown}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Conversations
          </h3>

          <div className="space-y-2">
            {matches.map(m => (
              <div
                key={m.id}
                onClick={() => onSelectMatch(m)}
                className="p-3.5 rounded-2xl glass-panel hover:bg-white/10 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer flex items-center gap-3.5 group"
              >
                <div className="relative w-13 h-13 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                  <img 
                    src={m.photo} 
                    alt={m.name} 
                    className="w-full h-full object-cover"
                  />
                  {m.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#161922]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                      <span>{m.name}</span>
                      <span className="text-[10px] font-normal text-slate-400">({m.currentCity})</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                  </div>

                  <p className={`text-xs truncate ${m.unread ? 'font-bold text-slate-100' : 'text-slate-400'}`}>
                    {m.lastMessage}
                  </p>
                </div>

                {m.unread ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                ) : (
                  <CheckCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
