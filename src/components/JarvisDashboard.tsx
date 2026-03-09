import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Cpu, Zap, Wifi, Terminal as TerminalIcon, Command, Settings } from 'lucide-react';

export const JarvisDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-jarvis-dark text-white font-sans overflow-hidden relative flex items-center justify-center p-8">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(var(--color-jarvis-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--color-jarvis-cyan) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-50 opacity-10" />
      
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-jarvis-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-jarvis-magenta/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Curved Connecting Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <path 
          d="M 50% 100 L 50% 200" 
          stroke="var(--color-jarvis-cyan)" 
          fill="none" 
          strokeWidth="1" 
          strokeDasharray="5 5"
        />
        {/* Left HUD Curve */}
        <path 
          d="M 25% 150 Q 25% 250 35% 300" 
          stroke="var(--color-jarvis-cyan)" 
          fill="none" 
          strokeWidth="1"
          className="animate-pulse"
        />
        {/* Right HUD Curve */}
        <path 
          d="M 75% 150 Q 75% 250 65% 300" 
          stroke="var(--color-jarvis-magenta)" 
          fill="none" 
          strokeWidth="1"
          className="animate-pulse"
        />
      </svg>

      {/* Main Layout */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
        
        {/* Left HUD: J.A.R.V.I.S 01 */}
        <div className="flex flex-col items-center justify-center space-y-8 relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-t from-jarvis-cyan to-transparent" />
          <div className="relative">
            <HUDHeader title="J.A.R.V.I.S 01" subtitle="CORE SYSTEM INTERFACE" color="cyan" />
            <RadialHUD variant="v1" />
          </div>
          <SystemMetrics />
        </div>

        {/* Right HUD: J.A.R.V.I.S 08 */}
        <div className="flex flex-col items-center justify-center space-y-8 relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-t from-jarvis-magenta to-transparent" />
          <div className="relative">
            <HUDHeader title="J.A.R.V.I.S 08" subtitle="SPECIAL INTELLIGENCE" color="magenta" />
            <RadialHUD variant="v2" />
          </div>
          <TerminalLog />
        </div>

      </div>

      {/* Audio Reacting Text at bottom center */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="flex gap-1 h-4 items-end">
          {[...Array(20)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ height: [2, 12, 4, 16, 2][i % 5] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.02 }}
              className="w-0.5 bg-jarvis-cyan/40"
            />
          ))}
        </div>
        <span className="text-[9px] font-mono tracking-[0.5em] text-jarvis-cyan/60 uppercase">Audio Reacting HUD System</span>
      </div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 border-t border-jarvis-cyan/10 bg-black/40 backdrop-blur-md flex justify-between items-center px-12">
        <div className="flex items-center gap-6">
          <StatusItem icon={<Cpu size={14} />} label="CPU" value="12%" />
          <StatusItem icon={<Activity size={14} />} label="RAM" value="4.2GB" />
          <StatusItem icon={<Wifi size={14} />} label="NET" value="980Mbps" />
        </div>
        <div className="font-mono text-[10px] tracking-[0.3em] text-jarvis-cyan/40 uppercase">
          Neural Link Established // Protocol 08-X
        </div>
      </div>
    </div>
  );
};

const HUDHeader = ({ title, subtitle, color }: { title: string; subtitle: string; color: 'cyan' | 'magenta' }) => (
  <div className="text-center mb-8 space-y-1 relative">
    <svg className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-12 pointer-events-none overflow-visible">
      <path 
        d="M 0 20 Q 96 -10 192 20" 
        fill="none" 
        stroke={color === 'cyan' ? 'var(--color-jarvis-cyan)' : 'var(--color-jarvis-magenta)'} 
        strokeWidth="1" 
        strokeDasharray="4 4"
        className="opacity-40"
      />
    </svg>
    <h2 className={`font-display text-2xl tracking-[0.3em] uppercase ${color === 'cyan' ? 'text-jarvis-cyan' : 'text-jarvis-magenta'}`}>
      {title}
    </h2>
    <p className="text-[10px] font-mono tracking-[0.4em] text-white/30 uppercase">
      {subtitle}
    </p>
  </div>
);

