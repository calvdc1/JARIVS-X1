import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Power, Shield, Activity, Cpu, Terminal, Music, Image as ImageIcon, X, Youtube, Dog, Database, Upload, MessageSquare, Command as CommandIcon, ArrowLeft } from 'lucide-react';
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
import { AIBuilder } from './AIBuilder';
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
    clearMessages,
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
    voiceGender,
    setVoiceGender,
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
  const [osModule, setOsModule] = useState<'memory' | 'automation' | 'goals' | 'learning' | 'team' | 'decisions' | 'graph' | 'autopsy' | 'models' | 'running' | 'food' | 'builder'>('memory');
  const fileInputRef = useRef<HTMLInputElement>(null);


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
    <div className="min-h-screen bg-jarvis-dark flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden">
      <Particles />
      
      <WorkspaceHUD mode={workspaceMode} isProcessing={isProcessing} />

      {/* Top Header - Just Logo/Speaking UI */}
      <div className="fixed top-0 left-0 right-0 h-20 z-30 flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col items-center pointer-events-auto cursor-pointer group"
          onClick={() => setCurrentView('main')}
        >
          <div className="flex items-center gap-4">
            {/* Small Speaking UI in Header */}
            <div className="flex items-center gap-1 h-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`header-wave-${i}`}
                  animate={{ 
                    height: isSpeaking ? [4, 16, 8, 12, 4][i % 5] : [4, 6, 4],
                    opacity: isSpeaking ? [0.4, 1, 0.4] : 0.2
                  }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  className="w-0.5 bg-jarvis-gold rounded-full"
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-jarvis-gold/10 border border-jarvis-gold/20 flex items-center justify-center group-hover:bg-jarvis-gold/20 transition-colors">
                <Cpu className="text-jarvis-gold" size={16} />
              </div>
              <h1 className="font-display text-xl tracking-[0.3em] text-white uppercase">
                JARVIS <span className="text-jarvis-gold">X3</span>
              </h1>
            </div>

            {/* Small Speaking UI in Header (Right) */}
            <div className="flex items-center gap-1 h-4">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`header-wave-r-${i}`}
                  animate={{ 
                    height: isSpeaking ? [4, 12, 16, 8, 4][i % 5] : [4, 6, 4],
                    opacity: isSpeaking ? [0.4, 1, 0.4] : 0.2
                  }}
                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  className="w-0.5 bg-jarvis-gold rounded-full"
                />
              ))}
            </div>
          </div>
          <div className="h-0.5 w-0 group-hover:w-full bg-jarvis-gold/50 transition-all duration-500 mt-1" />
        </motion.div>
      </div>

      {/* Back Button */}
      <AnimatePresence>
        {currentView !== 'main' && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={() => setCurrentView('main')}
            className="fixed top-24 md:top-32 left-4 md:left-6 z-40 p-2 md:p-3 rounded-xl glass-panel border-white/10 text-white/40 hover:text-jarvis-gold hover:border-jarvis-gold/30 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[8px] md:text-[10px] font-display uppercase tracking-widest">Back</span>
          </motion.button>
        )}
      </AnimatePresence>
      
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onCommand={handleCommand}
      />

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--color-jarvis-gold) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-jarvis-gold/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none" />

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
              className="relative max-w-5xl w-full aspect-video glass-panel overflow-hidden border-2 border-jarvis-gold/50 shadow-[0_0_100px_rgba(255,215,0,0.3)] perspective-1000"
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
                   style={{ backgroundImage: 'linear-gradient(var(--color-jarvis-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-jarvis-gold) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,215,0,0.03),rgba(218,165,32,0.01),rgba(255,215,0,0.03))] bg-[length:100%_4px,3px_100%]" />
              
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
                <div className="w-2 h-2 rounded-full bg-jarvis-gold animate-ping" />
                <ImageIcon className="text-jarvis-gold" size={20} />
                <span className="font-display text-xs tracking-widest text-jarvis-gold uppercase">Holographic Projection: 3D Render Active</span>
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
            <div className="relative max-w-5xl w-full aspect-video glass-panel overflow-hidden border-2 border-jarvis-gold/50 shadow-[0_0_100px_rgba(255,215,0,0.2)]">
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
                <Youtube className="text-jarvis-gold" size={20} />
                <span className="font-display text-xs tracking-widest text-jarvis-gold uppercase">YouTube Neural Stream Active</span>
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
            className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 z-10 px-4 md:px-0 justify-items-center relative"
          >
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-8 opacity-70">
                {[0, 1, 2].map((ring) => (
                  <motion.div
                    key={`hud-ring-${ring}`}
                    animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
                    transition={{ duration: 16 + ring * 5, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 md:w-20 md:h-20 rounded-full border border-jarvis-gold/35 relative"
                  >
                    <div className="absolute inset-2 rounded-full border border-dashed border-jarvis-gold/30" />
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-jarvis-gold/30" />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-jarvis-gold/20" />
                  </motion.div>
                ))}
              </div>

              <div className="absolute top-[35%] left-2 md:left-10 right-2 md:right-10">
                {["left", "right"].map((side) => (
                  <div key={side} className={`relative h-20 md:h-28 ${side === "left" ? "" : "scale-x-[-1]"}`}>
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-jarvis-gold/40 to-transparent" />
                    <div className="absolute left-[10%] right-[10%] top-[60%] h-px bg-gradient-to-r from-transparent via-jarvis-gold/25 to-transparent" />
                    <div className="absolute left-[18%] top-[38%] w-20 md:w-40 h-px bg-jarvis-gold/30" />
                    <div className="absolute right-[18%] top-[38%] w-20 md:w-40 h-px bg-jarvis-gold/30" />
                  </div>
                ))}
              </div>
            </div>

        {/* Center Column: Core Reactor */}
        <div className="md:col-span-6 md:col-start-4 flex flex-col items-center justify-center space-y-6 md:space-y-8 order-1 md:order-2 py-4 md:py-0">
          <div className="relative group scale-75 md:scale-100">
            {/* Voice Readiness Indicator */}
            <AnimatePresence>
              {isListening && !isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-[-60px] rounded-full border-2 border-jarvis-gold/20 blur-md pointer-events-none"
                />
              )}
            </AnimatePresence>
 
            {/* Outer Decorative Rings */}
            <div className="absolute inset-[-40px] rounded-full border border-jarvis-gold/5 pointer-events-none" />
            <div className="absolute inset-[-20px] rounded-full border border-jarvis-gold/10 border-dashed pointer-events-none" />
 
            {/* Main Rings */}
            <motion.div 
              animate={{ 
                scale: isSpeaking ? [1, 1.05, 1] : isConnected ? [1, 1.02, 1] : 1
              }}
              transition={{ 
                scale: { duration: isSpeaking ? 0.5 : 3, repeat: Infinity, ease: "easeInOut" }
              }}
              className="w-48 h-48 md:w-64 md:h-64 rounded-full border-2 border-dashed border-jarvis-gold/20 flex items-center justify-center"
            >
              <div className="w-36 h-36 md:w-48 md:h-48 rounded-full border border-jarvis-gold/40 flex items-center justify-center">
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
                          className="absolute inset-0 rounded-full border border-jarvis-gold/30"
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
                  ? "0 0 80px rgba(255, 215, 0, 0.8)" 
                  : isConnected 
                    ? "0 0 60px rgba(255, 215, 0, 0.4)" 
                    : "0 0 20px rgba(255, 255, 255, 0.1)"
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-40 md:h-40 rounded-full bg-black border-2 border-jarvis-gold/30 flex items-center justify-center group cursor-pointer overflow-hidden z-20 shadow-[inset_0_0_20px_rgba(255,215,0,0.2)]"
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
                      className="absolute inset-0 bg-jarvis-gold/20 rounded-full blur-xl pointer-events-none"
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
                              className="w-1.5 bg-jarvis-gold rounded-full shadow-[0_0_10px_rgba(255,215,0,0.8)]"
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
                    background: "conic-gradient(from 0deg, rgba(255,215,0,0.22) 0%, transparent 60%, rgba(255,215,0,0.22) 100%)",
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[130%] w-2 h-2 rounded-full bg-jarvis-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[130%] w-2 h-2 rounded-full bg-jarvis-gold/80 shadow-[0_0_10px_rgba(255,215,0,0.6)]" />
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-[130%] w-2 h-2 rounded-full bg-jarvis-gold/60 shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                <div className="absolute top-1/2 left-1/2 -translate-y-1/2 translate-x-[130%] w-2 h-2 rounded-full bg-jarvis-gold/60 shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              </motion.div>
              
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={`beam-${i}`}
                    className="absolute top-1/2 left-1/2 w-0.5 bg-jarvis-gold/40 rounded-sm origin-bottom"
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
                    className="absolute w-1 h-1 rounded-full bg-jarvis-gold/40"
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
                    className="absolute top-1/2 left-1/2 w-1 bg-jarvis-gold/50 rounded-sm origin-bottom"
                    style={{ transform: `rotate(${i * 15}deg) translateY(-78px)`, height: 6 }}
                    animate={{ scaleY: isSpeaking ? [1, 1.8, 1] : [1, 1.3, 1], opacity: isSpeaking ? [0.5, 1, 0.5] : [0.3, 0.8, 0.3] }}
                    transition={{ duration: isSpeaking ? 0.7 : 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.03 }}
                  />
                ))}
              </div>
              
              <motion.div
                className="absolute inset-0 rounded-full border border-jarvis-gold/30 pointer-events-none"
                animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ boxShadow: "0 0 30px rgba(255,215,0,0.25)" }}
              />
              
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              >
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "conic-gradient(from 0deg, transparent 0%, rgba(255,215,0,0.35) 8%, transparent 18%)",
                    WebkitMaskImage: "radial-gradient(circle at center, transparent 45%, black 55%)",
                    maskImage: "radial-gradient(circle at center, transparent 45%, black 55%)"
                  }}
                />
              </motion.div>
 
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(48)].map((_, i) => (
                  <motion.div
                    key={`micro-${i}`}
                    className="absolute top-1/2 left-1/2 w-0.5 bg-jarvis-gold/30 rounded-sm origin-bottom"
                    style={{ transform: `rotate(${i * 7.5}deg) translateY(-70px)`, height: 3 }}
                    animate={{ opacity: isSpeaking ? [0.4, 0.9, 0.4] : [0.2, 0.6, 0.2] }}
                    transition={{ duration: isSpeaking ? 0.8 : 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.02 }}
                  />
                ))}
              </div>
 
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-jarvis-gold/20" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-jarvis-gold/20" />
              </div>

              {/* Scanline overlay on the core */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-20" />
              
              {/* Initialization Scanning Animation */}
              {isConnecting && (
                <motion.div 
                  initial={{ top: "-100%" }}
                  animate={{ top: "200%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-1 bg-jarvis-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.8)] z-30 pointer-events-none"
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
                   <div className="w-full h-full border-4 border-t-jarvis-gold border-transparent rounded-full animate-spin opacity-40" />
                </div>
              )}
            </motion.button>
          </div>

          <div className="text-center">
            <div className="space-y-2">
              <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest">
                Neural Interface Active
              </p>
            </div>
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
              onClearChat={clearMessages}
              isProcessing={isProcessing} 
            />
            <button 
              onClick={() => setCurrentView('main')}
              className="mt-4 w-full p-3 glass-panel text-[10px] font-display uppercase tracking-widest text-white/40 hover:text-jarvis-gold transition-colors"
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
              <OSModuleTab active={osModule === 'builder'} onClick={() => setOsModule('builder')} label="Neural Builder" />
              <OSModuleTab active={osModule === 'automation'} onClick={() => setOsModule('automation')} label="Automations" />
              <OSModuleTab active={osModule === 'goals'} onClick={() => setOsModule('goals')} label="Objectives" />
              <OSModuleTab active={osModule === 'learning'} onClick={() => setOsModule('learning')} label="Learning" />
              <OSModuleTab active={osModule === 'decisions'} onClick={() => setOsModule('decisions')} label="Decisions" />
              <OSModuleTab active={osModule === 'autopsy'} onClick={() => setOsModule('autopsy')} label="Autopsy" />
              <OSModuleTab active={osModule === 'models'} onClick={() => setOsModule('models')} label="Mental Models" />
              <OSModuleTab active={osModule === 'team'} onClick={() => setOsModule('team')} label="Agent Team" />
              <button 
                onClick={() => setCurrentView('main')}
                className="ml-auto px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-display uppercase tracking-widest text-white/40 hover:text-jarvis-gold transition-colors"
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
                {osModule === 'builder' && <motion.div key="builder" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full"><AIBuilder /></motion.div>}
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
              className="text-jarvis-gold"
            >
              <div className="md:hidden">
                <Dog size={80} strokeWidth={1} />
              </div>
              <div className="hidden md:block">
                <Dog size={120} strokeWidth={1} />
              </div>
            </motion.div>
            <div className="text-jarvis-gold/40 font-display tracking-[0.5em] text-sm uppercase animate-pulse">
              System Standby
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Lower Header Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] md:w-[min(96vw,1200px)]"
      >
        <div className="glass-panel border-white/10 px-3 md:px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            <LowerHeaderButton icon={currentView === 'main' ? Cpu : ArrowLeft} label="Core" active={currentView === 'main'} onClick={() => setCurrentView('main')} />
            <LowerHeaderButton icon={MessageSquare} label="Chat" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
            <LowerHeaderButton icon={Terminal} label="Workshop" active={currentView === 'workshop'} onClick={() => setCurrentView('workshop')} />
            <LowerHeaderButton icon={isListening ? Mic : MicOff} label={isListening ? 'Mute' : 'Unmute'} active={isListening} onClick={() => setIsListening(!isListening)} />
            <LowerHeaderButton icon={Activity} label="Sync" active={false} onClick={() => { disconnect(); setTimeout(connect, 500); }} />
            <LowerHeaderButton icon={CommandIcon} label="Commands" active={isCommandPaletteOpen} onClick={() => setIsCommandPaletteOpen(true)} />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-1 border-t border-white/5">
            <LowerHeaderButton icon={Database} label="Memory" active={osModule === 'memory' && currentView === 'workshop'} onClick={() => { setCurrentView('workshop'); setOsModule('memory'); }} />
            <LowerHeaderButton icon={Activity} label="Graph" active={osModule === 'graph' && currentView === 'workshop'} onClick={() => { setCurrentView('workshop'); setOsModule('graph'); }} />
            <LowerHeaderButton icon={Terminal} label="Builder" active={osModule === 'builder' && currentView === 'workshop'} onClick={() => { setCurrentView('workshop'); setOsModule('builder'); }} />
            <LowerHeaderButton icon={Music} label="Running" active={osModule === 'running' && currentView === 'workshop'} onClick={() => { setCurrentView('workshop'); setOsModule('running'); }} />
            <LowerHeaderButton icon={Upload} label="Food" active={osModule === 'food' && currentView === 'workshop'} onClick={() => { setCurrentView('workshop'); setOsModule('food'); }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const LowerHeaderButton = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`shrink-0 px-3 py-2 rounded-xl border flex items-center gap-2 text-[10px] font-display uppercase tracking-widest transition-all ${
      active
        ? 'bg-jarvis-gold/15 border-jarvis-gold/40 text-jarvis-gold'
        : 'bg-white/5 border-white/10 text-white/55 hover:text-white hover:border-white/20'
    }`}
  >
    <Icon size={14} />
    <span>{label}</span>
  </button>
);

const OSModuleTab = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-xl font-display text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
      active 
        ? 'bg-jarvis-gold/20 text-jarvis-gold border border-jarvis-gold/30 shadow-[0_0_15px_rgba(255,215,0,0.2)]' 
        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const StatusItem = ({ label, value, active }: { label: string; value?: string; active: boolean }) => (
  <div className="flex items-center justify-between">
    <div className="flex flex-col">
      <span className="text-[9px] md:text-[10px] font-mono text-white/40 uppercase leading-none mb-1">{label}</span>
      {value && <span className="text-[10px] md:text-xs font-display text-jarvis-gold uppercase tracking-wider">{value}</span>}
    </div>
    <div className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${active ? 'bg-jarvis-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]' : 'bg-white/10'}`} />
  </div>
);
