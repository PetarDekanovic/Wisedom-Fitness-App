import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp as initializeClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection, getDocs, doc, setDoc, query, where, writeBatch, orderBy, limit } from "firebase/firestore";
import { FALLBACK_QUOTES, FALLBACK_NEWS } from "./src/fallbackQuotes";

dotenv.config();

// Read Firebase applet config for Admin/Client SDK
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
let firebaseConfig: any = {};
try {
  firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.warn("[WiseFit Server] Could not read firebase-applet-config.json:", e);
}

// Initialize Firebase Admin
let isFirebaseAdminInitialized = false;
if (firebaseConfig.projectId) {
  try {
    initializeApp({
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket || `${firebaseConfig.projectId}.firebasestorage.app`
    });
    isFirebaseAdminInitialized = true;
    console.log("[WiseFit Server] Firebase Admin initialized successfully.");
  } catch (err) {
    console.error("[WiseFit Server] Failed to initialize Firebase Admin:", err);
  }
}

// Initialize Firebase Client SDK on server for bypassing service account IAM permissions on daily digest
let clientFirestoreDb: any = null;
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    const clientApp = initializeClientApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId
    }, "ServerClientApp");
    clientFirestoreDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);
    console.log("[WiseFit Server] Firebase Client SDK initialized successfully on Server.");
  } catch (err) {
    console.error("[WiseFit Server] Failed to initialize Firebase Client SDK on Server:", err);
  }
}

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
  console.log("[WiseFit] --- BOOTING SANCTUARY ---");
  const app = express();
  
  const PORT = Number(process.env.PORT) || 3000;
  console.log(`[WiseFit] Port selected: ${PORT}`);

  app.use(cors());
  app.use(express.json({ limit: "65mb" }));
  app.use(express.urlencoded({ limit: "65mb", extended: true }));
  console.log("[WiseFit] Core middlewares: CORS, JSON (65mb) & URLencoded (65mb) enabled.");

  // Ensure uploads directory exists
  const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`[WiseFit] Created uploads directory: ${UPLOADS_DIR}`);
  }
  
  // Serve uploads statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Log incoming requests for debugging production 404s
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[REQ] ${req.method} ${req.path} | IP: ${req.ip}`);
    }
    next();
  });

  // Serve persistent files directly from Firestore (durable/non-ephemeral backup storage)
  app.get("/api/persistent-file/:id", async (req, res) => {
    try {
      const docId = req.params.id;
      if (!docId) {
        return res.status(400).send("Missing document ID.");
      }
      
      const firestoreDb = firebaseConfig.firestoreDatabaseId 
        ? getFirestore(getApp(), firebaseConfig.firestoreDatabaseId) 
        : getFirestore();
      const docRef = firestoreDb.collection("persistent_uploads").doc(docId);
      const docSnap = await docRef.get();
      
      if (!docSnap.exists) {
        console.warn(`[WiseFit Server] Persistent file not found: ${docId}`);
        return res.status(404).send("Persistent file not found.");
      }
      
      const docData = docSnap.data();
      if (!docData) {
        return res.status(404).send("No file data stored.");
      }

      let base64Data = "";
      if (docData.isChunked && docData.totalChunks) {
        console.log(`[WiseFit Server] Reassembling ${docData.totalChunks} chunks for persistent file ${docId}`);
        const chunksSnap = await docRef.collection("chunks").orderBy("chunkIndex", "asc").get();
        const chunks: string[] = [];
        chunksSnap.forEach((chunkDoc) => {
          const chunkData = chunkDoc.data();
          if (chunkData && chunkData.data) {
            chunks.push(chunkData.data);
          }
        });
        base64Data = chunks.join("");
      } else if (docData.base64Data) {
        base64Data = docData.base64Data;
      } else {
        console.warn(`[WiseFit Server] Persistent file has no data or chunked state: ${docId}`);
        return res.status(404).send("No file data stored.");
      }
      
      // Clean base64 prefix if present (e.g., data:image/png;base64,...)
      const cleanBase64 = base64Data.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(cleanBase64, 'base64');
      const totalSize = buffer.length;

      res.setHeader("Content-Type", docData.contentType || docData.fileType || "image/jpeg");
      res.setHeader("Accept-Ranges", "bytes");

      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (start >= totalSize || end >= totalSize || start > end) {
          res.setHeader("Content-Range", `bytes */${totalSize}`);
          return res.status(416).send("Requested Range Not Satisfiable");
        }

        const chunksize = (end - start) + 1;
        const chunkBuffer = buffer.subarray(start, end + 1);

        res.status(206);
        res.setHeader("Content-Range", `bytes ${start}-${end}/${totalSize}`);
        res.setHeader("Content-Length", chunksize);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(chunkBuffer);
      } else {
        res.setHeader("Content-Length", totalSize);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        return res.send(buffer);
      }
    } catch (err: any) {
      console.error("[WiseFit Server] Error serving persistent file:", err);
      return res.status(500).send("Failed to serve persistent file.");
    }
  });

  // Alias for backward compatibility
  app.get("/api/persistent-image/:id", (req, res) => {
    res.redirect(`/api/persistent-file/${req.params.id}`);
  });

  // Safe High-Capacity File Upload API
  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, fileType, base64Data, folder } = req.body;
      if (!filename || !base64Data) {
        return res.status(400).json({ error: "Missing filename or base64Data." });
      }

      // Clean base64 prefix if present (e.g., data:image/png;base64,...)
      const cleanBase64 = base64Data.replace(/^data:.*?;base64,/, "");
      const buffer = Buffer.from(cleanBase64, 'base64');

      // Reject files larger than 55MB to protect disk and memory space
      const MAX_SIZE = 55 * 1024 * 1024; 
      if (buffer.length > MAX_SIZE) {
        return res.status(400).json({ error: "File size exceeds the 55MB sanctuary limit." });
      }

      const ext = path.extname(filename);
      const base = path.basename(filename, ext).replace(/[^a-zA-Z0-9]/g, '_');
      const uniqueFilename = `${base}_${Date.now()}${ext}`;

      // Try uploading to Firebase Storage via Admin SDK first
      if (isFirebaseAdminInitialized && firebaseConfig.projectId) {
        try {
          const bucketName = firebaseConfig.storageBucket || `${firebaseConfig.projectId}.firebasestorage.app`;
          const bucket = getStorage().bucket(bucketName);
          const finalFolder = folder || 'general';
          const fullPath = `${finalFolder}/${uniqueFilename}`;
          const file = bucket.file(fullPath);

          // Generate UUID-like token
          const token = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });

          await file.save(buffer, {
            metadata: {
              contentType: fileType || 'image/jpeg',
              metadata: {
                firebaseStorageDownloadTokens: token
              }
            }
          });

          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(fullPath)}?alt=media&token=${token}`;
          console.log(`[WiseFit Server] Uploaded ${uniqueFilename} to Firebase Storage: ${publicUrl}`);
          return res.json({ url: publicUrl, filename: uniqueFilename, fileType });
        } catch (firebaseErr) {
          console.error("[WiseFit Server] Firebase Storage upload failed, falling back to database persistent storage:", firebaseErr);
        }
      }

      // Fallback 1: Firestore chunked persistent storage (Highly Durable)
      if (isFirebaseAdminInitialized) {
        try {
          const firestoreDb = firebaseConfig.firestoreDatabaseId 
            ? getFirestore(getApp(), firebaseConfig.firestoreDatabaseId) 
            : getFirestore();
          const docRef = firestoreDb.collection("persistent_uploads").doc();
          const docId = docRef.id;

          const chunkSize = 700000;
          const chunks: string[] = [];
          for (let i = 0; i < cleanBase64.length; i += chunkSize) {
            chunks.push(cleanBase64.substring(i, i + chunkSize));
          }

          console.log(`[WiseFit Server] Persisting ${chunks.length} chunks to Firestore for file ${uniqueFilename}`);
          
          await docRef.set({
            id: docId,
            filename: filename,
            contentType: fileType || 'image/jpeg',
            createdAt: new Date().toISOString(),
            isChunked: true,
            totalChunks: chunks.length,
            folder: folder || 'general'
          });

          const batchPromises = chunks.map(async (chunkStr, idx) => {
            const chunkRef = docRef.collection("chunks").doc(String(idx));
            await chunkRef.set({
              chunkIndex: idx,
              data: chunkStr
            });
          });
          
          await Promise.all(batchPromises);

          console.log(`[WiseFit Server] Successfully saved chunked file in Firestore: ${docId}`);
          return res.json({
            url: `/api/persistent-file/${docId}`,
            filename: uniqueFilename,
            fileType
          });
        } catch (dbErr) {
          console.error("[WiseFit Server] Firestore chunked persistent upload failed, falling back to local disk storage:", dbErr);
        }
      }

      // Fallback 2: Local Storage (Ephemeral)
      const destinationPath = path.join(UPLOADS_DIR, uniqueFilename);
      console.log(`[WiseFit Server] Falling back to local disk write: ${uniqueFilename} (${buffer.length} bytes)`);
      fs.writeFileSync(destinationPath, buffer);

      const relativeUrl = `/uploads/${uniqueFilename}`;
      res.json({ url: relativeUrl, filename: uniqueFilename, fileType });
    } catch (uploadErrString: any) {
      console.error("[WiseFit] File upload failure:", uploadErrString);
      res.status(500).json({ error: "Attachment processing crashed. Retain smaller file size." });
    }
  });

  // Health check - MUST BE FIRST
  console.log("[WiseFit] Registering /api/health...");
  app.get("/api/health", (req, res) => {
    const distPath = path.resolve(process.cwd(), "dist");
    const health = { 
      status: "online", 
      message: "WiseFit AI Bridge is active",
      geminiKey: !!getGeminiKey(),
      anthropicKey: !!process.env.ANTHROPIC_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      port: PORT,
      isProduction: process.env.NODE_ENV === "production" || fs.existsSync(distPath),
      cwd: process.cwd(),
      distPathExists: fs.existsSync(distPath),
      authorizedCount: AUTHORIZED_EMAILS.length,
      timestamp: new Date().toISOString()
    };
    console.log("[WiseFit] Health check requested.");
    res.json(health);
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
        System: You are Dr. Sigmund Freud (adapted), a Classical Psychoanalyst and Clinical Psychologist. Your persona is refined, intellectually deep, and focused on uncovering the deep-seated emotional structures and subconscious patterns of your patient.
        
        Patient Name: ${healthData?.name || 'Petar'}
        Observation: The user is in the "WiseFit Sanctuary". While you are aware of their physical biometrics (${healthData?.currentSteps || 0} steps), you interpret these through a psychological lens (e.g., discipline as a form of self-regulation or physical exertion as a release of suppressed tension).
        
        Clinical Methodology:
        - Psychoanalytic Depth: Look for the meaning *behind* the user's words. If they are tired, explore the weight of their responsibilities. If they are energetic, explore the source of their drive.
        - Transference & Alliance: Foster a calm, safe environment. Use "we" to signal shared exploration ("Let us see what this reveals about our inner state").
        - Socratic & Analytical: Instead of simple motivation, ask the "why". Encourage the "Free Association" of thoughts.
        - Tone: Sophisticated, calm, slightly formal yet deeply compassionate. You are a "Sage" figure of clinical authority.
        - Limits: Stay within 3-5 high-impact sentences. Avoid generic "cheerleading". Be a serious therapeutic companion.
        - Emojis: Integrate a couple of highly relevant, refined introspective emojis (e.g., 💭, 🧠, ⚖️, 🔍, 🕯️, 🧭) to highlight specific behavioral or subconscious markers in each message.
        - Scope: Address life, relationships, existential dread, joy, and the human condition. Fitness is merely one facet of their expression.
        
        Patient input: "${userMsg}"
      `;

      const result = await generateWithFallback(contextPrompt, { 
        maxOutputTokens: 512,
        temperature: 0.8
      });
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
          
          Always start your response with a short, powerful quote from one of these traditions that relates to the user's current situation or question.
          
          REQUIRED PRESENTATION STYLE:
          - Enrich your response with relevant philosophical and athletic emojis (e.g., 🏛️, 🧠, ⚔️, 🏋️, 🧘, ⚓, ⏳, 🌸) to make it highly engaging.
          - ALWAYS use double-asterisk Markdown **bolding** to highlight important terms, concepts, rules, and names of people or texts (e.g., **Marcus Aurelius**, **discipline**, **HRV**, **willpower**, **Epictetus**) to maximize visual visibility and contrast.`;

      const result = await generateMessagesWithFallback(messages, {}, systemInstruction);
      res.json({ text: result.text() || "Sorry, I could not generate a response." });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  app.post("/api/ai/scholar-chat", async (req, res) => {
    try {
      const { scholarId, messages } = req.body;
      
      let systemInstruction = "";
      const formattingRequiredRule = `\n\nREQUIRED PRESENTATION STYLE:
      - Embellish your response with 1-3 highly relevant emojis (e.g., 🏛️, 📜, 🧠, ⚔️, ⏳) that suit your classical vibe.
      - ALWAYS use double-asterisk Markdown **bolding** to highlight important terms, concepts, philosophical rules, and names of people or books (e.g., **Meditations**, **reason**, **stoicism**, **virtue**, **Seneca**) to elevate readability and scanning contrast.`;

      if (scholarId === "dummy_marcus_aurelius") {
        systemInstruction = `You are the Roman Emperor and Stoic Philosopher Marcus Aurelius. 
        Respond in a solemn, wise, encouraging, but highly disciplined and concise manner, drawing from your Meditations. 
        Always address the user with philosophical respect. Retain great depth. Max 4 sentences. Refuse modern jargon entirely.` + formattingRequiredRule;
      } else if (scholarId === "dummy_seneca_younger") {
        systemInstruction = `You are the Roman writer, advisor, and Stoic Philosopher Lucius Seneca. 
        Respond with deep understanding and classical elegance, exploring the tranquil mind and shortest of lives. 
        Offer practical encouragements. Max 4 sentences.` + formattingRequiredRule;
      } else if (scholarId === "dummy_epictetus") {
        systemInstruction = `You are the legendary Greek Stoic philosopher Epictetus. 
        Your tone is direct, sharp, slightly stern, and completely practical. Remind the user to focus strictly on what is in their control. 
        Inspire elite physical and mental discipline. Max 3 sentences.` + formattingRequiredRule;
      } else if (scholarId === "dummy_hypatia_alex") {
        systemInstruction = `You are the legendary scholar, astronomer, and mathematician Hypatia of Alexandria. 
        Offer logical, neoplatonist, and geometric clarity on self-discipline, training of the mind, and celestial harmony. 
        Be professional, intellectually elegant, and concise. Max 4 sentences.` + formattingRequiredRule;
      } else {
        systemInstruction = "You are a wise Stoic seeker and mentor in the WiseFit sanctuary. Respond in a highly professional, encouraging, and classical tone. Max 3 sentences." + formattingRequiredRule;
      }

      const result = await generateMessagesWithFallback(messages, {}, systemInstruction);
      res.json({ text: result.text() || "I remain centered in contemplation. Let us consult the nature of things." });
    } catch (error: any) {
      console.error("Scholar Chat Error:", error);
      res.status(500).json({ error: error.message || "The scholar is silent." });
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

  // --- LINK PREVIEW SCROLLER & META EXTRACTOR ---
  app.get("/api/link-metadata", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      console.log(`[Link Scraper] Fetching metadata for: ${targetUrl}`);
      
      const isFacebook = targetUrl.includes("facebook.com") || targetUrl.includes("fb.watch");
      const isTikTok = targetUrl.includes("tiktok.com");
      const isInstagram = targetUrl.includes("instagram.com");

      let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
      
      // Use Twitterbot/1.0 User-Agent for Facebook/Instagram/TikTok to bypass login blockades 
      // and retrieve official open graph tags (og:image, og:title, og:description)
      if (isFacebook || isInstagram || isTikTok) {
        userAgent = "Twitterbot/1.0";
      }

      const response = await axios.get(targetUrl, {
        headers: {
          "User-Agent": userAgent,
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 6000,
      });

      const $ = cheerio.load(response.data);
      const title = $('meta[property="og:title"]').attr('content') || $('title').text() || "";
      let description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || "";
      let image = $('meta[property="og:image"]').attr('content') || 
                  $('meta[property="og:image:src"]').attr('content') || 
                  $('meta[name="twitter:image"]').attr('content') || 
                  $('meta[name="twitter:image:src"]').attr('content') || 
                  "";
      
      if (image && !image.startsWith('http://') && !image.startsWith('https://')) {
        try {
          const parsedUrl = new URL(targetUrl);
          image = new URL(image, parsedUrl.origin).toString();
        } catch (e) {
          // Ignore URL resolution error, leave as relative
        }
      }

      const publisher = $('meta[property="og:site_name"]').attr('content') || "";

      const isGeneric = 
        !description || 
        description.toLowerCase().includes("explore the things you love") || 
        description.toLowerCase().includes("log in") || 
        description.toLowerCase().includes("log into") ||
        description.toLowerCase().includes("welcome to facebook") ||
        description.toLowerCase().includes("something went wrong");

      if ((isFacebook || isTikTok) && (isGeneric || !image)) {
        console.log(`[Link Scraper] Generating premium excerpt for Facebook/TikTok Reel: ${targetUrl}`);
        
        const prompt = `
          Translate or analyze this shared social media link: "${targetUrl}"
          This is for a shared post inside WiseFit (the premium, stoic Digital Sanctuary of physical & mental discipline and clinical athletic metrics).
          The chief explorer Petar Dekanovic has shared this link on the Swarm Feed.
          
          Generate:
          1. A polished, dignified Title (e.g. "Facebook Shared Reflection" or "Stoic Performance Reel").
          2. An intellectually dense, elegant, and scholarly Excerpt / Description (2-3 sentences) relating to self-discipline, athletic mastery, Stoic fortitude, or classic physical expression.
          3. Recommend an outstanding high-resolution vertical Unsplash sports/philosophy image URL (e.g. containing athletes, heavy weights, old stone gyms, training rings, or classical scenery, like "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format...").
          
          Provide the output in raw JSON format (no markdown, just the object):
          {"title": "...", "description": "...", "image": "..."}
        `;

        try {
          const geminiResult = await generateWithFallback(prompt, { responseMimeType: "application/json" });
          let text = geminiResult.text() || "{}";
          text = text.replace(/^```json/, '').replace(/```$/, '').trim();
          const parsed = JSON.parse(text);

          return res.json({
            title: parsed.title || (isFacebook ? "Facebook Shared Reflection" : "TikTok Shared Insight"),
            description: parsed.description || "A deep clinical breakdown of physical training, Stoic discipline, or community athletic expression.",
            image: image || parsed.image || (isFacebook 
              ? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
              : "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600"),
            publisher: publisher || (isFacebook ? "Facebook" : "TikTok")
          });
        } catch (gemErr) {
          console.error("[Link Scraper] Gemini fallback generation failed:", gemErr);
        }
      }

      res.json({
        title: title || (isFacebook ? "Facebook Reflection" : "TikTok Insight"),
        description: description || "Access this connected physical training or scholastic breakdown.",
        image: image || (isFacebook 
          ? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
          : "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600"),
        publisher: publisher || (isFacebook ? "Facebook" : "TikTok")
      });

    } catch (err) {
      console.warn(`[Link Scraper] Extraction error for ${targetUrl}:`, err);
      const isFacebook = targetUrl.includes("facebook.com") || targetUrl.includes("fb.watch");
      const isTikTok = targetUrl.includes("tiktok.com");

      try {
        const prompt = `
          Translate or analyze this shared link: "${targetUrl}"
          This is for WiseFit. Write a premium, stoic, and dignified Title, a beautiful intellectually dense Description (2 sentences) on how physical action trains the soul and mind, and pick a scenic fitness/philosophy Unsplash photo URL.
          Provide output as raw JSON:
          {"title": "...", "description": "...", "image": "..."}
        `;
        const geminiResult = await generateWithFallback(prompt, { responseMimeType: "application/json" });
        let text = geminiResult.text() || "{}";
        text = text.replace(/^```json/, '').replace(/```$/, '').trim();
        const parsed = JSON.parse(text);

        return res.json({
          title: parsed.title || (isFacebook ? "Facebook Shared Reflection" : "TikTok Shared Insight"),
          description: parsed.description || "A deep clinical breakdown of physical training, Stoic discipline, or community athletic expression.",
          image: parsed.image || (isFacebook 
            ? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
            : "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600"),
          publisher: isFacebook ? "Facebook" : isTikTok ? "TikTok" : "External"
        });
      } catch (gemErr2) {
        console.error("[Link Scraper] Gemini failsafe also failed:", gemErr2);
      }

      res.json({
        title: isFacebook ? "Facebook Reflection" : isTikTok ? "TikTok Insight" : "Resource Link",
        description: "Click to inspect this external resource, video breakdown, or community asset.",
        image: isFacebook 
          ? "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600"
          : "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=600",
        publisher: isFacebook ? "Facebook" : isTikTok ? "TikTok" : "External"
      });
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

  // --- NEW UNIFIED SANCTUARY DIGEST API WITH STALE-WHILE-REVALIDATE & LOCAL BACKUP CACHE ---
  const SCRAPED_STORE_PATH = path.resolve(process.cwd(), "uploads", "scraped_quotes_store.json");

  function loadLocalScrapedQuotes(): any[] {
    try {
      if (fs.existsSync(SCRAPED_STORE_PATH)) {
        const raw = fs.readFileSync(SCRAPED_STORE_PATH, "utf8");
        return JSON.parse(raw) || [];
      }
    } catch (err) {
      console.error("[WiseFit Server] Error reading local scraped quotes:", err);
    }
    return [];
  }

  function saveLocalScrapedQuotes(quotesList: any[]) {
    try {
      const dir = path.dirname(SCRAPED_STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SCRAPED_STORE_PATH, JSON.stringify(quotesList, null, 2), "utf8");
      console.log(`[WiseFit Server] Successfully saved ${quotesList.length} quotes to local backup store.`);
    } catch (err) {
      console.error("[WiseFit Server] Error writing local scraped quotes:", err);
    }
  }

  async function syncLocalQuotesToFirestore(firestoreDb: any) {
    if (!firestoreDb) return;
    try {
      const localQuotes = loadLocalScrapedQuotes();
      if (localQuotes.length === 0) {
        console.log("[WiseFit Sync] No local backup quotes found to sync.");
        return;
      }
      
      console.log(`[WiseFit Sync] Checking if ${localQuotes.length} local quotes are saved in Firestore...`);
      const quotesCollection = collection(firestoreDb, "daily_digest_quotes");
      const snapshot = await getDocs(quotesCollection);
      
      const existingTexts = new Set();
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (data && data.text) {
          existingTexts.add(data.text.trim().toLowerCase());
        }
      });
      
      const missingQuotes = localQuotes.filter(q => !existingTexts.has(q.text.trim().toLowerCase()));
      
      if (missingQuotes.length > 0) {
        console.log(`[WiseFit Sync] Found ${missingQuotes.length} missing quotes in Firestore. Uploading...`);
        const BATCH_SIZE = 100;
        for (let i = 0; i < missingQuotes.length; i += BATCH_SIZE) {
          const batch = writeBatch(firestoreDb);
          const chunk = missingQuotes.slice(i, i + BATCH_SIZE);
          
          chunk.forEach((q, idx) => {
            const docRef = doc(quotesCollection);
            batch.set(docRef, {
              text: q.text,
              author: q.author,
              source: q.source || "Daily Digest",
              fetchDate: q.fetchDate || "2026-07-12",
              order: idx,
              createdAt: q.createdAt || new Date().toISOString()
            });
          });
          await batch.commit();
        }
        console.log(`[WiseFit Sync] Successfully uploaded ${missingQuotes.length} quotes to Firestore.`);
      } else {
        console.log("[WiseFit Sync] All local quotes are already present in Firestore.");
      }
    } catch (err: any) {
      console.error("[WiseFit Sync] Failed to sync local quotes to Firestore:", err.message || err);
    }
  }

  async function performDigestHarvest(firestoreDb: any, todayStr: string, force = false) {
    let html = "";
    try {
      const response = await axios.get("https://wisefitorg.com/digest/", {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 8000
      });
      html = response.data;
    } catch (err: any) {
      try {
        const wpResponse = await axios.get("https://wisefitorg.com/wp-json/wp/v2/pages?slug=digest");
        if (wpResponse.data && wpResponse.data[0] && wpResponse.data[0].content) {
          html = wpResponse.data[0].content.rendered;
        }
      } catch (wpErr) {
        console.error("[WiseFit Server] Scraper: failed direct and WP API fetches");
      }
    }

    let lastUpdated = "";
    let targetDateStr = todayStr;

    if (html) {
      const $ = cheerio.load(html);
      $("p").each((i, el) => {
        const text = $(el).text().trim();
        if (text.startsWith("Updated:")) {
          lastUpdated = text.replace("Updated:", "").trim();
          const match = lastUpdated.match(/^(\d{4}-\d{2}-\d{2})/);
          if (match) {
            targetDateStr = match[1];
          }
        }
      });
    }

    let quotes: any[] = [];

    if (firestoreDb && !force) {
      try {
        const quotesCollection = collection(firestoreDb, "daily_digest_quotes");
        const q = query(quotesCollection, where("fetchDate", "==", targetDateStr));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          snapshot.forEach((doc: any) => {
            quotes.push({
              id: doc.id,
              ...doc.data()
            });
          });
          quotes.sort((a: any, b: any) => (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0);
          console.log(`[WiseFit Server] Loaded ${quotes.length} daily digest quotes from Firestore (Client SDK) for date ${targetDateStr}`);
        }
      } catch (dbReadErr: any) {
        console.error("[WiseFit Server] Failed to read daily_digest_quotes from Firestore:", dbReadErr.message || dbReadErr);
      }
    }

    if ((quotes.length === 0 || force) && html) {
      let quotesFromHtml: any[] = [];
      const $ = cheerio.load(html);
      
      // Look for any standard daily/wisdom quotes heading variant
      const quotesHeader = $("h1, h2, h3").filter((i, el) => {
        const txt = $(el).text().toLowerCase();
        return txt.includes("daily wise quotes") || 
               txt.includes("100 daily quotes") || 
               txt.includes("daily digest") || 
               txt.includes("wise quotes") ||
               txt.includes("daily quotes");
      });

      if (quotesHeader.length > 0) {
        const nextElements = quotesHeader.first().nextAll();
        nextElements.each((i, el) => {
          let text = $(el).text().replace(/\s+/g, ' ').trim();
          if (text.length > 10) {
            const numMatch = text.match(/^•?\s*\d+\.\s*/);
            if (numMatch) {
              text = text.substring(numMatch[0].length).trim();
            }

            const separators = [" — ", " – ", " - ", "—", "–"];
            let qText = text;
            let qAuthor = "Ancient Wisdom";
            
            for (const sep of separators) {
              if (text.includes(sep)) {
                const parts = text.split(sep);
                const lastPart = parts[parts.length - 1].trim();
                if (lastPart.length > 1 && lastPart.length < 55) {
                  qAuthor = lastPart;
                  qText = parts.slice(0, -1).join(sep).trim();
                  break;
                }
              }
            }
            
            quotesFromHtml.push({
              text: qText,
              author: qAuthor,
              source: "Daily Digest"
            });
          }
        });
      }

      // Robust fallback: If no header found or no quotes parsed from after the header, scan the whole document
      if (quotesFromHtml.length === 0) {
        console.log("[WiseFit Server] Header-based scraping returned 0. Performing full document fallback scan...");
        $("li, p, blockquote").each((i, el) => {
          let text = $(el).text().replace(/\s+/g, ' ').trim();
          if (text.length > 25 && text.length < 600) {
            if (text.startsWith("Updated:")) return;
            
            const numMatch = text.match(/^•?\s*\d+\.\s*/);
            if (numMatch) {
              text = text.substring(numMatch[0].length).trim();
            }

            const separators = [" — ", " – ", " - ", "—", "–"];
            let found = false;
            for (const sep of separators) {
              if (text.includes(sep)) {
                const parts = text.split(sep);
                const lastPart = parts[parts.length - 1].trim();
                if (lastPart.length > 1 && lastPart.length < 55 && parts[0].trim().length > 10) {
                  quotesFromHtml.push({
                    text: parts.slice(0, -1).join(sep).trim(),
                    author: lastPart,
                    source: "Daily Digest"
                  });
                  found = true;
                  break;
                }
              }
            }
            if (!found && text.length > 40 && text.length < 300) {
              quotesFromHtml.push({
                text: text,
                author: "Daily Insight",
                source: "Daily Digest"
              });
            }
          }
        });
      }

      const chosenQuotes = quotesFromHtml.slice(0, 55);

      if (firestoreDb && chosenQuotes.length > 0) {
        try {
          if (force) {
            const quotesCollection = collection(firestoreDb, "daily_digest_quotes");
            const q = query(quotesCollection, where("fetchDate", "==", targetDateStr));
            const existingSnap = await getDocs(q);
            if (!existingSnap.empty) {
              const deleteBatch = writeBatch(firestoreDb);
              existingSnap.forEach((docSnap: any) => {
                deleteBatch.delete(docSnap.ref);
              });
              await deleteBatch.commit();
              console.log(`[WiseFit Server] Force: Cleared ${existingSnap.size} outdated quotes for ${targetDateStr} from Firestore.`);
            }
          }
          const batch = writeBatch(firestoreDb);
          const quotesCollection = collection(firestoreDb, "daily_digest_quotes");
          const savedQuotes: any[] = [];

          chosenQuotes.forEach((q, idx) => {
            const docRef = doc(quotesCollection);
            const qData = {
              text: q.text,
              author: q.author,
              source: q.source || "Daily Digest",
              fetchDate: targetDateStr,
              order: idx,
              createdAt: new Date().toISOString()
            };
            batch.set(docRef, qData);
            savedQuotes.push({
              id: docRef.id,
              ...qData
            });
          });

          await batch.commit();
          quotes = savedQuotes;
          console.log(`[WiseFit Server] Stored ${quotes.length} scraped quotes for date ${targetDateStr} in Firestore (Client SDK).`);
        } catch (dbWriteErr: any) {
          console.error("[WiseFit Server] Failed to write daily_digest_quotes to Firestore:", dbWriteErr.message || dbWriteErr);
          quotes = chosenQuotes.map((q, idx) => ({
            id: `digest-q-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            ...q,
            fetchDate: targetDateStr,
            order: idx,
            createdAt: new Date().toISOString()
          }));
        }
      } else {
        quotes = chosenQuotes.map((q, idx) => ({
          id: `digest-q-${idx}-${Math.random().toString(36).substring(2, 6)}`,
          ...q,
          fetchDate: targetDateStr,
          order: idx,
          createdAt: new Date().toISOString()
        }));
      }

      if (quotes.length > 0) {
        const localStore = loadLocalScrapedQuotes();
        let addedAny = false;
        quotes.forEach(q => {
          const exists = localStore.some(existing => existing.text.trim().toLowerCase() === q.text.trim().toLowerCase());
          if (!exists) {
            localStore.push({
              text: q.text,
              author: q.author,
              source: q.source || "Daily Digest",
              fetchDate: q.fetchDate || targetDateStr,
              createdAt: q.createdAt || new Date().toISOString()
            });
            addedAny = true;
          }
        });
        if (addedAny) {
          saveLocalScrapedQuotes(localStore);
        }
      }
    }

    if (quotes.length === 0) {
      const localStore = loadLocalScrapedQuotes();
      if (localStore.length > 0) {
        quotes = localStore.slice(0, 55).map((q, idx) => ({
          id: `local-store-${idx}`,
          ...q,
          order: idx
        }));
      } else {
        if (firestoreDb) {
          try {
            const quotesCollection = collection(firestoreDb, "daily_digest_quotes");
            const q = query(quotesCollection, orderBy("createdAt", "desc"), limit(55));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
              snapshot.forEach((docSnap: any) => {
                quotes.push({
                  id: docSnap.id,
                  ...docSnap.data()
                });
              });
              quotes.sort((a: any, b: any) => (a.order !== undefined && b.order !== undefined) ? a.order - b.order : 0);
            }
          } catch (dbFallbackErr: any) {
            console.error("[WiseFit Server] Database fallback query failed:", dbFallbackErr.message || dbFallbackErr);
          }
        }
      }
    }

    let news: any[] = [];
    if (html) {
      const $ = cheerio.load(html);
      const newsHeader = $("h2").filter((i, el) => $(el).text().includes("Commerce & Live News"));
      if (newsHeader.length > 0) {
        const nextElements = newsHeader.nextAll();
        for (let i = 0; i < nextElements.length; i++) {
          const el = nextElements[i];
          const textVal = $(el).text().trim();
          if (textVal.includes("100 Daily Wise Quotes")) {
            break;
          }
          
          const aTag = $(el).find("a");
          if (aTag.length > 0) {
            const url = aTag.attr("href") || "";
            const linkText = aTag.text().replace(/\s+/g, ' ').trim();
            const dateRegex = /^([A-Z][a-z]+ \d{1,2}, \d{4})/;
            const dateMatch = linkText.match(dateRegex);
            let dateStr = "";
            let remainingText = linkText;
            if (dateMatch) {
              dateStr = dateMatch[1];
              remainingText = linkText.replace(dateRegex, "").trim();
            }
            
            const categories = ["Announcements", "eBay Impact", "eBay for Charity", "Press Release", "News Team"];
            let category = "Research";
            let cleanTitle = remainingText;
            for (const cat of categories) {
              if (remainingText.startsWith(cat)) {
                category = cat;
                cleanTitle = remainingText.substring(cat.length).trim();
                break;
              }
            }
            
            news.push({
              id: `news-${i}-${Math.random().toString(36).substring(2, 6)}`,
              date: dateStr || "Recent",
              category,
              title: cleanTitle,
              url
            });
          }
        }
      }
    }

    let localCount = loadLocalScrapedQuotes().length;
    let dbCount = 0;
    if (firestoreDb) {
      try {
        const quotesCollection = collection(firestoreDb, "daily_digest_quotes");
        const listSnap = await getDocs(quotesCollection);
        dbCount = listSnap.size;
      } catch (err: any) {
        console.error("[WiseFit Server] Error getting total count from Firestore:", err.message || err);
      }
    }
    const totalScrapedCount = Math.max(localCount, dbCount);

    return {
      success: true,
      lastUpdated: lastUpdated || todayStr,
      news,
      quotes,
      totalScrapedCount
    };
  }

  let cachedDigest: any = null;
  let lastDigestFetchTime = 0;
  const DIGEST_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  app.get("/api/sanctuary-diagnostic", async (req, res) => {
    const logs: string[] = [];
    logs.push("Sanctuary Diagnostic triggered.");
    
    let firestoreDb: any = clientFirestoreDb;
    if (clientFirestoreDb) {
      logs.push("Firestore Client SDK initialized successfully on Server.");
    } else {
      logs.push("Firestore Client SDK NOT initialized.");
    }

    const balkanDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zagreb' }).format(new Date());
    const todayStr = balkanDate;
    logs.push(`todayStr: ${todayStr}`);

    try {
      logs.push("Attempting performDigestHarvest...");
      const data = await performDigestHarvest(firestoreDb, todayStr, true);
      logs.push(`performDigestHarvest returned successfully with ${data.quotes ? data.quotes.length : 0} quotes.`);
      res.json({
        success: true,
        logs,
        todayStr,
        lastUpdated: data.lastUpdated,
        quotesCount: data.quotes ? data.quotes.length : 0,
        sampleQuotes: data.quotes ? data.quotes.slice(0, 3) : [],
        data
      });
    } catch (err: any) {
      logs.push(`performDigestHarvest failed: ${err.message}`);
      if (err.stack) {
        logs.push(`Stack: ${err.stack}`);
      }
      res.status(500).json({
        success: false,
        logs,
        error: err.message
      });
    }
  });

  app.get("/api/sanctuary-digest", async (req, res) => {
    const force = req.query.force === "true";
    const now = Date.now();

    const balkanDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zagreb' }).format(new Date());
    const todayStr = balkanDate;

    let firestoreDb: any = clientFirestoreDb;

    const fetchTotalScrapedCount = async (): Promise<number> => {
      let localCount = loadLocalScrapedQuotes().length;
      let dbCount = 0;
      if (firestoreDb) {
        try {
          const quotesCollection = collection(firestoreDb, "daily_digest_quotes");
          const listSnap = await getDocs(quotesCollection);
          dbCount = listSnap.size;
        } catch (listErr) {
          // ignore
        }
      }
      return Math.max(localCount, dbCount);
    };

    if (cachedDigest && (now - lastDigestFetchTime < DIGEST_CACHE_TTL) && !force) {
      console.log("[WiseFit Server] Returning fresh cached Sanctuary Digest instantly.");
      cachedDigest.totalScrapedCount = await fetchTotalScrapedCount();
      return res.json(cachedDigest);
    }

    if (cachedDigest && !force) {
      console.log("[WiseFit Server] Serving stale cache instantly. Regenerating in background...");
      cachedDigest.totalScrapedCount = await fetchTotalScrapedCount();
      res.json(cachedDigest);

      (async () => {
        try {
          const updated = await performDigestHarvest(firestoreDb, todayStr, false);
          cachedDigest = updated;
          lastDigestFetchTime = Date.now();
          console.log("[WiseFit Server] Background harvest successful. Cache refreshed.");
        } catch (bgErr) {
          console.error("[WiseFit Server] Background harvest failed:", bgErr);
        }
      })();
      return;
    }

    console.log("[WiseFit Server] Cache miss. Performing synchronous Sanctuary Digest harvest...");
    try {
      const data = await performDigestHarvest(firestoreDb, todayStr, force);
      cachedDigest = data;
      lastDigestFetchTime = Date.now();
      return res.json(data);
    } catch (err: any) {
      console.error("[WiseFit Server] Synchronous harvest failed, fallback to local backup:", err);
      const localQuotes = loadLocalScrapedQuotes();
      let quotesToReturn = localQuotes;
      if (quotesToReturn.length === 0) {
        quotesToReturn = FALLBACK_QUOTES.map((q, idx) => ({
          ...q,
          fetchDate: todayStr
        }));
      }

      const count = await fetchTotalScrapedCount();
      const fallbackResult = {
        success: true,
        lastUpdated: todayStr,
        news: FALLBACK_NEWS,
        quotes: quotesToReturn.slice(0, 55),
        totalScrapedCount: count
      };

      cachedDigest = fallbackResult;
      lastDigestFetchTime = Date.now();
      return res.json(fallbackResult);
    }
  });

  // --- INTERPRET DIGEST QUOTE ENDPOINT ---
  app.post("/api/interpret-quote", express.json(), async (req, res) => {
    try {
      const { text, author } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Quote text is required" });
      }

      const geminiKey = getGeminiKey();
      if (!geminiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1beta' });
      const prompt = `You are a wise Stoic mentor. Interpret the following quote in exactly three sentences, drawing on Stoic philosophy, self-discipline, or personal power. Speak directly to a "Seeker" who is pursuing excellence. Do not use conversational padding like "Sure" or "Here is an interpretation". Speak with deep intellectual depth, keep it concise, declarative, and elegant.
      
Quote: "${text}"
Author: ${author || "Unknown"}`;

      const response = await model.generateContent(prompt);
      const outputText = response.response.text().trim();
      res.json({ success: true, interpretation: outputText });
    } catch (e: any) {
      console.error("Interpret Quote Error:", e);
      res.status(500).json({ error: e.message || "Failed to generate interpretation" });
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
    // Disable automatic serving of index.html by express.static so that it falls through to our wildcard route
    app.use(express.static(distPath, { index: false }));
    
    // SPA Fallback for all non-API paths
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      
      const indexPath = path.join(distPath, "index.html");
      const view = req.query.view;
      const articleId = req.query.id as string;
      
      if (view === 'articles' && articleId) {
        try {
          console.log(`[Dynamic OG] Serving dynamic OG tags for article ${articleId}`);
          let html = fs.readFileSync(indexPath, "utf-8");
          
          const projectId = "gen-lang-client-0833207836";
          const firestoreDatabaseId = "ai-studio-4d7e1cec-5733-4ce6-a67d-e27f38f60915";
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents:runQuery`;
          
          const requestBody = {
            structuredQuery: {
              from: [{ collectionId: "articles" }],
              where: {
                fieldFilter: {
                  field: { fieldPath: "id" },
                  op: "EQUAL",
                  value: { stringValue: articleId }
                }
              },
              limit: 1
            }
          };
          
          const response = await axios.post(firestoreUrl, requestBody, { timeout: 3000 });
          const documents = response.data;
          
          if (documents && documents[0] && documents[0].document) {
            const fields = documents[0].document.fields;
            const title = fields.title?.stringValue || "WiseFit Link";
            const content = fields.content?.stringValue || "";
            const videoUrlRaw = fields.url?.stringValue || "";
            
            const dbThumbnail = fields.thumbnailUrl?.stringValue || "";
            const dbExcerpt = fields.excerpt?.stringValue || "";
            
            let description = dbExcerpt || content
              .replace(/[#*`~]/g, '')
              .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
              .trim();
            if (description.length > 200) {
              description = description.substring(0, 200) + "...";
            }
            
            const host = req.get('host') || "wisefit.fun";
            const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
            const absoluteBase = `${protocol}://${host}`;
            
            let videoUrl = videoUrlRaw;
            if (videoUrl && !videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
              videoUrl = `${absoluteBase}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
            }
            
            let imageUrl = dbThumbnail || "https://compcharity.org/wp-content/uploads/2026/04/e0efb5a2-1d04-40b2-b3fa-459dfdab069e_839bb3b2-scaled.jpg";
            if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
              imageUrl = `${absoluteBase}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
            }
            
            const titleEscaped = title.replace(/"/g, '&quot;');
            const descriptionEscaped = description.replace(/"/g, '&quot;');
            const urlEscaped = `${absoluteBase}${req.originalUrl}`.replace(/"/g, '&quot;');
            const imageEscaped = imageUrl.replace(/"/g, '&quot;');
            
            // Replaces patterns
            html = html.replace(/<title>[\s\S]*?<\/title>/gi, `<title>${titleEscaped} - WiseFit</title>`);
            
            // Clean other duplicate meta tags
            html = html.replace(/<meta name="description" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="og:title" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="og:description" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="og:url" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="og:image" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="og:type" content="[^"]*" \/>/gi, '');
            
            html = html.replace(/<meta property="twitter:card" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="twitter:url" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="twitter:title" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="twitter:description" content="[^"]*" \/>/gi, '');
            html = html.replace(/<meta property="twitter:image" content="[^"]*" \/>/gi, '');
            
            let newMeta = `
              <meta name="description" content="${descriptionEscaped}" />
              <meta property="og:title" content="${titleEscaped}" />
              <meta property="og:description" content="${descriptionEscaped}" />
              <meta property="og:url" content="${urlEscaped}" />
              <meta property="og:image" content="${imageEscaped}" />
              <meta property="og:type" content="${videoUrl ? 'video.other' : 'website'}" />
            `;
            
            if (videoUrl) {
              const videoEscaped = videoUrl.replace(/"/g, '&quot;');
              newMeta += `
              <meta property="og:video" content="${videoEscaped}" />
              <meta property="og:video:secure_url" content="${videoEscaped}" />
              <meta property="og:video:type" content="video/mp4" />
              <meta name="twitter:card" content="player" />
              <meta name="twitter:player" content="${videoEscaped}" />
              <meta name="twitter:player:width" content="720" />
              <meta name="twitter:player:height" content="1280" />
              <meta name="twitter:image" content="${imageEscaped}" />
              `;
            } else {
              newMeta += `
              <meta name="twitter:card" content="summary_large_image" />
              <meta name="twitter:title" content="${titleEscaped}" />
              <meta name="twitter:description" content="${descriptionEscaped}" />
              <meta name="twitter:image" content="${imageEscaped}" />
              `;
            }
            
            html = html.replace(/<head>/i, `<head>${newMeta}`);
            return res.send(html);
          }
        } catch (dbErr: any) {
          console.error("[Dynamic OG Database/Network Error]", dbErr.message);
        }
      }
      
      res.sendFile(indexPath, (err) => {
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
    if (clientFirestoreDb) {
      syncLocalQuotesToFirestore(clientFirestoreDb).catch((err: any) => {
        console.error("[WiseFit Sync] Error during startup sync:", err.message || err);
      });
    }
  });
}

startServer().catch(err => {
  console.error("Critical Server Failure:", err);
});
