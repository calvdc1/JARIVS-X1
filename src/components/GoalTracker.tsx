import React from 'react';
import { motion } from 'motion/react';
import { Target, CheckCircle2, Circle, TrendingUp } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description: string;
  status: 'active' | 'completed';
  progress: number;
  steps: string[];
}

interface GoalTrackerProps {
  goals: Goal[];
  onSave?: (title: string, description: string, steps: string[]) => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({ goals, onSave }) => {
  return (
    <div className="glass-panel p-4 md:p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <Target className="text-jarvis-accent" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-jarvis-accent">Strategic Objectives</h2>
      </div>

      <div className="space-y-6">
        {goals.map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-jarvis-accent/30 transition-all"
          >
            <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-display uppercase tracking-wider text-white mb-1">{goal.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{goal.description}</p>
              </div>
              <div className="flex flex-col items-end w-full md:w-auto">
                <span className="text-[10px] font-mono text-jarvis-accent uppercase tracking-widest">{goal.progress}%</span>
                <div className="w-full md:w-24 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    className="h-full bg-jarvis-accent shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {goal.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-[10px] text-white/60">
                  {idx < (goal.progress / 100) * goal.steps.length ? (
                    <CheckCircle2 size={12} className="text-jarvis-accent" />
                  ) : (
                    <Circle size={12} className="text-white/20" />
                  )}
                  <span className={idx < (goal.progress / 100) * goal.steps.length ? 'line-through opacity-40' : ''}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {goals.length === 0 && (
          <div className="py-20 text-center text-white/20 font-mono text-xs uppercase tracking-widest">
            No active objectives found
          </div>
        )}
      </div>
    </div>
  );
};
