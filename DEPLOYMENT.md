# 🚀 EcoRecycle AI — Cloud Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough for deploying the **EcoRecycle AI** application to production:
- **Backend API & PostgreSQL Database** ➔ [Render](https://render.com)
- **Frontend SPA (React + Vite)** ➔ [Vercel](https://vercel.com)

---

## 🌐 Deployment Architecture

```
                          INTERNET / USERS
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
      ┌──────────────────────┐       ┌──────────────────────┐
      │   VERCEL (Frontend)  │       │   RENDER (Backend)   │
      │   React 19 + Vite    │──────▶│   FastAPI + Uvicorn  │
      │   Leaflet + CSS      │ REST  │   Vision Classifier  │
      └──────────────────────┘  API  └──────────┬───────────┘
                 │                                  │
                 ▼                                  ▼
      OpenStreetMap Tiles                 RENDER PostgreSQL DB
                                          (Facilities & Surveys)
```

---

## Part 1: Deploy Backend & Database on Render

> **Order of Deployment:** Always deploy the backend first so you obtain the live backend URL (`https://your-app.onrender.com`) before configuring the frontend.

### Option A: 1-Click Blueprint Deployment via `render.yaml` (Recommended)

The repository includes a ready-to-use [`render.yaml`](file:///d:/DeepLearning/render.yaml) blueprint that provisions both the **Web Service** and the **PostgreSQL Database** in one go.

1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right corner and select **Blueprint**.
3. Connect your GitHub account and select your repository: **`Paras2611/EcoRecycle-Ai`**.
4. Render will detect `render.yaml` and display the resources to be created:
   - **`ecorecycle-backend`** (Python Web Service)
   - **`ecorecycle-db`** (PostgreSQL Database)
5. Click **Apply**.
6. Render will automatically build the environment, link the `DATABASE_URL` between database and backend, and launch the service.

---

### Option B: Manual Step-by-Step Setup on Render

If you prefer to configure the services manually in the Render UI:

#### Step 1: Create the Managed PostgreSQL Database
1. In Render Dashboard, click **New +** ➔ **PostgreSQL**.
2. Fill in the details:
   - **Name:** `ecorecycle-db`
   - **Database Name:** `ecorecycle`
   - **User:** `ecorecycle_user`
   - **Region:** Singapore / Oregon / Frankfurt (Choose region closest to your users)
   - **Plan:** Free
3. Click **Create Database**.
4. Once provisioned, scroll down to **Connections** and copy the **Internal Database URL** (e.g., `postgresql://ecorecycle_user:password@dpg-xxx:5432/ecorecycle`).

#### Step 2: Create the FastAPI Web Service
1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Choose **`Paras2611/EcoRecycle-Ai`**.
4. Configure the settings:
   - **Name:** `ecorecycle-api` (or any unique name)
   - **Region:** Same region as your database
   - **Branch:** `main`
   - **Root Directory:** *(leave blank — runs from repository root)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** Free

#### Step 3: Configure Environment Variables
Under the **Environment Variables** tab for your Web Service, add:

| Key | Value | Description |
|---|---|---|
| `DATABASE_URL` | *(Paste Internal Database URL from Step 1)* | Database connection string |
| `PYTHON_VERSION` | `3.11.8` | Ensures consistent Python runtime |
| `PORT` | `8000` | Target port |
| `CORS_ORIGINS` | `*` *(or your Vercel URL later)* | Allowed origins for web requests |

5. Click **Create Web Service**.

#### Step 4: Verify Backend Deployment
Once the build completes (usually ~2-3 minutes), copy your Render Web Service URL:  
`https://ecorecycle-api.onrender.com`

Verify in your browser:
- **Swagger Documentation:** `https://your-api.onrender.com/docs`
- **Health Check:** `https://your-api.onrender.com/api/v1/health`  
  *(Expected response: `{"status": "healthy", "database_connected": true, "facilities_indexed": 9}`)*

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** ➔ **Project**.
3. Connect your GitHub account and import **`Paras2611/EcoRecycle-Ai`**.

### Step 2: Configure Build Settings
In the Project Configuration screen:
- **Project Name:** `ecorecycle-ai`
- **Framework Preset:** Select **Vite**
- **Root Directory:** Click **Edit** and select **`frontend`** ⚠️ *(Crucial)*

Vercel will auto-populate:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://your-backend-api.onrender.com` | Your live Render backend URL from Part 1 |

> ⚠️ **Note:** Do NOT add a trailing slash `/` at the end of the URL.

### Step 4: Deploy
1. Click **Deploy**.
2. Vercel will build and deploy the React application in ~45 seconds.
3. Once completed, you will receive a production URL:  
   `https://ecorecycle-ai.vercel.app`

---

## Part 3: Verify End-to-End Live Application

1. Open your Vercel URL: `https://ecorecycle-ai.vercel.app`.
2. Observe the top right badge on the Navbar:
   - Should display: `● FastAPI: Online (9 facilities)`.
3. Test **Area Selection**:
   - Click the preset chips (**Karad**, **Satara**, **Kolhapur**).
   - The map pins will dynamically update and re-center.
4. Test **AI Intake & Analytics**:
   - Click **"Load PRD Benchmark (100 Items)"**.
   - The composition breakdown chart will render the official distribution (32% Plastic, 28% Organic, 18% Paper, etc.).
5. Test **Facility Recommendations & Map**:
   - Click on the **Plastic** category bar to filter facilities accepting plastic.
   - Click any facility pin on the Leaflet map to inspect daily capacities and process details.

---

## 🛠️ Common Troubleshooting & Tips

### 1. Render Free-Tier Cold Starts (Spin Down)
- **Symptom:** The first API call takes 30–50 seconds to respond after inactivity.
- **Cause:** Free web services on Render spin down after 15 minutes of inactivity.
- **Fix:** Subsequent requests respond in < 150ms. You can configure a free uptime ping service (e.g. [UptimeRobot](https://uptimerobot.com)) calling `GET /api/v1/health` every 10 minutes to keep the backend warm.

### 2. CORS Errors in Browser Console
- **Symptom:** `Access to fetch at ... from origin ... has been blocked by CORS policy`.
- **Cause:** The backend isn't allowing your Vercel domain.
- **Fix:** In Render Dashboard under Web Service ➔ **Environment Variables**, ensure `CORS_ORIGINS=*` (or include your exact Vercel URL `https://ecorecycle-ai.vercel.app`). Our [`backend/app/main.py`](file:///d:/DeepLearning/backend/app/main.py) allows all origins by default.

### 3. PostgreSQL Dialect URL Issue (`postgres://` vs `postgresql://`)
- **Note:** Render database URLs often begin with `postgres://`, whereas SQLAlchemy 2.0 requires `postgresql://`.
- **Status:** Already handled! Our [`backend/app/database/session.py`](file:///d:/DeepLearning/backend/app/database/session.py) automatically converts `postgres://` to `postgresql://` upon startup.

### 4. Vercel Page Refresh 404 (SPA Client Routing)
- **Status:** Already handled! The included [`frontend/vercel.json`](file:///d:/DeepLearning/frontend/vercel.json) rewrites all incoming routes to `/index.html`.

---

## 📋 Summary of Cloud Configuration Files

| File | Platform | Purpose |
|---|---|---|
| [`render.yaml`](file:///d:/DeepLearning/render.yaml) | Render | Infrastructure as Code for FastAPI Web Service + PostgreSQL |
| [`backend/Dockerfile`](file:///d:/DeepLearning/backend/Dockerfile) | Render / Docker | Containerized Python 3.11 runtime specification |
| [`backend/requirements.txt`](file:///d:/DeepLearning/backend/requirements.txt) | Render | Python package dependencies |
| [`frontend/vercel.json`](file:///d:/DeepLearning/frontend/vercel.json) | Vercel | Single-Page Application rewrite rules |
| [`frontend/vite.config.js`](file:///d:/DeepLearning/frontend/vite.config.js) | Vercel / Vite | Build and asset bundling configuration |

---

Developed for **EcoRecycle AI** — MCA Major Project.
