
import React, { useState, useEffect } from 'react';
import { Post, CommunityRole, CommunityVote } from '../types';

interface VoteModalProps {
  post: Post;
  initialVerdict?: 'REAL' | 'FAKE' | 'UNSURE';
  onClose: () => void;
  onVote: (vote: CommunityVote) => void;
}

// Mock User (Ideally passed from context)
const CURRENT_USER = {
  id: 'archivist_zero',
  credibilityScore: 88,
};

const VoteModal: React.FC<VoteModalProps> = ({ post, initialVerdict, onClose, onVote }) => {
  const [voteRole, setVoteRole] = useState<CommunityRole>(CommunityRole.CITIZEN);
  const [voteVerdict, setVoteVerdict] = useState<'REAL'|'FAKE'|'UNSURE'>(initialVerdict || 'UNSURE');
  const [voteReason, setVoteReason] = useState('');

  // Update state if initialVerdict changes
  useEffect(() => {
    if (initialVerdict) {
        setVoteVerdict(initialVerdict);
    }
  }, [initialVerdict]);

  const handleSubmit = () => {
    const newVote: CommunityVote = {
        userId: CURRENT_USER.id,
        userCredibility: CURRENT_USER.credibilityScore,
        role: voteRole,
        verdict: voteVerdict,
        reason: voteReason,
        timestamp: new Date().toISOString()
    };
    onVote(newVote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-parchment w-full max-w-md rounded-lg shadow-2xl border-2 border-gold" onClick={e => e.stopPropagation()}>
            <div className="bg-ink p-4 text-gold text-center font-title text-lg uppercase tracking-widest relative">
                Cast Your Verdict
                <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-6">
                
                <div className="text-center">
                    <p className="font-heading text-xl font-bold mb-1">"{post.author}"</p>
                    <p className="text-xs text-ink/60 line-clamp-2 italic">"{post.content}"</p>
                    <p className="text-[10px] mt-2 text-ink/40 font-bold uppercase tracking-widest">
                        Voting Weight: {((CURRENT_USER.credibilityScore / 100) * 10).toFixed(1)} Impact Points
                    </p>
                </div>

                <div className="border-t border-bronze/20 pt-4">
                    <label className="block text-xs font-bold uppercase mb-2 text-ink-light text-center">Select Your Role</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(CommunityRole).map(role => (
                            <button 
                            key={role}
                            onClick={() => setVoteRole(role)}
                            className={`py-2 text-sm font-button rounded border transition-colors ${voteRole === role ? 'bg-maroon text-parchment border-maroon shadow-md scale-105' : 'bg-white/50 border-bronze/30 text-ink hover:bg-bronze/10'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-ink-light text-center">Your Judgment</label>
                    <div className="flex gap-4">
                        <button onClick={() => setVoteVerdict('REAL')} className={`flex-1 py-4 rounded border-2 font-bold text-lg transition-all flex flex-col items-center ${voteVerdict === 'REAL' ? 'bg-green-700 border-green-900 text-white shadow-inner scale-95' : 'bg-gray-100 border-gray-200 hover:bg-green-50 hover:border-green-300'}`}>
                            <span>✅</span>
                            <span>REAL</span>
                        </button>
                         <button onClick={() => setVoteVerdict('UNSURE')} className={`flex-1 py-4 rounded border-2 font-bold text-lg transition-all flex flex-col items-center ${voteVerdict === 'UNSURE' ? 'bg-gray-500 border-gray-700 text-white shadow-inner scale-95' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 hover:border-gray-300'}`}>
                            <span>🤔</span>
                            <span>UNSURE</span>
                        </button>
                        <button onClick={() => setVoteVerdict('FAKE')} className={`flex-1 py-4 rounded border-2 font-bold text-lg transition-all flex flex-col items-center ${voteVerdict === 'FAKE' ? 'bg-red-700 border-red-900 text-white shadow-inner scale-95' : 'bg-gray-100 border-gray-200 hover:bg-red-50 hover:border-red-300'}`}>
                            <span>❌</span>
                            <span>FAKE</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-ink-light text-center">Your Reasoning</label>
                    <textarea
                        value={voteReason}
                        onChange={(e) => setVoteReason(e.target.value)}
                        placeholder="Why did you vote this way? Cite evidence if possible."
                        className="w-full h-24 bg-parchment-light border border-bronze/30 p-3 rounded font-body text-sm text-ink placeholder-ink/40 focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon resize-none shadow-inner"
                    />
                </div>

                <button 
                onClick={handleSubmit}
                className="w-full bg-gold text-ink font-title font-bold text-xl py-3 rounded shadow-md mt-4 hover:bg-yellow-500 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale"
                >
                    <span>✍️</span> Sign The Ledger
                </button>
            </div>
        </div>
    </div>
  );
};

export default VoteModal;
