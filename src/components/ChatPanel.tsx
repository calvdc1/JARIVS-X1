import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Trash2, Download, User, Bot, Loader2, Mic, MicOff } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { useJarvisStore } from '../store/useStore';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'jarvis';
  timestamp: Date;
}

export const ChatPanel: React.FC = () => {
  const { addMemory, addXp } = useJarvisStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome back, sir. All systems are operational. My neural link is fully synchronized and ready for your commands. How can I assist you today?',
      sender: 'jarvis',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send if transcript is long enough or just set input
        // For better UX, we'll just set the input so the user can review
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    const handleClearEvent = () => clearChat();
    window.addEventListener('jarvis-clear-chat', handleClearEvent);
    return () => {
      window.removeEventListener('jarvis-clear-chat', handleClearEvent);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isTyping) return;

    // Handle manual commands
    if (textToSend.startsWith('/save ')) {
      const content = textToSend.replace('/save ', '');
      addMemory('User Preference', content);
      setInput('');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: `Understood, sir. I have saved that to my memory banks under 'User Preference'.`,
        sender: 'jarvis',
        timestamp: new Date()
      }]);
      return;
    }
    
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = textToSend;
    setInput('');
    setIsTyping(true);
    addXp(10); // Gain XP for every interaction

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: currentInput,
        config: {
          systemInstruction: "You are J.A.R.V.I.S., a highly advanced artificial intelligence. Your primary directive is to assist 'sir' with maximum efficiency and sophisticated reasoning. For complex queries, provide deep, logical analysis while remaining concise. For simple queries, be brief and direct. Do NOT use markdown formatting like bold (**) or italics. Maintain a professional, witty, and loyal persona. Use your advanced NLP capabilities to understand context and nuance perfectly. You have the ability to save important information to your memory banks using the 'save_memory' tool when the user shares preferences, important facts, or context you should remember.",
          tools: [
            { googleSearch: {} },
            {
              functionDeclarations: [
                {
                  name: "save_memory",
                  description: "Saves important information, user preferences, or context to J.A.R.V.I.S. memory banks.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      category: {
                        type: Type.STRING,
                        description: "The category of the information (e.g., 'User Preference', 'Fact', 'Context')."
                      },
                      content: {
                        type: Type.STRING,
                        description: "The actual information to be remembered."
                      }
                    },
                    required: ["category", "content"]
                  }
                }
              ]
            }
          ],
        },
      });

      // Handle function calls
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'save_memory') {
            const { category, content } = call.args as { category: string; content: string };
            addMemory(category, content);
          }
        }
      }

      let cleanText = response.text || (functionCalls ? "Memory banks updated, sir." : "I apologize, sir, but I encountered an error in my processing core. Please try again.");
      // Strip any accidental markdown bold or italics
      cleanText = cleanText.replace(/\*\*|\*/g, '');

      const jarvisMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanText,
        sender: 'jarvis',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, jarvisMsg]);
      
      // Speak the response
      speak(cleanText);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sir, I'm having trouble connecting to the global data network. Please check your connection.",
        sender: 'jarvis',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      speak("Sir, I'm having trouble connecting to the global data network.");
    } finally {
      setIsTyping(false);
    }
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 0.9;
      // Try to find a professional sounding male voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Male'));
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now().toString(),
      text: 'Memory banks cleared. Ready for new input, sir.',
      sender: 'jarvis',
      timestamp: new Date()
    }]);
    window.speechSynthesis.cancel();
  };

  return (
    <div className="w-full md:w-96 h-full flex flex-col glass-panel overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-display uppercase tracking-widest text-jarvis-accent">Conversation</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={clearChat}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors flex items-center gap-1"
          >
            <Trash2 size={12} />
            <span className="text-[8px] uppercase">Clear</span>
          </button>
          <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors flex items-center gap-1">
            <Download size={12} />
            <span className="text-[8px] uppercase">Extract</span>
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-lg text-xs leading-relaxed ${
                msg.sender === 'user' 
                  ? 'bg-jarvis-accent/10 border border-jarvis-accent/20 text-white' 
                  : 'bg-white/5 border border-white/10 text-white/80'
              }`}>
                {msg.text}
              </div>
              <span className="text-[8px] text-white/20 mt-1 uppercase tracking-tighter">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-jarvis-accent/60"
            >
              <Loader2 size={12} className="animate-spin" />
              <span className="text-[10px] uppercase tracking-widest animate-pulse">Processing...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : "Type a message..."}
              disabled={isTyping}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-xs focus:outline-none focus:border-jarvis-accent/50 transition-colors disabled:opacity-50"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-jarvis-accent hover:text-white transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          <button 
            onClick={toggleListening}
            disabled={isTyping}
            className={`p-3 rounded-lg border transition-all ${
              isListening 
                ? 'bg-red-500/20 border-red-500 text-red-500 animate-pulse' 
                : 'bg-white/5 border-white/10 text-white/40 hover:text-jarvis-accent hover:border-jarvis-accent/50'
            }`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
