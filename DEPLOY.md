# Deployment Guide

This app has been updated to support deployment to free platforms like Render (backend) and Vercel (frontend), with Authentication powered by Firebase and Database by PostgreSQL.

## Prerequisites

1.  **Firebase Project**:
    *   Go to [Firebase Console](https://console.firebase.google.com/).
    *   Create a project.
    *   Enable **Authentication** -> **Sign-in method** -> **Google**.
    *   Go to Project Settings to get your Web App config (API Key, etc.).
    *   Go to **Service Accounts** and generate a new private key (JSON file).

2.  **PostgreSQL Database**:
    *   Sign up for [Neon](https://neon.tech/) or [Supabase](https://supabase.com/) (both have great free tiers).
    *   Get the `DATABASE_URL` connection string.

## Configuration

### Frontend
1.  Copy `.env.example` to `.env` (or `.env.local`):
    ```bash
    cp .env.example .env.local
    ```
2.  Fill in the `VITE_FIREBASE_...` variables from your Firebase Project Settings.
3.  Set `VITE_API_URL` to your backend URL. For local development, use `http://localhost:3001/api/books`.

### Backend
1.  Navigate to `server/`.
2.  Copy `.env.example` to `.env`:
    ```bash
    cp .env.example .env
    ```
3.  Set `DATABASE_URL` to your Postgres connection string.
4.  Set `ADMIN_EMAIL` to the Google email address you want to have Write access.
5.  **Service Account**:
    *   For **Local**: Download the Firebase Service Account JSON, save it as `service-account.json` in `server/`, and set `GOOGLE_APPLICATION_CREDENTIALS=service-account.json`. (Add this file to `.gitignore`).
    *   For **Production (Render)**: Open the JSON file, copy the *entire content*, and paste it into an environment variable named `FIREBASE_SERVICE_ACCOUNT`.

## Running Locally

1.  Start Backend:
    ```bash
    cd server
    npm install
    npm start
    ```
    (Ensure your Postgres DB is accessible).

2.  Start Frontend:
    ```bash
    # In root directory
    npm install
    npm run dev
    ```

## Deployment

### Backend (Render.com)
1.  Create a new **Web Service**.
2.  Connect your repo.
3.  Root Directory: `server`.
4.  Build Command: `npm install`.
5.  Start Command: `node index.js`.
6.  **Environment Variables**:
    *   `DATABASE_URL`: Your Postgres URL.
    *   `ADMIN_EMAIL`: Your email.
    *   `FIREBASE_SERVICE_ACCOUNT`: Paste key JSON here.
    *   `NODE_VERSION`: `18` or higher.

### Frontend (Vercel)
1.  Import your repo.
2.  **Environment Variables**:
    *   Add all `VITE_FIREBASE_...` variables.
    *   `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://your-app.onrender.com/api/books`).