const RadialHUD = ({ variant }: { variant: 'v1' | 'v2' }) => {
  return (
    <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center">
      {/* Outer Ticks */}
      <div className="absolute inset-0">
        {[...Array(60)].map((_, i) => (
          <div 
            key={i}
            className={`absolute top-1/2 left-1/2 w-0.5 h-2 origin-bottom ${i % 5 === 0 ? 'bg-jarvis-cyan/40 h-4' : 'bg-white/10'}`}
            style={{ transform: `rotate(${i * 6}deg) translateY(-180px)` }}
          />
        ))}
      </div>

      {/* Rotating Rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-4 border border-jarvis-cyan/20 rounded-full border-dashed"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute inset-8 border border-jarvis-magenta/10 rounded-full"
      />

      {/* Core Visualization */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden shadow-[inset_0_0_50px_rgba(0,242,255,0.1)]">
        {variant === 'v1' ? (
          <WaveformVisualizer />
        ) : (
          <NestedRingsVisualizer />
        )}
        
        {/* Center Point */}
        <div className="absolute w-2 h-2 bg-jarvis-cyan rounded-full shadow-[0_0_15px_rgba(0,242,255,0.8)] z-20" />
      </div>

      {/* Decorative Arcs */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle 
          cx="50%" cy="50%" r="45%" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeDasharray="100 1000"
          className="text-jarvis-cyan/40"
        />
        <circle 
          cx="50%" cy="50%" r="46%" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeDasharray="50 1000"
          className="text-jarvis-magenta/40"
        />
      </svg>
    </div>
  );
};

const WaveformVisualizer = () => (
  <div className="flex items-center gap-1 h-32">
    {[...Array(16)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          height: [20, 80, 40, 100, 20][i % 5],
          opacity: [0.3, 1, 0.3]
        }}
        transition={{ 
          duration: 0.8, 
          repeat: Infinity, 
          delay: i * 0.05,
          ease: "easeInOut" 
        }}
        className="w-2 bg-jarvis-cyan rounded-full shadow-[0_0_10px_rgba(0,242,255,0.5)]"
      />
    ))}
  </div>
);

const NestedRingsVisualizer = () => (
  <div className="relative w-full h-full flex items-center justify-center">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        animate={{ 
          rotate: i % 2 === 0 ? 360 : -360,
          scale: [1, 1.05, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ 
          rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute rounded-full border border-jarvis-magenta/30"
        style={{ inset: `${i * 20}px` }}
      />
    ))}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-1/2 h-1/2 border border-jarvis-cyan/20 rounded-full animate-pulse" />
    </div>
  </div>
);

const SystemMetrics = () => (
  <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
    <MetricCard label="SECURITY" value="OPTIMAL" icon={<Shield size={16} />} color="cyan" />
    <MetricCard label="POWER" value="98.4%" icon={<Zap size={16} />} color="magenta" />
  </div>
);

const MetricCard = ({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: 'cyan' | 'magenta' }) => (
  <div className="glass-panel p-4 border-white/5 flex flex-col gap-2">
    <div className="flex items-center gap-2 text-white/40">
      {icon}
      <span className="text-[10px] font-mono tracking-widest">{label}</span>
    </div>
    <div className={`font-display text-sm tracking-widest ${color === 'cyan' ? 'text-jarvis-cyan' : 'text-jarvis-magenta'}`}>
      {value}
    </div>
  </div>
);

const TerminalLog = () => (
  <div className="glass-panel w-full max-w-md h-32 p-4 border-white/5 overflow-hidden font-mono text-[10px] text-white/40 space-y-1">
    <div className="flex items-center gap-2 text-jarvis-cyan/60">
      <TerminalIcon size={12} />
      <span>SYSTEM LOGS</span>
    </div>
    <div className="animate-pulse">_ Initializing neural pathways...</div>
    <div>_ Link established with satellite X-9</div>
    <div className="text-jarvis-magenta/40">_ Warning: Sub-routine 04 latency high</div>
    <div>_ Diagnostic complete. All systems green.</div>
  </div>
);

const StatusItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3">
    <div className="text-jarvis-cyan/60">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[8px] text-white/20 font-mono uppercase">{label}</span>
      <span className="text-[10px] text-white/60 font-display tracking-wider">{value}</span>
    </div>
  </div>
);
