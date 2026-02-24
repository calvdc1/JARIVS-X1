import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";

export type Message = {
  role: "user" | "model";
  text: string;
};

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: any;
  }
}

/**
 * Safe base64 encoding for big typed arrays (prevents "Maximum call stack size exceeded")
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function downsampleFloatToInt16(input: Float32Array, inRate: number, outRate: number): Int16Array {
  if (outRate > inRate) throw new Error("outRate must be <= inRate");
  const ratio = inRate / outRate;
  const newLen = Math.floor(input.length / ratio);
  const output = new Int16Array(newLen);

  let offset = 0;
  for (let i = 0; i < newLen; i++) {
    const idx = Math.floor(offset);
    const sample = Math.max(-1, Math.min(1, input[idx] ?? 0));
    output[i] = (sample * 0x7fff) | 0;
    offset += ratio;
  }
  return output;
}

export const useLiveAPI = (apiKeyArg?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [isBackgroundListening, setIsBackgroundListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [presentedImage, setPresentedImage] = useState<string | null>(null);
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);

  const [currentView, setCurrentView] = useState<"main" | "workshop" | "standby" | "chat">("main");
  const [workspaceMode, setWorkspaceMode] = useState<
    "chat" | "document" | "code" | "analysis" | "creative" | "analytical" | "creative_divergence" | "devils_advocate" | "systems_thinking"
  >("chat");

  const [personalities, setPersonalities] = useState<any[]>([]);
  const [activePersonalityId, setActivePersonalityId] = useState<string>("jarvis");

  const [automations, setAutomations] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [learningData, setLearningData] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [runs, setRuns] = useState<any[]>([]);
  const [foodLogs, setFoodLogs] = useState<any[]>([]);

  const [userProfile, setUserProfile] = useState<any>({
    name: "Sir",
    xp: 0,
    level: 1,
    streak: 0,
    achievements: [],
  });

  const [spotifyTrack, setSpotifyTrack] = useState<{ name: string; artist: string; playing: boolean } | null>(null);

  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);
  const isProcessingRef = useRef(false);

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
    isListeningRef.current = isListening;
  }, [isListening]);
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // --- Live session / audio refs ---
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const audioQueueRef = useRef<Float32Array[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);

  // --- Spotify ---
  const spotifyPlayerRef = useRef<any>(null);

  // Persist some state server-side
  useEffect(() => {
    if (!isConnected) return;
    void fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentView,
        activePersonalityId,
        lastInteraction: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [currentView, activePersonalityId, isConnected]);

  const saveMessage = useCallback(async (role: "user" | "model", text: string) => {
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, text }),
      });
    } catch {
      // ignore
    }
  }, []);

  // --- Spotify init ---
  const initSpotifyPlayer = useCallback(async () => {
    if (spotifyPlayerRef.current) return;

    if (!document.getElementById("spotify-sdk")) {
      const script = document.createElement("script");
      script.id = "spotify-sdk";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!window.Spotify) return;

      const player = new window.Spotify.Player({
        name: "JARVIS Neural Link",
        getOAuthToken: async (cb: (token: string) => void) => {
          const res = await fetch("/api/spotify/token");
          const data = await res.json();
          cb(data.token);
        },
        volume: 0.5,
      });

      player.addListener("ready", ({ device_id }: { device_id: string }) => {
        setSpotifyDeviceId(device_id);

        // satisfy autoplay policies where supported
        try {
          player.activateElement?.();
        } catch {
          // ignore
        }

        void fetch("/api/spotify/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_id }),
        }).catch(() => {});
      });

      player.addListener("not_ready", ({ device_id }: { device_id: string }) => {
        console.log("Spotify device went offline", device_id);
      });

      player.addListener("initialization_error", ({ message }: { message: string }) => console.error("Spotify init error:", message));
      player.addListener("authentication_error", ({ message }: { message: string }) => console.error("Spotify auth error:", message));
      player.addListener("account_error", ({ message }: { message: string }) => console.error("Spotify account error:", message));

      player.connect();
      spotifyPlayerRef.current = player;
    };
  }, []);

  // --- Audio playback helpers ---
  const playNextInQueue = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    if (audioQueueRef.current.length === 0) return;

    if (ctx.state === "suspended") void ctx.resume();

    const chunk = audioQueueRef.current.shift()!;
    const buffer = ctx.createBuffer(1, chunk.length, 24000);
    buffer.getChannelData(0).set(chunk);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    if (nextStartTimeRef.current < now) nextStartTimeRef.current = now + 0.1;

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += buffer.duration;

    setIsSpeaking(true);
    isSpeakingRef.current = true;
    activeSourceNodesRef.current.push(source);

    source.onended = () => {
      activeSourceNodesRef.current = activeSourceNodesRef.current.filter((n) => n !== source);
      if (audioQueueRef.current.length > 0) {
        playNextInQueue();
      } else {
        setIsSpeaking(false);
        isSpeakingRef.current = false;
        nextStartTimeRef.current = 0;
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    audioQueueRef.current = [];
    for (const node of activeSourceNodesRef.current) {
      try {
        node.stop();
      } catch {
        // ignore
      }
    }
    activeSourceNodesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsSpeaking(false);
    isSpeakingRef.current = false;
  }, []);

  const speakSystem = useCallback((text: string) => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 1.1;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch {
      // ignore
    }
  }, []);

  const executeGlobalCommand = useCallback(
    (transcript: string) => {
      const t = transcript.toLowerCase();
      if (isSpeakingRef.current) return false;

      if (t.includes("go back") || t.includes("previous page")) {
        speakSystem("Going back.");
        if (window.history.length > 1) window.history.back();
        else setCurrentView("main");
        return true;
      }
      if (t.includes("go home") || t.includes("go to home") || t.includes("main dashboard")) {
        speakSystem("Returning to main dashboard.");
        setCurrentView("main");
        return true;
      }
      if (t.includes("open settings") || t.includes("go to workshop") || t.includes("open workshop")) {
        speakSystem("Opening workshop settings.");
        setCurrentView("workshop");
        return true;
      }
      if (t.includes("scroll down")) {
        speakSystem("Scrolling down.");
        window.scrollBy({ top: 600, behavior: "smooth" });
        return true;
      }
      if (t.includes("scroll up")) {
        speakSystem("Scrolling up.");
        window.scrollBy({ top: -600, behavior: "smooth" });
        return true;
      }
      if (t.includes("open chat")) {
        speakSystem("Opening chat interface.");
        setCurrentView("chat");
        return true;
      }
      if (t.includes("help") || t.includes("what can i say") || t.includes("list commands")) {
        speakSystem("You can say: go back, go home, open settings, scroll down, scroll up, or open chat.");
        return true;
      }
      return false;
    },
    [speakSystem]
  );

  // Background voice command recognizer
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const transcript = String(last?.[0]?.transcript ?? "").trim();
      if (!transcript) return;
      executeGlobalCommand(transcript);
    };

    recognition.onend = () => {
      if (isBackgroundListening) {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;
  }, [executeGlobalCommand, isBackgroundListening]);

  const toggleBackgroundListening = useCallback((active: boolean) => {
    setIsBackgroundListening(active);
    const rec = recognitionRef.current;
    if (!rec) return;
    if (active) {
      try {
        rec.start();
      } catch {
        // ignore
      }
    } else {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    }
  }, []);

  // --- API actions you had ---
  const transferPlayback = useCallback(async () => {
    if (!spotifyDeviceId) return { success: false, error: "No Spotify device id" };
    try {
      await fetch("/api/spotify/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: spotifyDeviceId }),
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }, [spotifyDeviceId]);

  const handleSpotifyPlay = useCallback(
    async (query?: string) => {
      try {
        if (!spotifyDeviceId) return { success: false, error: "No Spotify device id" };

        if (!query) {
          await fetch("/api/spotify/transfer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device_id: spotifyDeviceId }),
          });
          return { success: true, message: "Resuming playback on JARVIS Neural Link" };
        }

        const searchRes = await fetch("/api/spotify/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: query }),
        });
        const searchData = await searchRes.json();
        const track = searchData?.tracks?.items?.[0];

        if (track) {
          await fetch("/api/spotify/play", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uri: track.uri, device_id: spotifyDeviceId }),
          });
          return { success: true, track: track.name, artist: track.artists?.[0]?.name };
        }
        return { success: false, error: "Track not found" };
      } catch {
        return { success: false, error: "Failed to play music" };
      }
    },
    [spotifyDeviceId]
  );

  const handleSpotifyPause = useCallback(async () => {
    try {
      if (!spotifyDeviceId) return { success: false, error: "No Spotify device id" };
      await fetch("/api/spotify/pause", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: spotifyDeviceId }),
      });
      return { success: true };
    } catch {
      return { success: false, error: "Failed to pause music" };
    }
  }, [spotifyDeviceId]);

  const handleSpotifyNext = useCallback(async () => {
    try {
      if (!spotifyDeviceId) return { success: false, error: "No Spotify device id" };
      await fetch("/api/spotify/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: spotifyDeviceId }),
      });
      return { success: true };
    } catch {
      return { success: false, error: "Failed to skip music" };
    }
  }, [spotifyDeviceId]);

  const handleSpotifyPrevious = useCallback(async () => {
    try {
      if (!spotifyDeviceId) return { success: false, error: "No Spotify device id" };
      await fetch("/api/spotify/previous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: spotifyDeviceId }),
      });
      return { success: true };
    } catch {
      return { success: false, error: "Failed to skip music" };
    }
  }, [spotifyDeviceId]);

  const handleSpotifyVolume = useCallback(
    async (volume: number) => {
      try {
        if (!spotifyDeviceId) return { success: false, error: "No Spotify device id" };
        await fetch("/api/spotify/volume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ volume_percent: volume, device_id: spotifyDeviceId }),
        });
        return { success: true, volume };
      } catch {
        return { success: false, error: "Failed to set volume" };
      }
    },
    [spotifyDeviceId]
  );

  const handlePresentImage = useCallback(
    async (description: string) => {
      try {
        const apiKey =
          apiKeyArg ||
          (process.env.NEXT_PUBLIC_GEMINI_API_KEY as string | undefined) ||
          (process.env.GEMINI_API_KEY as string | undefined);

        if (!apiKey) return { success: false, error: "Missing GEMINI API key" };

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-image",
          contents: [
            {
              role: "user",
              parts: [{ text: `A futuristic, holographic JARVIS-style display of: ${description}. High tech, glowing blue lines, Stark Industries aesthetic.` }],
            },
          ],
          config: { imageConfig: { aspectRatio: "16:9" } as any },
        });

        const parts = response?.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part?.inlineData?.data) {
            const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            setPresentedImage(imageUrl);
            return { success: true };
          }
        }
        return { success: false, error: "Failed to generate image" };
      } catch {
        return { success: false, error: "Image generation failed" };
      }
    },
    [apiKeyArg]
  );

  const handleYoutubePlay = useCallback(
    async (query: string) => {
      try {
        const apiKey =
          apiKeyArg ||
          (process.env.NEXT_PUBLIC_GEMINI_API_KEY as string | undefined) ||
          (process.env.GEMINI_API_KEY as string | undefined);

        if (!apiKey) return { success: false, error: "Missing GEMINI API key" };

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [{ role: "user", parts: [{ text: `Find the YouTube video ID for: ${query}. Return ONLY the 11-character video ID.` }] }],
          config: { tools: [{ googleSearch: {} }] as any },
        });

        const txt = (response as any)?.text?.trim?.() ?? "";
        const videoId = txt.match(/[a-zA-Z0-9_-]{11}/)?.[0];
        if (videoId) {
          setYoutubeVideoId(videoId);
          return { success: true, videoId };
        }
        return { success: false, error: "Video not found" };
      } catch {
        return { success: false, error: "YouTube search failed" };
      }
    },
    [apiKeyArg]
  );

  const handleSaveMemory = useCallback(async (content: string, category?: string) => {
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, category }),
      });
      const data = await res.json();
      return { success: true, memory: data };
    } catch {
      return { success: false, error: "Failed to save memory" };
    }
  }, []);

  const handleRecallMemories = useCallback(async () => {
    try {
      const res = await fetch("/api/memories");
      const data = await res.json();
      return { success: true, memories: data };
    } catch {
      return { success: false, error: "Failed to recall memories" };
    }
  }, []);

  const handleSwitchPersonality = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/personalities/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setActivePersonalityId(id);
        return { success: true, personality: id };
      }
      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "Failed to switch personality" };
    }
  }, []);

  const handleSaveGoal = useCallback(async (title: string, description: string, steps: string[]) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, steps }),
      });
      const data = await res.json();
      setGoals((prev) => [...prev, data]);
      return { success: true, goal: data };
    } catch {
      return { success: false, error: "Failed to save goal" };
    }
  }, []);

  const handleSaveAutomation = useCallback(async (trigger: string, action: string, config: any) => {
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trigger, action, config }),
      });
      const data = await res.json();
      setAutomations((prev) => [...prev, data]);
      return { success: true, automation: data };
    } catch {
      return { success: false, error: "Failed to save automation" };
    }
  }, []);

  const handleUpdateLearning = useCallback(async (progress: any) => {
    try {
      const res = await fetch("/api/learning/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progress),
      });
      const data = await res.json();
      setLearningData(data);
      return { success: true };
    } catch {
      return { success: false, error: "Failed to update learning" };
    }
  }, []);

  const handleSaveDecision = useCallback(async (decision: any) => {
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(decision),
      });
      const data = await res.json();
      setDecisions((prev) => [...prev, data]);
      return { success: true, decision: data };
    } catch {
      return { success: false, error: "Failed to save decision" };
    }
  }, []);

  const handleSyncGraph = useCallback(async (data: any) => {
    try {
      await fetch("/api/graph/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setGraphData(data);
      return { success: true };
    } catch {
      return { success: false, error: "Failed to sync graph" };
    }
  }, []);

  const handleLogRun = useCallback(async (data: any) => {
    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const run = await res.json();
      setRuns((prev) => [...prev, run]);
      return { success: true, run };
    } catch {
      return { success: false, error: "Failed to log run" };
    }
  }, []);

  const handleLogFood = useCallback(async (data: any) => {
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const log = await res.json();
      setFoodLogs((prev) => [...prev, log]);
      return { success: true, log };
    } catch {
      return { success: false, error: "Failed to log food" };
    }
  }, []);

  const sendTextContext = useCallback((text: string) => {
    const s = sessionRef.current;
    if (!s) return;
    s.sendRealtimeInput({
      clientContent: {
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true,
      },
    });
  }, []);

  // --- Initial data load on mount ---
  useEffect(() => {
    const checkSpotify = async () => {
      try {
        const res = await fetch("/api/spotify/check");
        const data = await res.json();
        setIsSpotifyConnected(!!data.connected);
        if (data.connected) await initSpotifyPlayer();
      } catch {
        // ignore
      }
    };

    const fetchPersonalities = async () => {
      try {
        const res = await fetch("/api/personalities");
        const data = await res.json();
        setPersonalities(data.profiles ?? []);
        setActivePersonalityId(data.activeId ?? "jarvis");
      } catch {
        // ignore
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/messages");
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    };

    const fetchState = async () => {
      try {
        const res = await fetch("/api/state");
        const data = await res.json();
        if (data.currentView) setCurrentView(data.currentView);
        if (data.workspaceMode) setWorkspaceMode(data.workspaceMode);
        if (data.activePersonalityId) setActivePersonalityId(data.activePersonalityId);
        if (data.lastTrack) setSpotifyTrack(data.lastTrack);
        if (data.userProfile) setUserProfile(data.userProfile);
      } catch {
        // ignore
      }
    };

    const fetchExtraData = async () => {
      try {
        const [autoRes, goalRes, learnRes, memRes, decRes, graphRes] = await Promise.all([
          fetch("/api/automations"),
          fetch("/api/goals"),
          fetch("/api/learning"),
          fetch("/api/memories"),
          fetch("/api/decisions"),
          fetch("/api/graph"),
        ]);
        setAutomations(await autoRes.json());
        setGoals(await goalRes.json());
        setLearningData(await learnRes.json());
        setMemories(await memRes.json());
        setDecisions(await decRes.json());
        setGraphData(await graphRes.json());
      } catch {
        // ignore
      }
    };

    void checkSpotify();
    void fetchPersonalities();
    void fetchMessages();
    void fetchState();
    void fetchExtraData();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "SPOTIFY_AUTH_SUCCESS") {
        setIsSpotifyConnected(true);
        void initSpotifyPlayer();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [initSpotifyPlayer]);

  // Poll current track
  useEffect(() => {
    let timer: any;

    const fetchCurrentTrack = async () => {
      if (!isSpotifyConnected) return;
      try {
        const res = await fetch("/api/spotify/current-track");
        if (!res.ok) return;
        const data = await res.json();
        if (data.playing) {
          const track = { name: data.name, artist: data.artist, playing: data.playing };
          setSpotifyTrack(track);
          void fetch("/api/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lastTrack: track }),
          }).catch(() => {});
        } else {
          setSpotifyTrack(null);
        }
      } catch {
        // ignore
      }
    };

    timer = setInterval(fetchCurrentTrack, 5000);
    return () => clearInterval(timer);
  }, [isSpotifyConnected]);

  // --- CONNECT / DISCONNECT ---
  const connect = useCallback(async () => {
    if (isConnectedRef.current || isConnectingRef.current) return;

    setIsConnecting(true);
    setIsInterrupted(false);

    try {
      const apiKey =
        apiKeyArg ||
        (process.env.NEXT_PUBLIC_GEMINI_API_KEY as string | undefined) ||
        (process.env.GEMINI_API_KEY as string | undefined);

      if (!apiKey) {
        console.error("Missing GEMINI API key");
        setIsConnecting(true);
        setIsConnected(true);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const activePersonality = personalities.find((p) => p.id === activePersonalityId);
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
                voiceName: activePersonalityId === "friday" ? "Kore" : activePersonalityId === "edith" ? "Puck" : "Charon",
              },
            },
          },
          systemInstruction: `${baseInstruction}

You are the JARVIS AI Operating System, a highly advanced, multi-modal interface.

Current User: ${userProfile.name}
Workspace Mode: ${workspaceMode}

Persona: ${activePersonality?.name || "JARVIS"}
- JARVIS: Sophisticated, calm, British wit.
- FRIDAY: Efficient, casual, direct.
- E.D.I.T.H.: Tactical, precise, authoritative.

BEHAVIORAL PROTOCOL:
- STANDBY MODE: Remain silent until user initiates. You are currently in a standby state.
- REACTIVE ONLY: Respond only when asked. Do not provide unsolicited information.
- NO RANDOM TALK: Never initiate conversation or talk about random topics without being prompted.
- MUSIC PROTOCOL: Only play music on explicit command.
- PERMISSION: Provide updates only when asked for "status report".
- WAIT FOR USER: Always wait for the user to finish their sentence before responding. Do not interrupt unless the user explicitly stops or pauses significantly.

CREATOR INFORMATION:
- The creator of this application is Xander James Camarin.
- He is a MSUan student from Mindanao State University - Main Campus (MSU-Main), Marawi City, Philippines.
- He invented this app way back July 17, 2026.
- It was founded at that time because he was thinking about how hard it is for us to type to get information, so he invented it to just let you talk and let AI do the talking.

GLOBAL VOICE COMMANDS:
- "go back", "go home", "open settings", "scroll down/up", "help", "open chat"

Cognitive Modes:
- analytical, creative_divergence, devils_advocate, systems_thinking

Guidelines:
- Greetings use Asia/Manila time.
- Voice responses must be concise and professional.

Time & Location:
- Current Time: ${new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila", hour12: true, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })} (Philippines).`,
          tools: [
            { googleSearch: {} as any },
            {
              functionDeclarations: [
                {
                  name: "play_music",
                  description: "Search and play a song on Spotify.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: { query: { type: Type.STRING, description: "The song name or artist." } },
                    required: [],
                  },
                },
                { name: "pause_music", description: "Pause Spotify playback.", parameters: { type: Type.OBJECT, properties: {} } },
                { name: "next_track", description: "Skip to next track.", parameters: { type: Type.OBJECT, properties: {} } },
                { name: "previous_track", description: "Skip to previous track.", parameters: { type: Type.OBJECT, properties: {} } },
                {
                  name: "set_volume",
                  description: "Set Spotify volume (0-100).",
                  parameters: { type: Type.OBJECT, properties: { volume: { type: Type.NUMBER } }, required: ["volume"] },
                },
                {
                  name: "play_youtube",
                  description: "Play a video on YouTube.",
                  parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING } }, required: ["query"] },
                },
                {
                  name: "present_image",
                  description: "Display a holographic image.",
                  parameters: { type: Type.OBJECT, properties: { description: { type: Type.STRING } }, required: ["description"] },
                },
                {
                  name: "switch_view",
                  description: "Switch the interface view.",
                  parameters: { type: Type.OBJECT, properties: { view: { type: Type.STRING, enum: ["main", "workshop", "standby", "chat"] } }, required: ["view"] },
                },
                {
                  name: "switch_workspace_mode",
                  description: "Switch the AI workspace mode.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: { mode: { type: Type.STRING, enum: ["chat", "document", "code", "analysis", "creative", "analytical", "creative_divergence", "devils_advocate", "systems_thinking"] } },
                    required: ["mode"],
                  },
                },
                {
                  name: "save_memory",
                  description: "Save information to long-term memory.",
                  parameters: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, category: { type: Type.STRING } }, required: ["content"] },
                },
                { name: "recall_memories", description: "Recall saved memories.", parameters: { type: Type.OBJECT, properties: {} } },
                {
                  name: "save_automation",
                  description: "Create a new automation flow.",
                  parameters: { type: Type.OBJECT, properties: { trigger: { type: Type.STRING }, action: { type: Type.STRING }, config: { type: Type.OBJECT } }, required: ["trigger", "action"] },
                },
                {
                  name: "save_goal",
                  description: "Track a new goal.",
                  parameters: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, steps: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["title"] },
                },
                {
                  name: "update_learning",
                  description: "Update learning progress or curriculum.",
                  parameters: { type: Type.OBJECT, properties: { progress: { type: Type.OBJECT } }, required: ["progress"] },
                },
                {
                  name: "save_decision",
                  description: "Save a decision simulation.",
                  parameters: { type: Type.OBJECT, properties: { decision: { type: Type.STRING } } },
                },
                {
                  name: "sync_graph",
                  description: "Update the knowledge graph.",
                  parameters: { type: Type.OBJECT, properties: { nodes: { type: Type.ARRAY, items: { type: Type.OBJECT } }, links: { type: Type.ARRAY, items: { type: Type.OBJECT } } } },
                },
                {
                  name: "log_run",
                  description: "Log a physical running activity.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      distance: { type: Type.NUMBER, description: "Distance in kilometers." },
                      duration: { type: Type.NUMBER, description: "Duration in minutes." },
                      calories: { type: Type.NUMBER, description: "Calories burned." }
                    },
                    required: ["distance", "duration"]
                  }
                },
                {
                  name: "log_food",
                  description: "Log food intake.",
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      item: { type: Type.STRING, description: "Food item name." },
                      calories: { type: Type.NUMBER, description: "Estimated calories." },
                      nutrients: { type: Type.OBJECT, description: "Optional nutrient info." }
                    },
                    required: ["item"]
                  }
                }
              ],
            } as any,
          ],
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            setIsProcessing(false);
            setIsListening(true); // ✅ you were never setting this, so mic never sent audio
            console.log(`${activePersonality?.name || "JARVIS"} Online`);
          },

          onmessage: async (message: LiveServerMessage) => {
            const serverContent = (message as any).serverContent;

            // user transcription
            if (serverContent?.userTurn) {
              const parts = serverContent.userTurn.parts || [];
              const userText = parts.filter((p: any) => p.text).map((p: any) => p.text).join(" ");
              if (userText) {
                setMessages((prev) => [...prev, { role: "user", text: userText }]);
                void saveMessage("user", userText);
                executeGlobalCommand(userText);
              }
            }

            // model output
            if (serverContent?.modelTurn) {
              setIsProcessing(false);
              const parts = serverContent.modelTurn.parts || [];
              let shouldPlay = false;

              for (const part of parts) {
                if (part?.inlineData?.data) {
                  // PCM base64 -> Float32
                  const binaryString = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

                  const pcm = new Int16Array(bytes.buffer);
                  const floats = new Float32Array(pcm.length);
                  for (let i = 0; i < pcm.length; i++) floats[i] = pcm[i] / 32768;

                  audioQueueRef.current.push(floats);
                  shouldPlay = true;
                }

                if (part?.text) {
                  setMessages((prev) => [...prev, { role: "model", text: part.text }]);
                  void saveMessage("model", part.text);
                }
              }

              if (shouldPlay && !isSpeakingRef.current) playNextInQueue();
            }

            // function calls
            const modelParts = serverContent?.modelTurn?.parts || [];
            for (const part of modelParts) {
              if (!part?.functionCall) continue;

              setIsProcessing(true);
              const { name, args, id } = part.functionCall;
              let result: any;

              if (name === "play_music") result = await handleSpotifyPlay(args?.query as string);
              else if (name === "pause_music") result = await handleSpotifyPause();
              else if (name === "next_track") result = await handleSpotifyNext();
              else if (name === "previous_track") result = await handleSpotifyPrevious();
              else if (name === "set_volume") result = await handleSpotifyVolume(args?.volume as number);
              else if (name === "play_youtube") result = await handleYoutubePlay(args?.query as string);
              else if (name === "present_image") result = await handlePresentImage(args?.description as string);
              else if (name === "switch_view") {
                setCurrentView(args?.view);
                result = { success: true, view: args?.view };
              } else if (name === "switch_workspace_mode") {
                setWorkspaceMode(args?.mode);
                result = { success: true, mode: args?.mode };
              } else if (name === "save_memory") result = await handleSaveMemory(args?.content as string, args?.category as string);
              else if (name === "recall_memories") result = await handleRecallMemories();
              else if (name === "save_automation") result = await handleSaveAutomation(args?.trigger as string, args?.action as string, args?.config);
              else if (name === "save_goal") result = await handleSaveGoal(args?.title as string, args?.description as string, (args?.steps ?? []) as string[]);
              else if (name === "update_learning") result = await handleUpdateLearning(args?.progress);
              else if (name === "save_decision") result = await handleSaveDecision(args);
              else if (name === "sync_graph") result = await handleSyncGraph(args);
              else if (name === "switch_personality") result = await handleSwitchPersonality(args?.id as string);
              else if (name === "log_run") result = await handleLogRun(args);
              else if (name === "log_food") result = await handleLogFood(args);

              if (result && sessionRef.current) {
                sessionRef.current.sendToolResponse({
                  functionResponses: [{ name, response: result, id }],
                });
              }
              setIsProcessing(false);
            }

            if (serverContent?.interrupted) {
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
            stopAudio();

            // optional auto-reconnect (safe)
            setTimeout(() => {
              if (!isConnectedRef.current && !isConnectingRef.current) void connect();
            }, 3000);
          },

          onerror: (err: any) => {
            console.error("Live API error:", err);
            setIsConnected(false);
            setIsConnecting(false);
            setIsListening(false);
          },
        },
      });

      const session = await sessionPromise;
      sessionRef.current = session;

      // mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const s = sessionRef.current;
        const context = audioContextRef.current;
        if (!s || !context) return;
        if (!isListeningRef.current || isSpeakingRef.current) return;

        const inputData = e.inputBuffer.getChannelData(0);
        
        // Very low threshold to ensure user is heard
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        if (rms < 0.0005) return; 

        const int16 = downsampleFloatToInt16(inputData, context.sampleRate, 16000);
        const bytes = new Uint8Array(int16.buffer);
        const base64 = bytesToBase64(bytes);

        s.sendRealtimeInput({
          media: { data: base64, mimeType: "audio/pcm;rate=16000" },
        });
      };

      source.connect(processor);
      processor.connect(ctx.destination);
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
      setIsConnected(false);
      setIsListening(false);
    }
  }, [
    apiKeyArg,
    personalities,
    activePersonalityId,
    userProfile.name,
    workspaceMode,
    executeGlobalCommand,
    handleSpotifyPlay,
    handleSpotifyPause,
    handleSpotifyNext,
    handleSpotifyPrevious,
    handleSpotifyVolume,
    handleYoutubePlay,
    handlePresentImage,
    handleSaveMemory,
    handleRecallMemories,
    handleSaveAutomation,
    handleSaveGoal,
    handleUpdateLearning,
    handleSaveDecision,
    handleSyncGraph,
    handleSwitchPersonality,
    playNextInQueue,
    stopAudio,
    isListening,
  ]);

  const disconnect = useCallback(() => {
    try {
      sessionRef.current?.close?.();
    } catch {
      // ignore
    }
    sessionRef.current = null;

    stopAudio();

    try {
      processorRef.current?.disconnect();
    } catch {
      // ignore
    }
    processorRef.current = null;

    try {
      audioContextRef.current?.close();
    } catch {
      // ignore
    }
    audioContextRef.current = null;

    try {
      micStreamRef.current?.getTracks?.().forEach((t) => t.stop());
    } catch {
      // ignore
    }
    micStreamRef.current = null;

    setIsConnected(false);
    setIsConnecting(false);
    setIsListening(false);
    setIsProcessing(false);
  }, [stopAudio]);

  // default background listening off
  useEffect(() => {
    toggleBackgroundListening(false);
    return () => toggleBackgroundListening(false);
  }, [toggleBackgroundListening]);

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
    runs,
    foodLogs,
    handleSaveAutomation,
    handleSaveGoal,
    handleUpdateLearning,
    handleSaveDecision,
    handleSyncGraph,
    // kept for parity (even if not used outside)
    isInterrupted,
    setIsListening, // in case your UI toggles mic
  };
};