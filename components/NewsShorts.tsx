
import React, { useEffect, useState } from 'react';
import { fetchNewsShorts } from '../services/geminiService';
import { NewsShortItem } from '../types';

const NewsShorts: React.FC = () => {
    const [shorts, setShorts] = useState<NewsShortItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadShorts();
    }, []);

    const loadShorts = async () => {
        setLoading(true);
        const data = await fetchNewsShorts();
        setShorts(data);
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-ink text-parchment">
                <span className="text-4xl animate-bounce mb-4">📜</span>
                <h2 className="font-title text-2xl">Unrolling Daily Scrolls...</h2>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-parchment-dark overflow-y-scroll snap-y snap-mandatory scroll-container no-scrollbar relative">
            <div className="fixed top-4 left-0 right-0 z-20 pointer-events-none text-center">
                 <span className="bg-black/50 backdrop-blur-md text-parchment px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-gold/30">
                     Rapid Scrolls
                 </span>
            </div>

            {shorts.map((item, idx) => (
                <div key={item.id} className="w-full h-full snap-start relative flex flex-col bg-parchment">
                    {/* Image Section (Top Half) */}
                    <div className="h-[45%] w-full bg-gray-800 relative overflow-hidden">
                        <img 
                            src={item.imageUrl || `https://picsum.photos/seed/${item.id}/800/800`} 
                            onError={(e) => {
                                e.currentTarget.src = `https://picsum.photos/seed/${item.id}/800/800`;
                            }}
                            alt={item.headline} 
                            className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-parchment via-transparent to-transparent"></div>
                        <span className="absolute top-4 right-4 bg-maroon text-white text-[10px] font-bold px-2 py-1 rounded uppercase shadow-md">
                            {item.category}
                        </span>
                    </div>

                    {/* Content Section (Bottom Half) */}
                    <div className="h-[55%] p-6 flex flex-col relative">
                        <div className="flex-1">
                            <h2 className="font-heading text-3xl font-bold text-ink mb-4 leading-tight drop-shadow-sm">
                                {item.headline}
                            </h2>
                            <p className="font-body text-xl text-ink/90 leading-relaxed text-justify border-l-4 border-gold pl-4 mb-4">
                                {item.summary}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto border-t border-bronze/20 pt-4 flex justify-between items-center opacity-70">
                            <div className="text-xs text-ink-light">
                                <span className="block font-bold">Source: {item.sourceName}</span>
                                <span className="italic">{new Date(item.timestamp).toLocaleDateString()}</span>
                            </div>
                            <div className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">
                                Swipe for next
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Reload Trigger at bottom */}
            <div className="w-full h-32 snap-start flex items-center justify-center bg-ink text-gold">
                <button onClick={loadShorts} className="flex flex-col items-center gap-2">
                    <span className="text-3xl">↻</span>
                    <span className="font-button text-xl">Fetch Fresh Ink</span>
                </button>
            </div>
        </div>
    );
};

export default NewsShorts;
