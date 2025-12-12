
import React, { useEffect, useState } from 'react';
import { Post } from '../types';
import { analyzeTextDeeply } from '../services/geminiService';

interface InspectModalProps {
  post: Post;
  onClose: () => void;
  onUpdatePost?: (post: Post) => void;
  forceAnalysis?: boolean;
}

const InspectModal: React.FC<InspectModalProps> = ({ post, onClose, onUpdatePost, forceAnalysis = false }) => {
  const [loading, setLoading] = useState(forceAnalysis);
  const [localPost, setLocalPost] = useState<Post>(post);

  useEffect(() => {
    // If verification details are missing OR analysis is forced, fetch immediately
    if (!localPost.verificationDetails || forceAnalysis) {
        handleDeepAnalysis();
    }
  }, []);

  const handleDeepAnalysis = async () => {
    setLoading(true);
    // Use 'NEWS' as generic default, or infer from context if possible
    const deepData = await analyzeTextDeeply(localPost.content, 'NEWS');
    
    const updatedPost = {
        ...localPost,
        verificationDetails: deepData,
        // Sync top-level scores if they were missing/placeholder
        trustScore: deepData.trustScore,
        verdict: deepData.verdict
    };

    setLocalPost(updatedPost);
    setLoading(false);

    if (onUpdatePost) {
        onUpdatePost(updatedPost);
    }
  };

  const hasData = !!localPost.verificationDetails;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-parchment w-full max-w-lg max-h-[90vh] flex flex-col rounded-lg shadow-2xl overflow-hidden border-2 border-gold" onClick={e => e.stopPropagation()}>
            <div className="bg-maroon p-4 text-parchment flex justify-between items-center shrink-0">
                <h3 className="font-title text-xl tracking-wider flex items-center gap-2">
                    Evidence Dossier
                    {loading && <span className="animate-spin text-sm">⏳</span>}
                </h3>
                <button onClick={onClose} className="hover:text-gold transition-colors text-xl font-bold">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto scroll-container flex-1">
                {hasData && !loading ? (
                <>
                    {/* Scores Header */}
                    <div className="flex items-center justify-between mb-6 bg-parchment-light p-4 rounded-lg border border-bronze/20 shadow-inner">
                        {/* AI Trust Score */}
                        <div className="flex items-center gap-3">
                            <div className={`text-3xl font-title font-bold border-4 border-double rounded-full w-16 h-16 flex items-center justify-center bg-white shadow-sm ${localPost.trustScore >= 70 ? 'border-green-600 text-green-800' : localPost.trustScore < 40 ? 'border-red-600 text-red-800' : 'border-orange-600 text-orange-800'}`}>
                                {localPost.trustScore}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">AI TrustScore</div>
                                <div className="font-heading text-xl font-bold leading-none">{localPost.verdict}</div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-10 w-px bg-bronze/30"></div>

                        {/* Crowd Score */}
                        <div className="flex items-center gap-3 justify-end">
                            <div className="text-right">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Crowd Consensus</div>
                                <div className="font-heading text-xl font-bold leading-none text-antiqueBlue">{localPost.crowdScore}%</div>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-antiqueBlue/30 flex items-center justify-center bg-antiqueBlue/5 text-xl">
                                👥
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Content Details */}
                    {localPost.verificationDetails && (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="bg-white/50 p-4 rounded-sm border-l-4 border-gold shadow-sm">
                            <h4 className="font-bold text-xs uppercase text-ink/50 mb-1 tracking-wider">Analysis Summary</h4>
                            <p className="font-body text-lg leading-relaxed">{localPost.verificationDetails.realityGraphSummary || localPost.verificationDetails.summary}</p>
                        </div>
                        
                        {/* Claims */}
                        {localPost.verificationDetails.claims.length > 0 && (
                            <div>
                                <h4 className="font-title text-lg text-maroon mb-2 border-b border-bronze/20 pb-1">Verified Claims</h4>
                                <div className="space-y-3">
                                    {localPost.verificationDetails.claims.map(claim => (
                                        <div key={claim.id} className={`p-3 rounded border-l-4 ${claim.status === 'SUPPORTED' ? 'border-green-500 bg-green-50/50' : claim.status === 'CONTRADICTED' ? 'border-red-500 bg-red-50/50' : 'border-gray-400 bg-gray-50/50'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${claim.status === 'SUPPORTED' ? 'bg-green-200 text-green-900' : claim.status === 'CONTRADICTED' ? 'bg-red-200 text-red-900' : 'bg-gray-200 text-gray-800'}`}>
                                                    {claim.status}
                                                </span>
                                                <span className="text-[10px] font-mono opacity-60">Conf: {claim.confidence}%</span>
                                            </div>
                                            <p className="font-heading text-lg leading-tight mb-1 text-ink">"{claim.text}"</p>
                                            <p className="text-xs text-ink/70 italic border-t border-black/5 pt-1 mt-1 font-body">Reasoning: {claim.reasoning}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Intent & Manipulation Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {/* Intent */}
                            <div className="bg-indigo-50/40 p-3 rounded border border-indigo-100">
                                <h4 className="font-bold text-xs uppercase text-indigo-900 mb-2 flex items-center gap-1">
                                    <span>🧠</span> Intent
                                </h4>
                                <div className="space-y-2">
                                    <div>
                                        <span className="text-[9px] text-indigo-400 block uppercase tracking-wide">Primary Motive</span>
                                        <span className="text-sm font-bold text-indigo-900 leading-tight block">{localPost.verificationDetails.intent.primaryMotive}</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] text-indigo-400 block uppercase tracking-wide">Hidden Meaning</span>
                                        <span className="text-xs italic text-indigo-800 leading-tight block">"{localPost.verificationDetails.intent.hiddenMeaning}"</span>
                                    </div>
                                </div>
                            </div>

                            {/* Manipulation */}
                            <div className="bg-red-50/40 p-3 rounded border border-red-100">
                                <h4 className="font-bold text-xs uppercase text-red-900 mb-2 flex items-center gap-1">
                                    <span>🛡️</span> Manipulation
                                </h4>
                                {localPost.verificationDetails.manipulationFlags.length > 0 ? (
                                    <div className="space-y-2">
                                        {localPost.verificationDetails.manipulationFlags.map((flag, i) => (
                                            <div key={i} className="flex flex-col border-b border-red-100 last:border-0 pb-1 last:pb-0">
                                                    <div className="flex items-center gap-1 mb-0.5">
                                                        <span className="text-red-600 font-bold text-xs">⚠️ {flag.type}</span>
                                                    </div>
                                                    <p className="text-[10px] text-red-800/80 leading-tight">{flag.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-green-800 opacity-70">
                                        <span className="text-2xl">🛡️</span>
                                        <span className="text-[10px] font-bold uppercase mt-1">Clean Signal</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Sources */}
                        {localPost.verificationDetails.sources.length > 0 && (
                            <div className="pt-3 border-t border-bronze/10">
                                <h4 className="font-bold text-xs uppercase text-ink/40 mb-2 tracking-wider">Sources</h4>
                                <ul className="text-xs text-antiqueBlue space-y-1">
                                    {localPost.verificationDetails.sources.map((src, idx) => (
                                        <li key={idx} className="truncate hover:underline cursor-pointer flex items-center gap-1">
                                            <span>🔗</span> {src}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    )}
                </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 opacity-50 space-y-4 h-full">
                        <span className="text-5xl animate-pulse grayscale">⏳</span>
                        <p className="font-body italic text-xl">Consulting the Truth Engine...</p>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-60">Scanning Intent • Checking Sources • Detecting Bias</p>
                    </div>
                )}
            </div>

            {/* Footer with Re-Verify Action */}
            <div className="bg-parchment-dark p-3 border-t border-bronze/20 flex justify-center">
                 <button 
                    onClick={handleDeepAnalysis} 
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-bronze/10 hover:bg-bronze/20 rounded text-xs font-bold uppercase tracking-wider text-ink/60 transition-colors disabled:opacity-50"
                 >
                    <span>{loading ? 'Analyzing...' : '↻ Re-run Analysis'}</span>
                 </button>
            </div>
        </div>
    </div>
  );
};

export default InspectModal;
