import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Calendar, Thermometer, Trash2 } from 'lucide-react';

export const TopBar: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleClearChat = () => {
    window.dispatchEvent(new CustomEvent('jarvis-clear-chat'));
  };

  return (
    <div className="w-full h-16 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="text-jarvis-accent font-mono text-xl tracking-widest neon-text font-bold">
          J.A.R.V.I.S
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-tighter">Online</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 glass-panel px-6 py-2">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-jarvis-accent" />
          <span className="text-sm font-mono tracking-wider">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-jarvis-accent" />
          <span className="text-sm font-mono tracking-wider">
            {time.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={handleClearChat}
          className="hidden sm:flex items-center gap-2 px-3 py-2 glass-panel hover:bg-red-500/10 hover:border-red-500/30 text-white/40 hover:text-red-400 transition-all group"
          title="Clear Conversation"
        >
          <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] uppercase tracking-widest font-mono">Clear</span>
        </button>

        <div className="glass-panel px-2 md:px-4 py-2 flex items-center gap-2 md:gap-3">
          <Thermometer size={14} className="text-jarvis-accent" />
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-mono">25.2°C</span>
            <span className="hidden xs:block text-[8px] text-white/40 uppercase tracking-widest">Quezon City</span>
          </div>
        </div>
        <button className="p-2 glass-panel hover:bg-white/5 transition-colors">
          <motion.div whileHover={{ rotate: 90 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </motion.div>
        </button>
      </div>
    </div>
  );
};
