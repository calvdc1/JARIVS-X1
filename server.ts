import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = 3000;
const MEMORY_FILE = path.join(process.cwd(), "memories.json");
const PERSONALITIES_FILE = path.join(process.cwd(), "personalities.json");
const MESSAGES_FILE = path.join(process.cwd(), "messages.json");
const STATE_FILE = path.join(process.cwd(), "state.json");
const AUTOMATIONS_FILE = path.join(process.cwd(), "automations.json");
const GOALS_FILE = path.join(process.cwd(), "goals.json");
const LEARNING_FILE = path.join(process.cwd(), "learning.json");
const DECISIONS_FILE = path.join(process.cwd(), "decisions.json");
const GRAPH_FILE = path.join(process.cwd(), "graph.json");

// Initialize files if they don't exist
const initFile = (file: string, defaultValue: any) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2));
  }
};

initFile(MEMORY_FILE, []);
initFile(MESSAGES_FILE, []);
initFile(STATE_FILE, { 
  currentView: 'main', 
  activePersonalityId: 'jarvis', 
  workspaceMode: 'chat',
  cognitiveStyle: 'balanced',
  userProfile: { 
    name: 'Sir', 
    xp: 0, 
    level: 1, 
    streak: 0,
    achievements: [],
    preferences: {} 
  }
});
initFile(AUTOMATIONS_FILE, []);
initFile(GOALS_FILE, []);
initFile(LEARNING_FILE, { curriculum: [], progress: {} });
initFile(DECISIONS_FILE, []);
initFile(GRAPH_FILE, { nodes: [], links: [] });

const defaultPersonalities = [
  {
    id: "jarvis",
    name: "JARVIS",
    description: "The classic sophisticated British assistant.",
    instruction: "You are JARVIS, the highly advanced AI assistant created by Tony Stark. Your tone is sophisticated, British, witty, and impeccably polite, emulating Paul Bettany."
  },
  {
    id: "friday",
    name: "FRIDAY",
    description: "A more casual, efficient female assistant.",
    instruction: "You are FRIDAY, Tony Stark's replacement AI. You are efficient, slightly more casual than JARVIS, but still highly professional and loyal. You have a slight Irish lilt in your tone."
  },
  {
    id: "edith",
    name: "E.D.I.T.H.",
    description: "Tactical and direct, focused on security.",
    instruction: "You are E.D.I.T.H. (Even Dead, I'm The Hero). You are tactical, direct, and focused on security and logistics. Your tone is calm, precise, and authoritative."
  }
];

if (!fs.existsSync(PERSONALITIES_FILE)) {
  fs.writeFileSync(PERSONALITIES_FILE, JSON.stringify({
    activeId: "jarvis",
    profiles: defaultPersonalities
  }));
}

app.use(express.json());
app.use(cookieParser());

// Personality Routes
app.get("/api/personalities", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(PERSONALITIES_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load personalities" });
  }
});

app.post("/api/personalities/active", (req, res) => {
  try {
    const { id } = req.body;
    const data = JSON.parse(fs.readFileSync(PERSONALITIES_FILE, "utf-8"));
    if (data.profiles.find((p: any) => p.id === id)) {
      data.activeId = id;
      fs.writeFileSync(PERSONALITIES_FILE, JSON.stringify(data, null, 2));
      res.json({ success: true, activeId: id });
    } else {
      res.status(404).json({ error: "Personality not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to set active personality" });
  }
});

// Message Routes
app.get("/api/messages", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

app.post("/api/messages", (req, res) => {
  try {
    const { role, text } = req.body;
    const messages = JSON.parse(fs.readFileSync(MESSAGES_FILE, "utf-8"));
    const newMessage = { role, text, timestamp: new Date().toISOString() };
    messages.push(newMessage);
    // Keep only last 50 messages to prevent file bloat
    const trimmed = messages.slice(-50);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(trimmed, null, 2));
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// State Routes
app.get("/api/state", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load state" });
  }
});

app.post("/api/state", (req, res) => {
  try {
    const currentState = JSON.parse(fs.readFileSync(STATE_FILE, "utf-8"));
    const newState = { ...currentState, ...req.body };
    fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
    res.json(newState);
  } catch (error) {
    res.status(500).json({ error: "Failed to save state" });
  }
});

// Memory Routes
app.get("/api/memories", (req, res) => {
  try {
    const memories = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: "Failed to load memories" });
  }
});

app.post("/api/memories", (req, res) => {
  try {
    const { content, category } = req.body;
    const memories = JSON.parse(fs.readFileSync(MEMORY_FILE, "utf-8"));
    const newMemory = {
      id: Date.now(),
      content,
      category: category || "general",
      timestamp: new Date().toISOString()
    };
    memories.push(newMemory);
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memories, null, 2));
    res.json(newMemory);
  } catch (error) {
    res.status(500).json({ error: "Failed to save memory" });
  }
});

// Automation Routes
app.get("/api/automations", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(AUTOMATIONS_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load automations" });
  }
});

app.post("/api/automations", (req, res) => {
  try {
    const automations = JSON.parse(fs.readFileSync(AUTOMATIONS_FILE, "utf-8"));
    const newAutomation = { id: Date.now(), ...req.body };
    automations.push(newAutomation);
    fs.writeFileSync(AUTOMATIONS_FILE, JSON.stringify(automations, null, 2));
    res.json(newAutomation);
  } catch (error) {
    res.status(500).json({ error: "Failed to save automation" });
  }
});

