import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Terminal, Cpu, Database, Settings, X, Command } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (cmd: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onCommand }) => {
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'summarize', label: 'Summarize this page', icon: Terminal },
    { id: 'code-mode', label: 'Switch to code mode', icon: Cpu },
    { id: 'clear-memory', label: 'Clear memory', icon: Database },
    { id: 'change-tone', label: 'Change tone', icon: Settings },
    { id: 'main-view', label: 'Switch to main view', icon: Search },
    { id: 'workshop-view', label: 'Switch to workshop', icon: Cpu },
  ];

  const filteredCommands = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // Toggle logic handled by parent
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-xl glass-panel overflow-hidden border-jarvis-blue/30 shadow-[0_0_50px_rgba(0,242,255,0.2)]"
        >
          <div className="p-4 flex items-center gap-3 border-b border-white/10">
            <Search size={20} className="text-jarvis-blue" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/20 text-lg"
            />
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/40">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onCommand(cmd.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-jarvis-blue/10 transition-colors group text-left"
                >
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-jarvis-blue/30 transition-colors">
                    <cmd.icon size={18} className="text-white/60 group-hover:text-jarvis-blue" />
                  </div>
                  <span className="text-sm text-white/80 group-hover:text-white">{cmd.label}</span>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-white/20 text-sm">
                No commands found for "{query}"
              </div>
            )}
          </div>

          <div className="p-3 bg-black/20 border-t border-white/10 flex justify-between items-center text-[10px] text-white/40 uppercase tracking-widest">
            <span>Navigate with ↑↓</span>
            <span>Select with ↵</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
