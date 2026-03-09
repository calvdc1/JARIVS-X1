import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Activity, Zap, Shield, Cpu } from 'lucide-react';

export const NeuralLink: React.FC = () => {
  const [signals, setSignals] = useState<number[]>(Array(20).fill(0));
  const [syncRate, setSyncRate] = useState(98.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => prev.map(() => Math.random() * 100));
      setSyncRate(prev => {
        const next = prev + (Math.random() - 0.5) * 0.1;
        return Math.min(100, Math.max(90, next));
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-jarvis-accent/10 border border-jarvis-accent/30">
            <Brain className="text-jarvis-accent" size={24} />
          </div>
          <div>
            <h2 className="font-display text-lg tracking-widest uppercase gold-accent">Neural Link Interface</h2>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Direct Brain-Computer Interface (BCI) Active</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-white/40 uppercase">Sync Rate</p>
            <p className="text-xl font-display text-jarvis-accent">{syncRate.toFixed(1)}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-jarvis-accent/30 flex items-center justify-center animate-pulse">
            <Zap className="text-jarvis-accent" size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Brain Visualization */}
        <div className="lg:col-span-2 glass-panel relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(var(--color-jarvis-accent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          
          <motion.div 
            animate={{ 
              scale: [1, 1.02, 1],
              filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <Brain size={300} strokeWidth={0.5} className="text-jarvis-accent/20" />
            
            {/* Neural Pulse Points */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-jarvis-accent shadow-[0_0_10px_rgba(255,0,0,0.8)]"
                style={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <motion.path
                d="M 100,100 Q 150,150 200,100"
                stroke="var(--color-jarvis-accent)"
                strokeWidth="0.5"
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </svg>
          </motion.div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Alpha Waves: STABLE</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-jarvis-accent shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                <span className="text-[10px] font-mono uppercase tracking-widest">Beta Waves: ACTIVE</span>
              </div>
            </div>
            <div className="flex gap-1 h-12 items-end">
              {signals.map((s, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${s}%` }}
                  className="w-1 bg-jarvis-accent/40 rounded-t-sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Neural Stats */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 space-y-6">
            <h3 className="text-xs font-display uppercase tracking-widest gold-accent flex items-center gap-2">
              <Activity size={14} /> Signal Integrity
            </h3>
            <div className="space-y-4">
              <StatItem label="Signal Strength" value="99.2%" color="text-emerald-400" />
              <StatItem label="Latency" value="0.4ms" color="text-emerald-400" />
              <StatItem label="Bandwidth" value="12.4 TB/s" color="text-jarvis-accent" />
              <StatItem label="Encryption" value="AES-4096" color="text-jarvis-accent" />
            </div>
          </div>

          <div className="glass-panel p-6 flex-1 space-y-6">
            <h3 className="text-xs font-display uppercase tracking-widest gold-accent flex items-center gap-2">
              <Shield size={14} /> Neural Firewall
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest">Intrusion Detection</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">ACTIVE</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest">Cognitive Shielding</span>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">NOMINAL</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest">Synaptic Filtering</span>
                <span className="text-[10px] font-mono text-jarvis-accent uppercase">FILTERING...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="flex items-center justify-between border-b border-white/5 pb-2">
    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{label}</span>
    <span className={`text-xs font-display uppercase ${color}`}>{value}</span>
  </div>
);
