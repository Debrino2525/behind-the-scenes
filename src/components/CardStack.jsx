import React, { useState } from 'react';
import { 
  Heart, 
  X, 
  Sparkles, 
  Play, 
  Pause, 
  MapPin, 
  Volume2, 
  ShieldCheck, 
  Eye, 
  Compass, 
  Flame, 
  Info,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Flag
} from 'lucide-react';

export default function CardStack({ 
  profile, 
  onLike, 
  onPass, 
  onSuperLike, 
  onOpenBtsModal,
  onResetDeck,
  onReport
}) {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  if (!profile) {
    return (
      <div className="w-full max-w-md mx-auto h-[600px] rounded-3xl glass-panel p-8 flex flex-col items-center justify-center text-center border border-white/10 shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">You've Caught Up!</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">
          No more Ghanaian profiles matching your current filters. Reset the queue or expand your hometown search.
        </p>
        <button 
          onClick={onResetDeck}
          className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
        >
          Reload Profiles
        </button>
      </div>
    );
  }

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIdx < profile.mainPhotos.length - 1) {
      setCurrentPhotoIdx(prev => prev + 1);
    } else {
      setCurrentPhotoIdx(0);
    }
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIdx > 0) {
      setCurrentPhotoIdx(prev => prev - 1);
    } else {
      setCurrentPhotoIdx(profile.mainPhotos.length - 1);
    }
  };

  const toggleAudio = (e) => {
    e.stopPropagation();
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center select-none pb-20">
      {/* Main Card Container */}
      <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl bg-[#12151e] transition-all">
        
        {/* Photo Carousel Area */}
        <div className="relative h-[480px] w-full bg-slate-900 overflow-hidden cursor-pointer" onClick={handleNextPhoto}>
          <img 
            src={profile.mainPhotos[currentPhotoIdx]} 
            alt={profile.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Top Indicators Bar */}
          <div className="absolute top-3 left-0 right-0 px-4 flex gap-1.5 z-20">
            {profile.mainPhotos.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-all ${
                  i === currentPhotoIdx ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          {/* Left / Right touch triggers for photos */}
          <button 
            onClick={handlePrevPhoto} 
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/70 hover:text-white z-20 backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNextPhoto} 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white/70 hover:text-white z-20 backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Top Badges */}
          <div className="absolute top-7 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                {profile.countryFlag} {profile.country}
              </span>

              {/* Tribe Badge */}
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/40">
                🇬🇭 {profile.tribe}
              </span>
              
              {/* Detty December Ready */}
              {profile.dettyDecemberReady && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/80 backdrop-blur-md text-white flex items-center gap-1 border border-red-400/30">
                  <Flame className="w-3 h-3 fill-white" /> In GH Dec
                </span>
              )}
            </div>

            {/* Behind the scenes prompt pill */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onOpenBtsModal(profile);
              }}
              className="pointer-events-auto px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/30 animate-pulse hover:scale-105 transition-transform"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>See BTS</span>
            </button>
          </div>

          {/* Bottom Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#12151e] via-[#12151e]/80 to-transparent pointer-events-none" />

          {/* Basic Info pinned over image bottom */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-white">{profile.name}, {profile.age}</h2>
              {profile.verified && (
                <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/20" title="Identity Verified" />
              )}
            </div>
            
            <p className="text-sm font-semibold text-slate-200 mb-2">
              {profile.occupation}
            </p>

            <div className="flex flex-wrap gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{profile.currentCity}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm border border-white/10">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Roots: <strong>{profile.homeTown}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Below Photo: Authentic Voice Note & BTS Teaser */}
        <div className="p-4 space-y-4">
          
          {/* Audio Note Widget */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{profile.voiceNote.audioPreviewTitle}</h4>
                  <span className="text-[10px] text-slate-400">{profile.voiceNote.duration} • Authentic Voice Note</span>
                </div>
              </div>
              <button 
                onClick={toggleAudio}
                className="w-9 h-9 rounded-full bg-amber-400 hover:bg-amber-300 text-black flex items-center justify-center transition-all shadow-md shadow-amber-400/20"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
            </div>

            {/* Animated sound wave bars */}
            <div className="flex items-center gap-1 py-1 px-2 bg-black/30 rounded-lg">
              {[4, 12, 18, 8, 22, 14, 19, 10, 16, 6, 20, 14, 8, 16, 12, 24, 14, 8, 12, 6, 18, 14].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all ${
                    isPlayingAudio ? 'bg-amber-400 sound-bar' : 'bg-slate-600'
                  }`}
                  style={{ height: isPlayingAudio ? undefined : `${h}px` }}
                />
              ))}
            </div>

            {/* Transcript preview */}
            <div className="mt-2 text-xs text-slate-300 italic">
              "{profile.voiceNote.transcript}"
            </div>
          </div>

          {/* BTS Unfiltered Prompt Box */}
          <div 
            onClick={() => onOpenBtsModal(profile)}
            className="group relative p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-emerald-500/10 border border-amber-500/30 cursor-pointer hover:border-amber-400 transition-all flex items-center gap-3"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
              <img 
                src={profile.behindTheScenes.thumbnail} 
                alt="BTS preview" 
                className="w-full h-full object-cover filter blur-[2px] group-hover:blur-0 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>Behind The Scenes Moment</span>
              </div>
              <p className="text-xs font-medium text-slate-200 truncate">
                {profile.behindTheScenes.caption}
              </p>
              <span className="text-[10px] text-slate-400">
                Tap to unlock unfiltered candid
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
          </div>

          {/* Cultural Q&A Prompt */}
          {profile.culturalPrompts.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {item.question}
              </span>
              <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                "{item.answer}"
              </p>
            </div>
          ))}

          {/* Intent & Language Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300">
              🎯 {profile.intent}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300">
              🗣️ {profile.languages.join(', ')}
            </span>
          </div>

          {/* Report Profile — Apple Guideline 1.2 + Google Play Safety */}
          <button 
            onClick={() => onReport && onReport(profile.name)}
            className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-slate-500 hover:text-red-400 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all mt-1"
          >
            <Flag className="w-3 h-3" />
            <span>Report Profile</span>
          </button>

        </div>
      </div>

      {/* Floating Action Controls */}
      <div className="fixed bottom-5 max-w-md w-full px-8 flex items-center justify-between z-30 pointer-events-auto">
        {/* Pass Button */}
        <button 
          onClick={onPass}
          className="w-14 h-14 rounded-full bg-slate-900/90 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center shadow-xl shadow-red-500/20 hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
          title="Pass"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* BTS Quick Flip View */}
        <button 
          onClick={() => onOpenBtsModal(profile)}
          className="w-12 h-12 rounded-full bg-slate-900/90 border border-amber-400/40 text-amber-300 hover:bg-amber-400 hover:text-black flex items-center justify-center shadow-lg shadow-amber-400/20 hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
          title="Quick BTS Candid Peek"
        >
          <Eye className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Super Like / Spark */}
        <button 
          onClick={onSuperLike}
          className="w-12 h-12 rounded-full bg-slate-900/90 border border-blue-400/40 text-blue-400 hover:bg-blue-400 hover:text-black flex items-center justify-center shadow-lg shadow-blue-400/20 hover:scale-110 active:scale-95 transition-all backdrop-blur-md"
          title="Super Like"
        >
          <Sparkles className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Like Button */}
        <button 
          onClick={onLike}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-black flex items-center justify-center shadow-xl shadow-emerald-500/30 hover:scale-110 active:scale-95 transition-all font-bold"
          title="Like"
        >
          <Heart className="w-6 h-6 fill-black stroke-black" />
        </button>
      </div>

    </div>
  );
}
