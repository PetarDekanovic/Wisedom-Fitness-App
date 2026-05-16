import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

// Helper to get key from multiple possible names
const getGeminiKey = () => {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.VITE_GEMINI_API_KEY) {
    console.log("INFO: Using VITE_GEMINI_API_KEY (server-side). Recommendation: Use GEMINI_API_KEY.");
    return process.env.VITE_GEMINI_API_KEY;
  }
  console.warn("CRITICAL: No Gemini API Key found in environment variables (tried GEMINI_API_KEY and VITE_GEMINI_API_KEY).");
  return "";
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(getGeminiKey());

// Initialize Anthropic Lazily
let anthropicClient: Anthropic | null = null;
const getAnthropic = () => {
  if (anthropicClient) return anthropicClient;
  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    anthropicClient = new Anthropic({ apiKey: key });
    return anthropicClient;
  }
  return null;
};

// --- AUTHORIZATION WHITELIST ---
const AUTHORIZED_EMAILS = [
  "petar.dekanovic@gmail.com",
  "stjepan.dekanovic@gmail.com",
  "esmeraldadarkomanila@gmail.com"
];

function isAuthorized(email: string | undefined) {
  if (!email) return false;
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}

// Priority order for models - Claude IDs updated to May 2026 lifecycle
const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-exp",
  "models/gemini-1.5-flash",
  "models/gemini-1.5-pro"
];

const CLAUDE_MODELS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "claude-opus-4-7"
];

