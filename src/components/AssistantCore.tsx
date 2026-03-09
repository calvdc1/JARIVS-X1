import React from 'react';
import { motion } from 'motion/react';

export const AssistantCore: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative">
      {/* Pulsing Rings */}
      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full border border-jarvis-accent/20"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute inset-[-10px] md:inset-[-20px] rounded-full border border-jarvis-accent/10"
        />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-20px] md:inset-[-40px] rounded-full border border-dashed border-jarvis-accent/5"
        />

        {/* Central Core */}
        <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border-2 border-jarvis-accent/30 flex items-center justify-center relative overflow-hidden bg-jarvis-bg/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-radial-gradient from-jarvis-accent/20 to-transparent opacity-50" />
          
          {/* Waveform Animation */}
          <div className="flex items-center gap-1 md:gap-1.5 h-8 md:h-12 z-10">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: [8, 24, 12, 32, 8],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{ 
                  duration: 1 + i * 0.2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-1.5 md:w-2 bg-jarvis-accent rounded-full neon-border shadow-[0_0_10px_rgba(0,242,255,0.5)]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Text Label */}
      <div className="mt-8 md:mt-12 text-center space-y-2">
        <h2 className="text-xl md:text-3xl font-mono tracking-[0.2em] md:tracking-[0.3em] neon-text font-bold">J.A.R.V.I.S</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] md:text-[10px] text-emerald-500/80 font-mono uppercase tracking-widest">Neural Link: Active</span>
        </div>
      </div>
    </div>
  );
};
