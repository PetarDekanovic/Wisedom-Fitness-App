# WiseFit - Elite Fitness & Calisthenics Tracker

WiseFit is a digital sanctuary that integrates physical strength, mental stillness, and timeless wisdom. It sits at the intersection of fitness, mindfulness, and lifestyle.

## Health Data Status: SUCCESS

WiseFit is successfully integrated with the **Google Fitness API** (fitness.googleapis.com). 

*   **Status**: ACTIVE
*   **Hardware**: Pixel Watch 3 & Fitbit (Unified)
*   **Architecture**: Full-stack OAuth 2.0 with Express proxy.
*   **Biometrics**: Real-time sync for Steps, Calories, and Weight (89.0kg baseline).

## Prerequisites

To maintain this integration, ensure your Google Cloud Project (`WiseFitGoogle`) has the following:

*   **Google Cloud Project**: A project named `WiseFitGoogle` must be active.
*   **Google Fitness API**: The Service `fitness.googleapis.com` must be enabled in the Google Cloud Console.
*   **OAuth 2.0 Credentials**:
    *   **Client Type**: Web Application.
    *   **Authorized JavaScript Origins**: `https://wisefit.fun`
    *   **Authorized Redirect URIs**: `https://wisefit.fun/api/auth/callback/google`
*   **Authorized Scopes**:
    *   `https://www.googleapis.com/auth/fitness.activity.read`
    *   `https://www.googleapis.com/auth/fitness.body.read`
    *   `https://www.googleapis.com/auth/fitness.calories.read`
    *   `https://www.googleapis.com/auth/userinfo.profile`
    *   `openid`

## Environment Variables

The following environment variables are required for the application to function with Google Health integration. These should be set in the platform's settings.

```env
# Google OAuth Credentials
VITE_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# App URL (usually set by the platform)
APP_URL=https://wisefit.fun
```

## Data Flow

The integration ensures a seamless journey from your wrist to your dashboard:

1.  **Hardware Sync**: The **Pixel Watch 3** records biometric data during your day and workouts.
2.  **Google Cloud Sync**: This data is synchronized with your personal Google account.
3.  **Google Fitness API**: WiseFit's backend communicates with the `fitness.googleapis.com` service using the authorized OAuth token.
4.  **Dashboard Visualization**: Live metrics for Steps, Active Minutes, Calories, and Weight are pulled and displayed in the WiseFit "Fire" (Strength) and "Stillness" (Recovery) sections.

## Development

WiseFit uses a full-stack architecture with **React (Vite)** for the frontend and **Express** for the backend proxy and authentication.

*   **Frontend**: Built with Tailwind CSS and Framer Motion for a cinematic experience.
*   **Backend**: Handles secure OAuth handshakes and proxies requests to the Google Health API to keep secrets hidden from the browser.

## Hostinger Troubleshooting: 504 Gateway Time-out / 503 Outages

If the live production site (`wisefit.fun`) displays a **504 Gateway Time-out (nginx)** or **503 Service Unavailable** error:

### Primary Fix: "Stop running processes" in Hostinger hPanel
Hostinger accounts enforce limits on concurrent processes and resource usage. During builds, deployments, or traffic spikes, old or zombie Node processes can saturate the account's process allocation, triggering the Hostinger alert: *"Your plan has reached its resource limits"*. When this threshold is hit, Hostinger's Nginx reverse proxy is blocked from communicating with Node.js and returns a 504 timeout.

**Steps to restore the site immediately:**
1. Log into **Hostinger hPanel**.
2. Go to **Hosting Plan** → **Resources Usage** (or navigate to `hpanel.hostinger.com/websites/wisefit.fun/order/order-usage`).
3. Inside the red warning box (*"Your plan has reached its resource limits"*), click the **"Stop running processes"** button.
4. Hostinger will instantly terminate hung background worker processes, release the process table, and allow the application to boot and serve incoming requests normally.

