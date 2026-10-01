import React from 'react';
import { X, Check, MapPin, Compass, Flame, Users, Sparkles, Globe } from 'lucide-react';

export default function FiltersModal({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters, 
  onReset 
}) {
  if (!isOpen) return null;

  const COUNTRIES = [
    'All Countries', 
    'Ghana 🇬🇭', 
    'Mauritius 🇲🇺', 
    'Botswana 🇧🇼', 
    'Namibia 🇳🇦', 
    'Morocco 🇲🇦'
  ];

  const HOMETOWNS = [
    'All Roots', 
    'Kumasi', 
    'Accra', 
    'Cape Coast', 
    'Ho / Volta', 
    'Tamale', 
    'Port Louis', 
    'Grand Baie', 
    'Mahebourg', 
    'Gaborone', 
    'Maun', 
    'Francistown', 
    'Windhoek', 
    'Swakopmund', 
    'Oshakati', 
    'Marrakech', 
    'Casablanca', 
    'Fès', 
    'Chefchaouen'
  ];

  const LOCATIONS = [
    'Anywhere', 
    'Ghana', 
    'Mauritius', 
    'Botswana', 
    'Namibia', 
    'Morocco', 
    'UK (London, etc.)', 
    'USA', 
    'Canada', 
    'Europe', 
    'Middle East'
  ];

  const TRIBES = [
    'All Heritages', 
    'Asante', 
    'Fante', 
    'Ewe', 
    'Ga-Adangbe', 
    'Akuapem', 
    'Indo-Mauritian', 
    'Creole', 
    'Tswana', 
    'Kalanga', 
    'Herero', 
    'Ovambo', 
    'Amazigh (Berber)', 
    'Jebala (Riffian)', 
    'Arab'
  ];

  const INTENTS = [
    'All Intentions', 
    'Long-term leading to marriage', 
    'Serious relationship', 
    'Dating to explore & vibe'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#131620] rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-base text-white">Community & Origin Filters</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Body */}
        <div className="p-5 overflow-y-auto space-y-6">

          {/* Festival Season / Homecoming Toggle */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/10 to-amber-500/10 border border-red-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-red-400 uppercase tracking-wide">
                <Flame className="w-4 h-4 fill-red-400" />
                <span>Festival Season Active</span>
              </div>
              <p className="text-xs text-slate-300">
                Show singles planning festivals & homecoming events
              </p>
            </div>
            <button 
              onClick={() => setFilters(prev => ({ ...prev, dettyDecemberOnly: !prev.dettyDecemberOnly }))}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                filters.dettyDecemberOnly ? 'bg-red-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                filters.dettyDecemberOnly ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Country Selection */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Country</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map(country => (
                <button
                  key={country}
                  onClick={() => setFilters(prev => ({ ...prev, country }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    filters.country === country 
                      ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {country}
                </button>
              ))}
            </div>
          </div>

          {/* Hometown / Roots */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ancestral Roots / Home Town</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {HOMETOWNS.map(town => (
                <button
                  key={town}
                  onClick={() => setFilters(prev => ({ ...prev, homeTown: town }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    filters.homeTown === town 
                      ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/20' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {town}
                </button>
              ))}
            </div>
          </div>

          {/* Living In / Location */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Residence (Local / Diaspora)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => setFilters(prev => ({ ...prev, location: loc }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    filters.location === loc 
                      ? 'bg-emerald-400 text-black border-emerald-400 shadow-md shadow-emerald-400/20' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Tribe / Heritage */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Tribe / Heritage</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRIBES.map(tr => (
                <button
                  key={tr}
                  onClick={() => setFilters(prev => ({ ...prev, tribe: tr }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    filters.tribe === tr 
                      ? 'bg-white text-black border-white shadow-md' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  {tr}
                </button>
              ))}
            </div>
          </div>

          {/* Intent */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dating Intent</span>
            </div>
            <div className="flex flex-col gap-2">
              {INTENTS.map(it => (
                <button
                  key={it}
                  onClick={() => setFilters(prev => ({ ...prev, intent: it }))}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border flex items-center justify-between ${
                    filters.intent === it 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{it}</span>
                  {filters.intent === it && <Check className="w-4 h-4 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0c0e14] flex items-center justify-between">
          <button 
            onClick={onReset}
            className="text-xs font-bold text-slate-400 hover:text-white"
          >
            Reset All
          </button>

          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-400/20 hover:bg-amber-300 transition-all"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  );
}
