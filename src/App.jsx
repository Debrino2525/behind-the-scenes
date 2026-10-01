import React, { useState, useMemo } from 'react';
import AgeGate from './components/AgeGate';
import Header from './components/Header';
import CardStack from './components/CardStack';
import BtsRevealModal from './components/BtsRevealModal';
import FiltersModal from './components/FiltersModal';
import MatchesDrawer from './components/MatchesDrawer';
import ChatModal from './components/ChatModal';
import MatchCelebrationModal from './components/MatchCelebrationModal';
import ProfileModal from './components/ProfileModal';
import ReportBlockModal from './components/ReportBlockModal';
import SafetyCenter from './components/SafetyCenter';
import AdminConsole from './components/AdminConsole';
import AntiCatfishModal from './components/AntiCatfishModal';
import SponsoredAdCard from './components/SponsoredAdCard';
import { INITIAL_PROFILES, INITIAL_MATCHES } from './data/mockProfiles';
import { INITIAL_SPONSORED_ADS } from './data/adminData';
import confetti from 'canvas-confetti';

export default function App() {
  // Age Gate — must pass before accessing app (Google Play + Apple requirement)
  const [ageVerified, setAgeVerified] = useState(false);

  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedBtsProfile, setSelectedBtsProfile] = useState(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeChatMatch, setActiveChatMatch] = useState(null);
  const [newMatchCelebration, setNewMatchCelebration] = useState(null);

  // Compliance & Ops Modals
  const [reportTarget, setReportTarget] = useState(null);
  const [isSafetyCenterOpen, setIsSafetyCenterOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAntiCatfishOpen, setIsAntiCatfishOpen] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);
  const [sponsoredAds] = useState(INITIAL_SPONSORED_ADS);
  const [adSwipeCounter, setAdSwipeCounter] = useState(0);
  const [showingAd, setShowingAd] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    country: 'All Countries',
    homeTown: 'All Roots',
    location: 'Anywhere',
    tribe: 'All Heritages',
    intent: 'All Intentions',
    dettyDecemberOnly: false
  });

  // Filtered Profile Queue
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (filters.dettyDecemberOnly && !p.dettyDecemberReady) return false;
      if (filters.country && filters.country !== 'All Countries') {
        const countryName = filters.country.split(' ')[0].toLowerCase();
        const profileCountry = (p.country || '').toLowerCase();
        if (!profileCountry.includes(countryName)) return false;
      }
      if (filters.homeTown !== 'All Roots' && !p.homeTown.toLowerCase().includes(filters.homeTown.toLowerCase().split(' ')[0])) return false;
      if (filters.tribe !== 'All Heritages' && !p.tribe.toLowerCase().includes(filters.tribe.toLowerCase())) return false;
      if (filters.intent !== 'All Intentions' && p.intent !== filters.intent) return false;
      return true;
    });
  }, [profiles, filters]);

  const currentProfile = filteredProfiles[currentIndex] || null;

  // Swipe Actions & Sponsored Ad Interleaving
  const advanceQueue = () => {
    const nextCount = adSwipeCounter + 1;
    setAdSwipeCounter(nextCount);
    if (nextCount % 3 === 0 && sponsoredAds.length > 0 && !showingAd) {
      setShowingAd(true);
    } else {
      setShowingAd(false);
      if (currentIndex < filteredProfiles.length) {
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const handlePass = () => {
    advanceQueue();
  };

  const triggerMatchCelebration = (matchedProfile) => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#FFB800', '#E03638', '#008751', '#ffffff']
    });

    const newMatchItem = {
      id: matchedProfile.id,
      name: matchedProfile.name,
      photo: matchedProfile.mainPhotos[0],
      lastMessage: "You both connected through Behind The Scenes!",
      time: "Just now",
      unread: true,
      online: true,
      hometown: matchedProfile.homeTown,
      currentCity: matchedProfile.currentCity.split(' ')[0],
      btsUnlocked: true
    };

    setMatches(prev => [newMatchItem, ...prev]);
    setNewMatchCelebration(matchedProfile);
  };

  const handleLike = () => {
    if (!currentProfile) return;
    triggerMatchCelebration(currentProfile);
    advanceQueue();
  };

  const handleSuperLike = () => {
    if (!currentProfile) return;
    triggerMatchCelebration(currentProfile);
    advanceQueue();
  };

  const handleResetFilters = () => {
    setFilters({
      country: 'All Countries',
      homeTown: 'All Roots',
      location: 'Anywhere',
      tribe: 'All Heritages',
      intent: 'All Intentions',
      dettyDecemberOnly: false
    });
    setCurrentIndex(0);
  };

  const handleResetDeck = () => {
    setCurrentIndex(0);
  };

  // Compliance: Report & Block handlers
  const handleReport = (userName, reason, details) => {
    console.log('[BTS Safety] Report submitted:', { userName, reason, details, timestamp: new Date().toISOString() });
  };

  const handleBlock = (userName) => {
    console.log('[BTS Safety] User blocked:', { userName, timestamp: new Date().toISOString() });
  };

  const unreadMatchesCount = matches.filter(m => m.unread).length;

  // Age Gate — blocks entire app until verified
  if (!ageVerified) {
    return <AgeGate onVerified={() => setAgeVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      
      {/* Top Header */}
      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFilters={() => setIsFiltersOpen(true)}
        onOpenSafety={() => setIsSafetyCenterOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenVerify={() => setIsAntiCatfishOpen(true)}
        unreadCount={unreadMatchesCount}
        dettyMode={filters.dettyDecemberOnly}
        setDettyMode={(val) => setFilters(prev => ({ ...prev, dettyDecemberOnly: val }))}
        isUserVerified={isUserVerified}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-center">
        {activeTab === 'discover' && (
          showingAd ? (
            <SponsoredAdCard 
              ad={sponsoredAds[adSwipeCounter % sponsoredAds.length]}
              onPass={() => setShowingAd(false)}
              onLike={() => setShowingAd(false)}
            />
          ) : (
            <CardStack 
              profile={currentProfile}
              onLike={handleLike}
              onPass={handlePass}
              onSuperLike={handleSuperLike}
              onOpenBtsModal={(p) => setSelectedBtsProfile(p)}
              onResetDeck={handleResetDeck}
              onReport={(profileName) => setReportTarget(profileName)}
            />
          )
        )}

        {activeTab === 'matches' && (
          <MatchesDrawer 
            matches={matches}
            onSelectMatch={(m) => setActiveChatMatch(m)}
            onBackToDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileModal 
            onBack={() => setActiveTab('discover')}
            onOpenSafety={() => setIsSafetyCenterOpen(true)}
          />
        )}
      </main>

      {/* Behind The Scenes Raw Candid Modal */}
      {selectedBtsProfile && (
        <BtsRevealModal 
          profile={selectedBtsProfile}
          onClose={() => setSelectedBtsProfile(null)}
          onLike={() => {
            handleLike();
            setSelectedBtsProfile(null);
          }}
        />
      )}

      {/* Filters Modal */}
      <FiltersModal 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Match Celebration Dialog */}
      {newMatchCelebration && (
        <MatchCelebrationModal 
          match={newMatchCelebration}
          onStartChat={() => {
            const m = matches.find(item => item.id === newMatchCelebration.id) || matches[0];
            setNewMatchCelebration(null);
            setActiveChatMatch(m);
          }}
          onContinue={() => setNewMatchCelebration(null)}
        />
      )}

      {/* Real-time Simulated Chat Modal */}
      {activeChatMatch && (
        <ChatModal 
          match={activeChatMatch}
          onClose={() => setActiveChatMatch(null)}
          onReport={(name) => setReportTarget(name)}
        />
      )}

      {/* Compliance: Report & Block Modal */}
      <ReportBlockModal 
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetUser={reportTarget}
        onBlock={handleBlock}
        onReport={handleReport}
      />

      {/* Compliance: Safety & Legal Center */}
      <SafetyCenter 
        isOpen={isSafetyCenterOpen}
        onClose={() => setIsSafetyCenterOpen(false)}
      />

      {/* Trust & Ops: Admin Console */}
      {isAdminOpen && (
        <AdminConsole 
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Security: Anti-Catfish Liveness Selfie Verification */}
      <AntiCatfishModal 
        isOpen={isAntiCatfishOpen}
        onClose={() => setIsAntiCatfishOpen(false)}
        onVerified={() => setIsUserVerified(true)}
      />

    </div>
  );
}
