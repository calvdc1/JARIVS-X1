import React from 'react';
import { motion } from 'motion/react';
import { Activity, Cloud, Camera, Clock, RefreshCw, Power, Award, Database } from 'lucide-react';
import { useJarvisStore } from '../store/useStore';

export const WidgetPanel: React.FC = () => {
  const { userProfile, memories } = useJarvisStore();

  return (
    <div className="flex flex-col gap-4 w-full md:w-80 h-full overflow-y-auto pr-2 custom-scrollbar">
      {/* User Profile Widget */}
      <div className="glass-panel p-4 space-y-4 border-l-2 border-jarvis-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-jarvis-accent">
            <Award size={16} />
            <span className="text-xs font-display uppercase tracking-widest">User Profile</span>
          </div>
          <div className="text-[10px] font-mono text-jarvis-accent">LVL {userProfile.level}</div>
        </div>
        
        <div className="space-y-3">
          <StatBar 
            label="Experience Points" 
            value={(userProfile.xp / userProfile.nextLevelXp) * 100} 
            suffix={`${userProfile.xp} / ${userProfile.nextLevelXp} XP`} 
          />
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <div className="w-2 h-2 rounded-full bg-jarvis-accent animate-pulse" />
          <span className="text-[8px] text-white/40 uppercase tracking-widest">Neural Sync Optimized</span>
        </div>
      </div>

      {/* Memory Banks Widget */}
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-jarvis-accent">
            <Database size={16} />
            <span className="text-xs font-display uppercase tracking-widest">Memory Banks</span>
          </div>
          <span className="text-[10px] font-mono text-white/40">{memories.length} UNITS</span>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
          {memories.length === 0 ? (
            <div className="text-[8px] text-white/20 text-center py-4 uppercase tracking-widest italic">
              No data stored in memory
            </div>
          ) : (
            memories.slice().reverse().map((memory) => (
              <div key={memory.id} className="bg-white/5 p-2 rounded border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[7px] text-jarvis-accent uppercase font-bold">{memory.category}</span>
                  <span className="text-[6px] text-white/20">{new Date(memory.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[9px] text-white/70 line-clamp-2">{memory.content}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Stats */}
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-jarvis-accent">
            <Activity size={16} />
            <span className="text-xs font-display uppercase tracking-widest">System Architecture</span>
          </div>
          <RefreshCw size={12} className="text-white/20 cursor-pointer hover:text-jarvis-accent transition-colors" />
        </div>
        
        <div className="space-y-3">
          <StatBar label="CPU Load (6-Core Processor)" value={12} />
          <StatBar label="Memory Allocation (8GB RAM)" value={38} suffix="3.1 GB / 8.0 GB" />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
          <div className="bg-white/5 p-2 rounded">
            <div className="text-[7px] text-white/30 uppercase tracking-widest mb-1">Processor</div>
            <div className="text-[9px] font-mono text-white/80">Hexa-Core X1</div>
          </div>
          <div className="bg-white/5 p-2 rounded">
            <div className="text-[7px] text-white/30 uppercase tracking-widest mb-1">Memory Type</div>
            <div className="text-[9px] font-mono text-white/80">8GB LPDDR5</div>
          </div>
        </div>
      </div>

      {/* Weather */}
      <div className="glass-panel p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-jarvis-accent">
            <Cloud size={16} />
            <span className="text-xs font-display uppercase tracking-widest">Weather</span>
          </div>
          <RefreshCw size={12} className="text-white/20 cursor-pointer hover:text-jarvis-accent transition-colors" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-mono">25.2°C</div>
            <div className="text-[10px] text-white/60 uppercase">Quezon City, PH</div>
            <div className="text-[8px] text-white/40 uppercase">overcast clouds</div>
          </div>
          <Cloud size={32} className="text-jarvis-accent/50" />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
          <MiniStat label="Humidity" value="94%" />
          <MiniStat label="Wind" value="5.8 m/s" />
          <MiniStat label="Feels Like" value="26.3°C" />
        </div>
      </div>
    </div>
  );
};

const StatBar = ({ label, value, suffix }: { label: string; value: number; suffix?: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] text-white/60 uppercase tracking-wider">
      <span>{label}</span>
      <span>{suffix || `${value}%`}</span>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className="h-full bg-jarvis-accent neon-border"
      />
    </div>
  </div>
);

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col items-center text-center">
    <span className="text-[7px] text-white/30 uppercase tracking-widest mb-1">{label}</span>
    <span className="text-[9px] font-mono text-white/80">{value}</span>
  </div>
);
