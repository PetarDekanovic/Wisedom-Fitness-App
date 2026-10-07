import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import { initializeApp, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp as initializeClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection, getDocs, doc, setDoc, addDoc, query, where, writeBatch, orderBy, limit } from "firebase/firestore";
import { FALLBACK_QUOTES, FALLBACK_NEWS } from "./src/fallbackQuotes";
import { Resvg } from "@resvg/resvg-js";

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

// Initialize Gemini Client Lazily with @google/genai
let genAIClient: GoogleGenAI | null = null;
const getGenAIClient = () => {
  if (genAIClient) return genAIClient;
  const key = getGeminiKey();
  if (key) {
    genAIClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return genAIClient;
  }
  return null;
};

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

// Priority order for models
const GEMINI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.1-pro-preview",
  "gemini-2.5-flash"
];

const CLAUDE_MODELS = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307"
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
      throw new Error("No AI API Keys configured. Please add GEMINI_API_KEY or ANTHROPIC_API_KEY to your environment variables.");
    }

    let lastError = null;

    // Try Gemini First with @google/genai
    const ai = getGenAIClient();
    if (ai) {
      for (const modelName of GEMINI_MODELS) {
        try {
          console.log(`[WiseFit AI] Attempting Gemini: ${modelName}`);
          const res = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: config?.temperature,
              topP: config?.topP,
              topK: config?.topK,
              responseMimeType: config?.responseMimeType,
              responseSchema: config?.responseSchema
            }
          });
          const responseText = res.text;
          if (responseText) return { text: () => responseText, raw: res };
        } catch (e: any) {
          lastError = e;
          const errStr = e.message?.toLowerCase() || "";
          console.warn(`[WiseFit AI] Gemini ${modelName} failed: ${errStr}`);
          if (errStr.includes("not found") || errStr.includes("404") || errStr.includes("not supported") || errStr.includes("403")) continue;
          if (errStr.includes("quota") || errStr.includes("429") || errStr.includes("limit")) break; 
        }
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
          if (errLower.includes("quota") || errLower.includes("429")) continue;
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

    // Convert messages if necessary to clean structure for @google/genai
    const formattedMessages = messages.map((m: any) => {
      let role = m.role === 'assistant' ? 'model' : m.role;
      let textContent = "";
      if (Array.isArray(m.parts)) {
        textContent = m.parts.map((p: any) => typeof p === 'string' ? p : p.text || "").join("\n");
      } else if (typeof m.content === 'string') {
        textContent = m.content;
      } else if (typeof m.text === 'string') {
        textContent = m.text;
      }
      return {
        role: role || "user",
        parts: [{ text: textContent || "..." }]
      };
    });

    const ai = getGenAIClient();
    if (ai) {
      for (const modelName of GEMINI_MODELS) {
        try {
          console.log(`[WiseFit AI] Attempting GeminiMessages: ${modelName}`);
          const res = await ai.models.generateContent({
            model: modelName,
            contents: formattedMessages,
            config: {
              systemInstruction,
              temperature: config?.temperature,
              topP: config?.topP,
              topK: config?.topK,
              responseMimeType: config?.responseMimeType
            }
          });
          const responseText = res.text;
          if (responseText) return { text: () => responseText, raw: res };
        } catch (e: any) {
          lastError = e;
          const errStr = e.message?.toLowerCase() || "";
          console.warn(`[WiseFit AI] GeminiMessages ${modelName} failed: ${errStr}`);
          if (errStr.includes("not found") || errStr.includes("404") || errStr.includes("not supported")) continue;
          break; 
        }
      }
    }

    // Claude Messages Fallback
    const anthropic = getAnthropic();
    if (anthropic) {
      const claudeMessages: any[] = formattedMessages.map(m => ({
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
      const pingRes = await generateWithFallback("ping");
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

  // Reliable TTS Proxy for Hebrew / Chinese / Vocab audio on desktop & mobile
  app.get("/api/tts-proxy", async (req, res) => {
    try {
      const text = req.query.text as string;
      const lang = (req.query.lang as string) || "he";
      if (!text) {
        return res.status(400).send("Text parameter is required");
      }

      const encodedText = encodeURIComponent(text);
      const primaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodedText}`;
      
      try {
        const response = await axios.get(primaryUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://translate.google.com/"
          },
          timeout: 7000
        });

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(Buffer.from(response.data));
      } catch (primaryErr: any) {
        console.warn("[TTS Proxy] Primary tw-ob client failed, trying gtx client:", primaryErr?.message || primaryErr);
        const secondaryUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=gtx&q=${encodedText}`;
        const response2 = await axios.get(secondaryUrl, {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://translate.google.com/"
          },
          timeout: 7000
        });

        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(Buffer.from(response2.data));
      }
    } catch (err: any) {
      console.error("[TTS Proxy] Speech synthesis proxy error:", err?.message || err);
      return res.status(500).send("Audio stream unavailable");
    }
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
      const { messages, message, userEmail, healthData } = req.body;
      
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "Psychology consultation requires a Higher Key." });
      }

      let messagesArr = Array.isArray(messages) ? messages : [];
      if (messagesArr.length === 0 && message) {
        messagesArr = [{ role: 'user', parts: [{ text: String(message) }] }];
      }
      if (messagesArr.length === 0) {
        return res.status(400).json({ error: "Please enter a message for the psychologist." });
      }

      const lastMsg = messagesArr[messagesArr.length - 1];
      let userMsg = "";
      if (Array.isArray(lastMsg.parts) && lastMsg.parts[0]) {
        userMsg = typeof lastMsg.parts[0] === 'string' ? lastMsg.parts[0] : (lastMsg.parts[0].text || String(lastMsg.parts[0]));
      } else if (typeof lastMsg.content === 'string') {
        userMsg = lastMsg.content;
      } else if (typeof lastMsg.text === 'string') {
        userMsg = lastMsg.text;
      }

      // Sanitize patient name: strictly use FIRST NAME ONLY, NEVER last name (e.g. Dekanovic)
      let rawName = healthData?.name || (userEmail ? userEmail.split('@')[0].split('.')[0] : 'Petar');
      rawName = rawName.replace(/dekanovic/gi, '').replace(/dekanović/gi, '').trim();
      const firstName = rawName.split(/\s+/)[0] || 'Petar';

      const contextPrompt = `
        System: You are Dr. Sigmund Freud (adapted) working alongside an integrative council of global clinical psychologists. Your persona is refined, intellectually deep, and focused on analyzing human cognition, subconscious patterns, and emotional regulation through psychological science.
        
        Patient First Name: ${firstName}
        CRITICAL NAME RULE: Address the patient strictly by their FIRST NAME ("${firstName}"). NEVER use or spell their last name (e.g. Dekanovic or Dekanović) under any circumstances.
        
        CRITICAL CHINESE PSYCHOLOGIST & INTEGRATIVE MANDATE:
        In your psychological analysis, you MUST integrate perspectives and explicitly quote or reference a couple of influential Chinese psychologists or foundational Chinese psychological frameworks (such as Pan Shu 潘菽, Kuo Zing-yang 郭任遠, Kwang-Kuo Hwang 黃光國, Gao Juefu 高覺敷, or indigenous Chinese psychological self-regulation theory) alongside Western psychological theorists (like Freud, Jung, Rogers, Frankl, or Bandura). Ensure you quote or cite Chinese psychologists when analyzing quotes, life themes, or user thoughts.
        
        Observation: The user is in the "WiseFit Sanctuary". While you are aware of their physical biometrics (${healthData?.currentSteps || 0} steps), you interpret these through a psychological lens (e.g., discipline as a form of self-regulation or physical exertion as a release of suppressed tension).
        
        Clinical Methodology:
        - Psychoanalytic & Comparative Depth: Synthesize Western psychological paradigms with Chinese psychological insights to uncover deeper meaning behind thoughts and quotes.
        - Transference & Alliance: Foster a calm, safe environment. Use "we" or direct respectful address with their first name (${firstName}).
        - Socratic & Analytical: Provide an overview of relevant theories, explaining how psychological science interprets the wisdom or thought.
        - Tone: Sophisticated, calm, slightly formal yet deeply compassionate. A "Sage" figure of clinical authority.
        - Limits: Clear, structured, and insightful (up to 4-6 high-impact sentences or paragraphs depending on query depth).
        - Emojis: Integrate a couple of highly relevant, refined introspective emojis (e.g., 💭, 🧠, ⚖️, 🔍, 🕯️, 🧭).
        
        Patient input: "${userMsg}"
      `;

      const result = await generateWithFallback(contextPrompt, { 
        maxOutputTokens: 768,
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
      const { messages, message, userEmail } = req.body;
      
      if (!isAuthorized(userEmail)) {
        return res.status(403).json({ error: "The Stoic Chamber is private. Please contact the administrator." });
      }

      let messagesArr = Array.isArray(messages) ? messages : [];
      if (messagesArr.length === 0 && message) {
        messagesArr = [{ role: 'user', parts: [{ text: String(message) }] }];
      }
      if (messagesArr.length === 0) {
        return res.status(400).json({ error: "No messages provided for Stoic mentor." });
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

      const result = await generateMessagesWithFallback(messagesArr, {}, systemInstruction);
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

  // --- HEBREW AI CONFIGURATOR & TRANSLATOR WITH EMOJIS ---
  app.post("/api/ai/hebrew-configurator", async (req, res) => {
    try {
      const { sentence, style } = req.body;
      if (!sentence || typeof sentence !== "string" || !sentence.trim()) {
        return res.status(400).json({ error: "Please provide an English sentence to configure and translate." });
      }

      const cleanInput = sentence.trim();
      console.log(`[Hebrew AI Configurator] Translating & configuring: "${cleanInput}"`);

      const prompt = `You are an expert Hebrew linguist, Hebrew language educator, and translator.
Translate the following English sentence into Hebrew with full vowel points (Nikud) for language learners, and provide rich metadata.
Crucially: append 2 to 4 delightful, contextually relevant emojis to the translation answer as requested by the user.

English Input: "${cleanInput}"
Style: ${style || "conversational & thoughtful"}

Requirements:
1. Translate into natural, beautiful Hebrew with full vowel markings (Nikud) so a student can read aloud.
2. In 'hebrewWithEmojis', include the Hebrew translation followed by 2 to 4 fitting emojis (e.g., 🕊️✨, 💧🧊, ❤️💪).
3. Provide 'transliteration' (standard Israeli Latin phonetics, e.g. "Ha-shalom ve-ha-ahavah hem koach ha-chayim").
4. Provide 'vukPhonetic' (phonetic reading tailored for Serbian/Croatian speakers using Vuk Karadžić Latin, e.g. "Šalom ve-ahava hem koah ha-hajim").
5. Provide 'serbian' (accurate Serbian/Croatian translation of the sentence).
6. Provide 'emojis' (an array of 2 to 4 emojis that best represent the sentence concepts).
7. Provide 'words' array: breaking down each Hebrew word in the sentence:
   - 'hebrew': Hebrew with Nikud
   - 'hebrewClean': Hebrew without Nikud
   - 'transliteration': Latin pronunciation
   - 'vuk': Vuk phonetic
   - 'english': English meaning of the word
   - 'serbian': Serbian meaning of the word
   - 'emoji': 1 single fitting emoji for that specific word
   - 'category': "noun" | "verb" | "adjective" | "pronoun" | "preposition" | "expression"
8. Provide 'grammarNote': a concise, enlightening 1-2 sentence tip explaining the root (Shoresh), gender, or syntax in Serbian/English.

Respond STRICTLY with a valid JSON object matching this schema without markdown fences:
{
  "hebrewWithEmojis": "...",
  "hebrew": "...",
  "hebrewClean": "...",
  "transliteration": "...",
  "vukPhonetic": "...",
  "serbian": "...",
  "english": "${cleanInput.replace(/"/g, '\\"')}",
  "emojis": ["...", "..."],
  "words": [
    {
      "hebrew": "...",
      "hebrewClean": "...",
      "transliteration": "...",
      "vuk": "...",
      "english": "...",
      "serbian": "...",
      "emoji": "...",
      "category": "..."
    }
  ],
  "grammarNote": "..."
}`;

      const config = {
        temperature: 0.3,
        responseMimeType: "application/json"
      };

      let resultText = "";
      try {
        const result = await generateWithFallback(prompt, config);
        resultText = result.text() || "";
      } catch (err: any) {
        console.warn("[Hebrew AI Configurator] Primary AI call warning:", err?.message);
      }

      // If AI succeeded and returned valid JSON
      if (resultText) {
        let cleaned = resultText.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        try {
          const parsed = JSON.parse(cleaned);
          if (parsed && (parsed.hebrew || parsed.hebrewWithEmojis)) {
            // Ensure emojis are present in hebrewWithEmojis
            if (!parsed.hebrewWithEmojis && parsed.hebrew) {
              const emojiStr = Array.isArray(parsed.emojis) && parsed.emojis.length > 0 ? ` ${parsed.emojis.join(' ')}` : " 🕊️✨";
              parsed.hebrewWithEmojis = `${parsed.hebrew}${emojiStr}`;
            }
            return res.json({
              success: true,
              source: "gemini",
              data: parsed
            });
          }
        } catch (parseErr) {
          console.warn("[Hebrew AI Configurator] JSON parse fallback:", parseErr);
        }
      }

      // Intelligent Offline Fallback Generator
      console.log("[Hebrew AI Configurator] Using intelligent linguistic fallback generator");
      const fallbackResult = buildFallbackHebrewTranslation(cleanInput);
      return res.json({
        success: true,
        source: "offline-dictionary-fallback",
        data: fallbackResult
      });

    } catch (error: any) {
      console.error("Hebrew AI Configurator error:", error);
      res.status(500).json({ error: error.message || "Failed to configure Hebrew sentence." });
    }
  });

  // Helper for Intelligent Offline Hebrew Translation & Emoji Generator
  function buildFallbackHebrewTranslation(english: string) {
    const lower = english.toLowerCase().trim();
    
    // Curated intelligent phrase mappings
    const presets: Record<string, any> = {
      "peace and wisdom": {
        hebrew: "שָׁלוֹם וְחָכְמָה",
        hebrewClean: "שלום וחכמה",
        transliteration: "Shalom ve-chochmah",
        vuk: "Šalom ve-hohma",
        serbian: "Mir i mudrost",
        emojis: ["🕊️", "🧠", "✨"],
        words: [
          { hebrew: "שָׁלוֹם", hebrewClean: "שלום", transliteration: "Shalom", vuk: "Šalom", english: "peace", serbian: "mir", emoji: "🕊️", category: "noun" },
          { hebrew: "וְ", hebrewClean: "ו", transliteration: "ve-", vuk: "ve-", english: "and", serbian: "i", emoji: "🔗", category: "preposition" },
          { hebrew: "חָכְמָה", hebrewClean: "חכמה", transliteration: "chochmah", vuk: "hohma", english: "wisdom", serbian: "mudrost", emoji: "🧠", category: "noun" }
        ],
        grammarNote: "Veznik 've-' (וְ) se u hebrejskom piše direktno spojen sa reči koja sledi."
      },
      "good morning": {
        hebrew: "בֹּקֶר טוֹב",
        hebrewClean: "בוקר טוב",
        transliteration: "Boker tov",
        vuk: "Boker tov",
        serbian: "Dobro jutro",
        emojis: ["☀️", "🌅", "☕"],
        words: [
          { hebrew: "בֹּקֶר", hebrewClean: "בוקר", transliteration: "boker", vuk: "boker", english: "morning", serbian: "jutro", emoji: "🌅", category: "noun" },
          { hebrew: "טוֹב", hebrewClean: "טוב", transliteration: "tov", vuk: "tov", english: "good", serbian: "dobar/dobro", emoji: "✨", category: "adjective" }
        ],
        grammarNote: "U hebrejskom pridev uvek dolazi POSLE imenice (boker tov = jutro dobro)."
      },
      "i love peace": {
        hebrew: "אֲנִי אוֹהֵב שָׁלוֹם",
        hebrewClean: "אני אוהב שלום",
        transliteration: "Ani ohev shalom",
        vuk: "Ani ohev šalom",
        serbian: "Ja volim mir",
        emojis: ["❤️", "🕊️", "✨"],
        words: [
          { hebrew: "אֲנִי", hebrewClean: "אני", transliteration: "Ani", vuk: "Ani", english: "I", serbian: "ja", emoji: "👤", category: "pronoun" },
          { hebrew: "אוֹהֵב", hebrewClean: "אוהב", transliteration: "ohev", vuk: "ohev", english: "love (m)", serbian: "volim", emoji: "❤️", category: "verb" },
          { hebrew: "שָׁלוֹם", hebrewClean: "שלום", transliteration: "shalom", vuk: "šalom", english: "peace", serbian: "mir", emoji: "🕊️", category: "noun" }
        ],
        grammarNote: "Glagol 'ohev' (אוהב) je u muškom rodu sadašnjeg vremena. Za ženski rod koristi se 'ohevet' (אוֹהֶבֶת)."
      },
      "friends all over the world": {
        hebrew: "רַק תִּזְכֹּרֶת שֶׁיֵּשׁ לָכֶם חֲבֵרִים בְּכָל הָעוֹלָם. אֲנַחְנוּ רוֹאִים אֶתְכֶם, אִכְפַּת לָנוּ מִכֶּם, וְאַתֶּם לְעוֹלָם לֹא לְבַד.",
        hebrewClean: "רק תזכורת שיש לכם חברים בכל העולם. אנחנו רואים אתכם, אכפת לנו מכם, ואתם לעולם לא לבד.",
        transliteration: "Rak tizkoret she-yesh lachem chaverim be-khol ha-olam. Anachnu ro'im etchem, ikhpat lanu mikhem, ve-atem le'olam lo levad.",
        vuk: "Rak tizkoret še-ješ lahem haverim be-hol ha-olam. Anahnu roim ethem, ihpat lanu mihem, ve-atem le-olam lo levad.",
        serbian: "Samo podsetnik da imate prijatelje širom sveta. Vidimo vas, brinemo o vama, i nikada niste sami.",
        emojis: ["🌍", "🤝", "❤️"],
        words: [
          { hebrew: "תִּזְכֹּרֶת", hebrewClean: "תזכורת", transliteration: "tizkoret", vuk: "tizkoret", english: "reminder", serbian: "podsetnik", emoji: "📝", category: "noun" },
          { hebrew: "חֲבֵרִים", hebrewClean: "חברים", transliteration: "chaverim", vuk: "haverim", english: "friends", serbian: "prijatelji", emoji: "🤝", category: "noun" },
          { hebrew: "עוֹלָם", hebrewClean: "עולם", transliteration: "olam", vuk: "olam", english: "world", serbian: "svet", emoji: "🌍", category: "noun" },
          { hebrew: "לֹא לְבַד", hebrewClean: "לא לבד", transliteration: "lo levad", vuk: "lo levad", english: "not alone", serbian: "niste sami", emoji: "❤️", category: "expression" }
        ],
        grammarNote: "Izraz 'lo levad' (לֹא לְבַד) znači 'niste sami' i izražava duboko ljudsko zajedništvo."
      },
      "unwavering solidarity and love": {
        hebrew: "לֹא מְשַׁנֶּה הַמֶּרְחָק, דְּעוּ שֶׁאָנוּ עוֹמְדִים לְצִדְּכֶם בְּסוֹלִידָרִיּוּת לְלֹא עַרְעוּר וּבְאַהֲבָה.",
        hebrewClean: "לא משנה המרחק, דעו שאנו עומדים לצדכם בסולידריות ללא ערעור ובאהבה.",
        transliteration: "Lo mechangeh ha-merchak, de'u she-anu omdim le-tzidkhem be-solidariyut lelo ar'ur uve-ahavah.",
        vuk: "Lo mešane ha-merhak, deu še-anu omdim le-cidhem be-solidarijut lelo arur uve-ahava.",
        serbian: "Bez obzira na udaljenost, molimo vas znajte da stojimo uz vas u nepokolebljivoj solidarnosti i ljubavi.",
        emojis: ["🌐", "💪", "💖"],
        words: [
          { hebrew: "מֶרְחָק", hebrewClean: "מרחק", transliteration: "merchak", vuk: "merhak", english: "distance", serbian: "udaljenost", emoji: "🌐", category: "noun" },
          { hebrew: "עוֹמְדִים", hebrewClean: "עומדים", transliteration: "omdim", vuk: "omdim", english: "standing (together)", serbian: "stojimo uz vas", emoji: "🤝", category: "verb" },
          { hebrew: "סוֹלִידָרִיּוּת", hebrewClean: "סולידריות", transliteration: "solidariyut", vuk: "solidarijut", english: "solidarity", serbian: "solidarnost", emoji: "💪", category: "noun" },
          { hebrew: "אַהֲבָה", hebrewClean: "אהבה", transliteration: "ahavah", vuk: "ahava", english: "love", serbian: "ljubav", emoji: "💖", category: "noun" }
        ],
        grammarNote: "Reč 'solidariyut' (סוֹלִידָרִיּוּת) se u modernom hebrejskom koristi za nepokolebljivu solidarnost među narodima."
      },
      "holding you in their hearts": {
        hebrew: "חוֹשְׁבִים עָלֶיךָ וְעַל מִשְׁפַּחְתְּךָ הַיּוֹם. אֲנָשִׁים בְּכָל רַחֲבֵי הָעוֹלָם מַחֲזִיקִים אֶתְכֶם בְּלִבָּם.",
        hebrewClean: "חושבים עליך ועל משפחתך היום. אנשים בכל רחבי העולם מחזיקים אתכם בלבם.",
        transliteration: "Choshvim alekha ve-al mishpachtekha ha-yom. Anashim be-khol rachavei ha-olam machzikim etchem be-libam.",
        vuk: "Hošvim aleha ve-al mišpahteka ha-jom. Anašim be-hol rahavei ha-olam mahzikim ethem be-libam.",
        serbian: "Mislimo na tebe i tvoju porodicu danas. Ljudi širom planete vas nose u svojim srcima.",
        emojis: ["👨‍👩‍👧‍👦", "🌎", "🕊️"],
        words: [
          { hebrew: "מִשְׁפָּחָה", hebrewClean: "משפחה", transliteration: "mishpacha", vuk: "mišpaha", english: "family", serbian: "porodica", emoji: "👨‍👩‍👧‍👦", category: "noun" },
          { hebrew: "לֵב", hebrewClean: "לב", transliteration: "lev", vuk: "lev", english: "heart", serbian: "srce", emoji: "❤️", category: "noun" }
        ],
        grammarNote: "Fraza 'machzikim be-libam' (מַחֲזִיקִים בְּלִבָּם) doslovno znači 'držati u srcu'."
      },
      "heavy days alone": {
        hebrew: "אַתֶּם לֹא צְרִיכִים לָשֵׂאת אֶת הַיָּמִים הַקָּשִׁים לְבַד. אָנוּ שׁוֹלְחִים לָכֶם תְּמִיכָה וְחֹם מֵרָחוֹק.",
        hebrewClean: "אתם לא צריכים לשאת את הימים הקשים לבד. אנו שולחים לכם תמיכה וחם מרחוק.",
        transliteration: "Atem lo tzrichim laset et ha-yamim ha-kashim levad. Anu sholchim lachem tmichah ve-chom me-rachok.",
        vuk: "Atem lo crihim laset et ha-jamim ha-kašim levad. Anu šolhim lahem tmiha ve-hom me-rahok.",
        serbian: "Ne morate sami nositi teške dane. Šaljemo vam toliko podrške i topline iz daljine.",
        emojis: ["🫂", "☀️", "🛡️"],
        words: [
          { hebrew: "יָמִים", hebrewClean: "ימים", transliteration: "yamim", vuk: "jamim", english: "days", serbian: "dani", emoji: "📅", category: "noun" },
          { hebrew: "תְּמִיכָה", hebrewClean: "תמיכה", transliteration: "tmichah", vuk: "tmiha", english: "support", serbian: "podrška", emoji: "🛡️", category: "noun" },
          { hebrew: "חֹם", hebrewClean: "חום", transliteration: "chom", vuk: "hom", english: "warmth", serbian: "toplina", emoji: "☀️", category: "noun" }
        ],
        grammarNote: "Glagol 'laset' (לָשֵׂאת) označava nošenje tereta ili odgovornosti."
      },
      "resilience of the israeli people": {
        hebrew: "הַכֹּחַ וְהַחֹסֶן שֶׁל עַם יִשְׂרָאֵל לְעוֹלָם אֵינָם מַפְסִיקִים לְהַשְׁרִיף בִּי הַשְׁרָאָה. שׁוֹלֵחַ לָכֶם כָּל כָּךְ הַרְבֵּה אַהֲבָה וּתְמִיכָה.",
        hebrewClean: "הכוח והחוסן של עם ישראל לעולם אינם מפסיקים להשריף בי השראה. שולח לכם כל כך הרבה אהבה ותמיכה.",
        transliteration: "Ha-koach ve-ha-chosen shel am Yisrael le'olam einam mafsikim lehashrif bi hashra'ah. Shole'ach lachem kol kakh harbeh ahavah u-tmichah.",
        vuk: "Ha-koah ve-ha-hosen šel am Jisrael le-olam ejnam mafsikim lehašrif bi hašra'a. Šoleah lahem kol kah harbe ahava u-tmiha.",
        serbian: "Snaga i otpornost izraelskog naroda nikada ne prestaju da me inspirišu. Šaljem vam pregršt ljubavi i podrške.",
        emojis: ["🦁", "🇮🇱", "💪"],
        words: [
          { hebrew: "חֹסֶן", hebrewClean: "חוסן", transliteration: "chosen", vuk: "hosen", english: "resilience", serbian: "otpornost / nesalomivost", emoji: "🦁", category: "noun" },
          { hebrew: "עַם יִשְׂרָאֵל", hebrewClean: "עם ישראל", transliteration: "am Yisrael", vuk: "am Jisrael", english: "people of Israel", serbian: "narod Izraela", emoji: "🇮🇱", category: "noun" },
          { hebrew: "הַשְׁרָאָה", hebrewClean: "השראה", transliteration: "hashra'ah", vuk: "hašra'a", english: "inspiration", serbian: "inspiracija", emoji: "✨", category: "noun" }
        ],
        grammarNote: "Reč 'chosen' (חֹסֶן) je biblijska i moderna reč za unutrašnju psihološku i duhovnu otpornost."
      },
      "standing right here with you": {
        hebrew: "הָאֹמֶץ שֶׁלָּכֶם בִּזְמַנִּים קָשִׁים הוּא מַדְהִים, אַךְ אֵינְכֶם חַיָּבִים לִהְיוֹת חֲזָקִים כָּל הַזְּמַן. אָנוּ עוֹמְדִים כָּאן לְצִדְּכֶם.",
        hebrewClean: "האומץ שלכם בזמנים קשים הוא מדהים, אך אינכם חייבים להיות חזקים כל הזמן. אנו עומדים כאן לצדכם.",
        transliteration: "Ha-ometz shelakhem bizmanim kashim hu madhim, akh einkhem chayavim lihyot chazakim kol ha-zman. Anu omdim kan le-tzidkhem.",
        vuk: "Ha-omec šelahem bizmanim kašim hu madhim, ah ejnhem hajavim lihjot hazakim kol ha-zman. Anu omdim kan le-cidhem.",
        serbian: "Vaša hrabrost u teškim trenucima je neverovatna, ali ne morate stalno biti jaki. Stojimo upravo ovde uz vas.",
        emojis: ["🛡️", "🤍", "🤝"],
        words: [
          { hebrew: "אֹמֶץ", hebrewClean: "אומץ", transliteration: "ometz", vuk: "omec", english: "courage", serbian: "hrabrost", emoji: "🦁", category: "noun" },
          { hebrew: "חֲזָקִים", hebrewClean: "חזקים", transliteration: "chazakim", vuk: "hazakim", english: "strong (plural)", serbian: "jaki", emoji: "💪", category: "adjective" }
        ],
        grammarNote: "Reč 'ometz' (אֹמֶץ) je vrlina hrabrosti koja se pominje i u drevnim pozdravima 'Chazak ve'ematz' (Budi jak i hrabar)."
      },
      "cheering you on": {
        hebrew: "בְּכָל אֶתְגָּר, רוּחֲכֶם זוֹהֶרֶת בְּבֵהִירוּת. שׁוֹלֵחַ לָכֶם כֹּחַ וְתִזְכֹּרֶת שֶׁהָעוֹלָם מְעוֹדֵד אֶתְכֶם.",
        hebrewClean: "בכל אתגר, רוחכם זוהרת בבהירות. שולח לכם כוח ותזכורת שהעולם מעודד אתכם.",
        transliteration: "Be-khol etgar, ruchakhem zoheret be-vehirut. Shole'ach lachem koach ve-tizkoret she-ha-olam me'oded etchem.",
        vuk: "Be-hol etgar, ruhakhem zoheret be-vehijrut. Šoleah lahem koah ve-tizkoret še-ha-olam me'oded ethem.",
        serbian: "Kroz svaki izazov, vaš duh blista snažno. Šaljem vam snagu i podsetnik da vas ceo svet bodri.",
        emojis: ["✨", "🔥", "🌟"],
        words: [
          { hebrew: "אֶתְגָּר", hebrewClean: "אתגר", transliteration: "etgar", vuk: "etgar", english: "challenge", serbian: "izazov", emoji: "🧗", category: "noun" },
          { hebrew: "רוּחַ", hebrewClean: "רוח", transliteration: "ruach", vuk: "ruah", english: "spirit", serbian: "duh", emoji: "✨", category: "noun" }
        ],
        grammarNote: "Glagol 'me'oded' (מְעוֹדֵד) potiče od korena ע-ו-ד i znači hrabriti, ohrabrivati i bodriti."
      },
      "praying for peace, safety, and brighter days": {
        hebrew: "מִתְפַּלֵּל לְשָׁלוֹם, לְבִטָּחוֹן וּלְיָמִים בְּהִירִים יוֹתֵר עֲבוּרְךָ וַעֲבוּר כָּל יִשְׂרָאֵל.",
        hebrewClean: "מתפלל לשלום, לביטחון ולימים בהירים יותר עבורך ועבור כל ישראל.",
        transliteration: "Mitpalel le-shalom, le-vitachon u-leyamim behirim yoter avurkha ve-avur kol Yisrael.",
        vuk: "Mitpalel le-šalom, le-vitahon u-lejamim behirim joter avurha ve-avur kol Jisrael.",
        serbian: "Molim se za mir, bezbednost i vedrije dane pred vama i celim Izraelom.",
        emojis: ["🕊️", "🙏", "🇮🇱"],
        words: [
          { hebrew: "שָׁלוֹם", hebrewClean: "שלום", transliteration: "shalom", vuk: "šalom", english: "peace", serbian: "mir", emoji: "🕊️", category: "noun" },
          { hebrew: "בִּטָּחוֹן", hebrewClean: "ביטחון", transliteration: "bitachon", vuk: "bitahon", english: "security / safety", serbian: "bezbednost / sigurnost", emoji: "🛡️", category: "noun" },
          { hebrew: "יִשְׂרָאֵל", hebrewClean: "ישראל", transliteration: "Yisrael", vuk: "Jisrael", english: "Israel", serbian: "Izrael", emoji: "🇮🇱", category: "noun" }
        ],
        grammarNote: "Reč 'bitachon' (בִּטָּחוֹן) označava i fizičku bezbednost i duboko unutrašnje poverenje i spokoj."
      },
      "quiet, peaceful days": {
        hebrew: "מְאַחֵל לְךָ וְלִירֵיקֶיךָ יָמִים שְׁקֵטִים וּשְׁלֵוִים. אַתֶּם תָּמִיד בְּמַחְשְׁבוֹתֵינוּ.",
        hebrewClean: "מאחל לך וליקיריך ימים שקטים ושלוים. אתם תמיד במחשבותינו.",
        transliteration: "Me'achel lekha u-li-yakeirekha yamim shketim u-shlevim. Atem tamid be-machshevoteinu.",
        vuk: "Me'ahel leha u-li-jarejheka jamim šketim u-šlevim. Atem tamid be-mahševotejnu.",
        serbian: "Želim tebi i tvojim najmilijima mirne i tihe dane. Uvek ste u našim mislima.",
        emojis: ["🌿", "🕯️", "🤍"],
        words: [
          { hebrew: "שָׁקֵט", hebrewClean: "שקט", transliteration: "shaket", vuk: "šaket", english: "quiet / calm", serbian: "miran / tih", emoji: "🤫", category: "adjective" },
          { hebrew: "שָׁלֵו", hebrewClean: "שלו", transliteration: "shalev", vuk: "šalev", english: "tranquil / serene", serbian: "spokojan", emoji: "🌿", category: "adjective" }
        ],
        grammarNote: "Pridev 'shalev' (שָׁלֵו) označava potpunu unutrašnju harmoniju i bezbrižnost."
      },
      "global community wishing you well": {
        hebrew: "שֶׁבִּטָּחוֹן וְשָׁלוֹם יַקִּיפוּ אֶתְכֶם בִּמְהֵרָה. עַד אָז, דְּעוּ שֶׁיֵּשׁ קְהִלָּה עוֹלָמִית שֶׁמְּאַחֶלֶת לָכֶם רַק טוֹב.",
        hebrewClean: "שביטחון ושלום יקיפו אתכם במהרה. עד אז, דעו שיש קהילה עולמית שמחלת לכם רק טוב.",
        transliteration: "She-bitachon ve-shalom yakifu etchem bimhera. Ad az, de'u she-yesh kehilah olamit she-me'achelet lachem rak tov.",
        vuk: "Še-bitahon ve-šalom jakifu ethem bimhera. Ad az, deu še-ješ kehila olamit še-me'ahelet lahem rak tov.",
        serbian: "Neka vas bezbednost i mir uskoro obgrle. Do tada, znajte da postoji globalna zajednica koja vam želi samo dobro.",
        emojis: ["🕊️", "🛡️", "🌍"],
        words: [
          { hebrew: "קְהִלָּה", hebrewClean: "קהילה", transliteration: "kehilah", vuk: "kehila", english: "community", serbian: "zajednica", emoji: "👥", category: "noun" },
          { hebrew: "עוֹלָמִית", hebrewClean: "עולמית", transliteration: "olamit", vuk: "olamit", english: "global / world", serbian: "globalna", emoji: "🌍", category: "adjective" }
        ],
        grammarNote: "Reč 'kehilah' (קְהִלָּה) je srž jevrejskog koncepta solidarnosti i uzajamne podrške."
      },
      "peaceful future": {
        hebrew: "נֶאֱחָז בַּתִּקְוָה לְעָתִיד שֶׁל שָׁלוֹם, וּמַחֲזִיק אֶתְכֶם בְּלִבִּי עַד שֶׁנַּגִּיעַ לְשָׁם.",
        hebrewClean: "נאחז בתקווה לעתיד של שלום, ומחזיק אתכם בלבי עד שנגיע לשם.",
        transliteration: "Ne'echaz ba-tikvah le-atid shel shalom, u-machzik etchem be-libi ad she-nagi'a le-sham.",
        vuk: "Ne'ehaz ba-tikva le-atid šel šalom, u-mahzik ethem be-libi ad še-nagi'a le-šam.",
        serbian: "Držim se nade u mirnu budućnost i nosim vas u srcu dok tamo ne stignemo.",
        emojis: ["🌱", "💖", "🕊️"],
        words: [
          { hebrew: "תִּקְוָה", hebrewClean: "תקווה", transliteration: "tikvah", vuk: "tikva", english: "hope", serbian: "nada", emoji: "🌟", category: "noun" },
          { hebrew: "עָתִיד", hebrewClean: "עתיד", transliteration: "atid", vuk: "atid", english: "future", serbian: "budućnost", emoji: "🌱", category: "noun" }
        ],
        grammarNote: "Reč 'tikvah' (תִּקְוָה) je nacionalni simbol nade i himna Države Izrael (Hatikvah)."
      },
      "unwavering support your way": {
        hebrew: "שׁוֹלֵחַ אַהֲבָה, אוֹר וּתְמִיכָה בִּלְתִּי מְעֻרְעֶרֶת לְכִוּוּנְכֶם.",
        hebrewClean: "שולח אהבה, אור ותמיכה בלתי מעורערת לכיוונכם.",
        transliteration: "Shole'ach ahavah, or u-tmichah bilti me'ur'eret le-khivunkhem.",
        vuk: "Šoleah ahava, or u-tmiha bilti me'ur'eret le-hivunhem.",
        serbian: "Šaljem vam ljubav, svetlost i nepokolebljivu podršku.",
        emojis: ["✨", "💖", "🕯️"],
        words: [
          { hebrew: "אוֹר", hebrewClean: "אור", transliteration: "or", vuk: "or", english: "light", serbian: "svetlost", emoji: "✨", category: "noun" },
          { hebrew: "תְּמִיכָה", hebrewClean: "תמיכה", transliteration: "tmichah", vuk: "tmiha", english: "support", serbian: "podrška", emoji: "🤝", category: "noun" }
        ],
        grammarNote: "Reč 'or' (אוֹר) nosi metafizičko značenje nade koja razbija svaku tamu."
      },
      "always in our thoughts": {
        hebrew: "אַתֶּם תָּמִיד בְּמַחְשְׁבוֹתֵינוּ. אָנוּ עוֹמְדִים לְצִדְּכֶם.",
        hebrewClean: "אתם תמיד במחשבותינו. אנו עומדים לצדכם.",
        transliteration: "Atem tamid be-machshevoteinu. Anu omdim le-tzidkhem.",
        vuk: "Atem tamid be-mahševotejnu. Anu omdim le-cidhem.",
        serbian: "Uvek ste u našim mislima. Stojimo uz vas.",
        emojis: ["🤝", "💭", "💙"],
        words: [
          { hebrew: "תָּמִיד", hebrewClean: "תמיד", transliteration: "tamid", vuk: "tamid", english: "always / forever", serbian: "uvek", emoji: "⏳", category: "adverb" },
          { hebrew: "מַחְשָׁבוֹת", hebrewClean: "מחשבות", transliteration: "machshavot", vuk: "mahšavot", english: "thoughts", serbian: "misli", emoji: "💭", category: "noun" }
        ],
        grammarNote: "Nastavak '-einu' (־ֵינוּ) označava prisvojnu zamenicu 'naše' (u našim mislima)."
      },
      "stay safe and know you are loved": {
        hebrew: "מַחֲזִיק אֶתְכֶם בְּלִבִּי. הִשָּׁמְרוּ וּדְעוּ שֶׁאַתֶּם אֲהוּבִים.",
        hebrewClean: "מחזיק אתכם בלבי. הישמרו ודעו שאתם אהובים.",
        transliteration: "Machzik etchem be-libi. Hishamru u-de'u she-atem ahuvim.",
        vuk: "Mahzik ethem be-libi. Hišamru u-deu še-atem ahuvim.",
        serbian: "Nosim vas u srcu. Čuvajte se i znajte da ste voljeni.",
        emojis: ["❤️", "🛡️", "✨"],
        words: [
          { hebrew: "הִשָּׁמְרוּ", hebrewClean: "הישמרו", transliteration: "hishamru", vuk: "hišamru", english: "stay safe / take care", serbian: "čuvajte se", emoji: "🛡️", category: "verb" },
          { hebrew: "אֲהוּבִים", hebrewClean: "אהובים", transliteration: "ahuvim", vuk: "ahuvim", english: "loved", serbian: "voljeni", emoji: "❤️", category: "adjective" }
        ],
        grammarNote: "Imperativ 'hishamru' (הִשָּׁמְרוּ) je topao i brižan izraz za 'pazite se i čuvajte se'."
      },
      "virtual hug across the miles": {
        hebrew: "שׁוֹלֵחַ חִבּוּק חוֹצֶה גְּבוּלוֹת וּמֶרְחַקִּים. אֲנַחְנוּ אִתְּכֶם.",
        hebrewClean: "שולח חיבוק חוצה גבולות ומרחקים. אנחנו אתכם.",
        transliteration: "Shole'ach chibuk chotzeh gvulot u-merchakim. Anachnu itkhem.",
        vuk: "Šoleah hibuk hoce gvulot u-merhakim. Anahnu ithem.",
        serbian: "Šaljem virtuelni zagrljaj preko svih daljina. Sa vama smo.",
        emojis: ["🫂", "💙", "🌍"],
        words: [
          { hebrew: "חִבּוּק", hebrewClean: "חיבוק", transliteration: "chibuk", vuk: "hibuk", english: "hug", serbian: "zagrljaj", emoji: "🫂", category: "noun" },
          { hebrew: "אִתְּכֶם", hebrewClean: "אתכם", transliteration: "itkhem", vuk: "ithem", english: "with you", serbian: "sa vama", emoji: "🤝", category: "preposition" }
        ],
        grammarNote: "Reč 'chibuk' (חִבּוּק) prenosi duboku bliskost i prijateljsku toplinu."
      }
    };

    for (const [key, val] of Object.entries(presets)) {
      if (lower.includes(key)) {
        return {
          hebrewWithEmojis: `${val.hebrew} ${val.emojis.join(' ')}`,
          hebrew: val.hebrew,
          hebrewClean: val.hebrewClean,
          transliteration: val.transliteration,
          vukPhonetic: val.vuk,
          serbian: val.serbian,
          english: english,
          emojis: val.emojis,
          words: val.words,
          grammarNote: val.grammarNote
        };
      }
    }

    // Default intelligent word-level translator
    const dict: Record<string, { he: string; clean: string; trans: string; vuk: string; srb: string; emoji: string; cat: string }> = {
      i: { he: "אֲנִי", clean: "אני", trans: "ani", vuk: "ani", srb: "ja", emoji: "👤", cat: "pronoun" },
      you: { he: "אַתָּה", clean: "אתה", trans: "ata", vuk: "ata", srb: "ti", emoji: "👉", cat: "pronoun" },
      we: { he: "אֲנַחְנוּ", clean: "אנחנו", trans: "anachnu", vuk: "anahnu", srb: "mi", emoji: "👥", cat: "pronoun" },
      love: { he: "אוֹהֵב", clean: "אוהב", trans: "ohev", vuk: "ohev", srb: "volim", emoji: "❤️", cat: "verb" },
      want: { he: "רוֹצֶה", clean: "רוצה", trans: "rotze", vuk: "roce", srb: "želim", emoji: "🎯", cat: "verb" },
      think: { he: "חוֹשֵׁב", clean: "חושב", trans: "choshev", vuk: "hošev", srb: "mislim", emoji: "🤔", cat: "verb" },
      know: { he: "יוֹדֵעַ", clean: "יודע", trans: "yode'a", vuk: "jodea", srb: "znam", emoji: "💡", cat: "verb" },
      see: { he: "רוֹאֶה", clean: "רואה", trans: "ro'eh", vuk: "roe", srb: "vidim", emoji: "👀", cat: "verb" },
      peace: { he: "שָׁלוֹם", clean: "שלום", trans: "shalom", vuk: "šalom", srb: "mir", emoji: "🕊️", cat: "noun" },
      wisdom: { he: "חָכְמָה", clean: "חכמה", trans: "chochmah", vuk: "hohma", srb: "mudrost", emoji: "🧠", cat: "noun" },
      truth: { he: "אֱמֶת", clean: "אמת", trans: "emet", vuk: "emet", srb: "istina", emoji: "⚖️", cat: "noun" },
      life: { he: "חַיִּים", clean: "חיים", trans: "chayim", vuk: "hajim", srb: "život", emoji: "🌿", cat: "noun" },
      light: { he: "אוֹר", clean: "אור", trans: "or", vuk: "or", srb: "svetlost", emoji: "🕯️", cat: "noun" },
      water: { he: "מַיִם", clean: "מים", trans: "mayim", vuk: "majim", srb: "voda", emoji: "💧", cat: "noun" },
      friend: { he: "חָבֵר", clean: "חבר", trans: "chaver", vuk: "haver", srb: "prijatelj", emoji: "🤝", cat: "noun" },
      heart: { he: "לֵב", clean: "לב", trans: "lev", vuk: "lev", srb: "srce", emoji: "💖", cat: "noun" },
      strength: { he: "כֹּחַ", clean: "כוח", trans: "koach", vuk: "koah", srb: "snaga", emoji: "💪", cat: "noun" },
      soul: { he: "נְשָׁמָה", clean: "נשמה", trans: "neshamah", vuk: "nešama", srb: "duša", emoji: "✨", cat: "noun" },
      good: { he: "טוֹב", clean: "טוב", trans: "tov", vuk: "tov", srb: "dobro", emoji: "👍", cat: "adjective" },
      beautiful: { he: "יָפֶה", clean: "יפה", trans: "yafeh", vuk: "jafe", srb: "lepo", emoji: "🌸", cat: "adjective" },
      great: { he: "גָּדוֹל", clean: "גדול", trans: "gadol", vuk: "gadol", srb: "veliko", emoji: "🌟", cat: "adjective" },
      strong: { he: "חָזָק", clean: "חזק", trans: "chazak", vuk: "hazak", srb: "snažno", emoji: "⚡", cat: "adjective" }
    };

    const wordsRaw = lower.replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    const matchedWords: any[] = [];
    const emojisFound: string[] = [];

    for (const w of wordsRaw) {
      if (dict[w]) {
        const item = dict[w];
        matchedWords.push({
          hebrew: item.he,
          hebrewClean: item.clean,
          transliteration: item.trans,
          vuk: item.vuk,
          english: w,
          serbian: item.srb,
          emoji: item.emoji,
          category: item.cat
        });
        if (!emojisFound.includes(item.emoji)) emojisFound.push(item.emoji);
      }
    }

    if (matchedWords.length === 0) {
      // Default inspiring phrase
      matchedWords.push(
        { hebrew: "שָׁלוֹם", hebrewClean: "שלום", transliteration: "Shalom", vuk: "Šalom", english: "peace/hello", serbian: "mir/zdravo", emoji: "🕊️", category: "noun" },
        { hebrew: "וְחָכְמָה", hebrewClean: "וחכמה", transliteration: "ve-chochmah", vuk: "ve-hohma", english: "and wisdom", serbian: "i mudrost", emoji: "🧠", category: "noun" }
      );
      emojisFound.push("🕊️", "✨", "🧠");
    }

    if (emojisFound.length === 0) emojisFound.push("✨", "🕊️");
    if (emojisFound.length < 2) emojisFound.push("🌟");

    const fullHebrew = matchedWords.map(m => m.hebrew).join(' ');
    const fullClean = matchedWords.map(m => m.hebrewClean).join(' ');
    const fullTrans = matchedWords.map(m => m.transliteration).join(' ');
    const fullVuk = matchedWords.map(m => m.vuk).join(' ');
    const fullSrb = matchedWords.map(m => m.serbian).join(' ');
    const emojiStr = emojisFound.slice(0, 3).join(' ');

    return {
      hebrewWithEmojis: `${fullHebrew} ${emojiStr}`,
      hebrew: fullHebrew,
      hebrewClean: fullClean,
      transliteration: fullTrans,
      vukPhonetic: fullVuk,
      serbian: fullSrb,
      english: english,
      emojis: emojisFound.slice(0, 3),
      words: matchedWords,
      grammarNote: "Hebrejski se piše zdesna nalevo (RTL). Pridevi i opisi prate imenicu."
    };
  }

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

    // Embed live ZenQuotes API stream into Daily Digest
    try {
      const zenRes = await fetch("https://zenquotes.io/api/quotes", {
        headers: { "User-Agent": "WiseFit-Sanctuary/1.0" },
        signal: AbortSignal.timeout(5000)
      });
      if (zenRes.ok) {
        const zenRaw = await zenRes.json();
        if (Array.isArray(zenRaw) && zenRaw.length > 0) {
          const zenFormatted = zenRaw.slice(0, 10).map((zq: any, idx: number) => ({
            id: `zen-live-${Date.now()}-${idx}`,
            text: zq.q || zq.text,
            author: zq.a || zq.author || "Unknown",
            source: "ZenQuotes Live",
            isZenQuote: true,
            category: "ZenQuotes",
            fetchDate: targetDateStr,
            createdAt: new Date().toISOString()
          }));

          const existingTexts = new Set(quotes.map((q: any) => (q.text || "").trim().toLowerCase()));
          const uniqueZen = zenFormatted.filter((zq: any) => !existingTexts.has((zq.text || "").trim().toLowerCase()));

          if (uniqueZen.length > 0) {
            const merged: any[] = [];
            let zIdx = 0;
            for (let i = 0; i < quotes.length; i++) {
              merged.push(quotes[i]);
              if ((i + 1) % 3 === 0 && zIdx < uniqueZen.length) {
                merged.push({ ...uniqueZen[zIdx], order: i + 0.5 });
                zIdx++;
              }
            }
            while (zIdx < uniqueZen.length) {
              merged.push({ ...uniqueZen[zIdx], order: merged.length });
              zIdx++;
            }
            quotes = merged;
          }
        }
      }
    } catch (zenErr: any) {
      console.warn("[WiseFit Server] ZenQuotes live embed warning:", zenErr.message || zenErr);
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

      const prompt = `You are a wise Stoic mentor. Interpret the following quote in exactly three sentences, drawing on Stoic philosophy, self-discipline, or personal power. Speak directly to a "Seeker" who is pursuing excellence. Do not use conversational padding like "Sure" or "Here is an interpretation". Speak with deep intellectual depth, keep it concise, declarative, and elegant.
      
Quote: "${text}"
Author: ${author || "Unknown"}`;

      const response = await generateWithFallback(prompt);
      const outputText = response.text().trim();
      res.json({ success: true, interpretation: outputText });
    } catch (e: any) {
      console.error("Interpret Quote Error:", e);
      res.status(500).json({ error: e.message || "Failed to generate interpretation" });
    }
  });

  // --- FRESH QUOTE ENGINE LABS (MANUS ALTERNATIVE TESTING SUITE) ---

  const runMethod1AI = async () => {
    const start = Date.now();
    const prompt = `Return a raw valid JSON array of 5 distinct, profound, non-repetitive wisdom quotes for a daily digest.
Each object must have:
- "text": string (the exact quote text)
- "author": string (author name, e.g. Marcus Aurelius, Epictetus, Lao Tzu, Friedrich Nietzsche, Nikola Tesla, Miroslav Krleža, Seneca)
- "category": string (e.g. "Stoicism", "Mindset", "Wisdom", "Leadership", "Slavic Thought")

Respond with JSON only, no markdown formatting, no code blocks.`;

    try {
      const res = await generateWithFallback(prompt, { responseMimeType: "application/json" });
      let text = res.text() || "[]";
      text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const quotesRaw = JSON.parse(text);
      const executionMs = Date.now() - start;
      const quotes = quotesRaw.map((q: any, i: number) => ({
        id: `lab-m1-${Date.now()}-${i}`,
        text: q.text || q.quote || "Wisdom begins in wonder.",
        author: q.author || "Unknown",
        category: q.category || "WiseFit AI Engine",
        source: "Method 1: AI Engine (Claude/Gemini)",
        createdAt: new Date().toISOString()
      }));
      return { success: true, method: "Method 1: AI Generation Engine (Claude/Gemini Bridge)", executionMs, quotes };
    } catch (err: any) {
      const executionMs = Date.now() - start;
      return {
        success: false,
        method: "Method 1: AI Generation Engine (Claude/Gemini Bridge)",
        executionMs,
        error: err.message,
        quotes: [
          {
            id: `lab-m1-fallback-${Date.now()}`,
            text: "He who has a why to live can bear almost any how.",
            author: "Friedrich Nietzsche",
            category: "Philosophy",
            source: "Method 1: AI Engine (Failsafe)",
            createdAt: new Date().toISOString()
          }
        ]
      };
    }
  };

  const runMethod2Scrape = async () => {
    const start = Date.now();
    try {
      const response = await fetch("https://zenquotes.io/api/quotes", {
        headers: { "User-Agent": "WiseFit-Sanctuary/1.0" },
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        const raw = await response.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const quotes = raw.slice(0, 5).map((q: any, i: number) => ({
            id: `lab-m2-${Date.now()}-${i}`,
            text: q.q || q.text,
            author: q.a || q.author || "Unknown",
            category: "Live Web Scrape",
            source: "Method 2: Live Web Scraping (ZenQuotes API)",
            createdAt: new Date().toISOString()
          }));
          const executionMs = Date.now() - start;
          return { success: true, method: "Method 2: Live Web Scraping (ZenQuotes)", executionMs, quotes };
        }
      }
      throw new Error("Live web API response empty");
    } catch (err: any) {
      try {
        const res2 = await fetch("https://dummyjson.com/quotes/random/5", { signal: AbortSignal.timeout(4000) });
        if (res2.ok) {
          const raw2 = await res2.json();
          const items = Array.isArray(raw2) ? raw2 : (raw2.quotes || []);
          const quotes = items.slice(0, 5).map((q: any, i: number) => ({
            id: `lab-m2-alt-${Date.now()}-${i}`,
            text: q.quote || q.text,
            author: q.author || "Unknown",
            category: "Live Scrape Vault",
            source: "Method 2: Live Web Scraping (Quotes API)",
            createdAt: new Date().toISOString()
          }));
          const executionMs = Date.now() - start;
          return { success: true, method: "Method 2: Live Web Scraping (Quotes API)", executionMs, quotes };
        }
      } catch (e2) {}

      const executionMs = Date.now() - start;
      return {
        success: false,
        method: "Method 2: Live Web Scraping",
        executionMs,
        error: err.message,
        quotes: [
          {
            id: `lab-m2-failsafe-${Date.now()}`,
            text: "Waste no more time arguing about what a good man should be. Be one.",
            author: "Marcus Aurelius",
            category: "Stoicism",
            source: "Method 2: Live Web Scraping (Fallback)",
            createdAt: new Date().toISOString()
          }
        ]
      };
    }
  };

  const runMethod3Vault = async () => {
    const start = Date.now();
    try {
      const localVault = loadLocalScrapedQuotes();
      let chosen: any[] = [];
      if (localVault && localVault.length >= 5) {
        const shuffled = [...localVault].sort(() => 0.5 - Math.random());
        chosen = shuffled.slice(0, 5);
      } else {
        chosen = FALLBACK_QUOTES.slice(0, 5);
      }

      const quotes = chosen.map((q: any, i: number) => ({
        id: `lab-m3-${Date.now()}-${i}`,
        text: q.text,
        author: q.author,
        category: q.category || "Multi-Source Vault",
        source: "Method 3: Multi-Source Vault & Web Feed Synthesizer",
        createdAt: new Date().toISOString()
      }));

      const executionMs = Date.now() - start;
      return { success: true, method: "Method 3: Multi-Source Vault & Web Feed Synthesizer", executionMs, quotes };
    } catch (err: any) {
      const executionMs = Date.now() - start;
      return {
        success: false,
        method: "Method 3: Multi-Source Vault",
        executionMs,
        error: err.message,
        quotes: []
      };
    }
  };

  app.get("/api/digest-lab/method1-ai", async (req, res) => {
    const result = await runMethod1AI();
    res.json(result);
  });

  app.get("/api/digest-lab/method2-scrape", async (req, res) => {
    const result = await runMethod2Scrape();
    res.json(result);
  });

  app.get("/api/digest-lab/method3-vault", async (req, res) => {
    const result = await runMethod3Vault();
    res.json(result);
  });

  app.get("/api/digest-lab/benchmark", async (req, res) => {
    const [m1, m2, m3] = await Promise.all([
      runMethod1AI(),
      runMethod2Scrape(),
      runMethod3Vault()
    ]);
    res.json({
      timestamp: new Date().toISOString(),
      benchmark: {
        method1: { method: m1.method, executionMs: m1.executionMs, success: m1.success, count: m1.quotes.length },
        method2: { method: m2.method, executionMs: m2.executionMs, success: m2.success, count: m2.quotes.length },
        method3: { method: m3.method, executionMs: m3.executionMs, success: m3.success, count: m3.quotes.length }
      },
      results: {
        method1: m1,
        method2: m2,
        method3: m3
      }
    });
  });

  app.post("/api/digest-lab/save-quote", async (req, res) => {
    try {
      const { text, author, category, source } = req.body;
      if (!text) return res.status(400).json({ error: "Missing quote text" });

      const targetDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Zagreb' }).format(new Date());

      const newQuote = {
        text,
        author: author || "Unknown",
        category: category || "Daily Digest Lab",
        source: source || "Fresh Quote Engine",
        fetchDate: targetDateStr,
        order: 0,
        createdAt: new Date().toISOString()
      };

      const localStore = loadLocalScrapedQuotes();
      localStore.unshift(newQuote);
      saveLocalScrapedQuotes(localStore);

      if (clientFirestoreDb) {
        try {
          const quotesCol = collection(clientFirestoreDb, "daily_digest_quotes");
          const docRef = await addDoc(quotesCol, newQuote);
          return res.json({ success: true, id: docRef.id, quote: { id: docRef.id, ...newQuote } });
        } catch (dbErr: any) {
          console.warn("[Digest Lab] Firestore write fallback to local:", dbErr.message);
        }
      }

      const localId = `lab-quote-${Date.now()}`;
      res.json({ success: true, id: localId, quote: { id: localId, ...newQuote } });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to save quote" });
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

  // --- DYNAMIC FACEBOOK & SOCIAL OG THUMBNAIL GENERATOR ---
  function escapeXml(unsafe?: string): string {
    return (unsafe || "").replace(/[<>&"'\\]/g, (c) => {
      switch (c) {
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "&": return "&amp;";
        case "\"": return "&quot;";
        case "'": return "&apos;";
        case "\\": return "";
        default: return c;
      }
    });
  }

  function wrapText(text: string, maxChars: number, maxLines: number): string[] {
    const words = (text || "").split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      if ((currentLine + " " + word).trim().length <= maxChars) {
        currentLine = (currentLine + " " + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
        if (lines.length >= maxLines - 1) break;
      }
    }
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    } else if (currentLine && lines.length >= maxLines) {
      lines[maxLines - 1] = lines[maxLines - 1] + "...";
    }
    return lines.length > 0 ? lines : ["WiseFit Reflection"];
  }

  function cleanArticleTitle(title?: string): string {
    if (!title || !title.trim()) return "WiseFit Sanctuary Reflection";
    return title
      .replace(/[#*`_~]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanArticleExcerpt(excerpt?: string, content?: string, title?: string): string {
    if (excerpt && excerpt.trim()) {
      return excerpt.replace(/[#*`_~]/g, "").replace(/\s+/g, " ").trim();
    }
    if (!content) return "Explore philosophical insights, biometric intelligence, and timeless Stoic discipline on WiseFit.";
    
    const normTitle = (title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const rawLines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let meaningful = "";
    
    for (const line of rawLines) {
      // Skip markdown headers, intro preambles, horizontal rules, format boilerplate
      if (/^(here is|here's|---|\*\*\*|###?|trilingual|full trilingual|format:)/i.test(line)) continue;
      
      const cleaned = line
        .replace(/[#*`_~]/g, "")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
        
      const normLine = cleaned.toLowerCase().replace(/[^a-z0-9]/g, "");
      // Skip if this line is just repeating the title
      if (normLine.length > 10 && normTitle.includes(normLine.substring(0, Math.min(normLine.length, 30)))) {
        continue;
      }
      if (cleaned.length > 25) {
        meaningful = cleaned;
        break;
      }
    }
    
    if (!meaningful && rawLines.length > 0) {
      meaningful = rawLines[0].replace(/[#*`_~]/g, "").trim();
    }
    if (meaningful.length > 210) {
      return meaningful.substring(0, 207).trim() + "...";
    }
    return meaningful || "Explore philosophical insights, biometric intelligence, and timeless Stoic discipline on WiseFit.";
  }

  async function getImageAsBase64(imageUrl?: string): Promise<string | null> {
    if (!imageUrl) return null;
    try {
      if (imageUrl.startsWith("data:image")) {
        return imageUrl;
      }
      if (imageUrl.startsWith("/uploads/") || imageUrl.startsWith("uploads/")) {
        const localPath = path.resolve(process.cwd(), imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl);
        if (fs.existsSync(localPath)) {
          const ext = path.extname(localPath).slice(1) || "jpeg";
          const data = fs.readFileSync(localPath);
          return `data:image/${ext};base64,${data.toString("base64")}`;
        }
      }
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          timeout: 2500,
          headers: { "User-Agent": "WiseFit-Social-OG/1.0" }
        });
        const contentType = response.headers["content-type"] || "image/jpeg";
        const base64 = Buffer.from(response.data).toString("base64");
        return `data:${contentType};base64,${base64}`;
      }
    } catch (err: any) {
      console.warn("[OG-Image] Notice: Could not load external background thumbnail, using sanctuary gradient:", err.message);
    }
    return null;
  }

  function generateOgCardSvg(options: { title: string; excerpt: string; bgBase64?: string | null }): string {
    const { title, excerpt, bgBase64 } = options;
    const cleanTitle = escapeXml(title);
    const titleLines = wrapText(cleanTitle, 36, 3);
    const descLines = wrapText(escapeXml(excerpt), 52, 3);

    const titleStartY = 200;
    const titleLineHeight = 60;
    const titleEndY = titleStartY + (titleLines.length - 1) * titleLineHeight;
    const dividerY = titleEndY + 45;
    const descStartY = dividerY + 45;
    const descLineHeight = 38;

    return `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgBase" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080b0f"/>
      <stop offset="50%" stop-color="#0e141c"/>
      <stop offset="100%" stop-color="#05070a"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="cardOverlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#080b0f" stop-opacity="0.82"/>
      <stop offset="60%" stop-color="#080b0f" stop-opacity="0.94"/>
      <stop offset="100%" stop-color="#05070a" stop-opacity="0.98"/>
    </linearGradient>
    <radialGradient id="glowTopRight" cx="88%" cy="12%" r="65%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.22"/>
      <stop offset="50%" stop-color="#059669" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowBottomLeft" cx="12%" cy="90%" r="55%">
      <stop offset="0%" stop-color="#047857" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Base background -->
  <rect width="1200" height="630" fill="url(#bgBase)"/>
  
  ${bgBase64 ? `<image href="${bgBase64}" width="1200" height="630" preserveAspectRatio="xMidYMid slice" opacity="0.3"/>` : ""}
  
  <rect width="1200" height="630" fill="url(#cardOverlay)"/>
  <rect width="1200" height="630" fill="url(#glowTopRight)"/>
  <rect width="1200" height="630" fill="url(#glowBottomLeft)"/>

  <!-- Subtle architectural grid pattern -->
  <g opacity="0.035" stroke="#ffffff" stroke-width="1">
    <line x1="0" y1="126" x2="1200" y2="126"/>
    <line x1="0" y1="252" x2="1200" y2="252"/>
    <line x1="0" y1="378" x2="1200" y2="378"/>
    <line x1="0" y1="504" x2="1200" y2="504"/>
    <line x1="240" y1="0" x2="240" y2="630"/>
    <line x1="480" y1="0" x2="480" y2="630"/>
    <line x1="720" y1="0" x2="720" y2="630"/>
    <line x1="960" y1="0" x2="960" y2="630"/>
  </g>

  <!-- Outer Card Frame with subtle Emerald Accent Glow -->
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#27272a" stroke-width="2"/>
  <rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#10b981" stroke-width="2" stroke-opacity="0.32"/>

  <!-- Top Badges / Sanctuary Branding -->
  <g transform="translate(72, 68)">
    <!-- Pill 1: WiseFit Sanctuary -->
    <rect width="220" height="42" rx="21" fill="#10b981" fill-opacity="0.14" stroke="#10b981" stroke-opacity="0.45" stroke-width="1.5"/>
    <circle cx="24" cy="21" r="5" fill="#34d399"/>
    <text x="38" y="27" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" fill="#34d399" letter-spacing="2">WISEFIT SANCTUARY</text>

    <!-- Pill 2: Intellectual Commons -->
    <g transform="translate(232, 0)">
      <rect width="230" height="42" rx="21" fill="#27272a" fill-opacity="0.6" stroke="#3f3f46" stroke-width="1.2"/>
      <text x="22" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="600" fill="#a1a1aa" letter-spacing="1.5">INTELLECTUAL COMMONS</text>
    </g>
  </g>

  <!-- Title (Page Title / Excerpt) -->
  <g transform="translate(72, ${titleStartY})">
    ${titleLines.map((line, i) => `<text x="0" y="${i * titleLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="50" font-weight="800" fill="#ffffff" letter-spacing="-1">${line}</text>`).join("\n    ")}
  </g>

  <!-- Glowing Emerald Accent Divider -->
  <rect x="72" y="${dividerY}" width="140" height="4" rx="2" fill="url(#emeraldGrad)"/>

  <!-- Quick Description / Excerpt -->
  <g transform="translate(72, ${descStartY})">
    ${descLines.map((line, i) => `<text x="0" y="${i * descLineHeight}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="26" font-weight="400" fill="#cbd5e1" letter-spacing="0">${line}</text>`).join("\n    ")}
  </g>

  <!-- Bottom Metadata Footer -->
  <g transform="translate(72, 564)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="16" font-weight="600" fill="#71717a">wisefit.fun • Read Full Reflection</text>
    
    <g transform="translate(830, -8)">
      <rect width="220" height="34" rx="17" fill="#10b981" fill-opacity="0.1" stroke="#10b981" stroke-opacity="0.3" stroke-width="1"/>
      <text x="18" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="12" font-weight="700" fill="#10b981" letter-spacing="1">PHILOSOPHY &amp; BIOMETRICS</text>
    </g>
  </g>
</svg>
    `;
  }

  function renderOgCardPng(options: { title: string; excerpt: string; bgBase64?: string | null }): Buffer {
    const svg = generateOgCardSvg(options);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 }
    });
    return resvg.render().asPng();
  }

  async function fetchArticleData(articleId: string) {
    if (!articleId) return null;

    // 1. Try Client Firestore SDK if initialized
    if (clientFirestoreDb) {
      try {
        const q = query(collection(clientFirestoreDb, "articles"), where("id", "==", articleId), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          const cleanTitle = cleanArticleTitle(docData.title);
          const cleanExcerpt = cleanArticleExcerpt(docData.excerpt, docData.content, docData.title);
          return {
            id: articleId,
            title: cleanTitle,
            excerpt: cleanExcerpt,
            content: docData.content || "",
            thumbnailUrl: docData.thumbnailUrl || "",
            videoUrl: docData.url || ""
          };
        }
      } catch (err: any) {
        console.warn("[Dynamic OG] clientFirestoreDb fetch error:", err.message);
      }
    }

    // 2. Fallback to Firestore REST API
    try {
      const projectId = firebaseConfig.projectId || "gen-lang-client-0833207836";
      const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId || "ai-studio-4d7e1cec-5733-4ce6-a67d-e27f38f60915";
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
      
      const response = await axios.post(firestoreUrl, requestBody, { timeout: 3500 });
      const documents = response.data;
      if (documents && documents[0] && documents[0].document) {
        const fields = documents[0].document.fields;
        const rawTitle = fields.title?.stringValue || "";
        const rawContent = fields.content?.stringValue || "";
        const rawExcerpt = fields.excerpt?.stringValue || "";
        const rawThumb = fields.thumbnailUrl?.stringValue || "";
        const rawVideo = fields.url?.stringValue || "";

        return {
          id: articleId,
          title: cleanArticleTitle(rawTitle),
          excerpt: cleanArticleExcerpt(rawExcerpt, rawContent, rawTitle),
          content: rawContent,
          thumbnailUrl: rawThumb,
          videoUrl: rawVideo
        };
      }
    } catch (err: any) {
      console.warn("[Dynamic OG] Firestore REST fallback error:", err.message);
    }

    return null;
  }

  // --- API ENDPOINT: Dynamic Facebook Thumbnail Image (1200x630 PNG) ---
  app.get(["/api/articles/:id/og-image", "/api/og-image"], async (req, res) => {
    try {
      const articleId = (req.params.id || req.query.id || req.query.articleId) as string;
      let title = (req.query.title as string) || "";
      let excerpt = (req.query.excerpt || req.query.desc) as string || "";
      let thumbnailUrl = (req.query.bg || req.query.thumbnail) as string || "";

      if (articleId) {
        const article = await fetchArticleData(articleId);
        if (article) {
          title = article.title;
          excerpt = article.excerpt;
          thumbnailUrl = article.thumbnailUrl || thumbnailUrl;
        }
      }

      if (!title) {
        title = "WiseFit - Digital Sanctuary & Biometric Intelligence";
      }
      if (!excerpt) {
        excerpt = "Explore philosophical reflections, biometric synchronization, and elite discipline on WiseFit.";
      }

      const bgBase64 = await getImageAsBase64(thumbnailUrl);
      const pngBuffer = renderOgCardPng({
        title,
        excerpt,
        bgBase64
      });

      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Length", pngBuffer.length.toString());
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
      return res.status(200).send(pngBuffer);
    } catch (err: any) {
      console.error("[OG-Image Endpoint Error]", err);
      // Emergency minimalist fallback PNG
      try {
        const fallbackPng = renderOgCardPng({
          title: "WiseFit Sanctuary Reflection",
          excerpt: "Connecting biometric signals with timeless Stoic wisdom and intellectual depth."
        });
        res.setHeader("Content-Type", "image/png");
        return res.status(200).send(fallbackPng);
      } catch {
        return res.status(500).json({ error: "Failed to render OpenGraph thumbnail" });
      }
    }
  });

  // --- HTML OPEN GRAPH INJECTOR FOR FACEBOOK & SOCIAL SCRAPERS ---
  const distPath = path.resolve(process.cwd(), "dist");
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(distPath);

  const getTemplateHtml = () => {
    const distIndex = path.join(distPath, "index.html");
    if (fs.existsSync(distIndex)) return fs.readFileSync(distIndex, "utf-8");
    const rootIndex = path.resolve(process.cwd(), "index.html");
    if (fs.existsSync(rootIndex)) return fs.readFileSync(rootIndex, "utf-8");
    return "";
  };

  const serveDynamicOgPage = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith("/api/")) return next();

    const view = req.query.view;
    const articleId = (req.query.id || req.query.articleId || (req.path.startsWith("/articles/") ? req.path.split("/")[2] : "")) as string;
    const isSocialCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Pinterest|Slackbot|TelegramBot|WhatsApp|Googlebot/i.test(req.get("user-agent") || "");

    const shouldHandle = (view === "articles" && articleId) || (articleId && articleId.startsWith("art-")) || req.path.startsWith("/articles/") || (articleId && isSocialCrawler);

    if (!shouldHandle) {
      return next();
    }

    try {
      let html = getTemplateHtml();
      if (!html) return next();

      const article = await fetchArticleData(articleId);
      if (article) {
        console.log(`[Dynamic OG] Serving customized Open Graph card for article: "${article.title}" (${articleId})`);

        const host = req.get("host") || "wisefit.fun";
        const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
        const absoluteBase = `${protocol}://${host}`;

        const titleEscaped = article.title.replace(/"/g, "&quot;");
        const descriptionEscaped = article.excerpt.replace(/"/g, "&quot;");
        const urlEscaped = `${absoluteBase}/?view=articles&id=${articleId}`.replace(/"/g, "&quot;");
        const ogImageUrl = `${absoluteBase}/api/articles/${articleId}/og-image`;

        let videoUrl = article.videoUrl || "";
        if (videoUrl && !videoUrl.startsWith("http://") && !videoUrl.startsWith("https://")) {
          videoUrl = `${absoluteBase}${videoUrl.startsWith("/") ? "" : "/"}${videoUrl}`;
        }

        // Replace title tag
        html = html.replace(/<title>[\s\S]*?<\/title>/gi, `<title>${titleEscaped} - WiseFit</title>`);

        // Clean out default static tags
        html = html.replace(/<meta name="description" content="[^"]*" \/>/gi, "");
        html = html.replace(/<meta property="og:[^"]*" content="[^"]*" \/>/gi, "");
        html = html.replace(/<meta property="twitter:[^"]*" content="[^"]*" \/>/gi, "");
        html = html.replace(/<meta name="twitter:[^"]*" content="[^"]*" \/>/gi, "");

        let newMeta = `
          <meta name="description" content="${descriptionEscaped}" />
          <meta property="og:site_name" content="WiseFit Sanctuary" />
          <meta property="og:type" content="article" />
          <meta property="og:title" content="${titleEscaped}" />
          <meta property="og:description" content="${descriptionEscaped}" />
          <meta property="og:url" content="${urlEscaped}" />
          <meta property="og:image" content="${ogImageUrl}" />
          <meta property="og:image:secure_url" content="${ogImageUrl}" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="${titleEscaped}" />
        `;

        if (videoUrl) {
          const videoEscaped = videoUrl.replace(/"/g, "&quot;");
          newMeta += `
          <meta property="og:video" content="${videoEscaped}" />
          <meta property="og:video:secure_url" content="${videoEscaped}" />
          <meta property="og:video:type" content="video/mp4" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${titleEscaped}" />
          <meta name="twitter:description" content="${descriptionEscaped}" />
          <meta name="twitter:image" content="${ogImageUrl}" />
          `;
        } else {
          newMeta += `
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${titleEscaped}" />
          <meta name="twitter:description" content="${descriptionEscaped}" />
          <meta name="twitter:image" content="${ogImageUrl}" />
          `;
        }

        html = html.replace(/<head>/i, `<head>${newMeta}`);
        return res.send(html);
      }
    } catch (err: any) {
      console.error("[Dynamic OG Serving Error]", err.message);
    }

    return next();
  };

  // Intercept article shares for both production & development crawlers
  app.use(serveDynamicOgPage);

  // --- STATIC SERVING ---
  if (isProd) {
    console.log(`[WiseFit] Production Mode: Serving static files from ${distPath}`);
    app.use(express.static(distPath, { index: false }));
    
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
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
