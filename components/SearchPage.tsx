
import React, { useState } from 'react';
import { performGlobalSearch } from '../services/geminiService';
import { Post, CommunityVote, SearchFilters } from '../types';
import PostCard from './PostCard';
import InspectModal from './InspectModal';
import VoteModal from './VoteModal';
import { useFeed } from '../contexts/FeedContext';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'ALL',
    authorRole: 'ALL',
    verdict: 'ALL'
  });

  // Interaction State
  const [inspectPost, setInspectPost] = useState<Post | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [votingPost, setVotingPost] = useState<Post | null>(null);
  const [preselectedVerdict, setPreselectedVerdict] = useState<'REAL' | 'FAKE' | 'UNSURE' | undefined>(undefined);
  
  const { updatePost } = useFeed(); 

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    setResults([]);
    const data = await performGlobalSearch(query, filters);
    setResults(data);
    setLoading(false);
  };

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

    let scoreChange = 0;
    if (vote.verdict === 'REAL') scoreChange = 5;
    if (vote.verdict === 'FAKE') scoreChange = -5;
    
    const newScore = Math.min(100, Math.max(0, votingPost.crowdScore + scoreChange));
    
    const updatedPost = { 
        ...votingPost, 
        crowdScore: newScore,
        votes: [...(votingPost.votes || []), vote]
    };

    // Update local results
    setResults(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    
    // Also try to update global context if it matches (optional but good consistency)
    updatePost(updatedPost);

    setVotingPost(null);
    setPreselectedVerdict(undefined);
 };

  return (
    <div className="p-4 max-w-xl mx-auto min-h-screen pb-24">
       <div className="mb-6 text-center">
           <h1 className="font-title text-3xl text-maroon drop-shadow-sm mb-1">The Great Registry</h1>
           <p className="font-body text-ink opacity-60 italic">Search the archives of the known world.</p>
       </div>

       <div className="relative mb-6">
           <input 
               type="text" 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               placeholder="Search posts, claims, or entities..."
               className="w-full bg-white border-2 border-bronze/30 rounded-lg py-3 px-4 pl-12 font-heading text-xl focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon shadow-inner"
           />
           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-40">🔍</span>
           <button 
               onClick={handleSearch}
               className="absolute right-2 top-1/2 -translate-y-1/2 bg-maroon text-parchment px-4 py-1.5 rounded font-button text-sm hover:bg-red-900 transition-colors"
           >
               {loading ? '...' : 'Seek'}
           </button>
       </div>

       {/* Archive Filters */}
        <div className="bg-parchment-light/50 border border-bronze/20 rounded p-4 mb-8 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-maroon">Archive Filters</span>
                <div className="h-px bg-maroon/20 flex-1"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date Range */}
                <div>
                    <label className="block text-[10px] font-bold uppercase text-ink/50 mb-1">Time Period</label>
                    <div className="relative">
                        <select 
                            value={filters.dateRange}
                            onChange={(e) => setFilters({...filters, dateRange: e.target.value as any})}
                            className="appearance-none w-full bg-white border border-bronze/30 rounded px-3 py-2 font-heading text-lg focus:outline-none focus:border-maroon cursor-pointer"
                        >
                            <option value="ALL">All Time</option>
                            <option value="LAST_24H">Last 24 Hours</option>
                            <option value="LAST_WEEK">Past Week</option>
                            <option value="LAST_MONTH">Past Month</option>
                            <option value="LAST_YEAR">Past Year</option>
                        </select>
                         <div className="absolute right-2 top-1/2 -translate-y-1/2 text-bronze pointer-events-none text-xs">▼</div>
                    </div>
                </div>
                {/* Author Role */}
                <div>
                    <label className="block text-[10px] font-bold uppercase text-ink/50 mb-1">Source Type</label>
                    <div className="relative">
                        <select 
                            value={filters.authorRole}
                            onChange={(e) => setFilters({...filters, authorRole: e.target.value as any})}
                            className="appearance-none w-full bg-white border border-bronze/30 rounded px-3 py-2 font-heading text-lg focus:outline-none focus:border-maroon cursor-pointer"
                        >
                            <option value="ALL">All Sources</option>
                            <option value="Journalist">Journalist / News</option>
                            <option value="Expert">Subject Expert</option>
                            <option value="Eyewitness">Eyewitness</option>
                            <option value="Citizen">Citizen / Blog</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-bronze pointer-events-none text-xs">▼</div>
                    </div>
                </div>
                {/* Verdict */}
                <div>
                    <label className="block text-[10px] font-bold uppercase text-ink/50 mb-1">Verification Status</label>
                    <div className="relative">
                        <select 
                            value={filters.verdict}
                            onChange={(e) => setFilters({...filters, verdict: e.target.value as any})}
                            className="appearance-none w-full bg-white border border-bronze/30 rounded px-3 py-2 font-heading text-lg focus:outline-none focus:border-maroon cursor-pointer"
                        >
                            <option value="ALL">Any Verdict</option>
                            <option value="TRUE">🛡️ Verified Truth</option>
                            <option value="MOSTLY_TRUE">✅ Mostly True</option>
                            <option value="PARTIALLY_TRUE">⚖️ Partially True</option>
                            <option value="MISLEADING">⚠️ Misleading</option>
                            <option value="FAKE">🤥 Fabrication</option>
                            <option value="SATIRE">🃏 Satire</option>
                            <option value="UNVERIFIED">❓ Unverified</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-bronze pointer-events-none text-xs">▼</div>
                    </div>
                </div>
            </div>
        </div>

       {/* Results Area */}
       <div className="space-y-6">
           {loading && (
               <div className="text-center py-12">
                   <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
                   <p className="font-heading text-lg">Consulting the oracles...</p>
               </div>
           )}

           {!loading && hasSearched && results.length === 0 && (
               <div className="text-center py-12 border-2 border-dashed border-bronze/20 rounded bg-white/30">
                   <p className="font-heading text-xl text-ink/50">No records found in the archive.</p>
               </div>
           )}

           {results.map(post => (
               <PostCard 
                 key={post.id} 
                 post={post} 
                 onInspect={handleInspect}
                 onVerify={handleVerify} 
                 onVote={handleVoteRequest} 
               />
           ))}
       </div>

       {inspectPost && (
           <InspectModal 
             post={inspectPost} 
             onClose={() => setInspectPost(null)}
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

export default SearchPage;
