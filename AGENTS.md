# WiseFit — Strategic Build Plan for €10M Acquisition Path

> **Note to AI Assistant:** Use this document as the strategic frame for all WiseFit feature work. Every code change, feature, and design decision must be evaluated against the priorities and "Strategic Filters" defined below.

---

## 1. Project Vision & Context
WiseFit is a **Digital Sanctuary** merging biometric/wearable intelligence (Oura/Whoop style) with profound philosophical and intellectual depth. We are building toward a €5–15M strategic acquisition by a major wellness or wearable platform.

### Current Core Capabilities:
- **Biometric Sync:** Pixel Watch 3 / Fitbit live sync (Health Connect path).
- **Personal Records:** Dashboard for speed and distance (Fastest 1k, 5k, etc.).
- **Wisdom Repository:** Curated quotes with AI-powered expansion and personal tagging.
- **Yoga Rituals:** Flow-based sequences with timed poses and meditation soundscapes.
- **AI Stoic:** Personalized mentor (Gemini-powered) that understands user context.
- **Regional Edge:** Croatian-aware TTS and local translations for Slavic markets.

---

## 2. Strategic Filter (The "Acquisition" Lens)
Before implementing any feature, ask:
1. **Does this strengthen the acquisition pitch?** (Proprietary IP, high retention, unique biometric data).
2. **Is it automated?** Manual curation doesn't scale. Prefer AI-assisted human curation.
3. **Does it respect the user's brain?** No "gamified" junk. Only high-signal, cinematic UI.

---

## 3. High-Priority Roadmap (Months 1–12)

### A. The Biometric→Content "Operating Mode" (The Killer Feature)
Each morning, the app computes a **Daily Operating Mode** based on HRV, Sleep, and RHR:
- **SHARP:** (High Recovery) → Serve strategic/geopolitical analysis + Power Yoga.
- **BUILD:** (Baseline Recovery) → Serve discipline-focused wisdom + Strength training.
- **RESTORE:** (Low Recovery) → Serve Yin Yoga + Gentle Stoic patience quotes.
- **HOLD:** (Mixed signals) → Serve equanimity-themed meditation + breathwork.

### B. Monetization & Retention
- **WiseFit Plus (€4.99/mo):** Unlimited daily flows, full yoga library, Biometric matching, and Monthly Pattern Reports.
- **Founding Member (€99 Lifetime):** Immediate cash injection and social proof for first 500 users.
- **Grace Day System:** Users get one "Grace Day" a week where a missed session doesn't break their streak. This is critical for long-term retention.

### C. Native Wearable & Mobile Strategy
- **Capacitor Hardening:** Polished PWA install flow and native push notifications.
- **Wear OS / watchOS Native Apps:** Complications showing "Operating Mode" + Haptic "Wisdom Prompts" when high stress is detected.

---

## 4. Growth & Regional Moat
- **Slavic Market Dominance:** Lean into the Croatian/Serbian market. Localized thinkers (Krleža, Tesla, Andrić) and localized TTS are our secret weapon.
- **WordPress Integration:** Use external MP4 loops and SEO-driven deep-dives (e.g., "The Science of HRV") to drive top-of-funnel traffic.

---

## 5. Technical Implementation Notes (Brainstormed)

### AI & Data Intelligence:
- **Semantic Library Search:** Implement a search feature in the "Wisdom Repository" that allows users to find advice based on *how they feel* using Gemini embeddings.
- **Biometric Snapshotting:** Cache the last 7 days of biometric trends locally so the "Biological Trend" dash is instant, even if the Google Fit sync is slow.
- **Zustand/Firebase Persistence:** Ensure the subscription state and "Daily Flow" progress are rock-solid. A user should never lose their place in a 20-minute ritual.

### UI/UX Aesthetic ("Technical Zen"):
- **Home Tab:** Simplify. The default view should be the 60–90 second "Morning Ritual" (Operating Mode → Quote → Breathwork). Everything else belongs in the "More" or "Profile" tabs.
- **Cinematic Transitions:** Use `motion/react` for every transition. No abrupt jumps. The app should feel like a physical sanctuary.
- **Audio Experience:** Ensure we have a "Global Player" component so Ritual Soundscapes can continue playing smoothly while the user navigates between tabs.

---

## 6. Things to Cut/Avoid
- **No Social Feeds:** Avoid the noise of a "Social Fitness Network." Keep it individual and focused.
- **No Corny Gamification:** Drop terms like "Real Wise Guy." Stick to Seeker → Student → Scholar → Sage.
- **No Chatty AI:** AI Stoic must be terse (max 4 sentences), declarative, and source-cited. No "Petar, my friend" openers.

---

## 7. Exit Strategy Target
**Acquirer:** Whoop, Oura, Garmin, or Calm.
**Pitch:** "We own the seam between the biometric signal and the intellectual content. We have the highest-LTV users in the premium wellness space and a dominant position in Slavic markets."
