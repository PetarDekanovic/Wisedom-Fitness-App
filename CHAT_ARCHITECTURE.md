# WiseFit In-App Messaging — Architecture Brief

## Purpose of this document
This is a design proposal for an in-app messaging system for **WiseFit** (wisefit.fun).

---

## Product context
WiseFit is a mindset / mental fitness web application. Audience is multilingual (English, Croatian, Serbian Latin script).
Two tiers:
- **Free tier** — server-readable messages. Standard chat UX.
- **Paid tier** — end-to-end encrypted, anonymous. No operator access.

## Stack constraint
- **Hostinger** — Web hosting
- **Firebase** — Auth, Firestore, Cloud Functions, FCM
- **Google AI Studio (Gemini)** — Moderation & AI features

---

## Proposed architecture

### Realtime transport
Firestore's `onSnapshot` listener.

### Data model
```
/users/{uid}
  - email, displayName, tier ("free" | "paid"), fcmTokens[]

/anonymousHandles/{handleId}
  - publicKey (Curve25519, base64)
  - linkedUserHash (sha256(uid + salt))

/conversations/{convId}
  - participants: [uid or handleId]
  - tier: "free" | "paid"

/conversations/{convId}/messages/{msgId}
  - text (plaintext for free)
  - ciphertext, nonce (paid)
```

---

## Gemini's Critical Review & Pushback

### 1. Is the architecture sound for the stated stack constraint?
**Soundness:** 8/10 for 1:1 chat. Firestore is excellent for this.
**Warning:** Do not use `onSnapshot` without a strict `.limit()`. If a user has 5,000 messages, loading them all on every open will crush your Firebase read quota (and the user's mobile data). 
**Pushback:** Firebase doesn't have a native "isTyping" or "Online" state that scales well in Firestore (due to write costs). You'll either have a "static" feeling chat or you'll burn through your Spark write limits just showing "..." bubbles.

### 2. Is the E2EE design defensible?
**Defensibility:** 7/10. Curve25519 is "gold standard."
**The Structural Gap:** You have no **Forward Secrecy**. If a user's private key is stolen from IndexedDB (via XSS or local access), their *entire history* can be decrypted. High-end chat apps use "Double Ratchet" to change keys per message. 
**Multi-Device Trap:** If a user logs in on a laptop after using their phone, they will see gibberish because the laptop doesn't have the key. You *must* implement the "Passphrase Recovery" flow early, or your support inbox will be flooded with "I lost my chats."

### 3. Is the anonymity claim honest?
**Weak Point:** `sha256(uid + salt)` is not as anonymous as you think. If the admin (you) has the salt and the global list of UIDs (which you do in Firebase), you can brute-force every handle in seconds. 
**The Fix:** If you want to be "honest," avoid the hash. Let the handle be a completely decoupled ID. A user "proves" ownership via a signature, not a database link.

### 4. Push notifications — are they safe?
**Metadata Leakage:** FCM is the snitch. Google technically knows that `Handle A` sent a notification to `FCM Token B` (which is linked to `Google Account C`). 
**Pattern Fix:** For the Paid Tier, the notification payload should be empty: `{"type": "sync"}`. The client wakes up, checks Firestore, and only then shows "New Message." This hides the sender handle from the FCM log.

### 5. Firestore Security Rules
**The "Admin" Myth:** You cannot block the Firebase Admin SDK with rules. Your only defense is that you (the admin) don't have the private key.
**Rule Strategy:** Rules must strictly enforce that if `tier !== 'paid'`, the client cannot write to the `ciphertext` field. This prevents "downgrade attacks" where a user is tricked into sending plaintext to a "paid" conversation.

### 6. Cost trajectory
**The Spark Ceiling:** 50k reads/day sounds high, but in a 1:1 chat, every message sent is 1 write + 1 read for the recipient. If 100 users send 20 messages a day, that's 4,000 reads/writes. You'll hit the write limit (20k) way before the read limit. Chat is "write-heavy"—expect to move to Blaze ($$$) the moment you have >500 daily active users.

### 7. What did I miss?
- **Abuse Reporting:** How do you ban a harasser in a Paid/Encrypted chat? You need a "Report" button that bundle-signs the plaintext + sender's public key to prove the abuse to you.
- **Local Search:** Search won't work server-side. You'll need to build a client-side index, which is computationally expensive for mobile PWAs.
- **Key Rotation:** What happens when a user loses their phone?

### 8. Build order critique
**Strongly recommend moving E2EE to Phase 2.** Building a "Free Chat" and "bolting on" encryption later is how security bugs happen. If E2EE is your value prop, build the crypto-handshake simultaneously with the UI.

---
**Status:** Architecture Review Complete.
**Verdict:** Viable for MVP, but the "Anonymity" claim needs a disclaimer regarding Google's metadata visibility.
