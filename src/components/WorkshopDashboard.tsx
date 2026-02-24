import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Code, Cpu, Database, Globe, Layers, Zap, Activity } from 'lucide-react';
import { useLiveAPI } from '../hooks/useLiveAPI';

export const WorkshopDashboard: React.FC = () => {
  const { isSpeaking, isProcessing, isListening } = useLiveAPI();

  return (
    <div className="w-full h-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 font-mono overflow-y-auto md:overflow-hidden">
      {/* Left Column: System Stats */}
      <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
        <div className="glass-panel p-4 border-emerald-500/30">
          <h3 className="text-emerald-500 text-xs mb-4 uppercase tracking-tighter flex items-center gap-2">
            <Cpu size={14} /> System Resources
          </h3>
          <div className="space-y-3">
            <StatBar label="Neural Load" value={isProcessing ? 85 : 42} color="bg-emerald-500" />
            <StatBar label="Memory" value={64} color="bg-emerald-500" />
            <StatBar label="Sync Rate" value={99} color="bg-emerald-500" />
          </div>
        </div>

        <div className="glass-panel p-4 border-emerald-500/30 flex-1">
          <h3 className="text-emerald-500 text-xs mb-4 uppercase tracking-tighter flex items-center gap-2">
            <Activity size={14} /> Neural Status
          </h3>
          <div className="space-y-4 py-2">
            <StatusRow label="Listening" active={isListening && !isSpeaking && !isProcessing} />
            <StatusRow label="Processing" active={isProcessing} />
            <StatusRow label="Speaking" active={isSpeaking} />
            <div className="pt-4 border-t border-emerald-500/10">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-emerald-500/40">Neural Pulse</span>
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        opacity: [0.2, 1, 0.2],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 1, 
                        repeat: Infinity, 
                        delay: i * 0.3 
                      }}
                      className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Column: Code Editor View */}
      <div className="col-span-1 md:col-span-6 flex flex-col gap-4">
        <div className="glass-panel p-0 border-emerald-500/30 flex-1 flex flex-col overflow-hidden">
          <div className="bg-emerald-500/10 p-2 border-b border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code size={14} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-500 uppercase">main_sequence.ts</span>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
          </div>
          <div className="p-4 text-xs text-emerald-400/80 overflow-y-auto font-mono leading-relaxed">
            <pre>
{`import { NeuralCore } from '@stark/core';

async function initializeWorkshop() {
  const core = new NeuralCore({
    mode: 'DEVELOPMENT',
    security: 'LEVEL_5'
  });

  console.log('JARVIS Workshop Online');
  
  await core.sync();
  
  // Initialize holographic workspace
  core.on('ready', () => {
    core.render('DASHBOARD_V2');
  });
}

// System standby sequence
export const standby = () => {
  return core.hibernate();
};`}
            </pre>
          </div>
        </div>

        <div className="glass-panel p-4 border-emerald-500/30 h-32">
          <h3 className="text-emerald-500 text-xs mb-2 uppercase tracking-tighter flex items-center gap-2">
            <Terminal size={14} /> Output Console
          </h3>
          <div className="text-[10px] text-emerald-400/60 font-mono">
            <div>[SYSTEM] Workshop initialized...</div>
            <div>[SUCCESS] Neural link established.</div>
            <div>[READY] Awaiting developer input.</div>
            <div className="animate-pulse">_</div>
          </div>
        </div>
      </div>

      {/* Right Column: Network & Global */}
      <div className="col-span-1 md:col-span-3 flex flex-col gap-4">
        <div className="glass-panel p-4 border-emerald-500/30">
          <h3 className="text-emerald-500 text-xs mb-4 uppercase tracking-tighter flex items-center gap-2">
            <Globe size={14} /> Global Uplink
          </h3>
          <div className="aspect-square rounded-full border border-emerald-500/20 flex items-center justify-center relative">
            <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-ping" />
            <Globe size={48} className="text-emerald-500/20" />
          </div>
        </div>

        <div className="glass-panel p-4 border-emerald-500/30 flex-1">
          <h3 className="text-emerald-500 text-xs mb-4 uppercase tracking-tighter flex items-center gap-2">
            <Layers size={14} /> Project Stack
          </h3>
          <div className="space-y-2">
            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded text-[10px] text-emerald-400">
              Frontend: React + Tailwind
            </div>
            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded text-[10px] text-emerald-400">
              Backend: Node + Express
            </div>
            <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded text-[10px] text-emerald-400">
              AI: Gemini 2.5 Flash
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusRow = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between">
    <span className={`text-[10px] uppercase tracking-widest ${active ? 'text-emerald-400' : 'text-emerald-900'}`}>{label}</span>
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse' : 'bg-emerald-900'}`} />
  </div>
);

const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[9px] uppercase tracking-widest text-emerald-500/70">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-1 w-full bg-emerald-500/10 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
);
