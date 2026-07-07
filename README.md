# People's Priorities

A digital grievance register that connects citizens directly to their MP's office — complaints get logged, AI-scored, and ranked so the office always knows what to fix first.

**Hackathon:** Google Cloud "Build with AI: Code for Communities"

---

<img src="demo.png"/>

---

## About the Project

Civic complaints usually go nowhere — a WhatsApp forward, a paper petition, a comment at a ward office — with no record and no way to compare which issues actually affect the most people.

**People's Priorities** fixes that with two portals:

- **Citizens** file a grievance (title, category, ward, description + optional photo/voice note), track its status, and upvote issues their neighbors raised.
- **MPs / staff** get a dashboard where every complaint is auto-summarized by Gemini AI, scored for urgency + impact, and ranked so the highest-priority issues surface automatically. They can also manage welfare schemes and generate PDF reports.

**Priority formula:**
```
priority_score = urgency × ln(estimated_impact + 1) × (1 + upvotes / 20)
```

If no Gemini API key is set, a built-in keyword-based fallback keeps everything working end-to-end.

## Tech Stack

React 19 · Vite 6 · Tailwind CSS v4 · Express · Firebase Auth · Google Cloud Firestore · Gemini API · Google Maps Platform (heatmap) · jsPDF

## Setup Guide

**Prerequisites:** Node.js 18+

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and add your keys (both optional — app works without them)
cp .env.example .env
#   GEMINI_API_KEY            -> real AI scoring instead of fallback heuristic
#   GOOGLE_MAPS_PLATFORM_KEY  -> enables ward heatmap

# 3. Run locally
npm run dev
```
App runs at **http://localhost:3000**.

For production:
```bash
npm run build
npm start
```

### Creating `firebase-applet-config.json`

This file isn't in the repo (it holds your project's Firebase keys) — you need to create it yourself:

1. Go to the [Firebase Console](https://console.firebase.google.com) and create a new project (or open an existing one).
2. In **Project settings → General**, scroll to "Your apps" and click the **`</>`** (web) icon to register a new web app.
3. Firebase will show you a `firebaseConfig` object — you'll use these values in step 5.
4. Enable sign-in methods: go to **Authentication → Sign-in method** and turn on **Email/Password** and **Google**.
5. Enable the database: go to **Firestore Database → Create database** (start in production mode, since `firestore.rules` is already provided).
6. In the project root, create a file named `firebase-applet-config.json` with this shape, filled in with your values from step 3:

   ```json
   {
     "projectId": "your-project-id",
     "appId": "your-app-id",
     "apiKey": "your-api-key",
     "authDomain": "your-project-id.firebaseapp.com",
     "firestoreDatabaseId": "(default)",
     "storageBucket": "your-project-id.appspot.com",
     "messagingSenderId": "your-sender-id",
     "measurementId": ""
   }
   ```

7. Deploy the Firestore rules (needs the [Firebase CLI](https://firebase.google.com/docs/cli)):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # select your project
   firebase deploy --only firestore:rules
   ```

That's it — `src/firebase.js` reads this file directly, so the app picks it up on the next `npm run dev`.

## Demo Credentials

| Role | Username | Password |
|---|---|---|
| MP | `mp@people.in` | `password123` |
| Citizen | `citizen@people.in` | `password123` |

## License

Apache-2.0
