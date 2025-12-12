import React, { useState } from 'react';
import { simulateReality } from '../services/geminiService';
import { RealityForkScenario } from '../types';

const RealityFork: React.FC = () => {
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<RealityForkScenario[]>([]);

  const handleSimulate = async () => {
    if (!decision) return;
    setLoading(true);
    const res = await simulateReality(decision);
    setScenarios(res);
    setLoading(false);
  };

  const getBarColor = (val: number, type: 'good' | 'bad') => {
      if (type === 'good') {
          return val > 75 ? 'bg-green-600' : val > 40 ? 'bg-yellow-500' : 'bg-red-500';
      } else {
          return val > 75 ? 'bg-red-600' : val > 40 ? 'bg-yellow-500' : 'bg-green-600';
      }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto h-full flex flex-col pb-24">
       <div className="text-center mb-8 pt-4">
        <h1 className="font-title text-4xl text-antiqueBlue mb-2">The Future Engine</h1>
        <p className="font-body text-xl text-ink max-w-2xl mx-auto opacity-80">
            Simulate the multiverse of your decisions. Calculate happiness, regret, and impact before you act.
        </p>
      </div>

      <div className="bg-parchment-light p-8 rounded border border-bronze shadow-lg mb-12 relative overflow-hidden">
        <div className="relative z-10">
            <label className="font-button text-sm text-maroon block mb-2 uppercase tracking-wider">Input Life Decision or Dilemma</label>
            <div className="flex flex-col md:flex-row gap-4">
                <input 
                    type="text" 
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    placeholder="e.g. Should I move to Bangalore for this job?"
                    className="flex-1 bg-white border border-bronze/30 p-4 font-heading text-2xl focus:outline-none focus:border-maroon focus:ring-1 focus:ring-maroon rounded shadow-inner"
                />
                <button 
                    onClick={handleSimulate}
                    disabled={loading}
                    className="bg-antiqueBlue text-parchment font-button text-lg px-8 py-4 rounded shadow-lg hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                    {loading ? "Simulating Timelines..." : "Fork Reality"}
                </button>
            </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute -right-10 -bottom-10 text-[10rem] opacity-5 pointer-events-none select-none">🔮</div>
      </div>

      {scenarios.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 animate-page-enter">
              {scenarios.map((scenario) => (
                  <div key={scenario.id} className="bg-white/80 border-2 border-ink/10 p-6 rounded-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 flex flex-col relative overflow-hidden group">
                      
                      {/* Card Header */}
                      <div className="mb-4 pb-4 border-b border-dashed border-ink/10">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-title text-lg text-maroon font-bold leading-tight">{scenario.title}</span>
                            <span className="text-xs bg-ink/5 px-2 py-1 rounded font-mono font-bold">{scenario.probability}% Prob</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                             {scenario.tags.map(tag => (
                                 <span key={tag} className="text-[9px] uppercase font-bold text-antiqueBlue bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{tag}</span>
                             ))}
                          </div>
                      </div>

                      {/* Narrative */}
                      <p className="font-body text-lg leading-relaxed mb-6 flex-grow text-ink/90">
                          {scenario.outcomeNarrative}
                      </p>

                      {/* Metrics Visualization */}
                      <div className="mt-auto space-y-3 bg-parchment-light/50 p-3 rounded">
                          {/* Happiness */}
                          <div>
                              <div className="flex justify-between text-[10px] uppercase font-bold text-ink/50 mb-1">
                                  <span>Happiness</span>
                                  <span>{scenario.metrics.happinessScore}/100</span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${getBarColor(scenario.metrics.happinessScore, 'good')}`} style={{width: `${scenario.metrics.happinessScore}%`}}></div>
                              </div>
                          </div>

                          {/* Financial */}
                          <div>
                              <div className="flex justify-between text-[10px] uppercase font-bold text-ink/50 mb-1">
                                  <span>Wealth</span>
                                  <span>{scenario.metrics.financialScore}/100</span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${getBarColor(scenario.metrics.financialScore, 'good')}`} style={{width: `${scenario.metrics.financialScore}%`}}></div>
                              </div>
                          </div>

                          {/* Regret Risk */}
                          <div>
                              <div className="flex justify-between text-[10px] uppercase font-bold text-ink/50 mb-1">
                                  <span>Regret Risk</span>
                                  <span>{scenario.metrics.regretRisk}/100</span>
                              </div>
                              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${getBarColor(scenario.metrics.regretRisk, 'bad')}`} style={{width: `${scenario.metrics.regretRisk}%`}}></div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Relationship Impact text */}
                      <div className="mt-3 pt-3 border-t border-ink/5 text-xs text-ink/70 italic">
                          " {scenario.metrics.relationshipImpact} "
                      </div>

                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default RealityFork;
