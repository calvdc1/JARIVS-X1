import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Zap, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export const PromptAutopsy: React.FC = () => {
  const [input, setInput] = useState('');
  const [diagnosis, setDiagnosis] = useState<any>(null);

  const handleAutopsy = () => {
    // This would ideally call a tool, but for now we can simulate or provide a template
    setDiagnosis({
      mistakes: [
        "Vague instructions: 'Make it better' is not actionable.",
        "Missing constraints: No mention of word count or tone.",
        "Lack of context: AI doesn't know the target audience."
      ],
      optimized: `Act as a senior technical writer. Rewrite the following text for a non-technical audience, keeping it under 100 words and using a professional yet approachable tone. 

Text: [Your Input Here]`,
      score: 45
    });
  };

  return (
    <div className="glass-panel p-6 h-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-3 mb-8">
        <Zap className="text-jarvis-blue" size={20} />
        <h2 className="font-display text-sm uppercase tracking-widest text-jarvis-blue">Prompt Autopsy Tool</h2>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Paste Bad Output or Prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste here..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-jarvis-blue/50 transition-all resize-none"
          />
          <button
            onClick={handleAutopsy}
            className="w-full py-3 rounded-xl bg-jarvis-blue/10 border border-jarvis-blue/30 text-jarvis-blue font-display text-xs uppercase tracking-widest hover:bg-jarvis-blue/20 transition-all flex items-center justify-center gap-2"
          >
            <Search size={14} />
            Analyze Prompt
          </button>
        </div>

        {diagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-6 border-t border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Diagnosis Report</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-white/40 uppercase">Efficiency Score:</span>
                <span className="text-sm font-display text-red-400">{diagnosis.score}%</span>
              </div>
            </div>

            <div className="space-y-3">
              {diagnosis.mistakes.map((m: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-400/5 border border-red-400/10">
                  <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400/80">{m}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Optimized Version</span>
                <button className="text-jarvis-blue hover:underline text-[10px] font-mono uppercase">Copy</button>
              </div>
              <div className="p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/10 relative group">
                <pre className="text-xs text-emerald-400/80 whitespace-pre-wrap font-mono leading-relaxed">
                  {diagnosis.optimized}
                </pre>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
