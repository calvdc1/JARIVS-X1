import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, GraduationCap, Award, BarChart } from 'lucide-react';

interface LearningData {
  curriculum: { id: string, title: string, modules: string[] }[];
  progress: Record<string, number>;
}

interface LearningCompanionProps {
  data: LearningData | null;
}

export const LearningCompanion: React.FC<LearningCompanionProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="glass-panel p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <GraduationCap className="text-pink-400" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-pink-400">Learning Matrix</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.curriculum.map((course, i) => {
          const progress = data.progress[course.id] || 0;
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-400/30 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-pink-400/10 text-pink-400">
                  <BookOpen size={16} />
                </div>
                <div className="flex items-center gap-2">
                  <BarChart size={12} className="text-white/20" />
                  <span className="text-[10px] font-mono text-pink-400 uppercase tracking-widest">{progress}%</span>
                </div>
              </div>

              <h3 className="text-sm font-display uppercase tracking-wider text-white mb-2">{course.title}</h3>
              
              <div className="w-full h-1 bg-white/5 rounded-full mb-4 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.5)]"
                />
              </div>

              <div className="space-y-1">
                {course.modules.slice(0, 3).map((module, idx) => (
                  <div key={idx} className="text-[9px] text-white/40 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    {module}
                  </div>
                ))}
                {course.modules.length > 3 && (
                  <div className="text-[9px] text-pink-400/40 italic">+{course.modules.length - 3} more modules</div>
                )}
              </div>
            </motion.div>
          );
        })}

        {data.curriculum.length === 0 && (
          <div className="col-span-2 py-20 text-center text-white/20 font-mono text-xs uppercase tracking-widest">
            No active learning paths detected
          </div>
        )}
      </div>
    </div>
  );
};
