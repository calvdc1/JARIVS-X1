import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.join(process.cwd(), "data");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Helper to get user-specific file path
const getUserFile = (sessionId: string, fileName: string) => {
  const userDir = path.join(DATA_DIR, sessionId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir);
  }
  return path.join(userDir, fileName);
};

// Initialize files if they don't exist
const initUserFile = (sessionId: string, fileName: string, defaultValue: any) => {
  const filePath = getUserFile(sessionId, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
  }
  return filePath;
};

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

const getDefaultState = () => ({ 
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

app.use(express.json());
app.use(cookieParser());

// Session Middleware
app.use((req, res, next) => {
  let sessionId = req.cookies.session_id;
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    res.cookie("session_id", sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    });
  }
  req.sessionId = sessionId;
  
  // Initialize user data if needed
  initUserFile(sessionId, "personalities.json", {
    activeId: "jarvis",
    profiles: defaultPersonalities
  });
  initUserFile(sessionId, "messages.json", []);
  initUserFile(sessionId, "state.json", getDefaultState());
  initUserFile(sessionId, "memories.json", []);
  initUserFile(sessionId, "automations.json", []);
  initUserFile(sessionId, "goals.json", []);
  initUserFile(sessionId, "learning.json", { curriculum: [], progress: {} });
  initUserFile(sessionId, "decisions.json", []);
  initUserFile(sessionId, "graph.json", { nodes: [], links: [] });
  initUserFile(sessionId, "runs.json", []);
  initUserFile(sessionId, "food.json", []);
  
  next();
});

// Running Tracker Routes
app.get("/api/runs", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "runs.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load runs" });
  }
});

app.post("/api/runs", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "runs.json");
    const runs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newRun = { id: Date.now(), timestamp: new Date().toISOString(), ...req.body };
    runs.push(newRun);
    fs.writeFileSync(filePath, JSON.stringify(runs, null, 2));
    res.json(newRun);
  } catch (error) {
    res.status(500).json({ error: "Failed to save run" });
  }
});

// Food Tracker Routes
app.get("/api/food", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "food.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load food logs" });
  }
});

app.post("/api/food", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "food.json");
    const logs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newLog = { id: Date.now(), timestamp: new Date().toISOString(), ...req.body };
    logs.push(newLog);
    fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
    res.json(newLog);
  } catch (error) {
    res.status(500).json({ error: "Failed to save food log" });
  }
});

// Personality Routes
app.get("/api/personalities", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "personalities.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load personalities" });
  }
});

app.post("/api/personalities/active", (req, res) => {
  try {
    const { id } = req.body;
    const filePath = getUserFile(req.sessionId!, "personalities.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (data.profiles.find((p: any) => p.id === id)) {
      data.activeId = id;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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
    const filePath = getUserFile(req.sessionId!, "messages.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load messages" });
  }
});

app.post("/api/messages", (req, res) => {
  try {
    const { role, text } = req.body;
    const filePath = getUserFile(req.sessionId!, "messages.json");
    const messages = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newMessage = { role, text, timestamp: new Date().toISOString() };
    messages.push(newMessage);
    const trimmed = messages.slice(-50);
    fs.writeFileSync(filePath, JSON.stringify(trimmed, null, 2));
    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

app.post("/api/messages/clear", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "messages.json");
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear messages" });
  }
});

// State Routes
app.get("/api/state", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "state.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load state" });
  }
});

app.post("/api/state", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "state.json");
    const currentState = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newState = { ...currentState, ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(newState, null, 2));
    res.json(newState);
  } catch (error) {
    res.status(500).json({ error: "Failed to save state" });
  }
});

// Memory Routes
app.get("/api/memories", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "memories.json");
    const memories = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: "Failed to load memories" });
  }
});

app.post("/api/memories", (req, res) => {
  try {
    const { content, category } = req.body;
    const filePath = getUserFile(req.sessionId!, "memories.json");
    const memories = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newMemory = {
      id: Date.now(),
      content,
      category: category || "general",
      timestamp: new Date().toISOString()
    };
    memories.push(newMemory);
    fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));
    res.json(newMemory);
  } catch (error) {
    res.status(500).json({ error: "Failed to save memory" });
  }
});

// Automation Routes
app.get("/api/automations", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "automations.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load automations" });
  }
});

app.post("/api/automations", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "automations.json");
    const automations = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newAutomation = { id: Date.now(), ...req.body };
    automations.push(newAutomation);
    fs.writeFileSync(filePath, JSON.stringify(automations, null, 2));
    res.json(newAutomation);
  } catch (error) {
    res.status(500).json({ error: "Failed to save automation" });
  }
});

// Goal Routes
app.get("/api/goals", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "goals.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load goals" });
  }
});

app.post("/api/goals", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "goals.json");
    const goals = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newGoal = { id: Date.now(), status: 'active', progress: 0, steps: [], ...req.body };
    goals.push(newGoal);
    fs.writeFileSync(filePath, JSON.stringify(goals, null, 2));
    res.json(newGoal);
  } catch (error) {
    res.status(500).json({ error: "Failed to save goal" });
  }
});

// Learning Routes
app.get("/api/learning", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "learning.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load learning data" });
  }
});

app.post("/api/learning/progress", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "learning.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    data.progress = { ...data.progress, ...req.body };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to save learning progress" });
  }
});

// Decision Routes
app.get("/api/decisions", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "decisions.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load decisions" });
  }
});

app.post("/api/decisions", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "decisions.json");
    const decisions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newDecision = { id: Date.now(), timestamp: new Date().toISOString(), ...req.body };
    decisions.push(newDecision);
    fs.writeFileSync(filePath, JSON.stringify(decisions, null, 2));
    res.json(newDecision);
  } catch (error) {
    res.status(500).json({ error: "Failed to save decision" });
  }
});

// Graph Routes
app.get("/api/graph", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "graph.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load graph" });
  }
});

app.post("/api/graph/sync", (req, res) => {
  try {
    const filePath = getUserFile(req.sessionId!, "graph.json");
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
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
