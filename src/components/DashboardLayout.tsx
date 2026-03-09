import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Cpu, 
  Menu, 
  X, 
  Bell, 
  User,
  LogOut,
  ChevronRight,
  Activity
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  hud?: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
  userProfile: { name: string; level: number; xp: number };
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  hud,
  currentView, 
  onViewChange,
  userProfile 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { id: 'main', label: 'Core Interface', icon: Cpu },
    { id: 'chat', label: 'Neural Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-jarvis-dark text-white flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col border-r border-white/5 bg-black/40 backdrop-blur-xl z-50 relative overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] animate-scanline bg-[linear-gradient(transparent_50%,rgba(255,0,0,0.5)_50%)] bg-[length:100%_4px]" />
        
        <div className={`p-6 flex items-center gap-3 relative z-10 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl metallic-red-gradient flex items-center justify-center shadow-[0_0_20px_rgba(255,0,0,0.3)] shrink-0">
            <Cpu size={24} className="text-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="font-display text-sm tracking-widest uppercase gold-accent">JARVIS X3</h2>
              <p className="text-[8px] font-mono text-white/40 uppercase tracking-tighter">Neural Command Center</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative ${
                currentView === item.id 
                  ? 'bg-jarvis-accent/10 text-jarvis-accent border border-jarvis-accent/20' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className={currentView === item.id ? 'text-jarvis-accent' : 'group-hover:text-white'} />
              {!isSidebarCollapsed && (
                <span className="font-display text-[10px] uppercase tracking-widest truncate">{item.label}</span>
              )}
              {currentView === item.id && !isSidebarCollapsed && (
                <motion.div layoutId="active-nav" className="ml-auto w-1 h-1 rounded-full bg-jarvis-accent shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2"><X size={14} /><span className="text-[8px] font-mono uppercase">Collapse</span></div>}
          </button>

          <div className={`glass-panel p-4 flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center p-2' : ''}`}>
            <div className="w-10 h-10 rounded-full border border-jarvis-accent/30 bg-jarvis-accent/5 flex items-center justify-center shrink-0">
              <User size={20} className="text-jarvis-accent" />
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-display uppercase tracking-widest truncate">{userProfile.name}</p>
                <p className="text-[8px] font-mono text-white/40 uppercase">Level {userProfile.level} • {userProfile.xp} XP</p>
              </div>
            )}
            {!isSidebarCollapsed && (
              <button className="text-white/20 hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] animate-scanline bg-[linear-gradient(transparent_50%,rgba(255,0,0,0.5)_50%)] bg-[length:100%_4px]" />
        <button onClick={() => setIsSidebarOpen(true)} className="text-white/60 relative z-10">
          <Menu size={24} />
        </button>
        <h1 className="font-display text-xs tracking-[0.3em] uppercase gold-accent">JARVIS X3</h1>
        <div className="w-8 h-8 rounded-full border border-jarvis-accent/30 flex items-center justify-center">
          <Activity size={16} className="text-jarvis-accent" />
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-jarvis-dark border-r border-white/10 z-[70] lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg metallic-red-gradient flex items-center justify-center">
                    <Cpu size={18} className="text-white" />
                  </div>
                  <span className="font-display text-xs tracking-widest uppercase">JARVIS</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-white/40">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                      currentView === item.id 
                        ? 'bg-jarvis-accent/10 text-jarvis-accent border border-jarvis-accent/20' 
                        : 'text-white/40'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-display text-xs uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-jarvis-accent/30 bg-jarvis-accent/5 flex items-center justify-center">
                    <User size={24} className="text-jarvis-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-display uppercase tracking-widest">{userProfile.name}</p>
                    <p className="text-[10px] font-mono text-white/40 uppercase">Level {userProfile.level}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden pt-16 lg:pt-0">
        {/* Background Grid - Global */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(var(--color-jarvis-accent) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        {/* Top Header - Desktop Only */}
        <header className="hidden lg:flex h-20 items-center justify-between px-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-white/40">
              <Cpu size={14} />
              <span className="text-[10px] font-mono uppercase tracking-widest text-jarvis-accent">
                {navItems.find(i => i.id === currentView)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-white/40 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-jarvis-accent rounded-full border-2 border-jarvis-dark" />
            </button>
            <div className="h-8 w-px bg-white/5" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-display uppercase tracking-widest leading-none">SYSTEM STATUS</p>
                <p className="text-[8px] font-mono text-emerald-400 uppercase tracking-tighter">OPTIMAL</p>
              </div>
              <div className="w-8 h-8 rounded-lg border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center">
                <Activity size={16} className="text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 relative scrollbar-hide">
          {children}
        </div>

        {/* Global HUD Slot */}
        {hud && (
          <div className="absolute top-24 left-0 right-0 bottom-0 pointer-events-none z-30">
            {hud}
          </div>
        )}

        {/* Floating System Bar - Bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 lg:px-6 z-40 pointer-events-none">
          <div className="glass-panel py-2 lg:py-3 px-4 lg:px-6 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3 lg:gap-6">
              <div className="flex flex-col">
                <span className="text-[7px] lg:text-[8px] font-mono text-white/40 uppercase">CPU</span>
                <div className="w-16 lg:w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['20%', '45%', '30%', '60%', '25%'] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="h-full bg-jarvis-accent" 
                  />
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[7px] lg:text-[8px] font-mono text-white/40 uppercase">MEM</span>
                <div className="w-16 lg:w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ['60%', '65%', '62%', '68%', '61%'] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="h-full bg-amber-500" 
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="text-right">
                <p className="text-[7px] lg:text-[8px] font-mono text-white/40 uppercase">LINK</p>
                <p className="text-[9px] lg:text-[10px] font-display text-jarvis-accent uppercase">ACTIVE</p>
              </div>
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-jarvis-accent/30 flex items-center justify-center animate-pulse">
                <Cpu size={12} className="text-jarvis-accent lg:hidden" />
                <Cpu size={14} className="text-jarvis-accent hidden lg:block" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
