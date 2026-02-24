import React from 'react';
import { motion } from 'motion/react';
import { Utensils, Coffee, Apple, History, PieChart } from 'lucide-react';

interface FoodLog {
  id: number;
  item: string;
  calories: number;
  nutrients?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  timestamp: string;
}

interface FoodTrackerProps {
  logs: FoodLog[];
}

export const FoodTracker: React.FC<FoodTrackerProps> = ({ logs }) => {
  const dailyCalories = logs.reduce((acc, log) => acc + log.calories, 0);

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-jarvis-accent/50" />
          <PieChart className="text-jarvis-accent" size={32} />
          <div className="text-center">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Daily Intake</div>
            <div className="text-3xl font-display text-white">{dailyCalories} <span className="text-sm text-white/40">KCAL</span></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MiniStat icon={<Apple size={14} />} label="Vitamins" value="Optimal" color="text-emerald-400" />
          <MiniStat icon={<Coffee size={14} />} label="Hydration" value="Good" color="text-jarvis-blue" />
          <MiniStat icon={<Utensils size={14} />} label="Protein" value="72g" color="text-amber-400" />
          <MiniStat icon={<PieChart size={14} />} label="Metabolism" value="High" color="text-purple-400" />
        </div>
      </div>

      <div className="glass-panel p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="text-jarvis-gold" size={20} />
            <h3 className="font-display text-sm uppercase tracking-widest text-white">Nutritional Log</h3>
          </div>
        </div>

        <div className="space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-white/20 font-mono text-xs uppercase tracking-widest">
              No nutritional intake recorded, Sir.
            </div>
          ) : (
            logs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-jarvis-accent/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Utensils size={18} className="text-white/60" />
                  </div>
                  <div>
                    <div className="text-sm font-display text-white">{log.item}</div>
                    <div className="text-[10px] font-mono text-white/40 uppercase">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-jarvis-accent">{log.calories} KCAL</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="glass-panel p-3 flex flex-col gap-1 border-white/5">
    <div className={`flex items-center gap-2 ${color}`}>
      {icon}
      <span className="text-[8px] font-mono uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xs font-display text-white">{value}</div>
  </div>
);
