import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Timer, Flame, TrendingUp, History } from 'lucide-react';

interface Run {
  id: number;
  distance: number;
  duration: number;
  calories: number;
  timestamp: string;
}

interface RunningTrackerProps {
  runs: Run[];
}

export const RunningTracker: React.FC<RunningTrackerProps> = ({ runs }) => {
  const totalDistance = runs.reduce((acc, run) => acc + run.distance, 0).toFixed(2);
  const totalCalories = runs.reduce((acc, run) => acc + run.calories, 0);

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<TrendingUp className="text-jarvis-gold" size={20} />} 
          label="Total Distance" 
          value={`${totalDistance} KM`} 
        />
        <StatCard 
          icon={<Flame className="text-orange-500" size={20} />} 
          label="Total Calories" 
          value={`${totalCalories} KCAL`} 
        />
        <StatCard 
          icon={<Timer className="text-jarvis-blue" size={20} />} 
          label="Total Sessions" 
          value={runs.length.toString()} 
        />
      </div>

      <div className="glass-panel p-6 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <History className="text-jarvis-gold" size={20} />
          <h3 className="font-display text-sm uppercase tracking-widest text-white">Activity History</h3>
        </div>

        <div className="space-y-4">
          {runs.length === 0 ? (
            <div className="text-center py-12 text-white/20 font-mono text-xs uppercase tracking-widest">
              No physical tracks recorded yet, Sir.
            </div>
          ) : (
            runs.map((run) => (
              <motion.div 
                key={run.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-jarvis-accent/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-jarvis-accent/10 flex items-center justify-center border border-jarvis-accent/20">
                    <MapPin size={18} className="text-jarvis-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-display text-white">{run.distance} KM</div>
                    <div className="text-[10px] font-mono text-white/40 uppercase">
                      {new Date(run.timestamp).toLocaleDateString()} • {new Date(run.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} • {run.duration} MIN
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-jarvis-gold">{run.calories} KCAL</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="glass-panel p-4 flex items-center gap-4 border-white/5">
    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
      {icon}
    </div>
    <div>
      <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">{label}</div>
      <div className="text-lg font-display text-white">{value}</div>
    </div>
  </div>
);
