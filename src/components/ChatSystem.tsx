import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Terminal, Maximize2, Minimize2, ImagePlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatSystemProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onAttachImage?: (file: File, prompt: string) => void;
  isProcessing: boolean;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ messages, onSendMessage, onAttachImage, isProcessing }) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onAttachImage || isProcessing) return;
    const prompt = input.trim() || 'Analyze this image in detail and give actionable insights.';
    onAttachImage(file, prompt);
    setInput('');
    e.target.value = '';
  };

  return (
    <motion.div
      layout
      className={`glass-panel flex flex-col overflow-hidden transition-all duration-500 ${isExpanded ? 'fixed inset-4 z-50' : 'w-full h-full'}`}
    >
      <div className="p-3 border-b border-jarvis-blue/20 flex items-center justify-between bg-jarvis-blue/5">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-jarvis-blue" />
          <span className="text-[10px] font-display uppercase tracking-widest text-jarvis-blue">Neural Link Console</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-white/10 rounded transition-colors text-white/40 hover:text-jarvis-blue"
        >
          {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'border-jarvis-blue/30 bg-jarvis-blue/10' : 'border-white/10 bg-white/5'}`}>
                  {msg.role === 'user' ? <User size={14} className="text-jarvis-blue" /> : <Bot size={14} className="text-white/60" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-jarvis-blue/10 border border-jarvis-blue/20 text-white'
                    : 'bg-white/5 border border-white/10 text-white/80'
                }`}>
                  <div className="markdown-body prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                <Bot size={14} className="text-white/40 animate-pulse" />
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full bg-jarvis-blue"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-jarvis-blue/20 bg-black/20">
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 border border-white/10 rounded-lg text-jarvis-blue hover:bg-jarvis-blue/10 transition-colors"
            title="Attach photo"
          >
            <ImagePlus size={18} />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAttach}
          />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything, build AI workflows, generate images/videos..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-jarvis-blue/50 transition-colors placeholder:text-white/20"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="absolute right-2 p-2 text-jarvis-blue hover:bg-jarvis-blue/10 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
