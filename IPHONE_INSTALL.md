# Install Vizrr on iPhone (easy guide)

No Mac or App Store needed. Install Vizrr like an app in **3 taps**.

---

## Step 1 — Put Vizrr online (HTTPS)

iPhone requires a secure link (`https://`). Easiest free option:

### Deploy on Render (recommended)

1. Push this project to **GitHub**
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your repo
4. Use these settings:
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
5. Add environment variables in Render:
   - `MONGODB_URI` — your MongoDB connection string
   - `VITE_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
   - `CLERK_SECRET_KEY` — from Clerk dashboard
   - Any other keys in `server/.env.example`
6. Click **Deploy**

You get a URL like: `https://vizrr-xxxx.onrender.com`

### Configure Clerk

In [Clerk Dashboard](https://dashboard.clerk.com) → **Domains**, add:

`https://vizrr-xxxx.onrender.com`

---

## Step 2 — Install on iPhone

1. On your iPhone, open **Safari**
2. Go to your Vizrr URL (`https://vizrr-xxxx.onrender.com`)
3. Tap **Get App** in the menu, or go to `/get-app`
4. Follow on-screen steps:
   - Tap **Share** (bottom of Safari)
   - Tap **Add to Home Screen**
   - Tap **Add**

Done — the **Vizrr** icon is on your Home Screen.

---

## Step 3 — Open & use

Tap the Vizrr icon. It opens full-screen like a native app:

- AI Face Analyser
- Account & orders
- Cart & checkout

---

## Share with others

Open `https://your-url.onrender.com/get-app` — they see install steps and a QR code.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| No “Add to Home Screen” | Use **Safari**, not Chrome |
| Blank page after install | Set `VITE_API_BASE=/api` before build; redeploy |
| Sign-in fails | Add your HTTPS URL in Clerk allowed origins |
| Camera blocked | Allow camera when prompted (AI Analyser) |

---

## Native App Store (optional, needs Mac)

```bash
cd client
npm run app:ios
```

Opens Xcode on a Mac → Run on iPhone or submit to App Store.
