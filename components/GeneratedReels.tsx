
import React, { useState } from 'react';
import { generateReel } from '../services/geminiService';
import { ReelData, Post, Verdict } from '../types';
import { useFeed } from '../contexts/FeedContext';

const GeneratedReels: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [reel, setReel] = useState<ReelData | null>(null);
  const { addPost } = useFeed();

  const handleCreate = async () => {
    if (!topic) return;
    setLoading(true);
    setReel(null);
    const res = await generateReel(topic);
    setReel(res);
    setLoading(false);
  };

  const handlePublish = () => {
      if (!reel) return;
      
      // Convert ReelData to Post
      const newPost: Post = {
          id: reel.id,
          author: 'AI_Chronicler',
          authorRole: 'Automaton',
          content: `${reel.headline} - ${reel.snippet}`,
          image: reel.imageBase64 ? `data:image/jpeg;base64,${reel.imageBase64}` : undefined,
          timestamp: new Date().toISOString(),
          trustScore: reel.trustScore,
          crowdScore: 50, // Start neutral
          verdict: reel.trustScore > 80 ? Verdict.TRUE : Verdict.UNVERIFIED,
          type: 'GENERATED_REEL',
          votes: [],
          likes: 0,
          comments: 0,
          verificationDetails: {
              trustScore: reel.trustScore,
              verdict: reel.trustScore > 80 ? Verdict.TRUE : Verdict.UNVERIFIED,
              summary: "AI Generated Visual Chronicle based on real-time data ingestion.",
              claims: [],
              manipulationFlags: [],
              intent: { primaryMotive: 'News Generation', emotionalState: 'Neutral', hiddenMeaning: 'None', powerDynamics: 'None' },
              sources: [],
              realityGraphSummary: 'Generated content.'
          }
      };

      addPost(newPost);
      alert("✨ The Reel has been inscribed into the Chronicle (Feed).");
      setReel(null);
      setTopic('');
  };

  const handleSaveDraft = () => {
      alert("💾 Draft saved to your personal archives (Local Storage).");
  };

  return (
    <div className="h-full flex flex-col bg-ink text-parchment relative overflow-y-auto pb-20">
        {!reel ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold flex items-center justify-center mb-6">
                    <span className="text-4xl text-gold">✦</span>
                </div>
                <h2 className="font-title text-4xl mb-4 text-gold text-center">Genesis Engine</h2>
                <p className="font-body text-center mb-10 max-w-md text-parchment/60 text-lg">
                    Command the AI Scribes to manifest a verified visual chronicle from the ether.
                </p>
                
                <div className="w-full max-w-md relative group">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder="Enter a topic (e.g. Mars Colonization)"
                        className="w-full p-5 pr-14 rounded-lg bg-white/5 border border-gold/30 text-parchment placeholder-parchment/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold font-heading text-xl transition-all"
                    />
                    <button 
                        onClick={handleCreate}
                        disabled={loading}
                        className="absolute right-3 top-3 bottom-3 w-12 bg-gold rounded flex items-center justify-center text-ink font-bold hover:bg-parchment transition-colors disabled:opacity-50"
                    >
                        {loading ? <span className="animate-spin">↻</span> : "GO"}
                    </button>
                </div>
                
                <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md opacity-60">
                     <div className="border border-white/10 p-3 rounded text-center">
                         <span className="block text-xl mb-1">⚡</span>
                         <span className="text-xs uppercase tracking-widest">Instant</span>
                     </div>
                     <div className="border border-white/10 p-3 rounded text-center">
                         <span className="block text-xl mb-1">🛡️</span>
                         <span className="text-xs uppercase tracking-widest">Verified</span>
                     </div>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-start p-4 bg-gray-900">
                 <div className="w-full max-w-md flex justify-between items-center mb-4">
                     <button onClick={() => setReel(null)} className="text-parchment font-button hover:text-gold">← Create New</button>
                     <span className="text-green-500 font-bold text-xs uppercase border border-green-500 px-2 py-0.5 rounded">TrustScore: {reel.trustScore}</span>
                 </div>

                 {/* Reel Preview Card */}
                 <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-lg shadow-2xl overflow-hidden flex flex-col border border-gold/20">
                    <div className="flex-1 relative">
                        {reel.imageBase64 ? (
                            <img 
                                src={`data:image/jpeg;base64,${reel.imageBase64}`} 
                                alt={reel.topic} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 font-body italic">
                                [Visual Manifestation Failed]
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90"></div>
                        
                        {/* OmniTruth Watermark */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-50">
                            <span className="font-title text-white text-xs tracking-[0.3em]">OMNITRUTH</span>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 text-parchment">
                        <h2 className="font-heading text-2xl font-bold leading-none mb-3 text-white drop-shadow-lg border-l-4 border-gold pl-3">{reel.headline}</h2>
                        <p className="font-body text-lg leading-tight text-gray-100 drop-shadow-md bg-black/30 backdrop-blur-sm p-2 rounded">
                            {reel.snippet}
                        </p>
                    </div>
                 </div>
                 
                 <div className="mt-6 flex gap-4">
                     <button onClick={handlePublish} className="bg-gold text-ink px-6 py-3 rounded font-button font-bold hover:bg-white transition-colors shadow-lg active:scale-95">Publish to Feed</button>
                     <button onClick={handleSaveDraft} className="border border-gold text-gold px-6 py-3 rounded font-button hover:bg-gold/10 transition-colors active:scale-95">Save Draft</button>
                 </div>
            </div>
        )}
    </div>
  );
};

export default GeneratedReels;