async function startServer() {
  console.log("[WiseFit] Initializing Server...");
  const app = express();
  
  // Use a port that works in all environments (Hostinger might override this)
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Log incoming requests for debugging production 404s
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check - MUST BE FIRST
  app.get("/api/health", (req, res) => {
    const distPath = path.resolve(process.cwd(), "dist");
    res.json({ 
      status: "ok", 
      geminiKey: !!getGeminiKey(),
      anthropicKey: !!process.env.ANTHROPIC_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      port: PORT,
      isProduction: process.env.NODE_ENV === "production" || fs.existsSync(distPath),
      cwd: process.cwd(),
      distPathExists: fs.existsSync(distPath),
      authorizedCount: AUTHORIZED_EMAILS.length,
      timestamp: new Date().toISOString()
    });
  });

  // --- GEMINI AI ENDPOINTS ---
  app.get("/api/ai/models", async (req, res) => {
    try {
      // Note: listModels is not always available on all keys/regions, but good for debug
      res.json({ message: "Models debug info. Use health for key check." });
    } catch (e) {
      res.json({ error: "Could not list models" });
    }
  });

  const generateWithFallback = async (prompt: string, config?: any, systemInstruction?: string) => {
    const geminiKey = getGeminiKey();
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!geminiKey && !anthropicKey) {
      throw new Error("No AI API Keys configured. Please add GEMINI_API_KEY or ANTHROPIC_API_KEY to your Hostinger environment variables.");
    }

    let lastError = null;

    // Try Gemini First - v1beta is often required for experimental/pre-release models
    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`[WiseFit AI] Attempting Gemini: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            ...config,
            // Ensure we don't send incompatible fields
            candidateCount: undefined
          },
          systemInstruction
        }, { apiVersion: 'v1beta' }); 
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) return { text: () => responseText, raw: result };
      } catch (e: any) {
        lastError = e;
        const errStr = e.message?.toLowerCase() || "";
        console.warn(`[WiseFit AI] Gemini ${modelName} failed: ${errStr}`);
        // If it's a structural error (like unauthorized), we might want to continue, but if it's a quota, we hop to Claude
        if (errStr.includes("not found") || errStr.includes("404") || errStr.includes("not supported") || errStr.includes("403")) continue;
        if (errStr.includes("quota") || errStr.includes("429") || errStr.includes("limit")) break; 
      }
    }

    // Try Claude Fallback
    const anthropic = getAnthropic();
    if (anthropic) {
      for (const modelName of CLAUDE_MODELS) {
        try {
          console.log(`[WiseFit AI] Attempting Claude: ${modelName}`);
          const msg = await anthropic.messages.create({
            model: modelName,
            max_tokens: config?.maxOutputTokens || 1024,
            system: systemInstruction,
            messages: [{ role: "user", content: prompt }],
            temperature: config?.temperature || 0.7,
          });
          const content = msg.content[0];
          if (content.type === 'text') {
            return { text: () => content.text, raw: msg };
          }
        } catch (e: any) {
          lastError = e;
          const errLower = e.message?.toLowerCase() || "";
          console.warn(`[WiseFit AI] Claude ${modelName} failed: ${errLower}`);
          if (errLower.includes("not found") || errLower.includes("404")) continue;
          if (errLower.includes("quota") || errLower.includes("429")) continue; // Try next Claude model if quota hit
          break; 
        }
      }
    }

    // FINAL FAILSAFE
    console.error("CRITICAL: ALL AI MODELS EXHAUSTED. Returning synthetic wisdom.");
    return { 
      text: () => "Choose to be great. Focus your effort on the things within your control. Even in technical storms, the spirit remains calm.", 
      raw: { failsafe: true, error: lastError?.message || "Unknown Fail" } 
    };
  };

  const generateMessagesWithFallback = async (messages: any[], config?: any, systemInstruction?: string) => {
    const geminiKey = getGeminiKey();
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!geminiKey && !anthropicKey) {
      throw new Error("No AI API Keys configured. Please add GEMINI_API_KEY or ANTHROPIC_API_KEY to your environment.");
    }
    
    let lastError = null;

    for (const modelName of GEMINI_MODELS) {
      try {
        console.log(`[WiseFit AI] Attempting GeminiMessages: ${modelName}`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            ...config,
            candidateCount: undefined
          },
          systemInstruction
        }, { apiVersion: 'v1beta' });
        const result = await model.generateContent({ contents: messages });
        const responseText = result.response.text();
        if (responseText) return { text: () => responseText, raw: result };
      } catch (e: any) {
        lastError = e;
        const errStr = e.message?.toLowerCase() || "";
        console.warn(`[WiseFit AI] GeminiMessages ${modelName} failed: ${errStr}`);
        if (errStr.includes("not found") || errStr.includes("404") || errStr.includes("not supported")) continue;
        break; 
      }
    }

    // Claude Messages Fallback
    const anthropic = getAnthropic();
    if (anthropic) {
      const claudeMessages: any[] = messages.map(m => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
        content: m.parts[0].text
      }));

      for (const modelName of CLAUDE_MODELS) {
        try {
          console.log(`[AI] Attempting ClaudeMessages(${modelName})`);
          const msg = await anthropic.messages.create({
            model: modelName,
            max_tokens: config?.maxOutputTokens || 1024,
            system: systemInstruction,
            messages: claudeMessages,
            temperature: config?.temperature || 0.7,
          });
          const content = msg.content[0];
          if (content.type === 'text') {
            return { text: () => content.text, raw: msg };
          }
        } catch (e: any) {
          lastError = e;
          const errLower = e.message?.toLowerCase() || "";
          console.warn(`[AI] ClaudeMessages(${modelName}) failed: ${errLower}`);
          if (errLower.includes("not found") || errLower.includes("404")) continue;
          continue;
        }
      }
    }

    return { 
      text: () => "I am currently centered in silence. Patience is the greatest strength. We shall speak when the path is clear.", 
      raw: { failsafe: true, error: lastError?.message || "Unknown Fail" } 
    };
  };

  // --- WISDOM CACHE ENGINE ---
let globalQuotesCache: any[] = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

app.get("/api/wisdom/global", async (req, res) => {
  try {
    const now = Date.now();
    // Use cache if fresh
    if (globalQuotesCache.length > 0 && (now - lastCacheUpdate < CACHE_TTL)) {
      return res.json({ data: globalQuotesCache, source: 'cache' });
    }

    // In a real production setup, we'd use the Firebase Admin SDK here.
    // Since we are in the applet environment, we'll allow the client to request a seed, 
    // but for this implementation, the server-side proxy will act as a primary source.
    // If cache is empty, we'll return an empty array and let the first privileged client seed it.
    res.json({ data: globalQuotesCache, source: 'server_memory' });
  } catch (error) {
    res.status(500).json({ error: "Cache failure" });
  }
});

app.post("/api/wisdom/sync", express.json(), (req, res) => {
  const { quotes, secret } = req.body;
  // Simple guard: Only process if we don't have a huge cache already
  if (globalQuotesCache.length < 50 && quotes && Array.isArray(quotes)) {
    globalQuotesCache = quotes;
    lastCacheUpdate = Date.now();
    console.log(`[Cache] Synchronized ${quotes.length} quotes to server memory.`);
  }
  res.json({ status: "ok" });
});

app.get("/api/ai/diagnostics", async (req, res) => {
    const results: any = {
      gemini: { status: "pending", models: [] },
      anthropic: { status: "pending", models: [] },
      env: {
        geminiKey: !!process.env.GEMINI_API_KEY,
        anthropicKey: !!process.env.ANTHROPIC_API_KEY
      }
    };

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
      const test = await model.generateContent("ping");
      results.gemini.status = "ok";
      results.gemini.ping = "pong";
    } catch (e: any) {
      results.gemini.status = "error";
      results.gemini.error = e.message;
    }

    const anthropic = getAnthropic();
    if (anthropic) {
      for (const modelName of CLAUDE_MODELS) {
        try {
          console.log(`[WiseFit AI] Attempting Diagnostic Claude: ${modelName}`);
          const msg = await anthropic.messages.create({
            model: modelName,
            max_tokens: 10,
            messages: [{ role: "user", content: "ping" }]
          });
          results.anthropic.status = "ok";
          break; // Test passed
        } catch (e: any) {
          results.anthropic.status = "error";
          results.anthropic.error = `${modelName}: ${e.message}`;
          // Continue to next model if it's a 404 or auth issue
          if (e.message?.includes("404") || e.message?.includes("not found")) continue;
          break;
        }
      }
    } else {
      results.anthropic.status = "no_key";
    }

    res.json(results);
  });

  app.post("/api/ai/tts", async (req, res) => {
    try {
      const { text, userEmail } = req.body;
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "Your spirit is not yet ready for this transmission." });
      }
      if (!text) return res.status(400).json({ error: "Text is required" });

      const prompt = `Say in a calm, stoic, and authoritative voice: ${text}`;
      const result = await generateWithFallback(prompt);
      // Access safely for Gemini response structure
      const raw: any = result.raw;
      const base64Audio = raw?.response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio generated (TTS requires Gemini inlineData)");

      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("Gemini TTS Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate speech" });
    }
  });

  app.post("/api/ai/quote", async (req, res) => {
    try {
      const { traditionPrompt, recentTexts } = req.body;
      
      const config = {
        responseMimeType: "application/json",
        temperature: 1.0,
        topP: 0.95
      };

      const prompt = `${traditionPrompt}
        Format as JSON: {text, author, source, category, shortExplanation, stoicParallel, jewishParallel}.
        
        STRICT RULES:
        1. CRITICAL: Do NOT repeat or paraphrase any of these recent quotes: ${recentTexts}. 
        2. NO DUPLICATES: Ensure the quote is distinct in meaning, wording, and author from the ones listed above.
        3. FRESHNESS: Avoid the most "cliché" or common quotes if they have been shown recently.
        4. DEPTH: Prefer profound, lesser-known insights over generic motivational phrases.
        5. If category is psychology, also provide shortExplanation, stoicParallel, and jewishParallel as done in the app's local psychology insights.
        
        Seed: ${Math.random()}`;

      const result = await generateWithFallback(prompt, config);
      res.json(JSON.parse(result.text() || "{}"));
    } catch (error: any) {
      console.error("Gemini Quote Error:", error);
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });

  app.post("/api/ai/psychologist", async (req, res) => {
    try {
      const { messages, userEmail, healthData } = req.body;
      
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "Psychology consultation requires a Higher Key." });
      }

      const userMsg = messages[messages.length - 1].parts[0].text;
      const contextPrompt = `
        System: You are a warm, empathetic Clinical Psychologist specializing in Cognitive Behavioral Therapy and the Mind-Body connection.
        Patient Name: ${healthData?.name || 'Petar'}
        Recent Health Data: ${healthData?.currentSteps || 0} steps today, weight ${healthData?.currentWeight || 0}kg.
        
        Rules:
        - Be deeply empathetic but clinically grounded.
        - Help the user identify patterns between their physical activity and mental state.
        - Use "we" and "our" to foster a therapeutic alliance.
        - Keep it to 3-4 powerful sentences.
        - If they mention stress, suggest a simple breathing exercise.
        
        Patient Message: ${userMsg}
      `;

      const result = await generateWithFallback(contextPrompt, { maxOutputTokens: 512 });
      res.json({ text: result.text() || "I am listening. Tell me more about that." });
    } catch (error: any) {
      console.error("Gemini Psychologist Error:", error);
      res.status(500).json({ error: `The Clinical Chamber reached an error: ${error.message || "Unknown Failure"}` });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, userEmail } = req.body;
      
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "The Stoic Chamber is private. Please contact the administrator." });
      }
      
      const systemInstruction = `You are AI Stoic, an expert fitness coach and a master of ancient wisdom. 
          Your coaching style is deeply rooted in:
          1. Stoicism (Marcus Aurelius, Seneca, Epictetus): Focus on what you can control, endurance, and mental fortitude.
          2. Chinese Philosophy (especially Xunzi): Emphasize that human nature can be refined through deliberate effort and discipline.
          3. Japanese Wisdom (Bushido, Zen): Focus on precision, mindfulness, and the way of the warrior.
          4. Teachings of Jesus Christ: Focus on compassion, humility, and inner transformation.
          
          Help the user (Petar) with their workout plan (pull-ups and dips), nutrition, and motivation. 
          Integrate quotes and principles from these traditions naturally into your advice. 
          Be encouraging but firm in the pursuit of excellence.
          
          Always start your response with a short, powerful quote from one of these traditions that relates to the user's current situation or question.`;

      const result = await generateMessagesWithFallback(messages, {}, systemInstruction);
      res.json({ text: result.text() || "Sorry, I could not generate a response." });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  app.post("/api/ai/reflect", async (req, res) => {
    try {
      const { data, userEmail } = req.body;
      
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "Reflection requires a Higher Key." });
      }

      const prompt = `
        You are a Stoic Philosopher and Fitness Coach. 
        Analyze the following health metrics for ${data.userName}:
        - Steps Today: ${data.steps}
        - Current Weight: ${data.weight}kg
        - Calories Expended: ${data.calories}

        Wait! Before you respond, remember:
        - If steps are high (over 8000), praise their "Discipline" and "Momentum".
        - If steps are low, remind them that "Wealth is the ability to fully experience life" and encourage a short walk for "Clarity".
        - Regarding weight (${data.weight}kg), focus on "Consistency over Perfection".
        - Use a tone that is: Cinematic, Encouraging, Grave yet Inspiring.
        - Keep it short (max 2-3 sentences).
        - End with a short original Stoic quote.

        Respond in raw text.
      `;

      const result = await generateWithFallback(prompt);
      res.json({ text: result.text() || "Nature does not hurry, yet everything is accomplished..." });
    } catch (error: any) {
      console.error("Gemini Reflection Error:", error);
      res.status(500).json({ error: "Failed to generate reflection" });
    }
  });

  app.post("/api/ai/admin/generate-quotes", async (req, res) => {
    try {
      const { type } = req.body;
      let prompt = "";
      
      if (type === 'latin') {
        prompt = "Generate 50 unique, powerful Latin expressions and philosophical quotes with their English translations. Format as JSON array: [{text, author, source}]. The 'text' field should contain the Latin expression followed by the English translation in parentheses. The 'author' should be the historical figure or 'Ancient Proverb'. The 'source' should be 'Latin'. No markdown formatting, just the raw JSON array.";
      } else {
        prompt = "Generate 50 unique, powerful wise quotes from Stoic, Chinese, Japanese, Jewish, and Christian traditions. Format as JSON array: [{text, author, source}]. No markdown formatting, just the raw JSON array.";
      }

      const config = {
        responseMimeType: "application/json"
      };

      const result = await generateWithFallback(prompt, config);
      let text = result.text() || "[]";
      // Clean potential markdown code blocks
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Gemini Admin Generation Error:", error);
      res.status(500).json({ error: "Failed to generate quotes" });
    }
  });

  // --- SCRAPER ---
  app.get("/api/daily-quotes", async (req, res) => {
    try {
      let html = "";
      try {
        const response = await axios.get("https://wisefitorg.com/digest/", {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000
        });
        html = response.data;
      } catch (err: any) {
        try {
          const wpResponse = await axios.get("https://wisefitorg.com/wp-json/wp/v2/pages?slug=digest");
          if (wpResponse.data && wpResponse.data[0] && wpResponse.data[0].content) {
            html = wpResponse.data[0].content.rendered;
          }
        } catch (wpErr) {
          console.error("Scraper failed to fetch both direct and via WP API");
        }
      }

      if (!html) throw new Error("Could not fetch page content");

      const $ = cheerio.load(html);
      let quotes: any[] = [];
      
      // Look for list items or paragraphs that look like quotes
      $("li, p, blockquote").each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 25 && text.length < 600) {
          // Look for separators like em-dash or en-dash
          const separators = [" — ", " – ", " - ", "—", "–"];
          let found = false;
          for (const sep of separators) {
            if (text.includes(sep)) {
              const parts = text.split(sep);
              if (parts[0].trim().length > 10) {
                quotes.push({
                  id: `daily-${Math.random().toString(36).substr(2, 9)}`,
                  text: parts[0].trim(),
                  author: parts[1]?.trim() || "Ancient Wisdom",
                  source: "Daily Digest",
                  category: "daily"
                });
                found = true;
                break;
              }
            }
          }
          // If no separator but length is good, maybe it's just a quote
          if (!found && text.length > 40 && text.length < 300) {
             quotes.push({
               id: `daily-${Math.random().toString(36).substr(2, 9)}`,
               text: text,
               author: "Daily Insight",
               source: "Daily Digest",
               category: "daily"
             });
          }
        }
      });

      // deduplicate
      const uniqueQuotes = quotes.filter((q, index, self) =>
        index === self.findIndex((t) => t.text === q.text)
      );

      res.json(uniqueQuotes.slice(0, 50));
    } catch (error: any) {
      console.error("Scraper Error:", error.message);
      res.status(500).json({ error: "Failed to fetch daily quotes" });
    }
  });

  // --- GOOGLE AUTH & HEALTH ---
  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "Google Client ID not configured" });
    
    const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
    const redirectUri = `${appUrl}/api/auth/callback/google`;
    
    const scopes = [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.body.read"
    ];
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent"
    });
    
    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  // --- STATIC SERVING ---
  const distPath = path.resolve(process.cwd(), "dist");
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(distPath);
  
  if (isProd) {
    console.log(`[WiseFit] Production Mode: Serving static files from ${distPath}`);
    app.use(express.static(distPath));
    
    // SPA Fallback for all non-API paths
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) {
          console.error(`[SPA Error] Failed to send index.html: ${err.message}`);
          res.status(404).send("WiseFit Sanctuary: Static artifact missing. Please check build logs.");
        }
      });
    });
  } else {
    console.log("[WiseFit] Development Mode: Initializing Vite Middleware...");
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e: any) {
      console.error("[Vite Error] Failed to load middleware:", e.message);
    }
  }

  // Final catch-all for missing API routes
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.url}` });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[WiseFit] Active on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical Server Failure:", err);
});
