import express from "express";
import cors from "cors";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Helper to get key from multiple possible names
const getGeminiKey = () => {
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.warn("WARNING: No Gemini API Key found in environment variables.");
  }
  return key || "";
};

// Initialize Gemini
const genAI = new GoogleGenerativeAI(getGeminiKey());

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      geminiKey: !!getGeminiKey(),
      nodeEnv: process.env.NODE_ENV,
      port: PORT,
      authorizedCount: AUTHORIZED_EMAILS.length
    });
  });

  // --- GEMINI AI ENDPOINTS ---

  app.post("/api/ai/tts", async (req, res) => {
    try {
      const { text, userEmail } = req.body;
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "Your spirit is not yet ready for this transmission." });
      }
      if (!text) return res.status(400).json({ error: "Text is required" });

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `Say in a calm, stoic, and authoritative voice: ${text}`;
      const result = await model.generateContent([prompt]);
      const response = await result.response;
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio generated");

      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error("Gemini TTS Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate speech" });
    }
  });

  app.post("/api/ai/quote", async (req, res) => {
    try {
      const { traditionPrompt, recentTexts } = req.body;
      
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 1.0,
          topP: 0.95
        }
      });

      const result = await model.generateContent(`${traditionPrompt}
        Format as JSON: {text, author, source, category, shortExplanation, stoicParallel, jewishParallel}.
        
        STRICT RULES:
        1. CRITICAL: Do NOT repeat or paraphrase any of these recent quotes: ${recentTexts}. 
        2. NO DUPLICATES: Ensure the quote is distinct in meaning, wording, and author from the ones listed above.
        3. FRESHNESS: Avoid the most "cliché" or common quotes if they have been shown recently.
        4. DEPTH: Prefer profound, lesser-known insights over generic motivational phrases.
        5. If category is psychology, also provide shortExplanation, stoicParallel, and jewishParallel as done in the app's local psychology insights.
        
        Seed: ${Math.random()}`);

      const response = await result.response;
      res.json(JSON.parse(response.text() || "{}"));
    } catch (error: any) {
      console.error("Gemini Quote Error:", error);
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, userEmail } = req.body;
      
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "The Stoic Chamber is private. Please contact the administrator." });
      }
      
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are AI Stoic, an expert fitness coach and a master of ancient wisdom. 
          Your coaching style is deeply rooted in:
          1. Stoicism (Marcus Aurelius, Seneca, Epictetus): Focus on what you can control, endurance, and mental fortitude.
          2. Chinese Philosophy (especially Xunzi): Emphasize that human nature can be refined through deliberate effort and discipline.
          3. Japanese Wisdom (Bushido, Zen): Focus on precision, mindfulness, and the way of the warrior.
          4. Jewish Wisdom: Emphasize community, resilience, and the value of every small action.
          5. Teachings of Jesus Christ: Focus on compassion, humility, and inner transformation.
          
          Help the user (Petar) with their workout plan (pull-ups and dips), nutrition, and motivation. 
          Integrate quotes and principles from these traditions naturally into your advice. 
          Be encouraging but firm in the pursuit of excellence.
          
          Always start your response with a short, powerful quote from one of these traditions that relates to the user's current situation or question.`,
      });

      const result = await model.generateContent({ contents: messages });
      const response = await result.response;

      res.json({ text: response.text() || "Sorry, I could not generate a response." });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      // Check if it's an API error that looks like a 404 from Gemini
      if (error.message?.includes("404")) {
        return res.status(404).json({ error: "Gemini API returned 404. Checking model availability." });
      }
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

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      res.json({ text: response.text() || "Nature does not hurry, yet everything is accomplished..." });
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

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      res.json(JSON.parse(response.text() || "[]"));
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
  const isProd = process.env.NODE_ENV === "production";
  
  if (isProd) {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distPath, "index.html"), (err) => {
        if (err) res.status(404).send("Stoic sanctuary artifact not found.");
      });
    });
  } else {
    try {
      const { createServer } = await import("vite");
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error("Vite failed to load:", e);
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
