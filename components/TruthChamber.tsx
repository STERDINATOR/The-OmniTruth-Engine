
import React, { useState } from 'react';
import { analyzeTextDeeply } from '../services/geminiService';
import { DeepAnalysisResult } from '../types';

type ContextType = 'NEWS' | 'CHAT' | 'DEBATE';

const TruthChamber: React.FC = () => {
  const [input, setInput] = useState('');
  const [context, setContext] = useState<ContextType>('NEWS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'TRUTH' | 'INTENT' | 'SHIELD'>('TRUTH');

  const handleVerify = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    const res = await analyzeTextDeeply(input, context);
    setResult(res);
    setLoading(false);
  };

  // Helper to interpret scores based on context
  const getScoreLabel = () => {
      if (context === 'CHAT') return 'Sincerity Score';
      if (context === 'DEBATE') return 'Logic Score';
      return 'Trust Score';
  };

  const getPlaceholder = () => {
      if (context === 'CHAT') return "Paste a text message, email, or DM chain to analyze emotional intent and manipulation...";
      if (context === 'DEBATE') return "Paste a political argument or debate transcript to check for logical fallacies...";
      return "Paste a news article, claim, or URL to verify facts...";
  };

  return (
    <div className="p-4 max-w-5xl mx-auto pb-24">
      <div className="text-center mb-8 pt-4">
        <h1 className="font-title text-4xl text-maroon mb-2 drop-shadow-md">The Truth Chamber</h1>
        <p className="font-body text-xl text-ink max-w-2xl mx-auto opacity-80">
            Select your lens. The Engine separates Truth from Intent.
        </p>
      </div>

      {/* Input Section */}
      <div className={`bg-parchment border-4 border-double shadow-2xl rounded-lg relative mb-12 transition-colors duration-500 ${context === 'CHAT' ? 'border-purple-300' : context === 'DEBATE' ? 'border-blue-300' : 'border-bronze'} p-6`}>
        
        {/* Context Selector */}
        <div className="flex gap-4 mb-4 border-b border-bronze/20 pb-4 overflow-x-auto">
            <button 
                onClick={() => setContext('NEWS')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${context === 'NEWS' ? 'bg-maroon text-parchment font-bold shadow-md' : 'bg-white/50 text-ink hover:bg-bronze/10'}`}
            >
                <span>📰</span> News / Article
            </button>
            <button 
                onClick={() => setContext('CHAT')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${context === 'CHAT' ? 'bg-purple-800 text-parchment font-bold shadow-md' : 'bg-white/50 text-ink hover:bg-bronze/10'}`}
            >
                <span>💬</span> Personal Chat
            </button>
            <button 
                onClick={() => setContext('DEBATE')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors whitespace-nowrap ${context === 'DEBATE' ? 'bg-blue-800 text-parchment font-bold shadow-md' : 'bg-white/50 text-ink hover:bg-bronze/10'}`}
            >
                <span>🗣️</span> Debate / Argument
            </button>
        </div>

        <textarea 
          className="w-full h-32 bg-parchment-light border border-bronze/50 p-4 font-heading text-xl text-ink placeholder-ink/40 focus:outline-none focus:ring-2 focus:ring-gold rounded resize-none"
          placeholder={getPlaceholder()}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="mt-4 flex justify-end">
          <button 
            disabled={loading}
            onClick={handleVerify}
            className="bg-maroon text-parchment font-button text-xl px-8 py-3 rounded shadow-md hover:bg-red-900 transition-all disabled:opacity-50 flex items-center gap-2 border-2 border-gold active:scale-95"
          >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="animate-spin text-2xl">⚙️</span> Agents Analyzing...
                </span>
            ) : "Initiate Deep Scan"}
          </button>
        </div>
      </div>

      {result && (
        <div className="animate-page-enter">
           {/* Reality Graph Summary Header */}
           <div className="bg-parchment-light border-t-4 border-gold p-6 shadow-xl relative mb-8 flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-maroon">Reality Graph Synthesis</span>
                        <div className="h-px bg-maroon/20 flex-1"></div>
                    </div>
                    <h2 className="font-heading text-3xl font-bold text-ink mb-2 leading-tight">
                        {result.realityGraphSummary}
                    </h2>
                </div>
                <div className="flex flex-col items-center flex-none">
                       <div className={`w-24 h-24 rounded-full border-4 border-double flex items-center justify-center text-3xl font-title font-bold text-parchment shadow-lg ${result.trustScore >= 70 ? 'bg-green-800 border-green-600' : result.trustScore < 40 ? 'bg-maroon border-red-900' : 'bg-orange-700 border-orange-900'}`}>
                           {result.trustScore}
                       </div>
                       <span className="text-xs uppercase font-bold mt-2 text-ink">{getScoreLabel()}</span>
                </div>
           </div>

           {/* Analysis Tabs */}
           <div className="flex border-b border-bronze/30 mb-6 overflow-x-auto">
               <button 
                  onClick={() => setActiveTab('TRUTH')}
                  className={`px-6 py-3 font-button text-lg transition-colors border-b-4 whitespace-nowrap ${activeTab === 'TRUTH' ? 'border-maroon text-maroon' : 'border-transparent text-ink/50 hover:text-ink'}`}
               >
                   🔍 Truth Core
               </button>
               <button 
                  onClick={() => setActiveTab('INTENT')}
                  className={`px-6 py-3 font-button text-lg transition-colors border-b-4 whitespace-nowrap ${activeTab === 'INTENT' ? 'border-maroon text-maroon' : 'border-transparent text-ink/50 hover:text-ink'}`}
               >
                   🧠 Intent Seer
               </button>
               <button 
                  onClick={() => setActiveTab('SHIELD')}
                  className={`px-6 py-3 font-button text-lg transition-colors border-b-4 whitespace-nowrap ${activeTab === 'SHIELD' ? 'border-maroon text-maroon' : 'border-transparent text-ink/50 hover:text-ink'}`}
               >
                   🛡️ MythBuster
               </button>
           </div>

           {/* Tab Content */}
           <div className="min-h-[300px]">
               
               {/* TRUTH CORE TAB */}
               {activeTab === 'TRUTH' && (
                   <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                       <div className="space-y-4">
                           <h3 className="font-title text-xl text-ink">Fact Layers</h3>
                           {result.claims.length === 0 ? <p className="italic opacity-60">No factual claims extracted.</p> : null}
                           {result.claims.map((claim, idx) => (
                               <div key={idx} className="bg-white/40 p-4 rounded border border-bronze/10 shadow-sm">
                                   <div className="flex justify-between items-start mb-2">
                                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${claim.status === 'SUPPORTED' ? 'bg-green-100 text-green-800' : claim.status === 'CONTRADICTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                                           {claim.status}
                                       </span>
                                       <span className="text-xs text-ink-light opacity-70">{claim.confidence}% Conf.</span>
                                   </div>
                                   <p className="font-heading text-lg leading-tight mb-2">"{claim.text}"</p>
                                   <p className="font-body text-sm text-ink-light italic border-t border-ink/5 pt-2 mt-2">{claim.reasoning}</p>
                               </div>
                           ))}
                       </div>
                       <div>
                           <h3 className="font-title text-xl text-ink mb-4">Evidence Trail</h3>
                           <ul className="space-y-2 bg-parchment-light p-4 rounded border border-bronze/20">
                               {result.sources.length === 0 ? <li className="italic opacity-50">No external sources found.</li> : null}
                               {result.sources.map((src, i) => (
                                   <li key={i} className="text-sm font-body truncate">
                                       <a href={src} target="_blank" rel="noopener noreferrer" className="text-antiqueBlue hover:underline flex items-center gap-2">
                                           <span>🔗</span> {src}
                                       </a>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   </div>
               )}

               {/* INTENT LAYER TAB */}
               {activeTab === 'INTENT' && (
                   <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded border border-indigo-100 shadow-inner">
                           <h3 className="font-title text-xl text-indigo-900 mb-6">X-Ray Vision</h3>
                           
                           <div className="mb-6">
                               <span className="text-xs uppercase font-bold text-indigo-400 block mb-1">Primary Motive</span>
                               <p className="font-heading text-2xl text-indigo-950 font-bold leading-tight">{result.intent.primaryMotive}</p>
                           </div>

                           <div className="mb-6">
                               <span className="text-xs uppercase font-bold text-indigo-400 block mb-1">Hidden Meaning</span>
                               <p className="font-body text-lg text-indigo-900 italic">"{result.intent.hiddenMeaning}"</p>
                           </div>
                       </div>

                       <div className="space-y-6">
                           <div className="bg-white/60 p-4 rounded border border-bronze/10">
                               <span className="text-xs uppercase font-bold text-ink/50 block mb-1">Emotional State</span>
                               <div className="flex items-center gap-3">
                                   <span className="text-3xl">🎭</span>
                                   <span className="font-heading text-xl font-bold text-ink">{result.intent.emotionalState}</span>
                               </div>
                           </div>

                           <div className="bg-white/60 p-4 rounded border border-bronze/10">
                               <span className="text-xs uppercase font-bold text-ink/50 block mb-1">Power Dynamics</span>
                               <div className="flex items-center gap-3">
                                   <span className="text-3xl">⚖️</span>
                                   <span className="font-heading text-xl font-bold text-ink">{result.intent.powerDynamics}</span>
                               </div>
                           </div>
                       </div>
                   </div>
               )}

               {/* MANIPULATION SHIELD TAB */}
               {activeTab === 'SHIELD' && (
                   <div className="animate-fade-in">
                       <div className="bg-red-50/50 border border-red-100 p-6 rounded mb-6">
                           <h3 className="font-title text-xl text-maroon mb-2">Active Threat Detection</h3>
                           <p className="text-sm text-maroon/70 mb-4">The MythBuster engine has flagged the following psychological traps:</p>
                           
                           {result.manipulationFlags.length === 0 ? (
                               <div className="text-center py-8 text-green-700 font-bold flex flex-col items-center">
                                   <span className="text-4xl mb-2">🛡️</span>
                                   Clean Signal. No manipulation detected.
                               </div>
                           ) : (
                               <div className="grid md:grid-cols-2 gap-4">
                                   {result.manipulationFlags.map((flag, idx) => (
                                       <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow">
                                           <div className="text-2xl pt-1">🚩</div>
                                           <div>
                                               <div className="flex items-center gap-2 mb-1">
                                                   <span className="font-bold text-lg text-maroon">{flag.type}</span>
                                                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${flag.severity === 'HIGH' ? 'bg-red-600' : flag.severity === 'MEDIUM' ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                                                       {flag.severity}
                                                   </span>
                                               </div>
                                               <p className="text-sm font-body text-ink leading-relaxed">{flag.description}</p>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
};

export default TruthChamber;
