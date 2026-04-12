# Render.com CI/CD Deployment Guide

This guide ensures your application follows the **Local → GitHub → GitHub Actions → Render → Live App** pipeline accurately. 

Because we decoupled your frontend and backend completely, we will spin up **two separate services** on Render.com but connect them via GitHub Actions and secure environment variables.

---

## 🛑 Phase 1: Set Up Node Backend on Render

1. Go to your Render Dashboard and create a **New Web Service**.
2. Connect your GitHub repository (`viral-drop-v2`).
3. Set up the environment settings exactly as follows:
   * **Name**: `viral-drop-backend` (or similar)
   * **Language**: `Node`
   * **Root Directory**: *(Leave empty)*
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. **Important**: Under **Advanced** (or settings), change **"Auto-Deploy"** from `Yes` to `No`. You want GitHub Actions to control this, not Render.
5. Add the following **Environment Variables**:
   * `MONGO_URI` (Your whole MongoDB string)
   * `CLOUD_NAME`
   * `API_KEY`
   * `API_SECRET`
   * `FIREBASE_SERVICE_ACCOUNT` -> *(Open `serviceAccountKey.json` locally, copy ALL the text, and paste it into this Render variable).*
6. Hit **Create Web Service**. 
7. Go to the new service's Settings page, scroll down to **Deploy Hook**, create a hook, and copy the URL. **Save this hook URL.**

---

## 🛑 Phase 2: Set Up Vite Frontend on Render

1. Go to your Render Dashboard and create a **New Static Site**.
2. Connect the same GitHub repository.
3. Configure the environment settings:
   * **Name**: `viral-drop-frontend`
   * **Root Directory**: `frontend` *(Important!)*
   * **Build Command**: `npm install && npm run build`
   * **Publish Directory**: `frontend/dist`
4. Change **"Auto-Deploy"** from `Yes` to `No`.
5. Add the following **Environment Variables**:
   * `VITE_API_URL` -> *(Paste the Live URL of your Backend you just created from Phase 1, e.g., `https://viral-drop-backend.onrender.com`)*.
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_FIREBASE_STORAGE_BUCKET`
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`
   * `VITE_FIREBASE_APP_ID`
   * `VITE_FIREBASE_MEASUREMENT_ID`
6. Hit **Create Static Site**.
7. Go to this new frontend service's Settings page, scroll down to **Deploy Hook**, create a hook, and copy the URL. **Save this hook URL.**

---

## 🛑 Phase 3: Connect Pipeline via GitHub Secrets

Currently in your code inside `.github/workflows/deploy.yml`, we trigger GitHub Actions automatically when you run `git push origin main`. 

However, GitHub needs to know what the secure Webhook URLs are so it can secretly trigger Render.

1. Open your repository on **GitHub.com**.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Name the first secret `RENDER_BACKEND_DEPLOY_HOOK_URL` and paste the Deploy Hook you copied in Phase 1.
5. Name the second secret `RENDER_FRONTEND_DEPLOY_HOOK_URL` and paste the Deploy Hook you copied in Phase 2.

---

## 🚀 Phase 4: Launch!

Once setup, your pipeline is complete.

1. On your computer, commit your changes.
   ```bash
   git add .
   git commit -m "Initialize Render CI/CD Deployment hooks"
   git push origin main
   ```
2. What will happen?
   - **GitHub** receives the code.
   - **GitHub Actions** sees the `.github/workflows/deploy.yml` and runs the script.
   - The script securely triggers the two hooks.
   - **Render** receives the triggers, downloads your codebase, runs `npm install`, and deploys both independently securely without using `localhost` ports at all.
