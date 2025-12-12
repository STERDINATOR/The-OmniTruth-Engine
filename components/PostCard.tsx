
import React, { useState, useEffect } from 'react';
import { Post, Verdict } from '../types';

interface PostCardProps {
  post: Post;
  onInspect: (post: Post) => void;
  onVerify: (post: Post) => void;
  onVote: (post: Post, initialVerdict?: 'REAL' | 'FAKE' | 'UNSURE') => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onInspect, onVerify, onVote }) => {
  const [isVoteExpanded, setIsVoteExpanded] = useState(false);
  const [clickedVote, setClickedVote] = useState<'REAL' | 'FAKE' | 'UNSURE' | null>(null);
  
  // Image State Management
  const [imgSrc, setImgSrc] = useState(post.image);
  
  // Social Interactions State
  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [commentCount, setCommentCount] = useState(post.comments || 0);

  useEffect(() => {
    setImgSrc(post.image);
  }, [post.image]);

  const handleImageError = () => {
    // Fallback to a seeded placeholder if real image fails
    setImgSrc(`https://picsum.photos/seed/${post.id}/800/500`);
  };

  const handleVoteClick = (verdict: 'REAL' | 'FAKE' | 'UNSURE') => {
    setClickedVote(verdict);
    // Small delay to let animation play before modal opens
    setTimeout(() => {
        onVote(post, verdict);
        setClickedVote(null);
    }, 400);
  };

  const toggleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? Math.max(0, prev - 1) : prev + 1);
  };

  const handleCommentClick = () => {
      // For now, simulate functionality or just visually interact
      alert("The Scribe's Comment Ledger is currently being archived. Please check back later.");
  };

  const formatCount = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };
  
  const getVerdictStyle = (v: Verdict) => {
    switch (v) {
      case Verdict.TRUE: return { 
          color: 'text-emerald-900', 
          borderColor: 'border-emerald-900',
          label: 'Verified Truth', 
          icon: '🛡️' 
      };
      case Verdict.MOSTLY_TRUE: return { 
          color: 'text-emerald-800', 
          borderColor: 'border-emerald-700',
          label: 'Mostly True', 
          icon: '✅' 
      };
      case Verdict.PARTIALLY_TRUE: return { 
          color: 'text-amber-900', 
          borderColor: 'border-amber-800',
          label: 'Partially True', 
          icon: '⚖️' 
      };
      case Verdict.MISLEADING: return { 
          color: 'text-orange-900', 
          borderColor: 'border-orange-900',
          label: 'Misleading', 
          icon: '⚠️' 
      };
      case Verdict.FAKE: return { 
          color: 'text-red-900', 
          borderColor: 'border-red-900',
          label: 'Fabrication', 
          icon: '🤥' 
      };
      case Verdict.SATIRE: return { 
          color: 'text-purple-900', 
          borderColor: 'border-purple-900',
          label: 'Satire', 
          icon: '🃏' 
      };
      default: return { 
          color: 'text-stone-800', 
          borderColor: 'border-stone-600',
          label: 'Unverified', 
          icon: '❓' 
      };
    }
  };

  // Helper to determine the visual style of the Role Badge
  const getRoleBadgeConfig = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes('journalist') || r.includes('news')) {
        return { icon: '✒️', style: 'bg-indigo-50 border-indigo-200 text-indigo-900', label: 'Journalist' };
    }
    if (r.includes('expert') || r.includes('scientist') || r.includes('scholar')) {
        return { icon: '📜', style: 'bg-amber-50 border-amber-200 text-amber-900', label: 'Expert' };
    }
    if (r.includes('eyewitness') || r.includes('witness')) {
        return { icon: '👁️', style: 'bg-emerald-50 border-emerald-200 text-emerald-900', label: 'Eyewitness' };
    }
    if (r.includes('citizen')) {
        return { icon: '♟️', style: 'bg-stone-50 border-stone-200 text-stone-700', label: 'Citizen' };
    }
    // Default / Automaton
    return { icon: '⚙️', style: 'bg-gray-50 border-gray-200 text-gray-700', label: role };
  };

  const vStyle = getVerdictStyle(post.verdict);

  // Logic to filter and sort manipulation flags
  const getDisplayFlags = () => {
    if (!post.verificationDetails?.manipulationFlags) return [];
    
    const severityScore = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    
    // Sort by severity descending
    const sorted = [...post.verificationDetails.manipulationFlags].sort((a, b) => {
        const sA = severityScore[a.severity as keyof typeof severityScore] || 0;
        const sB = severityScore[b.severity as keyof typeof severityScore] || 0;
        return sB - sA;
    });

    // Only show High and Medium, take top 2 to keep it condensed
    return sorted.filter(f => f.severity === 'HIGH' || f.severity === 'MEDIUM').slice(0, 2);
  };

  const displayFlags = getDisplayFlags();

  const getFlagIcon = (type: string) => {
      const lower = type.toLowerCase();
      if (lower.includes('fear') || lower.includes('emotion')) return '😱';
      if (lower.includes('pseudo') || lower.includes('science')) return '🧪';
      if (lower.includes('context') || lower.includes('omit')) return '✂️';
      if (lower.includes('politic') || lower.includes('bias')) return '⚖️';
      return '🚩';
  };

  return (
    <div className="bg-parchment-light border border-bronze/40 rounded-sm shadow-md mb-8 relative overflow-hidden font-body group hover:shadow-2xl hover:border-bronze/60 hover:-translate-y-1 transition-all duration-500 ease-out">
        {/* Background Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] mix-blend-multiply"></div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-bronze/10 relative z-10 bg-parchment/50 backdrop-blur-[2px]">
        <div className="flex items-center gap-4">
           {/* Avatar */}
           <div className="w-12 h-12 rounded bg-ink text-parchment border border-bronze flex items-center justify-center font-title text-2xl shadow-sm relative overflow-hidden shrink-0">
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
             {post.author[0]}
           </div>
           
           <div className="flex flex-col">
             <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-2xl leading-none text-ink tracking-tight drop-shadow-sm">
                    {post.author}
                </h3>
                
                {/* Author Role Badge */}
                {post.authorRole && (() => {
                    const badge = getRoleBadgeConfig(post.authorRole);
                    return (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-sm border ${badge.style} shadow-sm transform hover:scale-105 transition-transform cursor-help`} title={post.authorRole}>
                            <span className="text-xs leading-none">{badge.icon}</span>
                            <span className="text-[9px] uppercase font-bold tracking-widest font-title pt-0.5 leading-none">
                                {badge.label}
                            </span>
                        </div>
                    );
                })()}
             </div>
             
             <span className="text-xs font-body text-ink-light/60 italic mt-0.5">
                {new Date(post.timestamp).toLocaleDateString()}
             </span>
           </div>
        </div>
        
        {/* Verdict Stamp - Refined */}
        <div className={`
            hidden sm:flex flex-col items-center justify-center 
            border-[3px] border-double ${vStyle.borderColor} 
            px-4 py-1.5 rounded-sm transform rotate-[-3deg]
            group-hover:rotate-0 transition-transform duration-300
            bg-parchment-light/80 backdrop-blur-sm
            shadow-sm
        `}>
            <div className={`flex items-center gap-2 ${vStyle.color}`}>
                <span className="text-lg leading-none">{vStyle.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-title leading-none pt-0.5">{vStyle.label}</span>
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 relative z-10">
          <p className="font-body text-xl leading-relaxed text-ink/90 mb-5 text-justify first-letter:text-4xl first-letter:font-title first-letter:float-left first-letter:mr-2 first-letter:mt-[-5px] first-letter:text-maroon">
            {post.content}
          </p>

          {/* Flags */}
          {displayFlags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-3 pl-3 border-l-2 border-bronze/20">
                  {displayFlags.map((flag, idx) => (
                      <div key={idx} className={`flex items-center gap-2 px-2 py-1 rounded-sm border ${flag.severity === 'HIGH' ? 'bg-red-50/80 border-red-200 text-red-900' : 'bg-orange-50/80 border-orange-200 text-orange-900'}`}>
                          <span className="text-sm">{getFlagIcon(flag.type)}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider font-heading pt-0.5">{flag.type}</span>
                          <div className="flex gap-0.5 ml-1">
                              {[...Array(flag.severity === 'HIGH' ? 3 : 2)].map((_, i) => (
                                  <div key={i} className={`w-1 h-1 rounded-full ${flag.severity === 'HIGH' ? 'bg-red-800' : 'bg-orange-700'}`}></div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {imgSrc && (
            <div className="mb-2 relative group/image">
                {/* Refined Image Frame */}
                <div className="p-2 bg-white shadow-md border border-gray-200 transform rotate-[0.5deg] group-hover/image:rotate-0 transition-all duration-500">
                    <div className="relative overflow-hidden border border-black/5 min-h-[200px] bg-gray-100">
                        <img 
                            src={imgSrc} 
                            onError={handleImageError}
                            alt="Post content" 
                            className="w-full h-auto object-cover sepia-[0.3] contrast-[1.1] brightness-95 group-hover/image:sepia-0 group-hover/image:contrast-100 transition-all duration-700" 
                        />
                         {/* Vignette */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_60%,rgba(60,40,20,0.3)_100%)] pointer-events-none mix-blend-multiply"></div>
                        {/* Old Photo Scratch Texture (CSS only) */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/scratched-surface.png')] pointer-events-none"></div>
                    </div>
                </div>

                {/* Trust Seal - Refined positioning */}
                <div className="absolute -bottom-5 -right-3 z-20 drop-shadow-xl">
                    <div className={`
                        w-20 h-20 rounded-full 
                        border-[4px] border-double ${post.trustScore > 80 ? 'bg-green-900 border-green-600' : post.trustScore < 40 ? 'bg-maroon border-red-800' : 'bg-amber-800 border-amber-600'} 
                        flex items-center justify-center 
                        transform rotate-12 group-hover/image:rotate-[20deg] transition-transform duration-500
                        shadow-inner
                    `}>
                        <div className="w-[88%] h-[88%] rounded-full border border-white/20 flex flex-col items-center justify-center">
                            <span className="text-[7px] uppercase text-white/70 tracking-widest font-title mb-0.5">Trust</span>
                            <span className="text-2xl font-title font-bold text-parchment leading-none">{post.trustScore}</span>
                        </div>
                    </div>
                </div>
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-bronze/5 border-t border-bronze/10 relative z-10 transition-all duration-300">
         <div className="flex items-center justify-between">
             <div className="flex gap-4">
                 {/* Like Button */}
                 <button 
                    onClick={toggleLike}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded transition-all active:scale-95 group/like hover:bg-bronze/10"
                 >
                     <span className={`text-xl transition-transform duration-300 ${liked ? 'text-red-700 scale-110' : 'text-ink/60 group-hover/like:text-red-700/50 group-hover/like:scale-110'}`}>
                         {liked ? '❤️' : '♡'}
                     </span>
                     <span className={`text-xs font-bold font-heading pt-0.5 ${liked ? 'text-red-900' : 'text-ink/60'}`}>
                         {formatCount(likeCount)}
                     </span>
                 </button>

                 {/* Comment Button */}
                 <button 
                    onClick={handleCommentClick}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded transition-all active:scale-95 group/comment hover:bg-bronze/10"
                 >
                     <span className="text-xl text-ink/60 group-hover/comment:text-ink transition-transform duration-300 group-hover/comment:-translate-y-0.5">💬</span>
                     <span className="text-xs font-bold font-heading pt-0.5 text-ink/60 group-hover/comment:text-ink">
                         {formatCount(commentCount)}
                     </span>
                 </button>

                 {/* Divider */}
                 <div className="w-px h-6 bg-bronze/20 self-center mx-1"></div>

                 {/* Verify with AI Button - New */}
                 <button 
                    onClick={() => onVerify(post)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-maroon/5 hover:bg-maroon/10 border border-maroon/20 rounded transition-colors group/ai-btn"
                 >
                     <span className="text-lg animate-pulse">✨</span>
                     <span className="text-xs uppercase font-bold text-maroon font-button tracking-wider pt-0.5">Verify</span>
                 </button>

                 {/* Vote Toggle */}
                 <button 
                    onClick={() => setIsVoteExpanded(!isVoteExpanded)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors group/btn ${isVoteExpanded ? 'bg-bronze/20 text-ink' : 'hover:bg-bronze/10'}`}
                 >
                     <span className="text-lg group-hover/btn:scale-110 transition-transform grayscale group-hover/btn:grayscale-0">⚖️</span>
                     <span className="text-xs uppercase font-bold text-ink/60 font-button tracking-wider pt-0.5 group-hover/btn:text-ink">Vote</span>
                 </button>
                 
                 {/* Inspect Button */}
                 <button 
                    onClick={() => onInspect(post)}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-bronze/10 rounded transition-colors group/btn"
                 >
                     <span className="text-lg group-hover/btn:scale-110 transition-transform grayscale group-hover/btn:grayscale-0">🔍</span>
                     <span className="text-xs uppercase font-bold text-ink/60 font-button tracking-wider pt-0.5 group-hover/btn:text-ink">Inspect</span>
                 </button>
             </div>

             <div className="flex flex-col items-end pr-2">
                 <div className="flex items-center gap-1.5 text-[9px] text-ink/50 font-bold uppercase tracking-widest mb-1">
                    <span>Crowd Consensus</span>
                 </div>
                 <div className="flex items-center gap-2 w-24 sm:w-28">
                    <div className="flex-1 h-1.5 bg-bronze/10 rounded-full overflow-hidden border border-bronze/20">
                        <div 
                            className="h-full bg-antiqueBlue/80 shadow-[0_0_8px_rgba(37,79,110,0.6)]" 
                            style={{width: `${post.crowdScore}%`}}
                        ></div>
                    </div>
                    <span className="text-xs font-bold text-antiqueBlue tabular-nums">{post.crowdScore}%</span>
                 </div>
             </div>
         </div>

         {/* Inline Voting Drawer */}
         <div className={`overflow-hidden transition-all duration-300 ease-out ${isVoteExpanded ? 'max-h-24 opacity-100 mt-3 border-t border-bronze/10 pt-3' : 'max-h-0 opacity-0'}`}>
            <p className="text-[10px] text-center uppercase tracking-widest text-ink/40 mb-2 font-bold">Quick Verdict</p>
            <div className="flex gap-3 px-2">
                {/* REAL Button */}
                <button 
                    onClick={() => handleVoteClick('REAL')}
                    disabled={clickedVote !== null}
                    className={`flex-1 py-2 rounded flex items-center justify-center gap-2 transition-all duration-300 group/vbtn relative overflow-hidden ${
                         clickedVote === 'REAL' 
                         ? 'bg-green-700 text-white scale-95 shadow-inner border-transparent' 
                         : 'bg-green-50 border border-green-200 hover:bg-green-100 text-green-900 shadow-sm hover:shadow-md'
                    }`}
                >
                    {clickedVote === 'REAL' && (
                        <span className="absolute inset-0 bg-green-500 animate-ping opacity-30"></span>
                    )}
                    <span className={`text-sm transition-transform duration-300 ${clickedVote === 'REAL' ? 'scale-125 rotate-12' : 'group-hover/vbtn:scale-110'}`}>✅</span>
                    <span className="text-xs font-heading font-bold uppercase tracking-wider">Real</span>
                </button>
                
                {/* UNSURE Button */}
                 <button 
                    onClick={() => handleVoteClick('UNSURE')}
                    disabled={clickedVote !== null}
                    className={`flex-1 py-2 rounded flex items-center justify-center gap-2 transition-all duration-300 group/vbtn relative overflow-hidden ${
                         clickedVote === 'UNSURE' 
                         ? 'bg-gray-600 text-white scale-95 shadow-inner border-transparent' 
                         : 'bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 shadow-sm hover:shadow-md'
                    }`}
                >
                    {clickedVote === 'UNSURE' && (
                        <span className="absolute inset-0 bg-gray-400 animate-ping opacity-30"></span>
                    )}
                    <span className={`text-sm transition-transform duration-300 ${clickedVote === 'UNSURE' ? 'scale-125 rotate-12' : 'group-hover/vbtn:scale-110'}`}>🤔</span>
                    <span className="text-xs font-heading font-bold uppercase tracking-wider">Unsure</span>
                </button>

                {/* FAKE Button */}
                <button 
                    onClick={() => handleVoteClick('FAKE')}
                    disabled={clickedVote !== null}
                    className={`flex-1 py-2 rounded flex items-center justify-center gap-2 transition-all duration-300 group/vbtn relative overflow-hidden ${
                         clickedVote === 'FAKE' 
                         ? 'bg-red-700 text-white scale-95 shadow-inner border-transparent' 
                         : 'bg-red-50 border border-red-200 hover:bg-red-100 text-red-900 shadow-sm hover:shadow-md'
                    }`}
                >
                    {clickedVote === 'FAKE' && (
                        <span className="absolute inset-0 bg-red-500 animate-ping opacity-30"></span>
                    )}
                    <span className={`text-sm transition-transform duration-300 ${clickedVote === 'FAKE' ? 'scale-125 rotate-12' : 'group-hover/vbtn:scale-110'}`}>❌</span>
                    <span className="text-xs font-heading font-bold uppercase tracking-wider">Fake</span>
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PostCard;
