import React from 'react';
import { Activity, MessageSquare, Cpu } from 'lucide-react';

interface BottomActionsProps {
  activeTab: 'core' | 'stats' | 'chat';
  onTabChange: (tab: 'core' | 'stats' | 'chat') => void;
}

export const BottomActions: React.FC<BottomActionsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-jarvis-bg/80 backdrop-blur-xl p-2 rounded-2xl border border-jarvis-border shadow-2xl">
      <ActionButton 
        icon={<Activity size={20} />} 
        active={activeTab === 'stats'} 
        onClick={() => onTabChange('stats')}
        label="Stats"
      />
      <ActionButton 
        icon={<Cpu size={24} />} 
        active={activeTab === 'core'} 
        onClick={() => onTabChange('core')}
        label="Core"
      />
      <ActionButton 
        icon={<MessageSquare size={20} />} 
        active={activeTab === 'chat'} 
        onClick={() => onTabChange('chat')}
        label="Chat"
      />
    </div>
  );
};

const ActionButton = ({ 
  icon, 
  active, 
  onClick,
  label 
}: { 
  icon: React.ReactNode; 
  active?: boolean; 
  onClick: () => void;
  label: string;
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
      active ? 'text-jarvis-accent bg-jarvis-accent/10 border border-jarvis-accent/20 shadow-[0_0_20px_rgba(0,242,255,0.2)]' : 'text-white/40 hover:text-white'
    }`}
  >
    {icon}
    <span className="text-[8px] uppercase tracking-widest font-mono">{label}</span>
  </button>
);
