# GreenID Deployment Guide

This guide will walk you through deploying the GreenID application for free using **Vercel** (Frontend) and **Render** (Backend & ML Service).

---

## 🏗️ 1. Backend Deployment (Node.js) - Render

1.  **Push Code to GitHub**: Ensure your latest changes are pushed to your GitHub repository.
2.  **Login to Render**: Go to [render.com](https://render.com/) and log in with GitHub.
3.  **New Web Service**:
    *   Click **New +** -> **Web Service**.
    *   Select your `GreenID` repository.
4.  **Configure Service**:
    *   **Name**: `greenid-backend`
    *   **Root Directory**: `Backend` (Important!)
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Plan**: Free
5.  **Environment Variables**:
    *   Scroll down to "Environment Variables" and add:
        *   `MONGO_URI`: Your MongoDB connection string.
        *   `JWT_SECRET`: Your secret key.
        *   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary name.
        *   `CLOUDINARY_API_KEY`: Your Cloudinary API key.
        *   `CLOUDINARY_API_SECRET`: Your Cloudinary secret.
        *   `GEMINI_API_KEY`: Your Google Gemini API key.
        *   `ML_SERVICE_URL`: `https://greenid-ml-service.onrender.com` (You will update this *after* deploying the ML service).
        *   `FRONTEND_URL`: `https://your-vercel-app.vercel.app` (You will update this *after* deploying the frontend).
6.  **Deploy**: Click **Create Web Service**.

---

## 🧠 2. ML Service Deployment (Python) - Render

1.  **New Web Service**: In Render dashboard, click **New +** -> **Web Service**.
2.  **Select Repo**: Select the same `GreenID` repository.
3.  **Configure Service**:
    *   **Name**: `greenid-ml-service`
    *   **Root Directory**: `ml_models` (Important!)
    *   **Environment**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `gunicorn ml_service:app`
    *   **Plan**: Free
4.  **Environment Variables**:
    *   `PYTHON_VERSION`: `3.10.12` (Recommended)
5.  **Deploy**: Click **Create Web Service**.
6.  **Copy URL**: Once deployed, copy the service URL (e.g., `https://greenid-ml-service.onrender.com`) and **update the `ML_SERVICE_URL` in your Backend service settings**.

---

## 🎨 3. Frontend Deployment (React) - Vercel

1.  **Login to Vercel**: Go to [vercel.com](https://vercel.com/) and log in with GitHub.
2.  **Add New Project**: Click **Add New...** -> **Project**.
3.  **Import Repo**: Import your `GreenID` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `FrontEnd`.
    *   **Build Command**: `npm run build` (Default)
    *   **Output Directory**: `dist` (Default)
5.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed Backend (e.g., `https://greenid-backend.onrender.com`).
    *   `VITE_FIREBASE_API_KEY`: Your Firebase Config.
    *   `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase Config.
    *   `VITE_FIREBASE_PROJECT_ID`: Your Firebase Config.
    *   `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase Config.
    *   `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase Config.
    *   `VITE_FIREBASE_APP_ID`: Your Firebase Config.
6.  **Deploy**: Click **Deploy**.
7.  **Final Step**: Copy the Vercel URL (e.g., `https://greenid-frontend.vercel.app`) and **update the `FRONTEND_URL` in your Backend service settings** on Render.

---

## ✅ Final Checklist

1.  **Update CORS**: Ensure your Backend `FRONTEND_URL` matches your specific Vercel URL.
2.  **Update ML URL**: Ensure your Backend `ML_SERVICE_URL` matches your Render ML service URL.
3.  **Test**: Open your Vercel URL, login, and test a full flow (Log activity -> ML Verification -> Database update).

🚀 **Your GreenID application is now live!**
