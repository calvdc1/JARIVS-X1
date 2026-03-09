import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, Cpu, Shield, Network, Layers } from 'lucide-react';

export const QuantumSimulator: React.FC = () => {
  const [qubits, setQubits] = useState<any[]>([]);
  const [coherence, setCoherence] = useState(99.99);

  useEffect(() => {
    const initialQubits = Array(16).fill(0).map((_, i) => ({
      id: i,
      state: Math.random() > 0.5 ? 1 : 0,
      phase: Math.random() * 360,
      entangled: i % 4 === 0 ? i + 1 : null,
    }));
    setQubits(initialQubits);

    const interval = setInterval(() => {
      setQubits(prev => prev.map(q => ({
        ...q,
        state: Math.random() > 0.95 ? (q.state === 1 ? 0 : 1) : q.state,
        phase: (q.phase + 5) % 360,
      })));
      setCoherence(prev => {
        const next = prev - (Math.random() * 0.01);
        return Math.min(100, Math.max(95, next));
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-jarvis-accent/10 border border-jarvis-accent/30">
            <Zap className="text-jarvis-accent" size={24} />
          </div>
          <div>
            <h2 className="font-display text-lg tracking-widest uppercase gold-accent">Quantum Computing Simulator</h2>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-tighter">Sub-atomic Neural Processing Unit (SNPU) Active</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-white/40 uppercase">Coherence</p>
            <p className="text-xl font-display text-emerald-400">{coherence.toFixed(2)}%</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 flex items-center justify-center animate-pulse">
            <Activity className="text-emerald-400" size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Quantum Lattice */}
        <div className="lg:col-span-2 glass-panel relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(var(--color-jarvis-accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="grid grid-cols-4 gap-8 p-10 relative">
            {qubits.map(qubit => (
              <motion.div
                key={qubit.id}
                className="relative w-16 h-16 flex items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full border border-white/5 animate-pulse" />
                <motion.div
                  animate={{ 
                    rotate: qubit.phase,
                    scale: qubit.state === 1 ? 1.2 : 0.8,
                    opacity: qubit.state === 1 ? 1 : 0.4
                  }}
                  className={`w-8 h-8 rounded-full border-2 border-jarvis-accent/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,0,0.3)]`}
                >
                  <div className="w-2 h-2 rounded-full bg-jarvis-accent" />
                </motion.div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/20 uppercase">
                  Q{qubit.id} | {qubit.state}
                </div>
                {qubit.entangled !== null && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                     <motion.line
                       x1="50%" y1="50%" x2="150%" y2="50%"
                       stroke="var(--color-jarvis-accent)"
                       strokeWidth="0.5"
                       strokeDasharray="2 2"
                       animate={{ opacity: [0.2, 0.8, 0.2] }}
                       transition={{ duration: 1, repeat: Infinity }}
                     />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>

          <div className="absolute bottom-6 left-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-jarvis-accent" />
              <span className="text-[8px] font-mono uppercase text-white/40">Superposition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-mono uppercase text-white/40">Entangled</span>
            </div>
          </div>
        </div>

        {/* Quantum Stats */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 space-y-6">
            <h3 className="text-xs font-display uppercase tracking-widest gold-accent flex items-center gap-2">
              <Network size={14} /> Entanglement Matrix
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/40">
                <span>Active Qubits</span>
                <span className="text-white">16 / 16</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-jarvis-accent" style={{ width: '100%' }} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/40">
                <span>Entanglement Rate</span>
                <span className="text-white">84.2%</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '84%' }} />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 flex-1 space-y-6">
            <h3 className="text-xs font-display uppercase tracking-widest gold-accent flex items-center gap-2">
              <Layers size={14} /> Algorithm Queue
            </h3>
            <div className="space-y-4">
              <AlgorithmItem label="Shor's Algorithm" status="RUNNING" progress={42} />
              <AlgorithmItem label="Grover's Search" status="QUEUED" progress={0} />
              <AlgorithmItem label="Quantum Fourier" status="READY" progress={0} />
              <AlgorithmItem label="Neural Decryption" status="COMPLETED" progress={100} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlgorithmItem = ({ label, status, progress }: { label: string, status: string, progress: number }) => (
  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">{label}</span>
      <span className={`text-[8px] font-mono uppercase ${status === 'RUNNING' ? 'text-emerald-400' : 'text-white/40'}`}>{status}</span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={`h-full ${status === 'RUNNING' ? 'bg-emerald-500' : 'bg-white/20'}`} 
      />
    </div>
  </div>
);
