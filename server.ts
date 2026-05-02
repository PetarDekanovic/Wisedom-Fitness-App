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

  // --- GOOGLE HEALTH / PIXEL WATCH INTEGRATION ---

  app.get("/api/auth/google/url", (req, res) => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "Google Client ID not configured" });
    
    const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
    const redirectUri = `${appUrl}/api/auth/callback/google`;
    
    // Scopes for Pixel Watch 3 & Fitbit (Unified May 2026)
    const scopes = [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.body.read",
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
