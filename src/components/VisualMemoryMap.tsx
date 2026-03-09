import React from 'react';
import { motion } from 'motion/react';
import { Database, User, Zap, Target, BookOpen } from 'lucide-react';

interface Memory {
  id: number;
  content: string;
  category: string;
  timestamp: string;
}

interface VisualMemoryMapProps {
  memories: Memory[];
}

export const VisualMemoryMap: React.FC<VisualMemoryMapProps> = ({ memories }) => {
  const categories = {
    profile: { icon: User, color: 'text-jarvis-accent', label: 'User Profile' },
    project: { icon: Zap, color: 'text-amber-400', label: 'Projects' },
    preference: { icon: Settings, color: 'text-emerald-400', label: 'Preferences' },
    goal: { icon: Target, color: 'text-purple-400', label: 'Goals' },
    learning: { icon: BookOpen, color: 'text-pink-400', label: 'Learning' },
    general: { icon: Database, color: 'text-white/40', label: 'General' },
  };

  return (
    <div className="glass-panel p-4 md:p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <Database className="text-jarvis-accent" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-jarvis-accent">Neural Memory Map</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {memories.length > 0 ? (
          memories.map((memory, i) => {
            const cat = (categories as any)[memory.category] || categories.general;
            return (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-jarvis-accent/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <cat.icon size={14} className={cat.color} />
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${cat.color}`}>{cat.label}</span>
                  <span className="ml-auto text-[8px] text-white/20 font-mono">{new Date(memory.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed group-hover:text-white transition-colors">
                  {memory.content}
                </p>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 py-20 text-center text-white/20 font-mono text-xs uppercase tracking-widest">
            No neural patterns detected
          </div>
        )}
      </div>
    </div>
  );
};

import { Settings } from 'lucide-react';
