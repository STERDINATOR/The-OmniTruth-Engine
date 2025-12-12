import React, { useState } from 'react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onEnter, 800); // Wait for animation
  };

  return (
    <div className={`fixed inset-0 z-50 bg-parchment bg-parchment-texture flex flex-col items-center justify-center p-6 text-center transition-all duration-1000 ${isExiting ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Decorative Border */}
      <div className="absolute inset-4 border-4 border-double border-bronze/40 rounded-lg pointer-events-none"></div>
      <div className="absolute inset-6 border border-bronze/20 rounded pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        
        {/* Animated Logo/Seal */}
        <div className="mb-8 relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-gold rounded-full animate-[spin_10s_linear_infinite] opacity-30 border-dashed"></div>
            <div className="absolute inset-2 border-2 border-maroon rounded-full"></div>
            <span className="font-title text-6xl text-maroon animate-pulse">✦</span>
        </div>

        <h1 className="font-title text-5xl md:text-6xl text-maroon font-black mb-4 drop-shadow-md tracking-wider">
          OMNITRUTH
          <span className="block text-2xl md:text-3xl text-gold mt-2 font-heading tracking-widest font-normal">ENGINE</span>
        </h1>

        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-bronze to-transparent my-6"></div>

        <p className="font-body text-xl md:text-2xl text-ink mb-10 leading-relaxed">
          The world's first <span className="font-bold text-maroon">AI-Verified</span> social ecosystem. 
          Discover truth in a sea of noise through the lens of history.
        </p>

        <button 
          onClick={handleEnter}
          className="group relative px-10 py-4 bg-transparent overflow-hidden rounded shadow-lg border-2 border-gold transition-all hover:scale-105 active:scale-95"
        >
            <div className="absolute inset-0 w-full h-full bg-parchment-dark group-hover:bg-gold transition-colors duration-300"></div>
            <span className="relative font-button text-2xl text-ink font-bold tracking-widest uppercase group-hover:text-parchment-light transition-colors">
                Enter the Archive
            </span>
        </button>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-3 gap-4 w-full text-ink-light opacity-80">
            <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">⚖️</span>
                <span className="text-xs uppercase font-bold tracking-wider">TrustScore</span>
            </div>
            <div className="flex flex-col items-center border-l border-r border-bronze/30">
                <span className="text-2xl mb-2">🔮</span>
                <span className="text-xs uppercase font-bold tracking-wider">RealityFork</span>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-2xl mb-2">📜</span>
                <span className="text-xs uppercase font-bold tracking-wider">Chronicle</span>
            </div>
        </div>

        <div className="absolute bottom-8 text-[10px] uppercase font-bold text-bronze tracking-[0.3em] opacity-50">
            Est. 2025 • Veritatem Quaerens
        </div>
      </div>
    </div>
  );
};

export default LandingPage;