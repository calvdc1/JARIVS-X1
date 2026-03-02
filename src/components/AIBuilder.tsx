import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Zap, Settings, Play, Save, Code, Sparkles, Brain, Layers, Terminal } from 'lucide-react';

export const AIBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'training' | 'deployment'>('architecture');
  const [modelName, setModelName] = useState('JARVIS-CORE-V4');
  const [parameters, setParameters] = useState({
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    contextWindow: 128000
  });

  return (
    <div className="h-full flex flex-col gap-6 p-6 glass-panel border-white/5 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-jarvis-gold/10 border border-jarvis-gold/30">
            <Cpu className="text-jarvis-gold" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display tracking-wider text-white uppercase">Neural Engine Builder</h2>
            <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Advanced Model Configuration Interface</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-display uppercase tracking-widest text-white/60 hover:text-white transition-colors">
            Load Preset
          </button>
          <button className="px-4 py-2 rounded-lg bg-jarvis-gold/20 border border-jarvis-gold/40 text-[10px] font-display uppercase tracking-widest text-jarvis-gold hover:bg-jarvis-gold/30 transition-all flex items-center gap-2">
            <Save size={14} />
            Deploy Model
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/5">
        <TabButton active={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')} icon={<Layers size={14} />} label="Architecture" />
        <TabButton active={activeTab === 'training'} onClick={() => setActiveTab('training')} icon={<Brain size={14} />} label="Training & Fine-tuning" />
        <TabButton active={activeTab === 'deployment'} onClick={() => setActiveTab('deployment')} icon={<Zap size={14} />} label="Deployment Specs" />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Model Identity</label>
                <input 
                  type="text" 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-jarvis-gold/50 transition-colors"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Base Engine</label>
                <div className="grid grid-cols-2 gap-3">
                  <EngineCard active name="Gemini 2.5 Flash" description="Multimodal, 1M Context" />
                  <EngineCard name="Gemini 3.1 Pro" description="Reasoning, 2M Context" />
                  <EngineCard name="GPT-4o" description="Omni-model, Balanced" />
                  <EngineCard name="Claude 3.5 Sonnet" description="Coding, Nuance" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-panel p-6 border-white/5 space-y-6">
                <h3 className="text-xs font-display text-jarvis-gold uppercase tracking-widest flex items-center gap-2">
                  <Settings size={14} />
                  Hyperparameters
                </h3>
                
                <Slider 
                  label="Temperature" 
                  value={parameters.temperature} 
                  min={0} max={1} step={0.1}
                  onChange={(v) => setParameters(p => ({ ...p, temperature: v }))}
                />
                <Slider 
                  label="Top P" 
                  value={parameters.topP} 
                  min={0} max={1} step={0.05}
                  onChange={(v) => setParameters(p => ({ ...p, topP: v }))}
                />
                <Slider 
                  label="Context Window" 
                  value={parameters.contextWindow} 
                  min={8000} max={128000} step={8000}
                  unit=" tokens"
                  onChange={(v) => setParameters(p => ({ ...p, contextWindow: v }))}
                />
              </div>

              <div className="glass-panel p-6 border-white/5">
                <h3 className="text-xs font-display text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Sparkles size={14} />
                  System Capabilities
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <CapabilityToggle label="Google Search" active />
                  <CapabilityToggle label="Code Execution" active />
                  <CapabilityToggle label="Vision Analysis" active />
                  <CapabilityToggle label="Audio Processing" active />
                  <CapabilityToggle label="Function Calling" active />
                  <CapabilityToggle label="Knowledge Retrieval" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="glass-panel p-8 border-white/5 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-jarvis-gold/10 flex items-center justify-center border border-jarvis-gold/20">
                <Brain className="text-jarvis-gold animate-pulse" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-display text-white uppercase">Neural Training Interface</h3>
                <p className="text-sm text-white/40 max-w-md mx-auto">Upload datasets or provide documentation to fine-tune the model's behavior and domain knowledge.</p>
              </div>
              <button className="mt-4 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-display uppercase tracking-widest text-white hover:bg-white/10 transition-all">
                Upload Training Data (.jsonl, .txt)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Training Epochs" value="0" />
              <StatCard label="Loss Rate" value="0.000" />
              <StatCard label="Tokens Processed" value="0" />
            </div>
          </div>
        )}

        {activeTab === 'deployment' && (
          <div className="space-y-6">
             <div className="glass-panel p-6 border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-display text-jarvis-gold uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={14} />
                    Deployment Console
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-500 uppercase">Edge Node Active</span>
                  </div>
                </div>
                
                <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-white/60 space-y-1">
                  <p className="text-emerald-400/80">[SYSTEM] Initializing deployment sequence...</p>
                  <p>[INFO] Validating architecture: Gemini 2.5 Flash</p>
                  <p>[INFO] Hyperparameters verified: Temp=0.7, TopP=0.9</p>
                  <p>[INFO] System capabilities: Search, Code, Vision, Audio, Functions</p>
                  <p className="text-jarvis-gold/80">[WARN] Context window set to 128k. Latency may increase.</p>
                  <p className="text-emerald-400/80">[READY] Awaiting final confirmation...</p>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-4 flex items-center gap-2 border-b-2 transition-all ${
      active 
        ? 'border-jarvis-gold text-jarvis-gold bg-jarvis-gold/5' 
        : 'border-transparent text-white/40 hover:text-white/60'
    }`}
  >
    {icon}
    <span className="text-[10px] font-display uppercase tracking-widest">{label}</span>
  </button>
);

const EngineCard = ({ active, name, description }: { active?: boolean, name: string, description: string }) => (
  <div className={`p-4 rounded-xl border transition-all cursor-pointer ${
    active 
      ? 'bg-jarvis-gold/10 border-jarvis-gold/40 shadow-[0_0_15px_rgba(255,215,0,0.1)]' 
      : 'bg-white/5 border-white/10 hover:border-white/20'
  }`}>
    <h4 className={`text-xs font-display uppercase tracking-wider mb-1 ${active ? 'text-jarvis-gold' : 'text-white/80'}`}>{name}</h4>
    <p className="text-[9px] font-mono text-white/30 uppercase leading-tight">{description}</p>
  </div>
);

const Slider = ({ label, value, min, max, step, unit = "", onChange }: { label: string, value: number, min: number, max: number, step: number, unit?: string, onChange: (v: number) => void }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{label}</label>
      <span className="text-[10px] font-display text-jarvis-gold">{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} max={max} step={step} 
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-jarvis-gold"
    />
  </div>
);

const CapabilityToggle = ({ label, active }: { label: string, active?: boolean }) => (
  <div className={`px-3 py-2 rounded-lg border flex items-center justify-between transition-all ${
    active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/30'
  }`}>
    <span className="text-[9px] font-display uppercase tracking-widest">{label}</span>
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-white/10'}`} />
  </div>
);

const StatCard = ({ label, value }: { label: string, value: string }) => (
  <div className="glass-panel p-4 border-white/5 text-center">
    <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-display text-white">{value}</p>
  </div>
);
