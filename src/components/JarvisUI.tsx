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
  const [osModule, setOsModule] = useState<'overview' | 'memory' | 'automation' | 'goals' | 'learning' | 'team' | 'decisions' | 'graph' | 'autopsy' | 'models' | 'running' | 'food'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (window as any).setJarvisModule = (mod: any) => {
      if (['overview', 'memory', 'automation', 'goals', 'learning', 'team', 'decisions', 'graph', 'autopsy', 'models', 'running', 'food'].includes(mod)) {
        setOsModule(mod);
      }
    };
  }, []);

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
    <div className="min-h-screen bg-jarvis-dark flex flex-col items-center p-2 md:p-8 relative overflow-x-hidden font-sans">
      <Particles />
      
      {/* Workspace HUD Overlay */}
      <WorkspaceHUD mode={workspaceMode} isProcessing={isProcessing} />
      
      {/* Command Palette Overlay */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onCommand={handleCommand}
      />
      
      {/* Scanning Line Effect */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute left-0 right-0 h-1 bg-jarvis-accent/20 animate-scanning" />
      </div>

      {/* Targeting Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center"
          >
            <div className="relative w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] border border-jarvis-accent/10 rounded-full">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-t-2 border-jarvis-accent/40 rounded-full border-dashed"
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-jarvis-accent/10" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-jarvis-accent/10" />
            </div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 border-t border-l border-jarvis-accent/40">
              <span className="absolute top-2 left-2 text-[8px] font-mono text-jarvis-accent">TRK_01</span>
            </div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border-b border-r border-jarvis-accent/40">
              <span className="absolute bottom-2 right-2 text-[8px] font-mono text-jarvis-accent">SYS_LOCK</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compass Widget (Top Right) */}
      <div className="fixed top-24 right-12 z-40 hidden xl:flex flex-col items-center gap-4">
        <div className="relative w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border border-jarvis-accent/20 rounded-full border-dashed"
          />
          <span className="text-[10px] font-display text-white/40">N</span>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-jarvis-accent" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Orientation</span>
          <span className="text-[10px] font-display text-jarvis-accent">342° NW</span>
        </div>
      </div>

      {/* Corner HUD Elements */}
      <div className="fixed top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-jarvis-accent/40 z-50 pointer-events-none">
        <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-jarvis-accent/20" />
      </div>
      <div className="fixed top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-jarvis-accent/40 z-50 pointer-events-none">
        <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-jarvis-accent/20" />
      </div>
      <div className="fixed bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-jarvis-accent/40 z-50 pointer-events-none">
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-jarvis-accent/20" />
      </div>
      <div className="fixed bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-jarvis-accent/40 z-50 pointer-events-none">
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-jarvis-accent/20" />
      </div>

      {/* Side Panels (HUD) */}
      <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-12 z-40">
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em] vertical-text transform rotate-180">Neural Load</span>
          <div className="w-1 h-48 bg-white/5 rounded-full relative overflow-hidden">
            <motion.div 
              animate={{ height: isProcessing ? '85%' : '25%' }}
              className="absolute bottom-0 left-0 right-0 bg-jarvis-accent shadow-[0_0_15px_rgba(255,0,0,0.6)]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border border-jarvis-accent/20 flex items-center justify-center">
            <Database size={12} className="text-jarvis-accent/40" />
          </div>
          <div className="w-8 h-8 rounded-full border border-jarvis-accent/20 flex items-center justify-center">
            <Upload size={12} className="text-jarvis-accent/40" />
          </div>
        </div>
      </div>

      <div className="hidden lg:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-12 z-40">
        <div className="flex flex-col gap-2 items-end">
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em] vertical-text">System Health</span>
          <div className="w-1 h-48 bg-white/5 rounded-full relative overflow-hidden">
            <motion.div 
              animate={{ height: isConnected ? '98%' : '10%' }}
              className="absolute bottom-0 left-0 right-0 bg-jarvis-blue shadow-[0_0_15px_rgba(0,210,255,0.6)]"
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 items-center">
          <div className="w-8 h-8 rounded-full border border-jarvis-blue/20 flex items-center justify-center">
            <Shield size={12} className="text-jarvis-blue/40" />
          </div>
          <div className="w-8 h-8 rounded-full border border-jarvis-blue/20 flex items-center justify-center">
            <Activity size={12} className="text-jarvis-blue/40" />
          </div>
        </div>
      </div>

      {/* Neural Activity Log (Bottom Left) */}
      <div className="hidden md:block fixed bottom-24 left-12 z-40 max-w-[250px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-jarvis-accent animate-pulse" />
            <span className="text-[10px] font-display text-white/40 uppercase tracking-widest">Live Stream</span>
          </div>
          {Array.isArray(logs) && logs.slice(-6).map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[9px] font-mono text-jarvis-accent/80 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis border-l border-jarvis-accent/20 pl-2"
            >
              {`[${new Date().toLocaleTimeString([], { hour12: false })}] ${log}`}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Top Panel */}
      <div className="w-full max-w-6xl z-40 mb-8 mt-4">
        <div className="glass-panel border-jarvis-accent/30 p-4 md:p-6 relative overflow-hidden holographic-glow">
          {/* Scanline effect for header */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(255,0,0,0.05)_50%)] bg-[length:100%_4px] opacity-20" />
          
          <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
            {/* Left Section: System Mode */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl border-2 border-jarvis-accent/40 flex items-center justify-center bg-jarvis-accent/5 relative group overflow-hidden">
                  <Activity size={40} className="text-jarvis-accent animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-t from-jarvis-accent/20 to-transparent" />
                  <div className="absolute inset-0 rounded-2xl border border-jarvis-accent/20 animate-pulse-ring" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-black border border-jarvis-accent/40 flex items-center justify-center">
                  <span className="text-[8px] font-mono text-jarvis-accent">X3</span>
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-3 bg-jarvis-accent" />
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em]">System Protocol</span>
                </div>
                <span className="text-2xl md:text-3xl font-display text-jarvis-accent tracking-widest uppercase red-glow-text animate-glitch">Neural Interface</span>
              </div>
            </div>

            {/* Middle Section: Global Status (Technical) */}
            <div className="hidden lg:flex items-center gap-12 border-x border-white/5 px-12">
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2">Core Load</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-4 rounded-sm ${i < 3 ? 'bg-jarvis-accent' : 'bg-white/5'}`} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2">Sync Rate</span>
                <span className="text-xs font-display text-jarvis-blue blue-glow-text">98.4%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2">Latency</span>
                <span className="text-xs font-display text-jarvis-accent">12ms</span>
              </div>
            </div>

            {/* Right Section: Time & Stats */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center md:items-end">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">User: {userProfile.name}</span>
                  <span className="text-xl md:text-3xl font-display text-jarvis-accent red-glow-text">{phTime}</span>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl border border-jarvis-accent/40 flex items-center justify-center bg-jarvis-accent/5 holographic-glow">
                  <Activity size={20} className="text-jarvis-accent" />
                </div>
              </div>
              
              <div className="flex gap-2 md:gap-3">
                <div className="glass-panel px-3 py-1.5 md:px-4 md:py-2 border-jarvis-accent/20 flex flex-col items-center min-w-[90px] md:min-w-[110px] bg-white/[0.02] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-jarvis-accent/5 to-transparent animate-scanning" />
                  <span className="text-[7px] md:text-[8px] font-mono text-white/30 uppercase tracking-widest">Lvl {userProfile.level}</span>
                  <span className="text-xs md:text-sm font-display text-jarvis-accent uppercase tracking-wider">{userProfile.xp} XP</span>
                </div>
                <div className="glass-panel px-3 py-1.5 md:px-4 md:py-2 border-jarvis-accent/20 flex flex-col items-center min-w-[90px] md:min-w-[110px] bg-white/[0.02] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-jarvis-accent/5 to-transparent animate-scanning" />
                  <span className="text-[7px] md:text-[8px] font-mono text-white/30 uppercase tracking-widest">Streak</span>
                  <span className="text-xs md:text-sm font-display text-jarvis-accent uppercase tracking-wider">{userProfile.streak} Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center relative z-10 perspective-1000">
        <AnimatePresence mode="wait">
          {currentView === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, rotateX: 20, scale: 0.9 }}
              animate={{ opacity: 1, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, rotateX: -20, scale: 0.9 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center w-full"
            >
              {/* Central Core Reactor */}
              <div className="relative mb-16">
                {/* Neural Flow Panel (Left) - Desktop Only */}
                <div className="hidden xl:flex absolute right-[130%] top-1/2 -translate-y-1/2 flex-col gap-4 w-64 z-20">
                  <motion.div 
                    initial={{ opacity: 0, x: -40, rotateY: 30 }}
                    animate={{ opacity: 1, x: 0, rotateY: 15 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="glass-panel p-5 border-jarvis-accent/20 flex flex-col gap-5 holographic-glow"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-jarvis-blue animate-pulse" />
                        <span className="text-[10px] font-display text-white/60 uppercase tracking-widest">Neural Flow</span>
                      </div>
                      <Cpu size={14} className="text-jarvis-blue" />
                    </div>
                    <div className="h-32 flex items-end gap-1.5 px-2">
                      {[...Array(15)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [30, 70, 50, 90, 40][i % 5] + '%' }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08 }}
                          className="flex-1 bg-gradient-to-t from-jarvis-blue/60 to-jarvis-blue/10 rounded-t-sm"
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[9px] font-mono text-white/40">
                        <span className="tracking-widest">SYNC STATUS</span>
                        <span className="text-jarvis-blue font-bold">OPTIMAL</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: ['85%', '98%', '90%'] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="h-full bg-jarvis-blue shadow-[0_0_15px_rgba(0,210,255,0.8)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* System Status Panel (Right) - Desktop Only */}
                <div className="hidden xl:flex absolute left-[130%] top-1/2 -translate-y-1/2 flex-col gap-4 w-64 z-20">
                  <motion.div 
                    initial={{ opacity: 0, x: 40, rotateY: -30 }}
                    animate={{ opacity: 1, x: 0, rotateY: -15 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="glass-panel p-5 border-jarvis-accent/20 flex flex-col gap-5 holographic-glow"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-jarvis-accent animate-pulse" />
                        <span className="text-[10px] font-display text-white/60 uppercase tracking-widest">Diagnostics</span>
                      </div>
                      <Activity size={14} className="text-jarvis-accent" />
                    </div>
                    <div className="flex flex-col gap-3">
                      <StatusItem label="Core Temp" value="34.2°C" active={true} />
                      <StatusItem label="Neural Sync" value="99.1%" active={true} />
                      <StatusItem label="Memory Load" value="12.8 GB" active={true} />
                      <StatusItem label="Uptime" value="18:45:12" active={true} />
                    </div>
                  </motion.div>
                </div>

                {/* Central Core HUD (Matching Image) */}
                <div className="relative w-[85vw] h-[85vw] md:w-[550px] md:h-[550px] flex items-center justify-center">
                  {/* Outer Ring - Segmented Arcs */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-jarvis-accent/10 rounded-full"
                  />
                  
                  {/* Outer Ring 2 - Large Segments */}
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-40">
                      {[...Array(4)].map((_, i) => (
                        <path
                          key={i}
                          d="M 50 2 A 48 48 0 0 1 98 50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-jarvis-accent"
                          transform={`rotate(${i * 90} 50 50)`}
                          strokeDasharray="10, 5"
                        />
                      ))}
                    </svg>
                  </motion.div>

                  {/* Ring 3 - Ticks and Dots */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-12"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                      {[...Array(36)].map((_, i) => (
                        <rect
                          key={i}
                          x="49.5"
                          y="2"
                          width="1"
                          height="4"
                          fill="currentColor"
                          className="text-jarvis-accent"
                          transform={`rotate(${i * 10} 50 50)`}
                        />
                      ))}
                      {[...Array(12)].map((_, i) => (
                        <circle
                          key={i}
                          cx="50"
                          cy="8"
                          r="1.2"
                          fill="currentColor"
                          className="text-jarvis-accent"
                          transform={`rotate(${i * 30} 50 50)`}
                        />
                      ))}
                    </svg>
                  </motion.div>

                  {/* Ring 4 - Segmented Blocks (The thick one in image) */}
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-20"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-50">
                      {[...Array(24)].map((_, i) => (
                        <rect
                          key={i}
                          x="48"
                          y="2"
                          width="4"
                          height="6"
                          fill="currentColor"
                          className="text-jarvis-accent"
                          transform={`rotate(${i * 15} 50 50)`}
                          rx="1"
                        />
                      ))}
                    </svg>
                  </motion.div>

                  {/* Ring 5 - Inner Ticks */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-32"
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
                      {[...Array(72)].map((_, i) => (
                        <rect
                          key={i}
                          x="49.75"
                          y="2"
                          width="0.5"
                          height="3"
                          fill="currentColor"
                          className="text-jarvis-accent"
                          transform={`rotate(${i * 5} 50 50)`}
                        />
                      ))}
                    </svg>
                  </motion.div>

                  {/* Inner Core with Text */}
                  <motion.button
                    onClick={handleToggle}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute inset-40 rounded-full bg-black/40 border-2 border-jarvis-accent/60 flex items-center justify-center overflow-hidden group cursor-pointer shadow-[0_0_40px_rgba(0,210,255,0.3)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-jarvis-accent/10 to-transparent animate-pulse" />
                    
                    {/* Text */}
                    <div className="text-center z-10">
                      <motion.h1 
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="font-display text-xl md:text-3xl tracking-[0.2em] text-jarvis-accent red-glow-text"
                      >
                        J.A.R.V.I.S
                      </motion.h1>
                    </div>

                    {/* Waveform if speaking */}
                    <AnimatePresence>
                      {isSpeaking && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 backdrop-blur-sm z-30"
                        >
                          {[...Array(8)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [10, 40, 20, 50, 15][i % 5] }}
                              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.04 }}
                              className="w-1 bg-jarvis-accent shadow-[0_0_10px_rgba(0,210,255,0.8)] rounded-full"
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Horizontal Glow Line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[800px] h-px bg-gradient-to-r from-transparent via-jarvis-accent to-transparent opacity-40 shadow-[0_0_25px_rgba(0,210,255,0.5)]" />
                  
                  {/* Vertical Glow Line */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[90vw] md:h-[800px] w-px bg-gradient-to-b from-transparent via-jarvis-accent to-transparent opacity-20" />
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-12 mb-12">
                <StatusIndicator label="Listening" active={isListening && !isSpeaking && !isProcessing} />
                <div className="hidden md:block w-px h-6 bg-white/10" />
                <StatusIndicator label="Processing" active={isProcessing} />
                <div className="hidden md:block w-px h-6 bg-white/10" />
                <StatusIndicator label="Speaking" active={isSpeaking} />
              </div>

              {/* Title Section */}
              <div className="text-center mb-12 md:mb-16 relative px-4">
                <motion.div 
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 bg-jarvis-accent/5 blur-3xl rounded-full z-0"
                />
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-8xl font-display tracking-[0.2em] md:tracking-[0.5em] text-white uppercase mb-4 red-glow-text animate-glitch relative z-10"
                >
                  Jarvis X3
                </motion.h1>
                <div className="flex items-center justify-center gap-3 md:gap-6 relative z-10">
                  <div className="w-8 md:w-16 h-px bg-gradient-to-r from-transparent to-jarvis-accent/60" />
                  <p className="text-white/60 font-mono text-[8px] md:text-sm uppercase tracking-[0.4em] md:tracking-[0.8em] animate-pulse">
                    Neural Interface Active
                  </p>
                  <div className="w-8 md:w-16 h-px bg-gradient-to-l from-transparent to-jarvis-accent/60" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-12">
                <ActionButton 
                  icon={<Mic size={24} />} 
                  active={isListening} 
                  onClick={() => setIsListening(!isListening)}
                  color="accent"
                />
                <ActionButton 
                  icon={<MessageSquare size={24} />} 
                  onClick={() => setCurrentView('chat')}
                  color="accent"
                />
                <ActionButton 
                  icon={<Activity size={24} />} 
                  onClick={() => {
                    disconnect();
                    setTimeout(connect, 500);
                  }}
                  color="blue"
                />
                <ActionButton 
                  icon={<CommandIcon size={24} />} 
                  onClick={() => setIsCommandPaletteOpen(true)}
                  color="gray"
                />
              </div>
            </motion.div>
          )}

          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-4xl h-[60vh]"
            >
              <ChatSystem 
                messages={messages} 
                onSendMessage={sendTextContext} 
                isProcessing={isProcessing} 
              />
              <button 
                onClick={() => setCurrentView('main')}
                className="mt-6 w-full p-4 glass-panel border-jarvis-accent/20 text-xs font-display uppercase tracking-widest text-white/40 hover:text-jarvis-accent transition-colors"
              >
                Return to Neural Core
              </button>
            </motion.div>
          )}

          {currentView === 'workshop' && (
            <motion.div
              key="workshop"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full min-h-[80vh] flex flex-col gap-6"
            >
              {/* Module Switcher Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide px-2">
                <OSModuleTab active={osModule === 'overview'} onClick={() => setOsModule('overview')} label="Overview" />
                <OSModuleTab active={osModule === 'memory'} onClick={() => setOsModule('memory')} label="Memory" />
                <OSModuleTab active={osModule === 'automation'} onClick={() => setOsModule('automation')} label="Automation" />
                <OSModuleTab active={osModule === 'goals'} onClick={() => setOsModule('goals')} label="Goals" />
                <OSModuleTab active={osModule === 'learning'} onClick={() => setOsModule('learning')} label="Learning" />
                <OSModuleTab active={osModule === 'team'} onClick={() => setOsModule('team')} label="AI Team" />
                <OSModuleTab active={osModule === 'decisions'} onClick={() => setOsModule('decisions')} label="Decisions" />
                <OSModuleTab active={osModule === 'graph'} onClick={() => setOsModule('graph')} label="Knowledge" />
                <OSModuleTab active={osModule === 'autopsy'} onClick={() => setOsModule('autopsy')} label="Autopsy" />
                <OSModuleTab active={osModule === 'models'} onClick={() => setOsModule('models')} label="Models" />
                <OSModuleTab active={osModule === 'running'} onClick={() => setOsModule('running')} label="Running" />
                <OSModuleTab active={osModule === 'food'} onClick={() => setOsModule('food')} label="Nutrition" />
              </div>

              <div className="flex-1 glass-panel p-4 md:p-6 border-jarvis-accent/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-jarvis-accent/5 to-transparent pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  {osModule === 'overview' && <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full overflow-y-auto"><WorkshopDashboard /></motion.div>}
                  {osModule === 'memory' && <motion.div key="memory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><VisualMemoryMap memories={memories} /></motion.div>}
                  {osModule === 'automation' && <motion.div key="automation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><AutomationBuilder automations={automations} onSave={handleSaveAutomation} /></motion.div>}
                  {osModule === 'goals' && <motion.div key="goals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><GoalTracker goals={goals} onSave={handleSaveGoal} /></motion.div>}
                  {osModule === 'learning' && <motion.div key="learning" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><LearningCompanion data={learningData} onUpdate={handleUpdateLearning} /></motion.div>}
                  {osModule === 'team' && <motion.div key="team" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><AITeam /></motion.div>}
                  {osModule === 'decisions' && <motion.div key="decisions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><DecisionSimulator decisions={decisions} onSave={handleSaveDecision} /></motion.div>}
                  {osModule === 'graph' && <motion.div key="graph" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><KnowledgeGraph data={graphData} onSync={handleSyncGraph} /></motion.div>}
                  {osModule === 'autopsy' && <motion.div key="autopsy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><PromptAutopsy /></motion.div>}
                  {osModule === 'models' && <motion.div key="models" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><MentalModelLibrary /></motion.div>}
                  {osModule === 'running' && <motion.div key="running" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><RunningTracker runs={runs} /></motion.div>}
                  {osModule === 'food' && <motion.div key="food" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full"><FoodTracker logs={foodLogs} /></motion.div>}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setCurrentView('main')}
                className="w-full p-4 glass-panel border-jarvis-accent/20 text-xs font-display uppercase tracking-widest text-white/40 hover:text-jarvis-accent transition-colors"
              >
                Return to Neural Core
              </button>
            </motion.div>
          )}

          {!['main', 'chat', 'workshop'].includes(currentView) && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white/40 font-mono text-sm"
            >
              SYSTEM_ERROR: INVALID_VIEW_STATE [{currentView}]
              <button 
                onClick={() => setCurrentView('main')}
                className="block mt-4 text-jarvis-accent underline"
              >
                REBOOT_INTERFACE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="w-full max-w-5xl mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-white/20 uppercase tracking-[0.4em] z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu size={14} />
            <span>Calvin 2026</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span>Project X</span>
        </div>
        <div className="text-center md:text-right">
          Jarvis AI Version 1
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {presentedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <div className="relative max-w-5xl w-full aspect-video glass-panel border-2 border-jarvis-accent/50 overflow-hidden">
              <img src={presentedImage} alt="Projection" className="w-full h-full object-contain mix-blend-screen" referrerPolicy="no-referrer" />
              <button onClick={() => setPresentedImage(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><X size={24} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton = ({ icon, active, onClick, color = 'accent' }: { icon: React.ReactNode; active?: boolean; onClick: () => void; color?: 'accent' | 'blue' | 'gray' }) => {
  const colorClass = color === 'accent' ? 'text-jarvis-accent border-jarvis-accent/40 bg-jarvis-accent/5' : 
                     color === 'blue' ? 'text-jarvis-blue border-jarvis-blue/40 bg-jarvis-blue/5' : 
                     'text-white/40 border-white/20 bg-white/5';
  const glowClass = color === 'accent' ? 'shadow-[0_0_20px_rgba(0,210,255,0.4)]' : 
                    color === 'blue' ? 'shadow-[0_0_20px_rgba(0,210,255,0.4)]' : 
                    '';

  return (
    <motion.button
      whileHover={{ scale: 1.15, y: -4, rotateX: -10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center transition-all ${colorClass} ${active ? glowClass : ''} glass-panel relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      {icon}
    </motion.button>
  );
};

const OSModuleTab = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-3 rounded-xl font-display text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
      active 
        ? 'bg-jarvis-accent/20 text-jarvis-accent border border-jarvis-accent/30 shadow-[0_0_15px_rgba(0,210,255,0.2)]' 
        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const StatusIndicator = ({ label, active }: { label: string; active: boolean }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative">
      <div className={`w-2 h-2 rounded-full transition-all duration-500 ${active ? 'bg-jarvis-accent shadow-[0_0_12px_rgba(0,210,255,1)]' : 'bg-white/5 border border-white/10'}`} />
      {active && (
        <motion.div 
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-jarvis-accent/40"
        />
      )}
    </div>
    <span className={`text-[8px] font-mono uppercase tracking-[0.2em] transition-colors duration-500 ${active ? 'text-jarvis-accent' : 'text-white/20'}`}>
      {label}
    </span>
  </div>
);

const StatusItem = ({ label, value, active }: { label: string; value?: string; active: boolean }) => (
  <div className="flex items-center justify-between p-2 rounded-lg border border-white/5 bg-white/[0.02]">
    <div className="flex flex-col">
      <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1">{label}</span>
      {value && <span className="text-[10px] font-display text-jarvis-accent uppercase tracking-wider red-glow-text">{value}</span>}
    </div>
    <div className="relative">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-jarvis-accent shadow-[0_0_10px_rgba(0,210,255,0.8)]' : 'bg-white/10'}`} />
      {active && (
        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-[-4px] rounded-full border border-jarvis-accent/20"
        />
      )}
    </div>
  </div>
);
