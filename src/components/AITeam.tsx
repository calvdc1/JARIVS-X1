import React from 'react';
import { motion } from 'motion/react';
import { Users, Search, PenTool, Edit3, CheckCircle, Shield } from 'lucide-react';

export const AITeam: React.FC = () => {
  const agents = [
    { id: 'researcher', name: 'Researcher', icon: Search, color: 'text-jarvis-blue', status: 'Analyzing data...', bio: 'Specializes in deep web search and fact extraction.' },
    { id: 'writer', name: 'Writer', icon: PenTool, color: 'text-emerald-400', status: 'Drafting content...', bio: 'Expert in creative and technical documentation.' },
    { id: 'editor', name: 'Editor', icon: Edit3, color: 'text-amber-400', status: 'Standby', bio: 'Refines tone, clarity, and structural flow.' },
    { id: 'factchecker', name: 'Fact Checker', icon: CheckCircle, color: 'text-purple-400', status: 'Standby', bio: 'Verifies claims against trusted sources.' },
  ];

  return (
    <div className="glass-panel p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <Users className="text-jarvis-blue" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-jarvis-blue">Neural Agent Team</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-jarvis-blue/30 transition-all group"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${agent.color} group-hover:bg-jarvis-blue/10 transition-colors`}>
                <agent.icon size={20} />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-display uppercase tracking-wider text-white">{agent.name}</h3>
                <span className={`text-[9px] font-mono uppercase tracking-widest ${agent.status === 'Standby' ? 'text-white/20' : 'text-jarvis-blue animate-pulse'}`}>
                  {agent.status}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-white/40 leading-relaxed mb-4">{agent.bio}</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex gap-1">
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className={`w-1 h-1 rounded-full ${idx < 2 ? 'bg-jarvis-blue' : 'bg-white/10'}`} />
                ))}
              </div>
              <button className="text-[9px] font-mono uppercase tracking-widest text-white/20 hover:text-jarvis-blue transition-colors">
                Configure Agent
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-jarvis-blue/5 border border-jarvis-blue/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-jarvis-blue" size={16} />
          <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Team Collaboration Mode: Active</span>
        </div>
        <button className="px-4 py-2 rounded-lg bg-jarvis-blue/20 text-jarvis-blue text-[10px] font-display uppercase tracking-widest hover:bg-jarvis-blue/30 transition-all">
          Initiate Group Task
        </button>
      </div>
    </div>
  );
};
