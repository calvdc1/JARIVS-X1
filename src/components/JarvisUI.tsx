import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Power, Shield, Activity, Cpu, Terminal, Music, Image as ImageIcon, X, Youtube, Dog, Database, Upload, MessageSquare, Command as CommandIcon, ArrowLeft, Download } from 'lucide-react';
import { useLiveAPI } from '../hooks/useLiveAPI';
import YouTube from 'react-youtube';
import { WorkshopDashboard } from './WorkshopDashboard';
import { Particles } from './Particles';
import { ChatSystem } from './ChatSystem';
import { CommandPalette } from './CommandPalette';
import { WorkspaceHUD } from './WorkspaceHUD';
import { VisualMemoryMap } from './VisualMemoryMap';
import { AutomationBuilder } from './AutomationBuilder';
import { GoalTracker } from './GoalTracker';
import { LearningCompanion } from './LearningCompanion';
import { AITeam } from './AITeam';
import { DecisionSimulator } from './DecisionSimulator';
import { KnowledgeGraph } from './KnowledgeGraph';
import { PromptAutopsy } from './PromptAutopsy';
import { MentalModelLibrary } from './MentalModelLibrary';
import { RunningTracker } from './RunningTracker';
import { FoodTracker } from './FoodTracker';

export const JarvisUI: React.FC = () => {
  const { 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    isSpeaking, 
    isSpotifyConnected, 
    presentedImage, 
    setPresentedImage,
    spotifyDeviceId,
    youtubeVideoId,
    setYoutubeVideoId,
    currentView,
    setCurrentView,
    workspaceMode,
    setWorkspaceMode,
    isProcessing,
    isListening,
    setIsListening,
    personalities,
    activePersonalityId,
    handleSwitchPersonality,
    messages,
    spotifyTrack,
    sendTextContext,
    transferPlayback,
    userProfile,
    automations,
    goals,
    learningData,
    memories,
    decisions,
    graphData,
    runs,
    foodLogs,
    handleSaveAutomation,
    handleSaveGoal,
    handleUpdateLearning,
    handleSaveDecision,
    handleSyncGraph
  } = useLiveAPI();
  const [bootSequence, setBootSequence] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [phTime, setPhTime] = useState(new Date().toLocaleTimeString('en-PH', { hour12: true, timeZone: 'Asia/Manila' }));
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [osModule, setOsModule] = useState<'memory' | 'automation' | 'goals' | 'learning' | 'team' | 'decisions' | 'graph' | 'autopsy' | 'models' | 'running' | 'food'>('memory');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTargets = [
    { label: 'Android APK', href: '/downloads/jarvis-android.apk' },
    { label: 'iOS XAPK', href: '/downloads/jarvis-ios.xapk' },
    { label: 'PC EXE', href: '/downloads/jarvis-windows.exe' },
  ];

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good morning');
      else if (hour >= 12 && hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    updateGreeting();
    const timer = setInterval(() => {
      setPhTime(new Date().toLocaleTimeString('en-PH', { hour12: true, timeZone: 'Asia/Manila' }));
      updateGreeting();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sequence = [
      "Initializing Core Systems...",
      "Loading Neural Networks...",
      "Establishing Secure Link...",
      `JARVIS Online. Welcome back, ${userProfile.name}.`
    ];

    if (bootSequence < sequence.length) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, sequence[bootSequence]]);
        setBootSequence(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (bootSequence === sequence.length && !isConnected && !isConnecting) {
      // Auto-connect after boot sequence
      connect();
    }
  }, [bootSequence, isConnected, isConnecting, connect]);

  const handleToggle = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      sendTextContext(`User uploaded a file named "${file.name}". Content: \n\n${content}\n\nPlease summarize this file for me.`);
      setLogs(prev => [`[SYSTEM] File uploaded: ${file.name}`, ...prev]);
    };
    reader.readAsText(file);
  };

  const handleCommand = (cmd: string) => {
    if (cmd === 'main-view') setCurrentView('main');
    else if (cmd === 'workshop-view') setCurrentView('workshop');
    else if (cmd === 'code-mode') setWorkspaceMode('code');
    else if (cmd === 'summarize') sendTextContext("Please summarize the current context for me.");
    else if (cmd === 'clear-memory') sendTextContext("Please clear our current conversation context.");
  };

  return (
    <div className="w-full min-h-[100dvh] bg-jarvis-dark flex flex-col items-center justify-center pt-[9.5rem] md:pt-32 p-3 md:p-6 relative overflow-hidden">
      <Particles />
      
      <WorkspaceHUD mode={workspaceMode} isProcessing={isProcessing} />

      <div className="fixed top-3 md:top-4 left-3 right-3 md:left-6 md:right-6 z-40 glass-panel border-white/10 px-3 py-2 md:px-4 md:py-3">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 md:gap-3">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {currentView !== 'main' && (
                <button
                  onClick={() => setCurrentView('main')}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-jarvis-accent hover:border-jarvis-accent/40 transition-all flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  <span className="text-[9px] font-display uppercase tracking-widest">Back</span>
                </button>
              )}
              <div className="min-w-0">
                <p className="text-[8px] md:text-[10px] font-mono text-white/40 uppercase tracking-widest truncate">{greeting}, {userProfile.name}</p>
                <p className="text-xs md:text-sm font-display text-jarvis-accent">{phTime}</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-[10px] md:text-xs font-display tracking-[0.25em] text-jarvis-accent uppercase">Jarvis ONEMSU</p>
              <p className="text-[8px] md:text-[10px] font-mono text-white/35 uppercase tracking-widest">Neural Interface Active</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="glass-panel px-2.5 py-1.5 border-white/5">
                <span className="text-[9px] font-display text-amber-300 uppercase">Lvl {userProfile.level} · {userProfile.xp} XP</span>
              </div>
              <div className="glass-panel px-2.5 py-1.5 border-white/5">
                <span className="text-[9px] font-display text-emerald-300 uppercase">Streak {userProfile.streak}D</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-jarvis-accent/30 flex items-center justify-center bg-jarvis-accent/5">
                <Activity size={14} className="text-jarvis-accent animate-pulse" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-jarvis-accent">
              <Download size={13} />
              <span className="text-[9px] md:text-[10px] font-display uppercase tracking-widest text-white/70">Download Builds</span>
            </div>
            {downloadTargets.map((target) => (
              <a
                key={target.label}
                href={target.href}
                download
                className="text-[10px] md:text-xs px-2.5 py-1.5 rounded-md border border-jarvis-accent/30 bg-jarvis-accent/10 text-jarvis-accent hover:bg-jarvis-accent/20 transition-colors"
              >
                {target.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onCommand={handleCommand}
      />

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--color-jarvis-accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-jarvis-accent/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

      {/* Holographic Projector Overlay */}
      <AnimatePresence>
        {presentedImage && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/40"
          >
            <motion.div 
              initial={{ rotateX: 20, scale: 0.8, y: 100, opacity: 0 }}
              animate={{ 
                rotateX: [20, 15, 20], 
                scale: 1, 
                y: 0, 
                opacity: 1,
                filter: ["hue-rotate(0deg)", "hue-rotate(10deg)", "hue-rotate(0deg)"]
              }}
              transition={{ 
                rotateX: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                scale: { duration: 0.5 },
                y: { duration: 0.5 },
                opacity: { duration: 0.3 }
              }}
              className="relative max-w-5xl w-full aspect-video glass-panel overflow-hidden border-2 border-jarvis-accent/50 shadow-[0_0_100px_rgba(230,197,106,0.3)] perspective-1000"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <motion.img 
                animate={{ 
                  opacity: [0.7, 0.9, 0.7, 0.8, 0.7],
                  scale: [1, 1.01, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                src={presentedImage} 
                alt="Holographic Presentation" 
                className="w-full h-full object-cover mix-blend-screen"
                referrerPolicy="no-referrer"
              />
              
              {/* Holographic Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none opacity-20" 
                   style={{ backgroundImage: 'linear-gradient(var(--color-jarvis-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-jarvis-accent) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(230,197,106,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%]" />
              
              {/* Flicker Overlay */}
              <motion.div 
                animate={{ opacity: [0, 0.05, 0, 0.1, 0] }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                className="absolute inset-0 bg-white pointer-events-none"
              />

              <button 
                onClick={() => setPresentedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-20"
              >
                <X size={24} />
              </button>
              
              <div className="absolute bottom-4 left-6 flex items-center gap-3 z-20">
                <div className="w-2 h-2 rounded-full bg-jarvis-accent animate-ping" />
                <ImageIcon className="text-jarvis-accent" size={20} />
                <span className="font-display text-xs tracking-widest text-jarvis-accent uppercase">Holographic Projection: 3D Render Active</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* YouTube Player Overlay */}
      <AnimatePresence>
        {youtubeVideoId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md"
          >
            <div className="relative max-w-5xl w-full aspect-video glass-panel overflow-hidden border-2 border-jarvis-accent/50 shadow-[0_0_100px_rgba(230,197,106,0.2)]">
              <YouTube 
                videoId={youtubeVideoId} 
                className="w-full h-full"
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                    controls: 1,
                  },
                }}
              />
              
              <button 
                onClick={() => setYoutubeVideoId(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <div className="absolute bottom-4 left-6 flex items-center gap-3 pointer-events-none">
                <Youtube className="text-jarvis-accent" size={20} />
                <span className="font-display text-xs tracking-widest text-jarvis-accent uppercase">YouTube Neural Stream Active</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Interface */}
      <AnimatePresence mode="wait">
        {currentView === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-[1400px] min-h-[calc(100dvh-2rem)] md:min-h-[calc(100dvh-3rem)] grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 z-10 px-2 md:px-4 justify-items-center"
          >
            
            

        {/* Center Column: Core Reactor */}
        <div className="md:col-span-6 md:col-start-4 flex flex-col items-center justify-center space-y-6 md:space-y-8 order-1 md:order-2 py-4 md:py-0">
          <div className="relative group scale-75 md:scale-100">
            {/* Outer Decorative Rings */}
            <div className="absolute inset-[-40px] rounded-full border border-jarvis-accent/5 pointer-events-none" />
            <div className="absolute inset-[-20px] rounded-full border border-jarvis-accent/10 border-dashed pointer-events-none" />

            {/* Main Rings */}
            <motion.div 
              animate={{ 
                scale: isSpeaking ? [1, 1.05, 1] : isConnected ? [1, 1.02, 1] : 1
              }}
              transition={{ 
                scale: { duration: isSpeaking ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-dashed border-jarvis-accent/20 flex items-center justify-center"
            >
              <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border border-jarvis-accent/40 flex items-center justify-center">
                {/* Talking Waveform Rings */}
                <AnimatePresence>
                  {isSpeaking && (
                    <>
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.5, 2] }}
                          exit={{ opacity: 0 }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            delay: i * 0.5,
                            ease: "easeOut"
                          }}
                          className="absolute inset-0 rounded-full border border-jarvis-accent/30"
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Core */}
            <motion.button
              onClick={handleToggle}
              whileHover={{ scale: 1.05, rotateX: 6, rotateY: -6 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: isSpeaking 
                  ? "0 0 80px rgba(230, 197, 106, 0.8)" 
                  : isConnected 
                    ? "0 0 60px rgba(230, 197, 106, 0.4)" 
                    : "0 0 20px rgba(255, 255, 255, 0.1)"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-40 md:h-40 rounded-full bg-black border-2 border-jarvis-accent/30 flex items-center justify-center group cursor-pointer overflow-hidden z-20 shadow-[inset_0_0_20px_rgba(230,197,106,0.2)]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isConnected ? "active" : "inactive"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: isSpeaking ? [1, 1.05, 1] : 1, 
                    filter: isConnected ? "brightness(1.2) contrast(1.1)" : "brightness(0.6) grayscale(0.5)"
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.5, repeat: isSpeaking ? Infinity : 0, ease: "easeInOut" },
                  }}
                  className="relative w-full h-full p-2"
                >
                  {/* Boot Flash */}
                  {isConnected && (
                    <motion.div
                      initial={{ opacity: 1, scale: 0.5 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0 bg-white rounded-full z-40 pointer-events-none"
                    />
                  )}
                  
                  <img 
                    src="/jarvis-logo.svg" 
                    alt="JARVIS Core" 
                    className="w-full h-full object-contain mix-blend-screen"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Internal Glow */}
                  {isConnected && (
                    <motion.div 
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-jarvis-accent/20 rounded-full blur-xl pointer-events-none"
                    />
                  )}

                  {/* Mouth Waveform Overlay */}
                  <AnimatePresence>
                    {isSpeaking && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                      >
                        <div className="flex items-center gap-1 h-10">
                          {[...Array(12)].map((_, i) => (
                            <motion.div
                              key={`mouth-${i}`}
                              animate={{ height: [6, 28, 10, 36, 6][i % 5], opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
                              className="w-1.5 bg-jarvis-accent rounded-full shadow-[0_0_10px_rgba(230,197,106,0.8)]"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
              
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, rgba(230,197,106,0.22) 0%, transparent 60%, rgba(230,197,106,0.22) 100%)",
                    WebkitMaskImage: "radial-gradient(circle at center, transparent 48%, black 52%)",
                    maskImage: "radial-gradient(circle at center, transparent 48%, black 52%)",
                    opacity: 0.8
                  }}
                />
              </motion.div>
              
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[130%] w-2 h-2 rounded-full bg-jarvis-accent shadow-[0_0_10px_rgba(230,197,106,0.8)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[130%] w-2 h-2 rounded-full bg-jarvis-accent/80 shadow-[0_0_10px_rgba(230,197,106,0.6)]" />
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[130%] w-2 h-2 rounded-full bg-jarvis-accent/60 shadow-[0_0_10px_rgba(230,197,106,0.5)]" />
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[130%] w-2 h-2 rounded-full bg-jarvis-accent/60 shadow-[0_0_10px_rgba(230,197,106,0.5)]" />
              </motion.div>
              
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`beam-${i}`}
                    className="absolute top-1/2 left-1/2 w-0.5 bg-jarvis-accent/40 rounded-sm origin-bottom"
                    style={{ transform: `rotate(${i * 30}deg) translateY(-90px)` }}
                    animate={{ height: isSpeaking ? [10, 30, 14, 36, 12][i % 5] : [8, 20, 12, 24, 10][i % 5], opacity: isSpeaking ? [0.6, 1, 0.6] : [0.3, 0.7, 0.3] }}
                    transition={{ duration: isSpeaking ? 0.6 : 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                  />
                ))}
              </div>
              
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 rounded-full bg-jarvis-accent/40"
                    style={{ left: `${10 + (i * 4.5) % 90}%`, top: `${20 + (i * 3.7) % 60}%` }}
                    animate={{ opacity: [0, 0.8, 0], y: [-6, 6, -6] }}
                    transition={{ duration: 3 + (i % 5) * 0.4, repeat: Infinity, ease: "easeInOut", delay: (i % 10) * 0.1 }}
                  />
                ))}
              </div>
              
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={`tick-${i}`}
                    className="absolute top-1/2 left-1/2 w-1 bg-jarvis-accent/50 rounded-sm origin-bottom"
                    style={{ transform: `rotate(${i * 15}deg) translateY(-78px)`, height: 6 }}
                    animate={{ scaleY: isSpeaking ? [1, 1.8, 1] : [1, 1.3, 1], opacity: isSpeaking ? [0.5, 1, 0.5] : [0.3, 0.8, 0.3] }}
                    transition={{ duration: isSpeaking ? 0.7 : 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
                  />
                ))}
              </div>
              
              <motion.div
                className="absolute inset-0 rounded-full border border-jarvis-accent/30 pointer-events-none"
                animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ boxShadow: "0 0 30px rgba(230,197,106,0.25)" }}
              />
              
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              >
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 0%, rgba(230,197,106,0.35) 8%, transparent 18%)",
                    WebkitMaskImage: "radial-gradient(circle at center, transparent 45%, black 55%)",
                    maskImage: "radial-gradient(circle at center, transparent 45%, black 55%)"
                  }}
                />
              </motion.div>

              <div className="absolute inset-0 pointer-events-none">
                {[...Array(48)].map((_, i) => (
                  <motion.div
                    key={`micro-${i}`}
                    className="absolute top-1/2 left-1/2 w-0.5 bg-jarvis-accent/30 rounded-sm origin-bottom"
                    style={{ transform: `rotate(${i * 7.5}deg) translateY(-70px)`, height: 3 }}
                    animate={{ opacity: isSpeaking ? [0.4, 0.9, 0.4] : [0.2, 0.6, 0.2] }}
                    transition={{ duration: isSpeaking ? 0.8 : 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.02 }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-jarvis-accent/20" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-jarvis-accent/20" />
              </div>

              {/* Scanline overlay on the core */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-20" />
              
              {/* Initialization Scanning Animation */}
              {isConnecting && (
                <motion.div 
                  initial={{ top: "-100%" }}
                  animate={{ top: "200%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-1 bg-jarvis-accent/50 shadow-[0_0_15px_rgba(230,197,106,0.8)] z-30 pointer-events-none"
                />
              )}
              
              {/* Power Indicator if disconnected */}
              {!isConnected && !isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <Power className="text-white/20" size={24} />
                </div>
              )}
              
              {isConnecting && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-full h-full border-4 border-t-jarvis-accent border-transparent rounded-full animate-spin opacity-40" />
                </div>
              )}
            </motion.button>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6">
              <StatusIndicator label="Listening" active={isListening && !isSpeaking && !isProcessing} />
              <StatusIndicator label="Processing" active={isProcessing} />
              <StatusIndicator label="Speaking" active={isSpeaking} />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-xl md:text-2xl tracking-[0.2em] text-white uppercase gold-accent">
                Jarvis ONEMSU
              </h1>
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">
                Neural Interface Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => setIsListening(!isListening)}
              className={`p-3 rounded-full border transition-all ${
                isListening 
                  ? 'bg-jarvis-accent/20 border-jarvis-accent text-jarvis-accent shadow-[0_0_15px_rgba(230,197,106,0.4)]' 
                  : 'bg-white/5 border-white/10 text-white/40'
              }`}
              title={isListening ? "Mute Microphone" : "Unmute Microphone"}
            >
              {isListening ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button 
              onClick={() => setCurrentView('chat')}
              className="p-3 rounded-full bg-jarvis-accent/10 border border-jarvis-accent/30 text-jarvis-accent hover:bg-jarvis-accent/20 transition-all"
              title="Open Chat"
            >
              <MessageSquare size={20} />
            </button>
            <button 
              onClick={() => {
                disconnect();
                setTimeout(connect, 500);
              }}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
              title="Reconnect System"
            >
              <Activity size={20} />
            </button>
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-all"
              title="Command Palette"
            >
              <CommandIcon size={20} />
            </button>
          </div>
        </div>

        {/* Right Column removed to focus on core talking wave */}
      </motion.div>
    )}

        {currentView === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-4xl h-[70vh] z-10 px-4 md:px-0"
          >
            <ChatSystem 
              messages={messages} 
              onSendMessage={sendTextContext} 
              isProcessing={isProcessing} 
            />
            <button 
              onClick={() => setCurrentView('main')}
              className="mt-4 w-full p-3 glass-panel text-[10px] font-display uppercase tracking-widest text-white/40 hover:text-jarvis-accent transition-colors"
            >
              Return to Core
            </button>
          </motion.div>
        )}

        {currentView === 'workshop' && (
          <motion.div
            key="workshop"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-7xl h-[85vh] z-10 px-4 md:px-0 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
              <OSModuleTab active={osModule === 'memory'} onClick={() => setOsModule('memory')} label="Memory" />
              <OSModuleTab active={osModule === 'graph'} onClick={() => setOsModule('graph')} label="Knowledge Graph" />
              <OSModuleTab active={osModule === 'running'} onClick={() => setOsModule('running')} label="Running Track" />
              <OSModuleTab active={osModule === 'food'} onClick={() => setOsModule('food')} label="Food Intake" />
              <OSModuleTab active={osModule === 'automation'} onClick={() => setOsModule('automation')} label="Automations" />
              <OSModuleTab active={osModule === 'goals'} onClick={() => setOsModule('goals')} label="Objectives" />
              <OSModuleTab active={osModule === 'learning'} onClick={() => setOsModule('learning')} label="Learning" />
              <OSModuleTab active={osModule === 'decisions'} onClick={() => setOsModule('decisions')} label="Decisions" />
              <OSModuleTab active={osModule === 'autopsy'} onClick={() => setOsModule('autopsy')} label="Autopsy" />
              <OSModuleTab active={osModule === 'models'} onClick={() => setOsModule('models')} label="Mental Models" />
              <OSModuleTab active={osModule === 'team'} onClick={() => setOsModule('team')} label="Agent Team" />
              <button 
                onClick={() => setCurrentView('main')}
                className="ml-auto px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-display uppercase tracking-widest text-white/40 hover:text-jarvis-accent transition-colors"
              >
                Exit OS
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {osModule === 'memory' && <motion.div key="memory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><VisualMemoryMap memories={memories} /></motion.div>}
                {osModule === 'graph' && <motion.div key="graph" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><KnowledgeGraph data={graphData} /></motion.div>}
                {osModule === 'running' && <motion.div key="running" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><RunningTracker runs={runs} /></motion.div>}
                {osModule === 'food' && <motion.div key="food" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><FoodTracker logs={foodLogs} /></motion.div>}
                {osModule === 'automation' && <motion.div key="automation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><AutomationBuilder automations={automations} onSave={handleSaveAutomation} /></motion.div>}
                {osModule === 'goals' && <motion.div key="goals" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><GoalTracker goals={goals} /></motion.div>}
                {osModule === 'learning' && <motion.div key="learning" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><LearningCompanion data={learningData} /></motion.div>}
                {osModule === 'decisions' && <motion.div key="decisions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><DecisionSimulator decisions={decisions} /></motion.div>}
                {osModule === 'autopsy' && <motion.div key="autopsy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><PromptAutopsy /></motion.div>}
                {osModule === 'models' && <motion.div key="models" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><MentalModelLibrary /></motion.div>}
                {osModule === 'team' && <motion.div key="team" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><AITeam /></motion.div>}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {currentView === 'standby' && (
          <motion.div
            key="standby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-6 md:space-y-8 z-10 px-4"
          >
            <motion.div
              animate={{ 
                x: [-50, 50, -50],
                scaleX: [1, 1, -1, -1, 1]
              }}
              transition={{ 
                x: { duration: 4, repeat: Infinity, ease: "linear" },
                scaleX: { duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }
              }}
              className="text-jarvis-accent"
            >
              <div className="md:hidden">
                <Dog size={80} strokeWidth={1} />
              </div>
              <div className="hidden md:block">
                <Dog size={120} strokeWidth={1} />
              </div>
            </motion.div>
            <div className="text-jarvis-accent/40 font-display tracking-[0.5em] text-sm uppercase animate-pulse">
              System Standby
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 md:bottom-8 w-full max-w-4xl px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 text-[8px] md:text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu size={12} />
            <span>CALVIN 2026</span>
          </div>
          <span className="hidden md:inline">|</span>
          <span>PROJECT X</span>
        </div>
        <div className="text-center md:text-right">
          JARVIS AI VERSION 1
        </div>
      </motion.div>
    </div>
  );
};

const OSModuleTab = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-xl font-display text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
      active 
        ? 'bg-jarvis-accent/20 text-jarvis-accent border border-jarvis-accent/30 shadow-[0_0_15px_rgba(230,197,106,0.2)]' 
        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const StatusIndicator = ({ label, active }: { label: string; active: boolean }) => (
  <div className="flex flex-col items-center gap-1 md:gap-1.5">
    <div className="relative">
      <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full transition-all duration-300 ${active ? 'bg-jarvis-accent shadow-[0_0_8px_rgba(230,197,106,0.8)]' : 'bg-white/10'}`} />
      {active && (
        <motion.div 
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-jarvis-accent/30"
        />
      )}
    </div>
    <span className={`text-[7px] md:text-[8px] font-mono uppercase tracking-widest transition-colors duration-300 ${active ? 'text-jarvis-accent' : 'text-white/20'}`}>
      {label}
    </span>
  </div>
);

const StatusItem = ({ label, value, active }: { label: string; value?: string; active: boolean }) => (
  <div className="flex items-center justify-between">
    <div className="flex flex-col">
      <span className="text-[9px] md:text-[10px] font-mono text-white/40 uppercase leading-none mb-1">{label}</span>
      {value && <span className="text-[10px] md:text-xs font-display text-jarvis-accent uppercase tracking-wider">{value}</span>}
    </div>
    <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${active ? 'bg-jarvis-accent shadow-[0_0_10px_rgba(230,197,106,0.8)]' : 'bg-white/10'}`} />
  </div>
);
