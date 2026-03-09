import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3000; // 3 seconds
    const interval = 30;
    const increment = 100 / (duration / interval);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-jarvis-bg z-[100] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--color-jarvis-accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Animated Logo Loop */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-12">
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.02, 1] }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.2, repeat: Infinity, repeatType: "reverse" }
          }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-jarvis-accent/30"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border border-jarvis-accent/20"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.5, 1, 0.5],
            x: [0, -2, 2, 0],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            x: { duration: 0.1, repeat: Infinity, repeatDelay: 2 }
          }}
          className="w-24 h-24 rounded-full border-4 border-jarvis-accent flex items-center justify-center bg-jarvis-accent/5 shadow-[0_0_30px_rgba(0,242,255,0.3)]"
        >
          <span className="text-jarvis-accent font-display text-2xl font-bold neon-text">J</span>
        </motion.div>
      </div>

      {/* Loading Text & Percentage */}
      <div className="w-64 space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[10px] text-jarvis-accent uppercase tracking-[0.3em] font-mono animate-pulse">Initializing Systems</span>
            <span className="text-[8px] text-white/40 uppercase tracking-widest font-mono">Neural Link Syncing...</span>
          </div>
          <span className="text-xl font-mono text-jarvis-accent neon-text">{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            className="h-full bg-jarvis-accent shadow-[0_0_10px_rgba(0,242,255,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-[7px] text-white/20 uppercase tracking-widest font-mono">
          <span>Booting Kernel v4.0.2</span>
          <span>Secure Connection Established</span>
        </div>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(0,242,255,0.01),rgba(0,242,255,0.01),rgba(0,242,255,0.01))] bg-[length:100%_4px,3px_100%] opacity-20" />
    </div>
  );
};