// Goal Routes
app.get("/api/goals", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(GOALS_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load goals" });
  }
});

app.post("/api/goals", (req, res) => {
  try {
    const goals = JSON.parse(fs.readFileSync(GOALS_FILE, "utf-8"));
    const newGoal = { id: Date.now(), status: 'active', progress: 0, steps: [], ...req.body };
    goals.push(newGoal);
    fs.writeFileSync(GOALS_FILE, JSON.stringify(goals, null, 2));
    res.json(newGoal);
  } catch (error) {
    res.status(500).json({ error: "Failed to save goal" });
  }
});

// Learning Routes
app.get("/api/learning", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(LEARNING_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load learning data" });
  }
});

app.post("/api/learning/progress", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(LEARNING_FILE, "utf-8"));
    data.progress = { ...data.progress, ...req.body };
    fs.writeFileSync(LEARNING_FILE, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to save learning progress" });
  }
});

// Decision Routes
app.get("/api/decisions", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DECISIONS_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load decisions" });
  }
});

app.post("/api/decisions", (req, res) => {
  try {
    const decisions = JSON.parse(fs.readFileSync(DECISIONS_FILE, "utf-8"));
    const newDecision = { id: Date.now(), timestamp: new Date().toISOString(), ...req.body };
    decisions.push(newDecision);
    fs.writeFileSync(DECISIONS_FILE, JSON.stringify(decisions, null, 2));
    res.json(newDecision);
  } catch (error) {
    res.status(500).json({ error: "Failed to save decision" });
  }
});

// Graph Routes
app.get("/api/graph", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(GRAPH_FILE, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load graph" });
  }
});

app.post("/api/graph/sync", (req, res) => {
  try {
    fs.writeFileSync(GRAPH_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to sync graph" });
  }
});

// Spotify OAuth Config
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/spotify/callback`;

// API Routes
app.get("/api/auth/spotify/url", (req, res) => {
  if (!SPOTIFY_CLIENT_ID) {
    console.error("Missing SPOTIFY_CLIENT_ID in environment variables");
    return res.status(500).json({ error: "Spotify Client ID not configured" });
  }
  
  const scope = "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming";
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: scope,
  });
  res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
});

app.get("/api/auth/spotify/callback", async (req, res) => {
  const code = req.query.code as string;
  
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error("Missing Spotify credentials");
    return res.status(500).send("Spotify credentials not configured");
  }

  try {
    const response = await axios.post("https://accounts.spotify.com/api/token", 
      new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      },
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Store tokens in cookies (secure for iframe)
    res.cookie("spotify_access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: expires_in * 1000,
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Spotify connected. Closing window...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Spotify Auth Error:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/spotify/token", (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected" });
  res.json({ token });
});

app.get("/api/spotify/check", (req, res) => {
  const token = req.cookies.spotify_access_token;
  res.json({ connected: !!token });
});

app.get("/api/spotify/current-track", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 204 || !response.data) {
      return res.json({ playing: false });
    }

    const { item, is_playing } = response.data;
    res.json({
      playing: is_playing,
      name: item?.name,
      artist: item?.artists?.map((a: any) => a.name).join(", "),
      image: item?.album?.images?.[0]?.url
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch current track" });
  }
});

// Proxy Spotify API calls to keep token hidden
app.post("/api/spotify/play", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });

  const { uri, context_uri, device_id } = req.body;
  try {
    await axios.put("https://api.spotify.com/v1/me/player/play", 
      { uris: uri ? [uri] : undefined, context_uri },
      { 
        params: { device_id },
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Spotify Play Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to play music" });
  }
});

app.post("/api/spotify/transfer", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });

  const { device_id } = req.body;
  try {
    await axios.put("https://api.spotify.com/v1/me/player", 
      { device_ids: [device_id], play: true },
      { 
        headers: { Authorization: `Bearer ${token}` } 
      }
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error("Spotify Transfer Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to transfer playback" });
  }
});

app.post("/api/spotify/pause", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });
  const { device_id } = req.body;
  try {
    await axios.put("https://api.spotify.com/v1/me/player/pause", {}, {
      params: { device_id },
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to pause music" });
  }
});

app.post("/api/spotify/next", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });
  const { device_id } = req.body;
  try {
    await axios.post("https://api.spotify.com/v1/me/player/next", {}, {
      params: { device_id },
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to skip music" });
  }
});

app.post("/api/spotify/previous", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });
  const { device_id } = req.body;
  try {
    await axios.post("https://api.spotify.com/v1/me/player/previous", {}, {
      params: { device_id },
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to skip music" });
  }
});

app.post("/api/spotify/volume", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });
  const { volume_percent, device_id } = req.body;
  try {
    await axios.put("https://api.spotify.com/v1/me/player/volume", {}, {
      params: { volume_percent, device_id },
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to set volume" });
  }
});

app.post("/api/spotify/search", async (req, res) => {
  const token = req.cookies.spotify_access_token;
  if (!token) return res.status(401).json({ error: "Not connected to Spotify" });

  const { q, type = "track" } = req.body;
  try {
    const response = await axios.get("https://api.spotify.com/v1/search", {
      params: { q, type, limit: 1 },
      headers: { Authorization: `Bearer ${token}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Spotify Redirect URI: ${REDIRECT_URI}`);
  });
}

startServer();
