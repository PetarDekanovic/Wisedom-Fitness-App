import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- FITBIT OAUTH ---
  
  app.get("/api/auth/fitbit/url", (req, res) => {
    const clientId = process.env.VITE_FITBIT_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "Fitbit Client ID not configured" });
    }
    
    // Using window.location.origin on the client side is better for the redirect_uri
    // But since this is the server, we might need to know the APP_URL
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/fitbit/callback`;
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      scope: "activity profile weight heartrate",
      redirect_uri: redirectUri,
    });
    
    const authUrl = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(["/auth/fitbit/callback", "/auth/fitbit/callback/"], async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send("Missing code");

    const clientId = process.env.VITE_FITBIT_CLIENT_ID;
    const clientSecret = process.env.FITBIT_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/fitbit/callback`;

    try {
      // Fitbit requires Basic Auth header with base64 encoded client_id:client_secret
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      
      const response = await axios.post(
        "https://api.fitbit.com/oauth2/token",
        new URLSearchParams({
          client_id: clientId!,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code: code as string,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${authHeader}`,
          },
        }
      );

      const tokens = response.data;
      // In a real production app, we would store these securely in Firestore or a session.
      // For this demo/integration, we'll send it back to the window or set a cookie.
      // We'll use postMessage to send the tokens back to the main app so it can store them in Firestore.

      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #09090b; color: white; text-align: center;">
            <div>
              <h2 style="color: #10b981;">Fitbit Connected!</h2>
              <p>Synchronizing your discipline...</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ 
                    type: 'FITBIT_AUTH_SUCCESS',
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
      console.error("Fitbit token exchange error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed. Check your credentials.");
    }
  });

  // --- GOOGLE HEALTH / PIXEL WATCH OAUTH ---

  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "Google Client ID not configured" });
    
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/api/auth/callback/google`;
    
    // Scopes requested by user
    const scopes = [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.body.read",
      "https://www.googleapis.com/auth/fitness.calories.read",
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
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
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
