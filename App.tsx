
import React, { useState } from 'react';
import Feed from './components/Feed';
import TruthChamber from './components/TruthChamber';
import RealityFork from './components/RealityFork';
import GeneratedReels from './components/GeneratedReels';
import ReelsFeed from './components/ReelsFeed';
import LandingPage from './components/LandingPage';
import SearchPage from './components/SearchPage';
import NewsShorts from './components/NewsShorts';
import { FeedProvider } from './contexts/FeedContext';

enum Tab {
  FEED = 'FEED',
  SEARCH = 'SEARCH',
  REELS = 'REELS',
  SHORTS = 'SHORTS',
  GENESIS = 'GENESIS',
  CHAMBER = 'CHAMBER',
  FORK = 'FORK'
}

// Mock User for UI display
const CURRENT_USER = {
  name: "Archivist_Zero",
  credibilityScore: 88,
  role: "Expert"
};

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab>(Tab.FEED);

  const renderContent = () => {
    switch (currentTab) {
      case Tab.FEED: return <Feed />;
      case Tab.SEARCH: return <SearchPage />;
      case Tab.REELS: return <ReelsFeed />;
      case Tab.SHORTS: return <NewsShorts />;
      case Tab.CHAMBER: return <TruthChamber />;
      case Tab.FORK: return <RealityFork />;
      case Tab.GENESIS: return <GeneratedReels />;
      default: return <Feed />;
    }
  };

  const isScrollableTab = (tab: Tab) => {
    return tab === Tab.FEED || tab === Tab.CHAMBER || tab === Tab.FORK || tab === Tab.SEARCH;
  };

  if (!hasEntered) {
    return <LandingPage onEnter={() => setHasEntered(true)} />;
  }

  return (
    <FeedProvider>
      <div className="h-screen w-full bg-parchment bg-parchment-texture text-ink font-body flex flex-col overflow-hidden">
        {/* Header - Fixed height, flex-none */}
        {currentTab !== Tab.REELS && currentTab !== Tab.SHORTS && (
            <header className="flex-none h-14 z-30 bg-parchment-dark/95 backdrop-blur-sm border-b border-bronze/40 shadow-sm flex items-center justify-between px-4 relative transition-all duration-500">
              {/* Left Placeholder for balance */}
              <div className="w-20"></div>

              {/* Logo */}
              <span className="font-title text-2xl tracking-widest text-maroon font-black drop-shadow-sm">OMNITRUTH</span>
              
              {/* User Credibility Profile */}
              <div className="w-auto flex items-center gap-3 justify-end">
                 <div className="hidden sm:flex flex-col items-end leading-none">
                     <span className="text-[9px] uppercase font-bold text-ink/50 tracking-wider">Credibility</span>
                     <span className="font-heading font-bold text-lg text-maroon tabular-nums">{CURRENT_USER.credibilityScore}</span>
                 </div>
                 <div className="relative group cursor-pointer">
                    <div className="w-9 h-9 rounded-full border border-gold bg-parchment flex items-center justify-center text-sm shadow-sm overflow-hidden">
                        <span className="font-title font-bold text-ink">A</span>
                    </div>
                    {/* Trust Indicator Dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-parchment ${CURRENT_USER.credibilityScore > 80 ? 'bg-green-600' : 'bg-yellow-500'}`}></div>
                 </div>
              </div>
            </header>
        )}

        {/* Main Content Area - Flex-1 to take remaining space */}
        <main className="flex-1 w-full relative overflow-hidden bg-parchment/50">
          <div 
              key={currentTab} 
              className={`w-full h-full animate-subtle-zoom ${isScrollableTab(currentTab) ? 'overflow-y-auto scroll-container' : 'overflow-hidden'}`}
          >
              {renderContent()}
          </div>
        </main>

        {/* Bottom Navigation Bar - Fixed height, flex-none */}
        <nav className="flex-none h-16 z-40 bg-ink text-parchment border-t-4 border-gold flex justify-around items-center px-1 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto">
          <button 
              onClick={() => setCurrentTab(Tab.FEED)}
              className={`flex flex-col items-center justify-center min-w-[50px] w-full h-full transition-colors duration-300 ${currentTab === Tab.FEED ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}
          >
              <span className={`text-xl mb-1 ${currentTab === Tab.FEED ? 'scale-110' : ''}`}>📜</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">Feed</span>
          </button>

          <button 
              onClick={() => setCurrentTab(Tab.SEARCH)}
              className={`flex flex-col items-center justify-center min-w-[50px] w-full h-full transition-colors duration-300 ${currentTab === Tab.SEARCH ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}
          >
              <span className={`text-xl mb-1 ${currentTab === Tab.SEARCH ? 'scale-110' : ''}`}>🔍</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">Find</span>
          </button>

          <button 
              onClick={() => setCurrentTab(Tab.SHORTS)}
              className={`flex flex-col items-center justify-center min-w-[50px] w-full h-full transition-colors duration-300 ${currentTab === Tab.SHORTS ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}
          >
              <span className={`text-xl mb-1 ${currentTab === Tab.SHORTS ? 'scale-110' : ''}`}>⚡</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">Shorts</span>
          </button>

          <button 
              onClick={() => setCurrentTab(Tab.GENESIS)}
              className={`group flex flex-col items-center justify-center min-w-[50px] w-full h-full relative`}
          >
              <div className={`w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center mb-6 shadow-lg transform transition-all duration-300 group-hover:scale-110 ${currentTab === Tab.GENESIS ? 'bg-gold text-ink scale-110' : 'bg-maroon text-parchment'}`}>
                  <span className="text-xl">✦</span>
              </div>
              <span className={`absolute bottom-2 text-[9px] uppercase font-bold tracking-wider transition-colors duration-300 ${currentTab === Tab.GENESIS ? 'text-gold' : 'text-parchment/50'}`}>Create</span>
          </button>

          <button 
              onClick={() => setCurrentTab(Tab.REELS)}
              className={`flex flex-col items-center justify-center min-w-[50px] w-full h-full transition-colors duration-300 ${currentTab === Tab.REELS ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}
          >
              <span className={`text-xl mb-1 ${currentTab === Tab.REELS ? 'scale-110' : ''}`}>🎬</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">Reels</span>
          </button>

          <button 
              onClick={() => setCurrentTab(Tab.CHAMBER)}
              className={`flex flex-col items-center justify-center min-w-[50px] w-full h-full transition-colors duration-300 ${currentTab === Tab.CHAMBER ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}
          >
              <span className={`text-xl mb-1 ${currentTab === Tab.CHAMBER ? 'scale-110' : ''}`}>⚖️</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">Truth</span>
          </button>

          <button 
              onClick={() => setCurrentTab(Tab.FORK)}
              className={`flex flex-col items-center justify-center min-w-[50px] w-full h-full transition-colors duration-300 ${currentTab === Tab.FORK ? 'text-gold' : 'text-parchment/50 hover:text-parchment'}`}
          >
              <span className={`text-xl mb-1 ${currentTab === Tab.FORK ? 'scale-110' : ''}`}>🔮</span>
              <span className="text-[9px] uppercase font-bold tracking-wider">Fork</span>
          </button>
        </nav>
      </div>
    </FeedProvider>
  );
};

export default App;
