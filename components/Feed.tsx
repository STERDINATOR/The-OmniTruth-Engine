
import React, { useState, useMemo } from 'react';
import PostCard from './PostCard';
import { Post, Verdict, CommunityVote } from '../types';
import { useFeed } from '../contexts/FeedContext';
import InspectModal from './InspectModal';
import VoteModal from './VoteModal';

const Feed: React.FC = () => {
  const { posts, updatePost, loading } = useFeed();
  const [inspectPost, setInspectPost] = useState<Post | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [votingPost, setVotingPost] = useState<Post | null>(null);
  const [preselectedVerdict, setPreselectedVerdict] = useState<'REAL' | 'FAKE' | 'UNSURE' | undefined>(undefined);

  // Filter & Sort State
  const [filterVerdict, setFilterVerdict] = useState<Verdict | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'LATEST' | 'TRUST_HIGH' | 'TRUST_LOW' | 'CROWD_HIGH'>('LATEST');

  const handleInspect = (post: Post) => {
    setInspectPost(post);
    setAutoAnalyze(false);
  };

  const handleVerify = (post: Post) => {
    setInspectPost(post);
    setAutoAnalyze(true);
  };

  const handleVoteRequest = (post: Post, initialVerdict?: 'REAL' | 'FAKE' | 'UNSURE') => {
      setVotingPost(post);
      setPreselectedVerdict(initialVerdict);
  };

  const handleVoteSubmit = (vote: CommunityVote) => {
     if (!votingPost) return;

     // Weight Calculation:
     // Base weight is 5.
     // User credibility adds multiplier.
     // Credibility 0 -> 0 impact. Credibility 100 -> 10 impact.
     const weight = (vote.userCredibility / 100) * 10;
     
     let scoreChange = 0;
     if (vote.verdict === 'REAL') scoreChange = weight;
     if (vote.verdict === 'FAKE') scoreChange = -weight;
     // Unsure votes don't change the score, but add to consensus volume (not visualized yet)
     
     const newScore = Math.min(100, Math.max(0, votingPost.crowdScore + scoreChange));
     
     const updatedPost = { 
         ...votingPost, 
         crowdScore: Math.round(newScore), // Keep it integer for cleaner UI
         votes: [...(votingPost.votes || []), vote]
     };

     updatePost(updatedPost);
     setVotingPost(null);
     setPreselectedVerdict(undefined);
  };

  const processedPosts = useMemo(() => {
    let result = [...posts];

    // Filter
    if (filterVerdict !== 'ALL') {
        result = result.filter(p => p.verdict === filterVerdict);
    }

    // Sort
    result.sort((a, b) => {
        switch (sortBy) {
            case 'LATEST': return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            case 'TRUST_HIGH': return b.trustScore - a.trustScore;
            case 'TRUST_LOW': return a.trustScore - b.trustScore;
            case 'CROWD_HIGH': return b.crowdScore - a.crowdScore;
            default: return 0;
        }
    });

    return result;
  }, [posts, filterVerdict, sortBy]);

  return (
    <div className="max-w-xl mx-auto pt-4 px-4 pb-24 relative min-h-screen">
      <div className="flex flex-col mb-6 border-b-2 border-bronze/20 pb-4">
        <div className="flex items-center justify-between mb-4">
            <h1 className="font-title text-3xl text-maroon drop-shadow-sm">The Chronicle</h1>
            <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-ink-light uppercase">Live Feed</span>
            </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="bg-white/40 p-3 rounded-lg border-2 border-bronze/10 flex flex-wrap gap-4 items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-[10px] uppercase font-bold text-ink/50 tracking-wider">Verdict Filter</label>
                <div className="relative">
                    <select 
                        value={filterVerdict} 
                        onChange={(e) => setFilterVerdict(e.target.value as Verdict | 'ALL')}
                        className="appearance-none w-full bg-parchment-light border border-bronze/30 text-maroon font-heading font-bold text-lg rounded px-3 py-1 pr-8 focus:outline-none focus:border-maroon shadow-sm cursor-pointer"
                    >
                        <option value="ALL">All Scrolls</option>
                        <option value={Verdict.TRUE}>🛡️ Verified Truth</option>
                        <option value={Verdict.MOSTLY_TRUE}>✅ Mostly True</option>
                        <option value={Verdict.PARTIALLY_TRUE}>⚖️ Partially True</option>
                        <option value={Verdict.MISLEADING}>⚠️ Misleading</option>
                        <option value={Verdict.FAKE}>🤥 Fabrication</option>
                        <option value={Verdict.SATIRE}>🃏 Satire</option>
                        <option value={Verdict.UNVERIFIED}>❓ Unverified</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-bronze pointer-events-none text-xs">▼</div>
                </div>
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-auto">
                <label className="text-[10px] uppercase font-bold text-ink/50 tracking-wider">Sort Order</label>
                <div className="relative">
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="appearance-none w-full bg-parchment-light border border-bronze/30 text-maroon font-heading font-bold text-lg rounded px-3 py-1 pr-8 focus:outline-none focus:border-maroon shadow-sm cursor-pointer"
                    >
                        <option value="LATEST">📅 Newest Ink</option>
                        <option value="TRUST_HIGH">🛡️ Highest Trust</option>
                        <option value="TRUST_LOW">📉 Lowest Trust</option>
                        <option value="CROWD_HIGH">👥 Crowd Consensus</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-bronze pointer-events-none text-xs">▼</div>
                </div>
            </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-70">
            <div className="w-16 h-16 border-4 border-bronze border-t-maroon rounded-full animate-spin mb-4"></div>
            <p className="font-heading text-xl italic text-ink animate-pulse">Inscribing latest chronicles...</p>
        </div>
      ) : processedPosts.length === 0 ? (
          <div className="text-center py-12 opacity-50 font-heading text-xl italic border-2 border-dashed border-bronze/30 rounded bg-white/20 animate-ink-in">
              No scrolls found matching your criteria.
          </div>
      ) : (
          processedPosts.map((post, index) => (
            <div 
                key={post.id}
                className="animate-ink-in opacity-0" 
                style={{ animationDelay: `${Math.min(index * 150, 1000)}ms`, animationFillMode: 'forwards' }}
            >
                <PostCard 
                    post={post} 
                    onInspect={handleInspect}
                    onVerify={handleVerify}
                    onVote={handleVoteRequest}
                />
            </div>
          ))
      )}
      
      {!loading && (
        <div className="text-center py-8">
            <span className="font-button text-ink-light opacity-50">End of Scroll</span>
        </div>
      )}

      {inspectPost && (
          <InspectModal 
            post={inspectPost} 
            onClose={() => setInspectPost(null)} 
            onUpdatePost={(updated) => {
                updatePost(updated);
                setInspectPost(updated);
            }}
            forceAnalysis={autoAnalyze}
          />
      )}
      
      {votingPost && (
          <VoteModal 
            post={votingPost} 
            initialVerdict={preselectedVerdict}
            onClose={() => {
                setVotingPost(null);
                setPreselectedVerdict(undefined);
            }} 
            onVote={handleVoteSubmit} 
          />
      )}
    </div>
  );
};

export default Feed;
