import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Code, FileText, BarChart2, Palette, Shield, Activity, Brain, Zap, Scale, Network } from 'lucide-react';

interface WorkspaceHUDProps {
  mode: 'chat' | 'document' | 'code' | 'analysis' | 'creative' | 'analytical' | 'creative_divergence' | 'devils_advocate' | 'systems_thinking';
  isProcessing: boolean;
}

export const WorkspaceHUD: React.FC<WorkspaceHUDProps> = ({ mode, isProcessing }) => {
  const modes = {
    chat: { icon: Activity, label: 'Neural Chat', color: 'text-jarvis-blue' },
    document: { icon: FileText, label: 'Document Mode', color: 'text-emerald-400' },
    code: { icon: Code, label: 'Code Mode', color: 'text-amber-400' },
    analysis: { icon: BarChart2, label: 'Analysis Mode', color: 'text-purple-400' },
    creative: { icon: Palette, label: 'Creative Mode', color: 'text-pink-400' },
    analytical: { icon: Brain, label: 'Analytical', color: 'text-blue-400' },
    creative_divergence: { icon: Zap, label: 'Divergence', color: 'text-yellow-400' },
    devils_advocate: { icon: Scale, label: 'Advocate', color: 'text-red-400' },
    systems_thinking: { icon: Network, label: 'Systems', color: 'text-indigo-400' },
  };

  const current = modes[mode];

  return (
    <div className="fixed top-6 left-6 z-40 flex flex-col gap-4">
      <motion.div 
        layout
        className="glass-panel p-3 flex items-center gap-4 neon-border"
      >
        <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${current.color}`}>
          <current.icon size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-mono text-white/40 uppercase tracking-[0.2em]">System Mode</span>
          <span className={`text-xs font-display uppercase tracking-widest ${current.color}`}>{current.label}</span>
        </div>
        {isProcessing && (
          <div className="ml-4 flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 12, 4] }}
                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                className={`w-1 rounded-full ${current.color.replace('text-', 'bg-')}`}
              />
            ))}
          </div>
        )}
      </motion.div>

      <div className="flex gap-2">
        <MiniStat icon={Shield} label="Security" value="Level 5" color="text-jarvis-blue" />
        <MiniStat icon={Cpu} label="Neural" value="98%" color="text-jarvis-blue" />
      </div>
    </div>
  );
};

const MiniStat = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className="glass-panel px-3 py-1.5 flex items-center gap-2 border-white/5">
    <Icon size={10} className="text-white/40" />
    <div className="flex flex-col">
      <span className="text-[6px] font-mono text-white/20 uppercase leading-none">{label}</span>
      <span className={`text-[8px] font-display uppercase ${color}`}>{value}</span>
    </div>
  </div>
);
