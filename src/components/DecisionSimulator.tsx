import React from 'react';
import { motion } from 'motion/react';
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface Scenario {
  name: string;
  forecast: string;
  risk: string;
}

interface Decision {
  id: number;
  timestamp: string;
  decision: string;
  constraints: string[];
  scenarios: Scenario[];
  confidenceScore: number;
}

interface DecisionSimulatorProps {
  decisions: Decision[];
}

export const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({ decisions }) => {
  return (
    <div className="glass-panel p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <BarChart2 className="text-jarvis-blue" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-jarvis-blue">Decision Simulation Engine</h2>
      </div>

      <div className="space-y-8">
        {decisions.map((dec, i) => (
          <motion.div
            key={dec.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-jarvis-blue/30 transition-all"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1 block">Simulation #{dec.id}</span>
                <h3 className="text-lg font-display text-white uppercase tracking-wider">{dec.decision}</h3>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-mono text-jarvis-blue uppercase tracking-widest">Confidence</span>
                <span className="text-xl font-display text-jarvis-blue">{dec.confidenceScore}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {dec.scenarios.map((scenario, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    {idx === 0 ? <TrendingUp size={14} className="text-emerald-400" /> : 
                     idx === 1 ? <AlertTriangle size={14} className="text-amber-400" /> : 
                     <CheckCircle size={14} className="text-jarvis-blue" />}
                    <span className="text-[10px] font-display uppercase tracking-widest text-white/60">{scenario.name}</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed">{scenario.forecast}</p>
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[8px] font-mono text-white/20 uppercase">Risk Factor:</span>
                    <p className="text-[10px] text-red-400/80">{scenario.risk}</p>
                  </div>
                </div>
              ))}
            </div>

            {dec.constraints && dec.constraints.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dec.constraints.map((c, idx) => (
                  <span key={idx} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-mono text-white/40 uppercase">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {decisions.length === 0 && (
          <div className="py-20 text-center text-white/20 font-mono text-xs uppercase tracking-widest">
            No active simulations detected
          </div>
        )}
      </div>
    </div>
  );
};
