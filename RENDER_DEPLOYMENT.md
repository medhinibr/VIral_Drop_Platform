# Render.com CI/CD Deployment Guide (Monolith)

Since you want a **single URL** that handles both your frontend and your backend, we have configured your Node.js/Express backend to serve the compiled Vite frontend files automatically!

This means you only need **ONE** Render Web Service to host your entire platform.

---

## 🛑 Phase 1: Create the Web Service in Render

1. Go to your Render Dashboard and create a **New Web Service**.
2. Connect your GitHub repository (`viral-drop-v2`).
3. Set up the environment settings exactly as follows:
   * **Name**: `viral-drop-platform`
   * **Language**: `Node`
   * **Root Directory**: *(Leave empty)*
   * **Build Command**: `npm run build` *(This runs the unified pipeline we injected into your package.json)*
   * **Start Command**: `npm start`
4. **Important**: Under **Advanced** (or settings), change **"Auto-Deploy"** from `Yes` to `No`. You want your GitHub Action to control this.
5. Add all your **Environment Variables**:
   * `MONGO_URI`
   * `CLOUD_NAME`, `API_KEY`, `API_SECRET`
   * `FIREBASE_SERVICE_ACCOUNT` -> *(Paste the entirety of your serviceAccountKey.json content here)*
   * `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` ... *(Add all your frontend VITE variables too!)*
   * Note: You DO NOT need to add `VITE_API_URL` anymore since both run on the exact same domain.
6. Hit **Create Web Service**. 
7. Go to this new service's Settings page, scroll down to **Deploy Hook**, create a hook, and copy the URL. **Save this hook URL.**

---

## 🛑 Phase 2: Connect Pipeline via GitHub Secrets

Currently in your code inside `.github/workflows/deploy.yml`, we trigger GitHub Actions automatically when you run `git push origin main`. 

However, GitHub needs to know what the secure Webhook URL is to trigger Render.

1. Open your repository on **GitHub.com**.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Name the secret exactly `RENDER_DEPLOY_HOOK_URL` and paste the Deploy Hook you copied in Phase 1.

---

## 🚀 Phase 3: Launch!

Once setup, your pipeline is complete.

1. Commit your changes and push.
   ```bash
   git add .
   git commit -m "Configure Mono-repo for single Render URL"
   git push origin main
   ```
2. What happens now?
   - **GitHub** receives the code.
   - **GitHub Actions** sees the `.github/workflows/deploy.yml` and triggers the deploy hook.
   - **Render** runs the unified build combining both sides, deploys a single Node instance, and everything is accessed through one clean URL with no localhost connections!
