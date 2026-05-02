# WiseFit - Elite Fitness & Calisthenics Tracker

WiseFit is a digital sanctuary that integrates physical strength, mental stillness, and timeless wisdom. It sits at the intersection of fitness, mindfulness, and lifestyle.

## Health Data Strategy (May 2026)

WiseFit bypasses the legacy Fitbit Developer Portal (`dev.fitbit.com`) in favor of the **Google Health API** (`health.googleapis.com`). This provides a unified data stream for:
*   **Pixel Watch 3**
*   **Fitbit Devices** (migrated to Google accounts)

## Prerequisites

To integrate live health data from Pixel Watch or Fitbit devices, you must have the following Google Cloud configuration:

*   **Google Cloud Project**: A project named `WiseFitGoogle` must be active.
*   **Google Health API**: The Service `health.googleapis.com` must be enabled in the Google Cloud Console.
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
3.  **Google Health API**: WiseFit's backend communicates with the `health.googleapis.com` service using the authorized OAuth token.
4.  **Dashboard Visualization**: Live metrics for Steps, Active Minutes, Calories, and Weight are pulled and displayed in the WiseFit "Fire" (Strength) and "Stillness" (Recovery) sections.

## Development

WiseFit uses a full-stack architecture with **React (Vite)** for the frontend and **Express** for the backend proxy and authentication.

*   **Frontend**: Built with Tailwind CSS and Framer Motion for a cinematic experience.
*   **Backend**: Handles secure OAuth handshakes and proxies requests to the Google Health API to keep secrets hidden from the browser.
