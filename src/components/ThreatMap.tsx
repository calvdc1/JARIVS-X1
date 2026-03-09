import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Shield, AlertTriangle, Target, Activity, Zap } from 'lucide-react';

export const ThreatMap: React.FC = () => {
  const [threats, setThreats] = useState<any[]>([]);
  const [threatLevel, setThreatLevel] = useState(2.4);

  useEffect(() => {
    const initialThreats = [
      { id: 1, x: 20, y: 30, label: "Cyber Attack", level: "HIGH", color: "text-red-500" },
      { id: 2, x: 60, y: 40, label: "Neural Breach", level: "CRITICAL", color: "text-jarvis-accent" },
      { id: 3, x: 40, y: 70, label: "Data Leak", level: "MODERATE", color: "text-amber-500" },
      { id: 4, x: 80, y: 20, label: "System Probe", level: "LOW", color: "text-emerald-500" },
    ];
    setThreats(initialThreats);

    const interval = setInterval(() => {
      setThreatLevel(prev => {
        const next = prev + (Math.random() - 0.5) * 0.1;
        return Math.min(10, Math.max(0, next));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-jarvis-accent/10 border border-jarvis-accent/30">
            <Globe className="text-jarvis-accent" size={24} />
          </div>
          <div>
            <h2 className="font-display text-lg tracking-widest uppercase gold-accent">Global Threat Map</h2>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Real-time Global Neural Network Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-white/40 uppercase">Threat Level</p>
            <p className={`text-xl font-display ${threatLevel > 5 ? 'text-red-500' : 'text-emerald-400'}`}>{threatLevel.toFixed(1)} / 10.0</p>
          </div>
          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center animate-pulse ${threatLevel > 5 ? 'border-red-500/30' : 'border-emerald-500/30'}`}>
            <AlertTriangle className={threatLevel > 5 ? 'text-red-500' : 'text-emerald-400'} size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Map Visualization */}
        <div className="lg:col-span-3 glass-panel relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(var(--color-jarvis-accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative w-full h-full p-10">
            {/* Simulated Map Outline */}
            <div className="absolute inset-10 border border-white/5 rounded-3xl overflow-hidden">
               <div className="absolute inset-0 bg-white/5 opacity-10" 
                    style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.05) 50%), linear-gradient(transparent 50%, rgba(255,255,255,0.05) 50%)', backgroundSize: '100px 100px' }} />
               
               {/* Threat Markers */}
               {threats.map(threat => (
                 <motion.div
                   key={threat.id}
                   className="absolute cursor-pointer group"
                   style={{ left: `${threat.x}%`, top: `${threat.y}%` }}
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                 >
                   <div className={`relative w-4 h-4 rounded-full ${threat.color.replace('text-', 'bg-')} shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-pulse`} />
                   <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                     <div className="glass-panel p-3 min-w-[150px] space-y-2">
                       <p className="text-[10px] font-display uppercase tracking-widest gold-accent">{threat.label}</p>
                       <p className={`text-[8px] font-mono uppercase ${threat.color}`}>{threat.level} PRIORITY</p>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${threat.color.replace('text-', 'bg-')}`} style={{ width: '70%' }} />
                       </div>
                     </div>
                   </div>
                   {/* Scanning Ring */}
                   <motion.div 
                     animate={{ scale: [1, 4], opacity: [0.5, 0] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     className={`absolute inset-0 rounded-full border ${threat.color.replace('text-', 'border-')}`}
                   />
                 </motion.div>
               ))}
            </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-col gap-2">
            <MapControl icon={Target} label="Targeting" active />
            <MapControl icon={Shield} label="Defense" active />
            <MapControl icon={Activity} label="Scanning" active />
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[8px] font-mono uppercase text-white/40">Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[8px] font-mono uppercase text-white/40">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-mono uppercase text-white/40">Secure</span>
            </div>
          </div>
        </div>

        {/* Threat Feed */}
        <div className="flex flex-col gap-6 overflow-hidden">
          <div className="glass-panel p-6 flex-1 flex flex-col overflow-hidden">
            <h3 className="text-xs font-display uppercase tracking-widest gold-accent flex items-center gap-2 mb-6">
              <Activity size={14} /> Neural Feed
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono text-white/40 uppercase">00:12:0{i}</span>
                    <span className="text-[8px] font-mono text-jarvis-accent uppercase">ALERT</span>
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/80">Neural breach attempt detected in sector {i + 7}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-jarvis-accent" style={{ width: `${Math.random() * 100}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-white/40">72%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-xs font-display uppercase tracking-widest gold-accent flex items-center gap-2">
              <Zap size={14} /> Countermeasures
            </h3>
            <button className="w-full py-3 rounded-xl metallic-red-gradient font-display text-[10px] uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,0,0,0.3)]">
              INITIATE GLOBAL LOCKDOWN
            </button>
            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-display text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all">
              PURGE NEURAL CACHE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MapControl = ({ icon: Icon, label, active }: { icon: any, label: string, active: boolean }) => (
  <div className={`p-2 rounded-lg border transition-all cursor-pointer ${active ? 'bg-jarvis-accent/20 border-jarvis-accent text-jarvis-accent' : 'bg-white/5 border-white/10 text-white/40'}`}>
    <Icon size={16} />
  </div>
);
