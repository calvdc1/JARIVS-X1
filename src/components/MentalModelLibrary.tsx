import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Target, Layers, RotateCcw, Grid } from 'lucide-react';

const models = [
  { id: 'first-principles', name: 'First Principles', icon: Target, description: 'Break down complex problems into basic elements and reassemble them from the ground up.' },
  { id: 'pareto', name: 'Pareto 80/20', icon: Layers, description: '80% of consequences come from 20% of causes. Focus on the vital few.' },
  { id: 'inversion', name: 'Inversion', icon: RotateCcw, description: 'Instead of thinking about how to achieve a goal, think about how to avoid failure.' },
  { id: 'ooda', name: 'OODA Loop', icon: RotateCcw, description: 'Observe, Orient, Decide, Act. A four-step cycle for decision-making in fast-moving environments.' },
  { id: 'eisenhower', name: 'Eisenhower Matrix', icon: Grid, description: 'Categorize tasks by urgency and importance to prioritize effectively.' },
];

export const MentalModelLibrary: React.FC = () => {
  return (
    <div className="glass-panel p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="text-jarvis-blue" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-jarvis-blue">Mental Model Library</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model, i) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-jarvis-blue/30 transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-jarvis-blue/5 border border-jarvis-blue/20 group-hover:bg-jarvis-blue/10 transition-colors">
                <model.icon size={20} className="text-jarvis-blue" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-display text-white uppercase tracking-wider">{model.name}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{model.description}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="text-[8px] font-mono text-white/20 uppercase">Apply this model</span>
              <button className="text-[10px] font-display text-jarvis-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Analyze →</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
