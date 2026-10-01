import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Camera, 
  Mic, 
  MapPin, 
  Compass, 
  Flame, 
  Sparkles, 
  Save, 
  Upload,
  Check
} from 'lucide-react';

export default function ProfileModal({ onBack }) {
  const [name, setName] = useState('Kobby Addo');
  const [age, setAge] = useState(28);
  const [occupation, setOccupation] = useState('Creative Director & Brand Strategist');
  const [city, setCity] = useState('London & Accra');
  const [hometown, setHometown] = useState('Kumasi');
  const [tribe, setTribe] = useState('Asante');
  const [dettyDec, setDettyDec] = useState(true);
  const [btsCaption, setBtsCaption] = useState('Behind the scenes: Arguing with the tailor in Osu over my linen shirt fitting.');
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSave = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[85vh] flex flex-col bg-[#0e1017] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between glass-panel">
        <button 
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/10 flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Discover</span>
        </button>

        <h2 className="font-extrabold text-sm text-white">My BTS Profile</h2>

        <button 
          onClick={handleSave}
          className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black flex items-center gap-1 transition-all"
        >
          {savedAlert ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedAlert ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">

        {/* Profile Avatar & Verified State */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-2 border-amber-400 p-1 shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=80" 
              alt="My Avatar"
              className="w-full h-full object-cover rounded-2xl"
            />
            <button className="absolute bottom-1 right-1 p-2 rounded-xl bg-black/70 hover:bg-black text-white backdrop-blur-sm border border-white/20">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-3">
            <h3 className="text-lg font-black text-white">{name}, {age}</h3>
            <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/20" title="Verified Ghanaian Profile" />
          </div>
          <p className="text-xs text-slate-400 font-medium">{occupation}</p>
        </div>

        {/* The Core Feature: My Behind The Scenes Story */}
        <div className="p-4 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-red-500/10 to-emerald-500/10 border border-amber-400/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400 text-black flex items-center justify-center font-black text-xs">
                ★
              </div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                My Unfiltered "Behind The Scenes"
              </h4>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Active
            </span>
          </div>

          <p className="text-[11px] text-slate-300">
            This is what matches see when they tap your BTS reveal. Keep it candid, funny, and 100% real.
          </p>

          <textarea 
            value={btsCaption}
            onChange={(e) => setBtsCaption(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          />

          <div className="flex items-center gap-2">
            <button className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload Raw Photo/Video</span>
            </button>
            <button className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-colors">
              <Mic className="w-3.5 h-3.5 text-red-400" />
              <span>Record Voice Note</span>
            </button>
          </div>
        </div>

        {/* Heritage & Cultural Identifiers */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Ghanaian Heritage & Roots
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Ancestral Home Town</label>
              <input 
                type="text" 
                value={hometown} 
                onChange={(e) => setHometown(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Tribe / Ethnicity</label>
              <input 
                type="text" 
                value={tribe} 
                onChange={(e) => setTribe(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Current Base / Living In</label>
            <input 
              type="text" 
              value={city} 
              onChange={(e) => setCity(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Detty December Homecoming Toggle */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${dettyDec ? 'text-red-400 fill-red-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-xs font-bold text-white block">Detty December Active</span>
                <span className="text-[10px] text-slate-400">Badge shows you will be in Ghana for Dec festivities</span>
              </div>
            </div>
            <button 
              onClick={() => setDettyDec(!dettyDec)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                dettyDec ? 'bg-red-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                dettyDec ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
