import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Play, Plus, Trash2, ArrowRight, Mail, Bell, Globe } from 'lucide-react';

interface Automation {
  id: number;
  trigger: string;
  action: string;
  config: any;
}

interface AutomationBuilderProps {
  automations: Automation[];
  onSave: (trigger: string, action: string, config: any) => void;
}

export const AutomationBuilder: React.FC<AutomationBuilderProps> = ({ automations, onSave }) => {
  const [newTrigger, setNewTrigger] = useState('');
  const [newAction, setNewAction] = useState('');

  const triggers = [
    { id: 'voice', label: 'When I say...', icon: Play },
    { id: 'time', label: 'At a specific time...', icon: Globe },
    { id: 'email', label: 'When I get an email...', icon: Mail },
  ];

  const actions = [
    { id: 'notify', label: 'Send a notification', icon: Bell },
    { id: 'email', label: 'Send an email', icon: Mail },
    { id: 'summarize', label: 'Summarize context', icon: Zap },
  ];

  return (
    <div className="glass-panel p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <Zap className="text-amber-400" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-amber-400">Automation Engine</h2>
      </div>

      <div className="space-y-6">
        {/* New Automation Form */}
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 border-dashed">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-4">Create New Flow</h3>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <select 
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              className="w-full md:w-1/3 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400/50"
            >
              <option value="">Select Trigger</option>
              {triggers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <ArrowRight className="text-white/20 hidden md:block" size={20} />
            <select 
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              className="w-full md:w-1/3 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-400/50"
            >
              <option value="">Select Action</option>
              {actions.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
            <button 
              onClick={() => {
                if (newTrigger && newAction) {
                  onSave(newTrigger, newAction, {});
                  setNewTrigger('');
                  setNewAction('');
                }
              }}
              className="w-full md:w-auto p-3 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              <span className="text-xs font-display uppercase tracking-widest">Deploy</span>
            </button>
          </div>
        </div>

        {/* List of Automations */}
        <div className="space-y-3">
          {automations.map((auto) => (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400">
                  <Zap size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">IF {auto.trigger} THEN {auto.action}</span>
                  <span className="text-xs text-white/80">Active Automation Flow</span>
                </div>
              </div>
              <button className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
