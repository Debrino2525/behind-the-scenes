import React from 'react';
import { Flame, Sparkles, MessageCircleHeart, User, Eye, PartyPopper } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, unreadCount, likesCount }) {
  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      icon: Flame,
    },
    {
      id: 'date_drops',
      label: 'Date Drops',
      icon: PartyPopper,
      highlight: true
    },
    {
      id: 'likes_you',
      label: 'Likes You',
      icon: Eye,
      badge: likesCount
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: MessageCircleHeart,
      badge: unreadCount
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
    }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto px-4 py-2 pointer-events-none">
      <div className="glass-panel backdrop-blur-2xl bg-[#0f121a]/90 rounded-3xl border border-white/10 shadow-2xl px-3 py-2 flex items-center justify-around pointer-events-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive 
                  ? 'text-amber-400 font-extrabold scale-105' 
                  : 'text-slate-400 hover:text-white font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-[1.8]'}`} />
                
                {/* Notification Badge */}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-black flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-amber-400 font-black' : 'text-slate-400'}`}>
                {tab.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
