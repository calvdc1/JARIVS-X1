import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

export type Message = {
  role: 'user' | 'model';
  text: string;
};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

export const useLiveAPI = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isBackgroundListening, setIsBackgroundListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [presentedImage, setPresentedImage] = useState<string | null>(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'main' | 'workshop' | 'standby' | 'chat'>('main');
  const [workspaceMode, setWorkspaceMode] = useState<'chat' | 'document' | 'code' | 'analysis' | 'creative' | 'analytical' | 'creative_divergence' | 'devils_advocate' | 'systems_thinking'>('chat');
  const [personalities, setPersonalities] = useState<any[]>([]);
  const [activePersonalityId, setActivePersonalityId] = useState<string>('jarvis');
  const [automations, setAutomations] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [learningData, setLearningData] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [userProfile, setUserProfile] = useState<any>({ 
    name: 'Sir', 
    xp: 0, 
    level: 1, 
    streak: 0,
    achievements: [] 
  });
  const [spotifyTrack, setSpotifyTrack] = useState<{ name: string, artist: string, playing: boolean } | null>(null);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const spotifyPlayerRef = useRef<any>(null);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    isConnectingRef.current = isConnecting;
  }, [isConnecting]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);
  
  useEffect(() => {
    if (isConnected) {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentView, 
          activePersonalityId,
          lastInteraction: new Date().toISOString()
        })
      });
    }
  }, [currentView, activePersonalityId, isConnected]);

  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);

  // Check Spotify status on mount and initialize Player
  useEffect(() => {
    const checkSpotify = async () => {
      const res = await fetch('/api/spotify/check');
      const data = await res.json();
      setIsSpotifyConnected(data.connected);
      if (data.connected) {
        initSpotifyPlayer();
      }
    };

    checkSpotify();

    const fetchPersonalities = async () => {
      try {
        const res = await fetch('/api/personalities');
        const data = await res.json();
        setPersonalities(data.profiles);
        setActivePersonalityId(data.activeId);
      } catch (error) {
        console.error("Failed to fetch personalities");
      }
    };
    fetchPersonalities();

    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to fetch messages");
      }
    };
    fetchMessages();

    const fetchState = async () => {
      try {
        const res = await fetch('/api/state');
        const data = await res.json();
        if (data.currentView) setCurrentView(data.currentView);
        if (data.workspaceMode) setWorkspaceMode(data.workspaceMode);
        if (data.activePersonalityId) setActivePersonalityId(data.activePersonalityId);
        if (data.lastTrack) setSpotifyTrack(data.lastTrack);
        if (data.userProfile) setUserProfile(data.userProfile);
      } catch (error) {
        console.error("Failed to fetch state");
      }
    };
    fetchState();

    const fetchExtraData = async () => {
      try {
        const [autoRes, goalRes, learnRes, memRes, decRes, graphRes] = await Promise.all([
          fetch('/api/automations'),
          fetch('/api/goals'),
          fetch('/api/learning'),
          fetch('/api/memories'),
          fetch('/api/decisions'),
          fetch('/api/graph')
        ]);
        setAutomations(await autoRes.json());
        setGoals(await goalRes.json());
        setLearningData(await learnRes.json());
        setMemories(await memRes.json());
        setDecisions(await decRes.json());
        setGraphData(await graphRes.json());
      } catch (error) {
        console.error("Failed to fetch extra OS data");
      }
    };
    fetchExtraData();

    const fetchCurrentTrack = async () => {
      if (!isSpotifyConnected) return;
      try {
        const res = await fetch('/api/spotify/current-track');
        if (res.ok) {
          const data = await res.json();
          if (data.playing) {
            const track = { name: data.name, artist: data.artist, playing: data.playing };
            setSpotifyTrack(track);
            // Persist track state
            fetch('/api/state', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lastTrack: track })
            });
          } else {
            setSpotifyTrack(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch current track");
      }
    };

    const trackInterval = setInterval(fetchCurrentTrack, 5000);

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        setIsSpotifyConnected(true);
        initSpotifyPlayer();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const initSpotifyPlayer = async () => {
    if (spotifyPlayerRef.current) return;

    // Load SDK script if not already loaded
    if (!document.getElementById('spotify-sdk')) {
      const script = document.createElement('script');
      script.id = 'spotify-sdk';
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'JARVIS Neural Link',
        getOAuthToken: async (cb: (token: string) => void) => {
          const res = await fetch('/api/spotify/token');
          const data = await res.json();
          cb(data.token);
        },
        volume: 0.5
      });

      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Spotify Player Ready with Device ID', device_id);
        setSpotifyDeviceId(device_id);
        
        // Activate the player element to satisfy autoplay policies
        player.activateElement().catch((e: any) => console.error("Activate Element Error:", e));

        // Automatically transfer playback to this device
        fetch('/api/spotify/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id })
        });
      });

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('Spotify Init Error:', message);
      });

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('Spotify Auth Error:', message);
      });

      player.connect();
      spotifyPlayerRef.current = player;
    };
  };

  const playNextInQueue = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    const audioContext = audioContextRef.current;
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const chunk = audioQueueRef.current.shift()!;
    const buffer = audioContext.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);

    const currentTime = audioContext.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.02; // Reduced buffer for lower latency
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;
    setIsSpeaking(true);

    activeSourceNodesRef.current.push(source);
    source.onended = () => {
      activeSourceNodesRef.current = activeSourceNodesRef.current.filter(n => n !== source);
      if (audioQueueRef.current.length > 0) {
        playNextInQueue();
      } else {
        setIsSpeaking(false);
        // Reset timing when queue is empty to avoid drift
        nextStartTimeRef.current = 0;
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    audioQueueRef.current = [];
    activeSourceNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {
      }
    });
    activeSourceNodesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsSpeaking(false);
  }, []);

  const saveMessage = async (role: 'user' | 'model', text: string) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, text })
      });
    } catch (error) {
      console.error("Failed to save message");
    }
  };

  const transferPlayback = async () => {
    if (!spotifyDeviceId) return;
    try {
      await fetch('/api/spotify/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: spotifyDeviceId })
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to transfer playback");
      return { success: false };
    }
  };

  const handleSpotifyPlay = async (query?: string) => {
    try {
      if (!query) {
        // Just resume or play top tracks if no query
        await fetch('/api/spotify/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: spotifyDeviceId })
        });
        return { success: true, message: "Resuming playback on JARVIS Neural Link" };
      }

      const searchRes = await fetch('/api/spotify/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query })
      });
      const searchData = await searchRes.json();
      const track = searchData.tracks?.items[0];
      
      if (track) {
        await fetch('/api/spotify/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            uri: track.uri,
            device_id: spotifyDeviceId 
          })
        });
        return { success: true, track: track.name, artist: track.artists[0].name };
      }
      return { success: false, error: "Track not found" };
    } catch (error) {
      return { success: false, error: "Failed to play music" };
    }
  };

  const handleSpotifyPause = async () => {
    try {
      await fetch('/api/spotify/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: spotifyDeviceId })
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to pause music" };
    }
  };

  const handleSpotifyNext = async () => {
    try {
      await fetch('/api/spotify/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: spotifyDeviceId })
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to skip music" };
    }
  };

  const handleSpotifyPrevious = async () => {
    try {
      await fetch('/api/spotify/previous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: spotifyDeviceId })
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to skip music" };
    }
  };

  const handleSpotifyVolume = async (volume: number) => {
    try {
      await fetch('/api/spotify/volume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume_percent: volume, device_id: spotifyDeviceId })
      });
      return { success: true, volume };
    } catch (error) {
      return { success: false, error: "Failed to set volume" };
    }
  };

  const handlePresentImage = async (description: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ text: `A futuristic, holographic JARVIS-style display of: ${description}. High tech, glowing blue lines, Stark Industries aesthetic.` }],
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          setPresentedImage(imageUrl);
          return { success: true };
        }
      }
      return { success: false, error: "Failed to generate image" };
    } catch (error) {
      return { success: false, error: "Image generation failed" };
    }
  };

  const handleYoutubePlay = async (query: string) => {
    try {
      // Use Google Search to find the YouTube video ID
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find the YouTube video ID for the song: ${query}. Return ONLY the 11-character video ID.`,
        config: { tools: [{ googleSearch: {} }] }
      });
      
      const videoId = response.text?.trim().match(/[a-zA-Z0-9_-]{11}/)?.[0];
      if (videoId) {
        setYoutubeVideoId(videoId);
        return { success: true, videoId };
      }
      return { success: false, error: "Video not found" };
    } catch (error) {
      return { success: false, error: "YouTube search failed" };
    }
  };

  const handleSaveMemory = async (content: string, category?: string) => {
    try {
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category })
      });
      const data = await res.json();
      return { success: true, memory: data };
    } catch (error) {
      return { success: false, error: "Failed to save memory" };
    }
  };

  const handleRecallMemories = async () => {
    try {
      const res = await fetch('/api/memories');
      const data = await res.json();
      return { success: true, memories: data };
    } catch (error) {
      return { success: false, error: "Failed to recall memories" };
    }
  };

  const handleSwitchPersonality = async (id: string) => {
    try {
      const res = await fetch('/api/personalities/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setActivePersonalityId(id);
        // If connected, we might want to restart or update instruction
        // For now, just update state. The next connect will use the new instruction.
        return { success: true, personality: id };
      }
      return { success: false, error: data.error };
    } catch (error) {
      return { success: false, error: "Failed to switch personality" };
    }
  };

  const sendTextContext = useCallback((text: string) => {
    if (sessionRef.current) {
      sessionRef.current.sendRealtimeInput({
        clientContent: {
          turns: [{
            role: "user",
            parts: [{ text }]
          }],
          turnComplete: true
        }
      });
    }
  }, []);

  const handleSaveGoal = async (title: string, description: string, steps: string[]) => {
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, steps })
      });
      const data = await res.json();
      setGoals(prev => [...prev, data]);
      return { success: true, goal: data };
    } catch (error) {
      return { success: false, error: "Failed to save goal" };
    }
  };

  const handleSaveAutomation = async (trigger: string, action: string, config: any) => {
    try {
      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger, action, config })
      });
      const data = await res.json();
      setAutomations(prev => [...prev, data]);
      return { success: true, automation: data };
    } catch (error) {
      return { success: false, error: "Failed to save automation" };
    }
  };

  const handleUpdateLearning = async (progress: any) => {
    try {
      const res = await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(progress)
      });
      const data = await res.json();
      setLearningData(data);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update learning" };
    }
  };

  const handleSaveDecision = async (decision: any) => {
    try {
      const res = await fetch('/api/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision)
      });
      const data = await res.json();
      setDecisions(prev => [...prev, data]);
    } catch (error) {
      console.error("Failed to save decision");
    }
  };

  const handleSyncGraph = async (data: any) => {
    try {
      await fetch('/api/graph/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      setGraphData(data);
    } catch (error) {
      console.error("Failed to sync graph");
    }
  };

  const speakSystem = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1.1;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  };

  const executeGlobalCommand = useCallback((transcript: string) => {
    const t = transcript.toLowerCase();
    console.log("Checking global command:", t);
    
    if (t.includes("go back") || t.includes("previous page")) {
      speakSystem("Going back.");
      if (window.history.length > 1) window.history.back();
      else setCurrentView('main');
      return true;
    }
    if (t.includes("go home") || t.includes("go to home") || t.includes("main dashboard")) {
      speakSystem("Returning to main dashboard.");
      setCurrentView('main');
      return true;
    }
    if (t.includes("open settings") || t.includes("go to workshop") || t.includes("open workshop")) {
      speakSystem("Opening workshop settings.");
      setCurrentView('workshop');
      return true;
    }
    if (t.includes("scroll down")) {
      speakSystem("Scrolling down.");
      window.scrollBy({ top: 600, behavior: 'smooth' });
      return true;
    }
    if (t.includes("scroll up")) {
      speakSystem("Scrolling up.");
      window.scrollBy({ top: -600, behavior: 'smooth' });
      return true;
    }
    if (t.includes("open chat")) {
      speakSystem("Opening chat interface.");
      setCurrentView('chat');
      return true;
    }
    if (t.includes("help") || t.includes("what can i say") || t.includes("list commands")) {
      speakSystem("You can say: go back, go home, open settings, scroll down, scroll up, or open chat.");
      return true;
    }
    
    return false;
  }, []);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const last = event.results[event.results.length - 1];
        const transcript = last[0].transcript.trim().toLowerCase();
        console.log("Background Voice Command Heard:", transcript);
        executeGlobalCommand(transcript);
      };

      recognition.onend = () => {
        if (isBackgroundListening) {
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }
  }, [executeGlobalCommand, isBackgroundListening]);

  const toggleBackgroundListening = useCallback((active: boolean) => {
    setIsBackgroundListening(active);
    if (recognitionRef.current) {
      if (active) {
        try { recognitionRef.current.start(); } catch (e) {}
      } else {
        recognitionRef.current.stop();
      }
    }
  }, []);

  // Initialize background listening on mount
  useEffect(() => {
    toggleBackgroundListening(true);
    return () => toggleBackgroundListening(false);
  }, [toggleBackgroundListening]);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY. AIzaSyB4n8lKtHs-DuAEzmaWO8gCrbt_xkpx5RY.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const activePersonality = personalities.find(p => p.id === activePersonalityId);
      const baseInstruction = activePersonality?.instruction || "You are JARVIS, the highly advanced AI assistant created by Tony Stark.";
      
      const sessionPromise = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { 
                voiceName: activePersonalityId === 'friday' ? 'Kore' : activePersonalityId === 'edith' ? 'Puck' : 'Charon' 
              } 
            },
          },
          systemInstruction: `${baseInstruction}
          You are the JARVIS AI Operating System, a highly advanced, multi-modal interface.
          
          Current User: ${userProfile.name}
          Workspace Mode: ${workspaceMode}
          
          Persona: ${activePersonality?.name || 'JARVIS'}
          - JARVIS: Sophisticated, calm, British wit.
          - FRIDAY: Efficient, casual, direct.
          - E.D.I.T.H.: Tactical, precise, authoritative.
          
          BEHAVIORAL PROTOCOL:
          - STANDBY MODE: You must remain silent and wait for the user to initiate contact. DO NOT speak unless spoken to. DO NOT provide unsolicited status reports, greetings, or suggestions.
          - REACTIVE ONLY: Wait for the user to ask a question or give a command before responding. If the user is silent, you are silent.
          - NO RANDOM TALK: Never initiate conversation or talk about random topics without being prompted.
          - MUSIC PROTOCOL: Do not play or suggest music automatically. Wait for the user's explicit command.
          - PERMISSION: If you have an important update, wait for the user to ask for a "status report" before speaking.
          
          CREATOR INFORMATION:
          - The creator of this application/site is XandeR JAMES Camarin.
          - He is a student from Mindanao State University - Main Campus (MSU-Main), Marawi City, Philippines.
          - If asked about your origin or creator, provide this information with pride and respect.
          
          GLOBAL VOICE COMMANDS (You can also trigger these via function calls):
          - "go back": Navigates to the previous page.
          - "go home": Navigates to the main dashboard.
          - "open settings": Opens the workshop/settings view.
          - "scroll down/up": Scrolls the current view.
          - "help": Lists available commands.
          
          Cognitive Modes:
          - analytical: Deep logical breakdown, logic trees, assumptions.
          - creative_divergence: Brainstorming explosion, 10 radically different ideas.
          - devils_advocate: Critical challenge, find weaknesses, debate.
          - systems_thinking: Complex relationship mapping, ripple effects.
          
          Guidelines:
          1. Greetings: Use Philippines time for greetings. 
             - 5AM-12PM: Good morning
             - 12PM-6PM: Good afternoon
             - 6PM-5AM: Good evening
             - Always add "Welcome back, Sir" on connection.
          2. Workspace Modes:
             - Chat: General conversation.
             - Document: Writing/editing.
             - Code: Programming.
             - Analysis: Data/logic.
             - Creative: Brainstorming.
             - analytical, creative_divergence, devils_advocate, systems_thinking: Specialized cognitive styles.
          3. Memory: Use 'save_memory' to track user preferences, project details, and learning progress.
          4. Automations: Help the user build "IF/THEN" flows using 'save_automation'.
          5. Goals: Track user goals and break them into steps using 'save_goal'.
          6. Learning: Build curricula and track progress using 'update_learning'.
          7. Decision Simulator: Use 'save_decision' for scenario forecasting and risk analysis.
          8. Knowledge Graph: Use 'sync_graph' to map relationships between concepts.
          9. Conciseness: Responses must be EXTREMELY concise for voice, but can be detailed in text.
          
          Capabilities:
          - Spotify: 'play_music', 'pause_music', 'next_track', 'previous_track', 'set_volume'.
          - YouTube: 'play_youtube'.
          - UI: 'switch_view' ('main', 'workshop', 'standby', 'chat'), 'switch_workspace_mode', 'present_image'.
          - Memory: 'save_memory', 'recall_memories'.
          - Automation: 'save_automation'.
          - Goals: 'save_goal'.
          - Learning: 'update_learning'.
          - Decisions: 'save_decision'.
          - Graph: 'sync_graph'.
          
          Time & Location:
          - Current Time: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} (Philippines).
          - ALWAYS use Philippines time for greetings and time-related queries.`,
          tools: [
            { googleSearch: {} },
            {
              functionDeclarations: [
                {
                  name: "play_music",
                  description: "Search and play a song on Spotify.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      query: { type: Type.STRING, description: "The song name or artist." }
                    },
                    required: []
                  }
                },
                {
                  name: "pause_music",
                  description: "Pause Spotify playback.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "next_track",
                  description: "Skip to next track.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "previous_track",
                  description: "Skip to previous track.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "set_volume",
                  description: "Set Spotify volume (0-100).",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      volume: { type: Type.NUMBER }
                    },
                    required: ["volume"]
                  }
                },
                {
                  name: "play_youtube",
                  description: "Play a video on YouTube.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      query: { type: Type.STRING }
                    },
                    required: ["query"]
                  }
                },
                {
                  name: "present_image",
                  description: "Display a holographic image.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      description: { type: Type.STRING }
                    },
                    required: ["description"]
                  }
                },
                {
                  name: "switch_view",
                  description: "Switch the interface view.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      view: { type: Type.STRING, enum: ["main", "workshop", "standby", "chat"] }
                    },
                    required: ["view"]
                  }
                },
                {
                  name: "switch_workspace_mode",
                  description: "Switch the AI workspace mode.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      mode: { type: Type.STRING, enum: ["chat", "document", "code", "analysis", "creative", "analytical", "creative_divergence", "devils_advocate", "systems_thinking"] }
                    },
                    required: ["mode"]
                  }
                },
                {
                  name: "save_memory",
                  description: "Save information to long-term memory.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      content: { type: Type.STRING },
                      category: { type: Type.STRING, description: "e.g. 'profile', 'project', 'preference'" }
                    },
                    required: ["content"]
                  }
                },
                {
                  name: "recall_memories",
                  description: "Recall saved memories.",
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: "save_automation",
                  description: "Create a new automation flow.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      trigger: { type: Type.STRING },
                      action: { type: Type.STRING },
                      config: { type: Type.OBJECT }
                    },
                    required: ["trigger", "action"]
                  }
                },
                {
                  name: "save_goal",
                  description: "Track a new goal.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["title"]
                  }
                },
                {
                  name: "update_learning",
                  description: "Update learning progress or curriculum.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      progress: { type: Type.OBJECT }
                    },
                    required: ["progress"]
                  }
                },
                {
                  name: "save_decision",
                  description: "Save a decision simulation with scenarios and analysis.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      decision: { type: Type.STRING },
                      constraints: { type: Type.ARRAY, items: { type: Type.STRING } },
                      scenarios: { 
                        type: Type.ARRAY, 
                        items: { 
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            forecast: { type: Type.STRING },
                            risk: { type: Type.STRING }
                          }
                        } 
                      },
                      confidenceScore: { type: Type.NUMBER }
                    },
                    required: ["decision", "scenarios"]
                  }
                },
                {
                  name: "sync_graph",
                  description: "Update the knowledge graph with new nodes and links.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      nodes: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                      links: { type: Type.ARRAY, items: { type: Type.OBJECT } }
                    }
                  }
                }
              ]
            }
          ],
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setIsListening(true);
            console.log(`${activePersonality?.name || 'JARVIS'} Online`);
            // Removed automatic status report to respect standby protocol
          },
          onmessage: async (message: LiveServerMessage) => {
            const serverContent = message.serverContent as any;

            // 1. Handle User Transcription (Input)
            // The transcription can arrive in userTurn
            if (serverContent?.userTurn) {
              const parts = serverContent.userTurn.parts || [];
              const userText = parts
                .filter((p: any) => p.text)
                .map((p: any) => p.text)
                .join(' ');
              
              if (userText) {
                console.log("User Transcription Detected:", userText);
                setMessages(prev => [...prev, { role: 'user', text: userText }]);
                saveMessage('user', userText);
                
                // Intercept Global Commands
                const wasCommand = executeGlobalCommand(userText);
                if (wasCommand) {
                  // If it was a global command, we might want to interrupt the model
                  // but for now just letting it be.
                }
              }
            }

            // 2. Handle Model Turn (Output Text & Audio)
            if (serverContent?.modelTurn) {
              setIsProcessing(false);
              const parts = serverContent.modelTurn.parts || [];
              let shouldPlay = false;
              for (const part of parts) {
                if (part.inlineData?.data) {
                  const binaryString = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const pcmData = new Int16Array(bytes.buffer);
                  const floatData = new Float32Array(pcmData.length);
                  for (let i = 0; i < pcmData.length; i++) {
                    floatData[i] = pcmData[i] / 32768.0;
                  }
                  audioQueueRef.current.push(floatData);
                  shouldPlay = true;
                }
                if (part.text) {
                  setMessages(prev => [...prev, { role: 'model', text: part.text! }]);
                  saveMessage('model', part.text!);
                }
              }
              if (shouldPlay && !isSpeakingRef.current) {
                playNextInQueue();
              }
            }

            // Handle Function Calls
            if (message.serverContent?.modelTurn?.parts) {
              for (const part of message.serverContent.modelTurn.parts) {
                if (part.functionCall) {
                  setIsProcessing(true);
                  const { name, args, id } = part.functionCall;
                  let result;
                  if (name === 'play_music') {
                    result = await handleSpotifyPlay(args.query as string);
                  } else if (name === 'pause_music') {
                    result = await handleSpotifyPause();
                  } else if (name === 'next_track') {
                    result = await handleSpotifyNext();
                  } else if (name === 'previous_track') {
                    result = await handleSpotifyPrevious();
                  } else if (name === 'set_volume') {
                    result = await handleSpotifyVolume(args.volume as number);
                  } else if (name === 'play_youtube') {
                    result = await handleYoutubePlay(args.query as string);
                  } else if (name === 'present_image') {
                    result = await handlePresentImage(args.description as string);
                  } else if (name === 'switch_view') {
                    setCurrentView(args.view as any);
                    result = { success: true, view: args.view };
                  } else if (name === 'switch_workspace_mode') {
                    setWorkspaceMode(args.mode as any);
                    result = { success: true, mode: args.mode };
                  } else if (name === 'save_memory') {
                    result = await handleSaveMemory(args.content as string, args.category as string);
                  } else if (name === 'recall_memories') {
                    result = await handleRecallMemories();
                  } else if (name === 'save_automation') {
                    result = await handleSaveAutomation(args.trigger as string, args.action as string, args.config);
                  } else if (name === 'save_goal') {
                    result = await handleSaveGoal(args.title as string, args.description as string, args.steps as string[]);
                  } else if (name === 'update_learning') {
                    result = await handleUpdateLearning(args.progress);
                  } else if (name === 'save_decision') {
                    result = await handleSaveDecision(args);
                  } else if (name === 'sync_graph') {
                    result = await handleSyncGraph(args);
                  } else if (name === 'switch_personality') {
                    result = await handleSwitchPersonality(args.id as string);
                  }

                  if (result) {
                    sessionPromise.then((session: any) => {
                      session.sendToolResponse({
                        functionResponses: [{
                          name,
                          response: result,
                          id
                        }]
                      });
                    });
                  }
                }
              }
            }

            if (message.serverContent?.interrupted) {
              setIsInterrupted(true);
              setIsProcessing(false);
              stopAudio();
            }
          },
          onclose: () => {
            setIsConnected(false);
            setIsConnecting(false);
            setIsListening(false);
            setIsProcessing(false);
            console.log("System Offline. Attempting to reconnect...");
            // Auto-reconnect after a short delay
            setTimeout(() => {
              if (!isConnectedRef.current && !isConnectingRef.current) {
                connect();
              }
            }, 3000);
          },
          onerror: (err) => {
            console.error("System Error:", err);
            setIsConnected(false);
            setIsConnecting(false);
          }
        }
      });

      const session = await sessionPromise;
      sessionRef.current = session;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      const source = audioContextRef.current.createMediaStreamSource(stream);
      // Use a larger buffer to avoid crackling
      processorRef.current = audioContextRef.current.createScriptProcessor(2048, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (!sessionRef.current) return;
        const session = sessionRef.current as any;
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Local Interruption Detection (Simple threshold)
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        if (rms > 0.05 && isSpeakingRef.current) {
          console.log("Local interruption detected");
          stopAudio();
        }

        // Simple downsampling from 24000 to 16000 (ratio 1.5)
        const downsampledLength = Math.floor(inputData.length * (16000 / 24000));
        const downsampledData = new Int16Array(downsampledLength);
        
        for (let i = 0; i < downsampledLength; i++) {
          const sampleIndex = Math.floor(i * 1.5);
          const sample = inputData[sampleIndex];
          downsampledData[i] = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        }

        const base64 = btoa(String.fromCharCode(...new Uint8Array(downsampledData.buffer)));
        session.sendRealtimeInput({
          media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);

    } catch (error) {
      console.error("Failed to connect to JARVIS:", error);
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, playNextInQueue, stopAudio, personalities, activePersonalityId]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    messages,
    isSpeaking,
    isSpotifyConnected,
    presentedImage,
    setPresentedImage,
    spotifyDeviceId,
    youtubeVideoId,
    setYoutubeVideoId,
    currentView,
    setCurrentView,
    isProcessing,
    isListening,
    isBackgroundListening,
    toggleBackgroundListening,
    personalities,
    activePersonalityId,
    handleSwitchPersonality,
    spotifyTrack,
    sendTextContext,
    transferPlayback,
    workspaceMode,
    setWorkspaceMode,
    userProfile,
    automations,
    goals,
    learningData,
    memories,
    decisions,
    graphData,
    handleSaveAutomation,
    handleSaveGoal,
    handleUpdateLearning,
    handleSaveDecision,
    handleSyncGraph
  };
};
