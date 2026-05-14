import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini at the top level
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

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

  // --- GEMINI AI ENDPOINTS ---

  app.post("/api/ai/tts", async (req, res) => {
    try {
      const { text, userEmail } = req.body;
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "Your spirit is not yet ready for this transmission." });
      }
      if (!text) return res.status(400).json({ error: "Text is required" });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say in a calm, stoic, and authoritative voice: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

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
      const { traditionPrompt, recentTexts, userEmail } = req.body;
      
      // If it's a guest or unauthorized, we can either block or just let them use local fallback
      // For quotes, we'll allow guests to try but prioritize the whitelist
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${traditionPrompt}
        Format as JSON: {text, author, source, category, shortExplanation, stoicParallel, jewishParallel}.
        
        STRICT RULES:
        1. CRITICAL: Do NOT repeat or paraphrase any of these recent quotes: ${recentTexts}. 
        2. NO DUPLICATES: Ensure the quote is distinct in meaning, wording, and author from the ones listed above.
        3. FRESHNESS: Avoid the most "cliché" or common quotes if they have been shown recently.
        4. DEPTH: Prefer profound, lesser-known insights over generic motivational phrases.
        5. If category is psychology, also provide shortExplanation, stoicParallel, and jewishParallel as done in the app's local psychology insights.
        
        Seed: ${Math.random()}`,
        config: {
          responseMimeType: "application/json",
          temperature: 1.0,
          topP: 0.95
        }
      });

      res.json(JSON.parse(response.text || "{}"));
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
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview", // Note: Pro requires billing enabled usually
        contents: messages,
        config: {
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
        }
      });

      res.json({ text: response.text || "Sorry, I could not generate a response." });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: "Failed to generate response" });
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

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      });

      res.json({ text: response.text || "Nature does not hurry, yet everything is accomplished..." });
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

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      res.json(JSON.parse(response.text || "[]"));
    } catch (error: any) {
      console.error("Gemini Admin Generation Error:", error);
      res.status(500).json({ error: "Failed to generate quotes" });
    }
  });

  // --- DAILY FRESH QUOTES SCRAPER ---
  app.get("/api/daily-quotes", async (req, res) => {
    try {
      let html = "";
      try {
        const response = await axios.get("https://wisefitorg.com/digest/", {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
          },
          timeout: 10000
        });
        html = response.data;
      } catch (err: any) {
        console.error("Direct fetch failed, trying WP API...");
        try {
          const wpResponse = await axios.get("https://wisefitorg.com/wp-json/wp/v2/pages?slug=digest");
          if (wpResponse.data && wpResponse.data[0] && wpResponse.data[0].content) {
            html = wpResponse.data[0].content.rendered;
          }
        } catch (wpErr) {
          console.error("WP API fetch failed too.");
        }
      }

      if (!html) throw new Error("Could not fetch page content");

      const $ = cheerio.load(html);
      let quotes: any[] = [];
      
      // Strategy 1: Find major headers and scan their siblings for content
      let targetHeaders = $("h1, h2, h3, h4").filter((i, el) => {
        const text = $(el).text().toLowerCase();
        return text.includes("wise quotes") || text.includes("daily quotes") || text.includes("wisdom");
      });

      targetHeaders.each((i, header) => {
        let current = $(header).next();
        let limit = 0;
        while (current.length > 0 && !current.is("h1, h2") && limit < 40) {
          if (current.is("ul, ol")) {
            current.find("li").each((j, li) => {
              const text = $(li).text().trim();
              if (text.length > 15) {
                const parsed = parseQuoteText(text);
                if (parsed) quotes.push(parsed);
              }
            });
          } else if (current.is("p, div, blockquote")) {
            const text = current.text().trim();
            if (text.length > 30) {
              const parsed = parseQuoteText(text);
              if (parsed) quotes.push(parsed);
            }
          }
          current = current.next();
          limit++;
        }
      });

      // Strategy 2: If Strategy 1 was insufficient, look at all list items and paragraphs
      if (quotes.length < 10) {
        $("li, p, blockquote").each((i, el) => {
          if ($(el).children().length > 3) return;
          const text = $(el).text().trim();
          if (text.length > 25 && text.length < 600) {
            const parsed = parseQuoteText(text);
            if (parsed) quotes.push(parsed);
          }
        });
      }

      function parseQuoteText(text: string) {
        // Remove bullets, numbers, and symbols from the start
        let cleanText = text.replace(/^[•\d\.\s\*\[\]]+/, "").trim();
        
        // Remove common prefixes like "Apr 29, 2026 Earnings"
        if (cleanText.match(/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},/)) {
            cleanText = ""; 
        }

        if (!cleanText) return null;

        const separators = [" — ", " – ", " - ", "—", "–"];
        let quote = cleanText;
        let author = "Daily Wisdom";

        for (const sep of separators) {
            if (cleanText.includes(sep)) {
                const parts = cleanText.split(sep);
                if (parts[0].length > 10) {
                    quote = parts[0].trim();
                    author = parts[1]?.trim() || "Daily Wisdom";
                    break;
                }
            }
        }
        
        return {
          id: `daily-sc-${Math.random().toString(36).substr(2, 9)}`,
          text: quote,
          author: author,
          source: "Daily Digest",
          category: "daily",
          randomId: Math.random()
        };
      }

      // Final processing: Shuffle, filter, and de-duplicate
      const finalQuotes = quotes
        .filter(q => q && q.text && q.text.length > 15 && q.text.length < 800)
        .filter((q, index, self) => index === self.findIndex((t) => t.text === q.text))
        .sort(() => Math.random() - 0.5) // Shuffle for variety
        .slice(0, 100);

      if (finalQuotes.length === 0) {
          const debugSnippet = $("body").text().substring(0, 150).replace(/\n/g, " | ");
          return res.json([{
              id: "wait",
              text: "The web is still weaving today's wisdom.",
              author: "Daily Digest",
              source: "System",
              category: "daily",
              shortExplanation: `Scraper found no quotes in ${html.length} chars. Snippet: "${debugSnippet}"`
          }]);
      }

      res.json(finalQuotes);
    } catch (error: any) {
      console.error("Scraping error:", error.message);
      res.status(500).json({ error: "Failed to fetch daily quotes" });
    }
  });

  // --- GOOGLE FITNESS / PIXEL WATCH INTEGRATION ---

  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "Google Client ID not configured" });
    
    const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
    const redirectUri = `${appUrl}/api/auth/callback/google`;
    
    // Scopes for Pixel Watch 3 & Fitbit (Unified May 2026)
    const scopes = [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.body.read",
      "https://www.googleapis.com/auth/fitness.location.read",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
      "openid"
    ];
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes.join(" "),
      access_type: "offline",
      prompt: "consent"
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(["/api/auth/callback/google", "/api/auth/callback/google/"], async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Missing code");

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
    const redirectUri = `${appUrl}/api/auth/callback/google`;

    try {
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });

      const tokens = response.data;

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #09090b; color: white; text-align: center;">
            <div style="max-width: 400px; padding: 2rem; border-radius: 2rem; background: #18181b; border: 1px solid #27272a;">
              <h2 style="color: #10b981; margin-bottom: 1rem;">Pixel Watch Connected!</h2>
              <p style="color: #a1a1aa; margin-bottom: 2rem;">Your health data is now syncing with WiseFit.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'GOOGLE_HEALTH_AUTH_SUCCESS',
                    tokens: ${JSON.stringify(tokens)}
                  }, '*');
                  window.close();
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Google token exchange error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed. Check your client secret and redirect URI settings.");
    }
  });

  app.post("/api/health/sync", async (req, res) => {
    const { accessToken, types } = req.body;
    if (!accessToken) return res.status(401).json({ error: "No access token" });

    try {
      const results: any = {};
      const now = Date.now();
      const startTimeMillis = new Date().setHours(0, 0, 0, 0); // Start of today

      // Fetch Steps (Estimated from Pixel Watch/Phone)
      if (types.includes('steps')) {
        const stepsResponse = await axios.post(
          "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
          {
            aggregateBy: [{ dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis,
            endTimeMillis: now,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const point = stepsResponse.data.bucket[0]?.dataset[0]?.point[0];
        results.steps = point ? point.value[0].intVal : 0;
      }

      // Fetch Calories
      if (types.includes('calories')) {
        const caloriesResponse = await axios.post(
          "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
          {
            aggregateBy: [{ dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended" }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis,
            endTimeMillis: now,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const point = caloriesResponse.data.bucket[0]?.dataset[0]?.point[0];
        results.calories = point ? Math.round(point.value[0].fpVal) : 0;
      }

      // Fetch Distance
      if (types.includes('distance') || types.includes('steps')) {
        const distanceResponse = await axios.post(
          "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
          {
            aggregateBy: [{ dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta" }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis,
            endTimeMillis: now,
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const point = distanceResponse.data.bucket[0]?.dataset[0]?.point[0];
        results.distance = point ? parseFloat((point.value[0].fpVal / 1000).toFixed(2)) : 0;
      }

      // Fetch Weight (Focusing on your 89.0kg data stream)
      if (types.includes('weight')) {
        const weightResponse = await axios.get(
          "https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.weight:com.google.android.gms:merge_weight/datasets/0-" + (now * 1000000),
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const points = weightResponse.data.point;
        if (points && points.length > 0) {
          results.weight = points[points.length - 1].value[0].fpVal;
        }
      }

      // Fetch Heart Rate (RHR & HRV)
      if (types.includes('heart_rate') || types.includes('steps')) {
        try {
          // RHR
          const rhrResponse = await axios.post(
            "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
            {
              aggregateBy: [{ dataSourceId: "derived:com.google.heart_rate.summary:com.google.android.gms:merge_heart_rate_summary" }],
              bucketByTime: { durationMillis: 86400000 },
              startTimeMillis,
              endTimeMillis: now,
            },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const rhrPoint = rhrResponse.data.bucket[0]?.dataset[0]?.point[0];
          results.rhr = rhrPoint ? Math.round(rhrPoint.value[0].fpVal) : 0;

          // HRV (Estimated from health snapshots if available)
          const hrvResponse = await axios.get(
            `https://www.googleapis.com/fitness/v1/users/me/dataSources/derived:com.google.heart_rate.variability.summary:com.google.android.gms:merge_heart_rate_variability/datasets/0-${now * 1000000}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const hrvPoints = hrvResponse.data.point;
          if (hrvPoints && hrvPoints.length > 0) {
            results.hrv = Math.round(hrvPoints[hrvPoints.length - 1].value[0].fpVal);
          }
        } catch (e) {
          console.log("Heart rate data not available yet for today or scope missing.");
        }
      }

      res.json(results);
    } catch (error: any) {
      console.error("Health sync error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to sync health data from Google Cloud" });
    }
  });

  app.post("/api/health/weekly", async (req, res) => {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(401).json({ error: "No access token" });

    try {
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 86400000);
      const startTimeMillis = new Date(sevenDaysAgo).setHours(0, 0, 0, 0);

      const requestBody = {
        aggregateBy: [
          { dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps" },
          { dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended" },
          { dataSourceId: "derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta" }
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis,
        endTimeMillis: now,
      };

      const response = await axios.post(
        "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
        requestBody,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const weeklyData = response.data.bucket.map((bucket: any, index: number) => {
        const date = new Date(bucket.startTimeMillis);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toISOString().split('T')[0],
          steps: bucket.dataset[0].point[0]?.value[0].intVal || 0,
          calories: Math.round(bucket.dataset[1].point[0]?.value[0].fpVal || 0),
          distance: parseFloat((bucket.dataset[2].point[0]?.value[0].fpVal / 1000 || 0).toFixed(2)) // meters to km
        };
      });

      res.json(weeklyData);
    } catch (error: any) {
      console.error("Weekly health sync error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch weekly health trends" });
    }
  });

  app.post("/api/health/records", async (req, res) => {
    // These match the professional personal records in your health ecosystem
    const records = [
      { id: '1', label: 'Fastest kilometre', date: 'Sun 8 Feb', value: '4 min 38 sec', category: 'speed' },
      { id: '2', label: 'Fastest 5K', date: '18 Oct 2025', value: '26 min 9 sec', category: 'speed' },
      { id: '3', label: 'Fastest 10K', date: '26 Jul 2025', value: '56 min 43 sec', category: 'speed' },
      { id: '4', label: 'Fastest half marathon', date: '31 Aug 2025', value: '2 h 11 m', category: 'speed' },
      { id: '5', label: 'Farthest run', date: '31 Aug 2025', value: '41.24 km (4 h 45 m)', category: 'distance' }
    ];
    res.json(records);
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
