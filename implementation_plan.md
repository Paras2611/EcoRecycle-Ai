# Implementation Plan: EcoRecycle AI Full-Stack MVP

Build and integrate the end-to-end **EcoRecycle AI** system according to [TASKS.md](file:///d:/DeepLearning/TASKS.md) and [EcoRecycle_AI_PRD.md](file:///d:/DeepLearning/EcoRecycle_AI_PRD.md), establishing a robust FastAPI backend with geospatial & waste recommendation logic alongside a modern React + Vite frontend with Leaflet maps and Recharts analytics.

---

## User Review Required

> [!IMPORTANT]
> - **Python Version Notice:** The local environment runs **Python 3.14.5**. Heavy frameworks like PyTorch or TensorFlow often lack precompiled wheels for brand new Python versions. To guarantee zero build breaks and immediate out-of-the-box execution, the backend classifier will use an extensible inference engine (using standard image processing / ONNX runtime compatibility with a heuristic fallback engine that simulates neural predictions when torch is unavailable, plus complete training scripts in `ml/`).
> - **Database:** We will configure SQLite by default with automatic SQLAlchemy PostgreSQL dialect compatibility so the project runs immediately with zero external service prerequisites, yet can seamlessly point to PostgreSQL on Render via `DATABASE_URL`.

---

## Open Questions

None currently. The architecture and requirements are specified in detail in [EcoRecycle_AI_PRD.md](file:///d:/DeepLearning/EcoRecycle_AI_PRD.md).

---

## Proposed Implementation Steps

### Phase 1: Backend Scaffolding, Models & Database
1. **Directory Structure Setup**:
   - `backend/app/api/`, `backend/app/models/`, `backend/app/services/`, `backend/app/ml/`, `database/`, `frontend/`.
2. **Database Schema & Models (`backend/app/models/` & `database/schema.sql`)**:
   - `Facility`, `FacilityWasteType`, `WasteAnalysis`, `WasteResult`, `User`.
3. **Seed Data Script (`backend/app/database/seed.py`)**:
   - Pre-populate 20+ realistic recycling facilities across Maharashtra (Karad, Kolhapur, Satara, Pune, Sangli) handling Plastic, Paper, Metal, Glass, Organic, and E-waste.

### Phase 2: Classification Service & Geospatial Recommendation Engine
1. **Waste Classifier (`backend/app/ml/classifier.py`)**:
   - Support standard categories: `Plastic`, `Paper`, `Cardboard`, `Glass`, `Metal`, `Organic`, `Textile`, `E-waste`, `Wood`, `Other`.
   - Single & multi-image batch analysis returning classification + confidence percentages.
2. **Geospatial & Recommendation Engine (`backend/app/services/`)**:
   - `geo_service.py`: Haversine distance computation & radius filtering.
   - `recommendation_service.py`: Knowledge base mapping waste $\to$ recommended processes + multi-factor suitability scoring ($W_c \cdot C + W_d \cdot D + W_k \cdot K$).
3. **FastAPI Endpoints (`backend/app/api/`)**:
   - `POST /api/v1/analyze/image`
   - `POST /api/v1/analyze/batch`
   - `GET /api/v1/facilities/nearby`
   - `POST /api/v1/recommendations`
   - `GET /api/v1/health`

### Phase 3: Frontend Application (React + Vite + Leaflet)
1. **Project Setup**:
   - Bootstrap React + Vite frontend with Tailwind / Vanilla CSS design tokens.
2. **Core Components**:
   - `Navbar` & `Footer` with premium eco-tech design.
   - `AreaSelector`: City/locality search and interactive coordinates selector with radius slider.
   - `ImageUploader`: Drag-and-drop file upload with batch progress indicator.
   - `WasteChart`: Recharts composition charts (percentages & item counts).
   - `MapView`: Leaflet + OpenStreetMap displaying area radius circle and interactive facility pins with popup details.
   - `FacilityCard`: Recommended facilities ordered by proximity and suitability score.
3. **App Integration**:
   - Wire all components together in `App.jsx` with real-time API client (`services/api.js`).

---

## Verification Plan

### Automated Tests
- Run backend test suite via `pytest backend/tests` verifying:
  - Haversine distance accuracy
  - Recommendation scoring algorithm
  - Batch aggregation math ($\text{WasteShare}_i = \frac{\text{Count}_i}{\text{Total}} \times 100$)
  - API endpoint response payloads

### Manual Verification
- Start FastAPI backend with Uvicorn and verify OpenAPI docs at `http://127.0.0.1:8000/docs`.
- Start Vite frontend dev server and test:
  1. Selecting an area (e.g. Karad, Satara).
  2. Uploading test waste images.
  3. Viewing composition chart and nearby recycling facility recommendations on the map.
