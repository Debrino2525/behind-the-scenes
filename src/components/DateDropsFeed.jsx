import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Sparkles, 
  Plus, 
  Send, 
  X, 
  Camera, 
  Smile, 
  Award,
  PartyPopper,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_DATE_DROPS } from '../data/dateDropsData';

export default function DateDropsFeed({ matches, onOpenChatWithMatch }) {
  const [drops, setDrops] = useState(INITIAL_DATE_DROPS);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeCommentDropId, setActiveCommentDropId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  // New Post Form State
  const [selectedMatch, setSelectedMatch] = useState(matches[0]?.name || 'Nana Ama');
  const [venue, setVenue] = useState('');
  const [caption, setCaption] = useState('');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80');
  const [vibeRating, setVibeRating] = useState('⭐⭐⭐⭐⭐ Pure Chemistry');

  const handleLikeDrop = (dropId) => {
    setDrops(prev => prev.map(d => {
      if (d.id === dropId) {
        return {
          ...d,
          userLiked: !d.userLiked,
          likesCount: d.userLiked ? d.likesCount - 1 : d.likesCount + 1
        };
      }
      return d;
    }));
  };

  const handleCheerDrop = (dropId) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setDrops(prev => prev.map(d => {
      if (d.id === dropId) {
        return { ...d, cheersCount: d.cheersCount + 1 };
      }
      return d;
    }));
  };

  const handleAddComment = (dropId) => {
    if (!commentInput.trim()) return;
    setDrops(prev => prev.map(d => {
      if (d.id === dropId) {
        return {
          ...d,
          commentsCount: d.commentsCount + 1,
          comments: [
            ...d.comments,
            { id: Date.now().toString(), user: "You", text: commentInput.trim() }
          ]
        };
      }
      return d;
    }));
    setCommentInput('');
  };

  const handlePublishDateDrop = (e) => {
    e.preventDefault();
    if (!venue.trim() || !caption.trim()) return;

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#FFB800', '#E03638', '#008751', '#ffffff']
    });

    const newDrop = {
      id: `drop-${Date.now()}`,
      couple: `You & ${selectedMatch.split(' ')[0]}`,
      matchTag: "Matched on BTS • Real Date Verified",
      photo: photoUrl,
      venue: venue.trim(),
      venueCategory: "Community Date Drop",
      caption: caption.trim(),
      vibeRating: vibeRating,
      likesCount: 1,
      cheersCount: 1,
      commentsCount: 0,
      timestamp: "Just now",
      userLiked: true,
      comments: []
    };

    setDrops(prev => [newDrop, ...prev]);
    setIsPostModalOpen(false);
    setVenue('');
    setCaption('');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 animate-in fade-in select-none">
      
      {/* Feed Banner & Callout */}
      <div className="p-4 rounded-3xl glass-panel border border-amber-400/30 flex items-center justify-between shadow-xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>BTS Date Drops</span>
          </div>
          <h2 className="text-sm font-extrabold text-white">Real Dates from BTS Matches</h2>
          <p className="text-[11px] text-slate-400">
            Real couples. Real food. No staged studio shoots.
          </p>
        </div>

        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Drop Date</span>
        </button>
      </div>

      {/* Date Drop Cards List */}
      <div className="space-y-4">
        {drops.map(drop => (
          <div key={drop.id} className="rounded-3xl glass-panel border border-white/10 overflow-hidden shadow-2xl bg-[#11141d]">
            
            {/* Post Header */}
            <div className="p-3.5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 p-0.5 shadow-md">
                  <div className="w-full h-full rounded-[14px] bg-[#11141d] flex items-center justify-center font-black text-xs text-amber-300">
                    🥂
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-white">{drop.couple}</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-amber-400 font-semibold">{drop.matchTag}</p>
                </div>
              </div>

              <span className="text-[10px] text-slate-500 font-medium">{drop.timestamp}</span>
            </div>

            {/* Date Photo */}
            <div className="relative w-full h-72 bg-slate-900 overflow-hidden">
              <img 
                src={drop.photo} 
                alt="Date capture"
                className="w-full h-full object-cover"
              />

              {/* Venue Tag Overlay */}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-1.5 text-xs text-slate-100 shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="font-bold">{drop.venue}</span>
              </div>

              {/* Vibe rating pill */}
              <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-amber-400/30 text-[11px] font-bold text-amber-300">
                {drop.vibeRating}
              </div>
            </div>

            {/* Caption & Details */}
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "{drop.caption}"
              </p>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  {/* Like Button */}
                  <button 
                    onClick={() => handleLikeDrop(drop.id)}
                    className={`flex items-center gap-1.5 transition-colors font-bold ${
                      drop.userLiked ? 'text-red-400' : 'hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${drop.userLiked ? 'fill-red-400 text-red-400' : ''}`} />
                    <span>{drop.likesCount}</span>
                  </button>

                  {/* Cheers Button */}
                  <button 
                    onClick={() => handleCheerDrop(drop.id)}
                    className="flex items-center gap-1.5 hover:text-amber-400 transition-colors font-bold text-amber-300/80"
                    title="Send Cheers"
                  >
                    <PartyPopper className="w-4 h-4 text-amber-400" />
                    <span>{drop.cheersCount} Cheers</span>
                  </button>

                  {/* Comments Trigger */}
                  <button 
                    onClick={() => setActiveCommentDropId(activeCommentDropId === drop.id ? null : drop.id)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors font-bold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{drop.commentsCount}</span>
                  </button>
                </div>

                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Verified Date
                </span>
              </div>

              {/* Comments Section Drawer */}
              {activeCommentDropId === drop.id && (
                <div className="pt-3 border-t border-white/5 space-y-2 animate-in fade-in">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {drop.comments.map(c => (
                      <div key={c.id} className="p-2 rounded-xl bg-white/5 text-xs">
                        <strong className="text-amber-300 text-[11px] block">{c.user}</strong>
                        <span className="text-slate-200">{c.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input 
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(drop.id)}
                      placeholder="Cheer on this date..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    <button 
                      onClick={() => handleAddComment(drop.id)}
                      className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black"
                    >
                      <Send className="w-3.5 h-3.5 fill-black" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* POST A DATE DROP MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-[#131620] rounded-3xl overflow-hidden border border-amber-400/40 shadow-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black text-xs">
                  📸
                </div>
                <h3 className="font-extrabold text-sm text-white">Drop Your Date Story</h3>
              </div>
              <button onClick={() => setIsPostModalOpen(false)} className="p-1 rounded-full bg-white/5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishDateDrop} className="space-y-3 text-xs">
              
              {/* Select Match */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Who was the date with?</label>
                <select 
                  value={selectedMatch} 
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 appearance-none"
                >
                  {matches.map(m => (
                    <option key={m.id} value={m.name} className="bg-[#131620]">
                      {m.name} ({m.currentCity})
                    </option>
                  ))}
                  <option value="Nana Ama" className="bg-[#131620]">Nana Ama (Accra)</option>
                  <option value="Priya" className="bg-[#131620]">Priya (Port Louis)</option>
                  <option value="Kelebogile" className="bg-[#131620]">Kelebogile (Gaborone)</option>
                </select>
              </div>

              {/* Venue */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Where did you go? (Spot / Restaurant)</label>
                <input 
                  type="text" 
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="e.g. Buka Restaurant Osu, Skybar 25, Kokrobite Beach"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              {/* Date Story / Caption */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">What happened? (Keep it real)</label>
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  placeholder="How was the food, the laughter, who paid, did the banter hit?"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 resize-none"
                  required
                />
              </div>

              {/* Vibe rating */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Date Chemistry Rating</label>
                <select 
                  value={vibeRating}
                  onChange={(e) => setVibeRating(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 appearance-none"
                >
                  <option value="⭐⭐⭐⭐⭐ Pure Chemistry" className="bg-[#131620]">⭐⭐⭐⭐⭐ Pure Chemistry (Already planning date 2)</option>
                  <option value="⭐⭐⭐⭐ Great Banter" className="bg-[#131620]">⭐⭐⭐⭐ Great Banter & Amazing Food</option>
                  <option value="⭐⭐⭐ Solid Friend Vibes" className="bg-[#131620]">⭐⭐⭐ Solid Friend Vibes</option>
                </select>
              </div>

              {/* Publish CTA */}
              <button 
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 text-black font-extrabold text-xs shadow-lg shadow-amber-400/20 hover:scale-[1.01] active:scale-95 transition-all mt-2"
              >
                Post Date to Community
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
