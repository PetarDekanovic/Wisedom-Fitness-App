# WiseFit Deployment & Production Guide

This file tracks the configuration for the live production site at [https://wisefit.fun/](https://wisefit.fun/).

## 1. Firebase Domain Authorization (CRITICAL)
Your site currently fails to log in because Firebase doesn't trust the domain `wisefit.fun`.

**Action Required:**
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Open your project.
3.  Go to **Build** > **Authentication** > **Settings** > **Authorized Domains**.
4.  Click **Add domain** and enter: `wisefit.fun`
5.  Wait about 5-10 minutes for it to propagate.

## 2. Environment Variables (Hostinger)
In your Hostinger hPanel "Environment Variables" section, add the following key to enable AI generation and plan storage:

| Key | Value | Source |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | `YOUR_SECRET_KEY` | Your Google AI Studio API Key |

*Note: For Vite apps, if you are doing a static build, these variables usually need to be present at build-time. However, if you are running a Node.js process on Hostinger, they will be available at runtime.*

## 3. Deployment Summary
- **Primary Domain:** [https://wisefit.fun/](https://wisefit.fun/)
- **Build Target:** `dist/`
- **Node Environment:** 22.x
- **Updates:** All "Admin Only" restrictions have been removed from the UI. Every user on `wisefit.fun` can now:
    - Save and Comment on quotes.
    - Create New AI quotes (once the Gemini API Key is added).
    - Use the AI Loop feature.

---
*Memory updated: Site is live at wisefit.fun. Current focus: Auth fix and API Key config.*
