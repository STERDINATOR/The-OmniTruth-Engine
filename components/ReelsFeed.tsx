
import React, { useState, useEffect } from 'react';
import { fetchTrendingReels, generateMatchingImage } from '../services/geminiService';
import { ReelData } from '../types';

const ReelsFeed: React.FC = () => {
    const [reels, setReels] = useState<ReelData[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Local state to track interactions since this data is static for now
    const [likes, setLikes] = useState<Record<string, number>>({});
    const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let isMounted = true;

        const loadReels = async () => {
            setLoading(true);
            const data = await fetchTrendingReels();
            if (!isMounted) return;

            setReels(data);
            
            // Initialize mock likes
            const initialLikes: Record<string, number> = {};
            data.forEach(r => initialLikes[r.id] = Math.floor(Math.random() * 9000) + 500);
            setLikes(initialLikes);
            
            setLoading(false);

            // Background Image Generation
            data.forEach(async (reel) => {
                const img = await generateMatchingImage(reel.headline, "9:16");
                if (isMounted && img) {
                    setReels(prev => prev.map(r => r.id === reel.id ? { ...r, imageUrl: img } : r));
                }
            });
        };
        loadReels();

        return () => { isMounted = false; };
    }, []);

    const handleLike = (id: string) => {
        setLikes(prev => ({
            ...prev,
            [id]: hasLiked[id] ? prev[id] - 1 : prev[id] + 1
        }));
        setHasLiked(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleComment = () => {
        alert("Discussion scrolls are currently being archived. Please check back later.");
    };

    const formatCount = (num: number) => {
        if (!num) return '0';
        return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
    };

    if (loading) {
        return (
            <div className="h-full w-full bg-black flex flex-col items-center justify-center text-white">
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="font-title text-xl">Loading Visuals...</h2>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory scroll-container no-scrollbar">
            {reels.map(reel => (
                <div key={reel.id} className="w-full h-full snap-start relative flex items-center justify-center bg-gray-900 border-b border-gray-800">
                    <img 
                        src={reel.imageUrl || reel.imageBase64} 
                        alt={reel.headline} 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000 ease-in-out" 
                    />
                    
                    {/* UI Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 flex flex-col justify-end p-6 pb-20">
                        <div className="flex justify-between items-end">
                            <div className="max-w-[80%]">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="bg-gold text-ink text-[10px] font-bold px-2 py-1 rounded uppercase">Verified Reel</span>
                                </div>
                                <h2 className="text-white font-heading text-3xl font-bold leading-none mb-2 drop-shadow-md">{reel.headline}</h2>
                                <p className="text-gray-200 font-body text-lg leading-tight drop-shadow-sm">{reel.snippet}</p>
                            </div>

                            <div className="flex flex-col gap-4 items-center pb-4">
                                <button 
                                    onClick={() => handleLike(reel.id)}
                                    className={`flex flex-col items-center gap-1 transition-colors ${hasLiked[reel.id] ? 'text-red-500' : 'text-white hover:text-red-400'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 ${hasLiked[reel.id] ? 'bg-red-500/20' : 'bg-white/20'}`}>
                                        <span className="text-xl">{hasLiked[reel.id] ? '❤️' : '🤍'}</span>
                                    </div>
                                    <span className="text-xs font-bold">{formatCount(likes[reel.id])}</span>
                                </button>
                                
                                <button 
                                    onClick={handleComment}
                                    className="flex flex-col items-center gap-1 text-white hover:text-gold transition-colors active:scale-90"
                                >
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                        <span className="text-xl">💬</span>
                                    </div>
                                    <span className="text-xs font-bold">300</span>
                                </button>
                                
                                <div className="w-12 h-12 rounded-full border-2 border-green-500 bg-black/50 flex items-center justify-center text-green-500 font-bold text-sm shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                                    {reel.trustScore}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReelsFeed;
