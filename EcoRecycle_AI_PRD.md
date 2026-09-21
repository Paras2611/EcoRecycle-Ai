# PRD — EcoRecycle AI

## 1. Project Overview

**Project Name:** EcoRecycle AI  
**Project Type:** Deep Learning + Geospatial Recommendation + Waste Management  
**Frontend:** React.js / Vite → Vercel  
**Backend:** FastAPI / Python → Render  
**ML/DL:** TensorFlow / PyTorch  
**Database:** PostgreSQL  
**Maps & Location:** OpenStreetMap + OpenRouteService/Google Maps API  
**Deployment:** Vercel + Render

### Core Idea

EcoRecycle AI is a web application that analyzes the **type and quantity of waste generated in a selected geographical area** and recommends suitable recycling/disposal methods by identifying **nearby recycling industries or waste-processing facilities**.

The system combines:

1. **Deep Learning-based waste classification**
2. **Area-wise waste analysis**
3. **Waste-to-recycling-process mapping**
4. **Nearest recycling-industry discovery**
5. **Distance and transportation analysis**
6. **Recycling recommendations**
7. **Analytics dashboard**

---

## 2. Problem Statement

Waste generated in residential, commercial, institutional, and industrial areas is often mixed together. This makes proper recycling difficult.

Current problems include:

- Lack of information about the composition of waste in a particular area.
- Difficulty identifying recyclable materials.
- Improper segregation of waste.
- Lack of awareness about appropriate recycling methods.
- Difficulty locating suitable recycling facilities.
- Unnecessary transportation of waste to distant facilities.
- Limited data-driven decision-making for local waste management.

### Proposed Solution

EcoRecycle AI will allow a user to select an area or upload waste images/data.

The system will:

> **Analyze → Classify → Quantify → Recommend → Locate → Optimize**

Example:

**Selected Area:** Karad

| Waste Type | Estimated Share |
|---|---:|
| Plastic | 32% |
| Organic | 28% |
| Paper | 18% |
| Glass | 12% |
| Metal | 7% |
| E-waste | 3% |

The application then recommends suitable recycling processes and identifies nearby facilities capable of handling each waste category.

---

## 3. Objectives

### Primary Objectives

1. Detect waste categories using Deep Learning.
2. Analyze waste composition for a selected area.
3. Identify recyclable and non-recyclable waste.
4. Recommend suitable recycling methods.
5. Find nearby recycling industries/facilities.
6. Calculate approximate distance from the selected area.
7. Provide actionable waste-management recommendations.
8. Provide analytics for municipalities, organizations, and communities.

### Secondary Objectives

- Reduce improper waste disposal.
- Improve waste segregation.
- Reduce unnecessary transportation.
- Encourage local recycling.
- Generate useful waste-management data.

---

## 4. Target Users

### 4.1 General Users

Users can:

- Select an area.
- Upload waste images.
- Analyze waste.
- View recycling recommendations.
- Find nearby recycling facilities.

### 4.2 Municipal Authorities

Municipalities can:

- Analyze area-wise waste generation.
- Identify major waste categories.
- Locate recycling facilities.
- Plan collection routes.
- Monitor recycling potential.

### 4.3 Waste Management Companies

Companies can:

- Identify waste sources.
- Analyze waste composition.
- Find potential recyclable material.
- Identify nearby processing facilities.

### 4.4 Recycling Industries

Recycling companies can:

- Register their facilities.
- Specify accepted waste types.
- Specify processing capacity.
- Provide location and contact information.

---

## 5. Main Application Workflow

```text
                    USER
                      |
                      ↓
              Select Geographic Area
                      |
             ┌────────┴─────────┐
             ↓                  ↓
        Upload Images       Enter Waste Data
             |                  |
             └────────┬─────────┘
                      ↓
             Deep Learning Model
                      ↓
             Waste Classification
                      ↓
              Waste Composition
                      ↓
             Recycling Knowledge Base
                      ↓
            Suitable Recycling Method
                      ↓
             Geospatial Processing
                      ↓
       Find Nearby Recycling Facilities
                      ↓
          Distance + Compatibility
                      ↓
          Recycling Recommendations
                      ↓
                Dashboard
```

---

## 6. Core Features

### 6.1 Area Selection

Users can select an area using:

- Search by city
- Search by locality
- Pin location on map
- Draw/select an area
- Enter latitude/longitude

Example:

```text
Selected Area
     ↓
Karad
Maharashtra
India
```

---

## 7. Waste Image Upload

Users can upload:

- JPG
- JPEG
- PNG
- Multiple images

Example:

```text
Upload Waste Images

[ image1.jpg ]
[ image2.jpg ]
[ image3.jpg ]

        ↓

      ANALYZE
```

### Supported Categories

Initial model:

1. Plastic
2. Paper
3. Cardboard
4. Glass
5. Metal
6. Organic
7. Textile
8. E-waste
9. Wood
10. Other

---

## 8. Deep Learning Waste Classification

This is the primary AI component.

### Proposed Architecture

Use a pretrained CNN/vision model with transfer learning.

### Option 1 — MobileNetV3

Suitable for a compact application.

Advantages:

- Lightweight
- Fast inference
- Lower computational requirements
- Suitable for deployment

### Option 2 — EfficientNet-B0

Provides a good balance between:

- Accuracy
- Model size
- Inference speed

### Option 3 — ResNet50

Can be used as a higher-capacity baseline.

---

## 9. Deep Learning Pipeline

```text
Waste Image
     ↓
Image Resize
     ↓
Normalization
     ↓
Data Augmentation
     ↓
CNN / Transfer Learning Model
     ↓
Feature Extraction
     ↓
Classification Layer
     ↓
Waste Category
     ↓
Confidence Score
```

Example:

```json
{
  "classification": "Plastic",
  "confidence": 0.94
}
```

---

## 10. Multi-Image Area Analysis

A major feature of the project should be **area-level analysis rather than only image classification**.

Suppose the user uploads 100 waste images.

The system performs:

```text
100 Images
    ↓
Deep Learning Classification
    ↓
Individual Predictions
    ↓
Aggregation
    ↓
Area Waste Composition
```

Example:

```text
Plastic     ████████████████ 32%
Organic     ██████████████   28%
Paper       █████████         18%
Glass       ██████            12%
Metal       ███                7%
E-Waste     ██                 3%
```

---

## 11. Waste Analysis Engine

The backend aggregates predictions.

### Formula

For waste category `i`:

\[
WasteShare_i =
\frac{Count_i}{TotalWasteItems} \times 100
\]

Example:

```text
Total detected items = 500

Plastic = 160

Plastic Share =
160 / 500 × 100

= 32%
```

---

## 12. Recycling Recommendation Engine

The system should maintain a knowledge base mapping waste types to possible processing methods.

| Waste | Recommended Process |
|---|---|
| Plastic | Mechanical recycling |
| PET | Washing + shredding + pelletizing |
| Paper | Pulping + de-inking |
| Glass | Crushing + remelting |
| Metal | Sorting + melting |
| Organic | Composting / Biogas |
| E-waste | Authorized e-waste processing |
| Textile | Fiber recovery |
| Wood | Reuse / biomass processing |

The recommendation engine should consider:

```text
Waste Type
+
Contamination
+
Quantity
+
Facility Capability
+
Distance
+
Processing Capacity
=
Recommendation
```

---

## 13. Recycling Industry Database

Each facility should have:

```text
Facility ID
Facility Name
Address
Latitude
Longitude
Waste Types Accepted
Processing Methods
Daily Capacity
Contact
Operating Status
Verification Status
```

Example:

```json
{
  "name": "ABC Plastic Recycling",
  "latitude": 16.70,
  "longitude": 74.22,
  "accepted_waste": [
    "Plastic",
    "PET"
  ],
  "capacity_tons_per_day": 20
}
```

---

## 14. Nearest Recycling Facility

The application should identify facilities based on:

### 1. Waste compatibility

Does the facility accept the detected waste?

### 2. Distance

How far is the facility?

### 3. Capacity

Can the facility handle the estimated quantity?

### 4. Processing method

Can it actually process the material?

---

## 15. Distance Calculation

Use geographic coordinates.

For example, Haversine distance:

\[
d = 2R\arcsin(\sqrt{
\sin^2(\frac{\Delta\phi}{2}) +
\cos(\phi_1)\cos(\phi_2)
\sin^2(\frac{\Delta\lambda}{2})
})
\]

Where:

- `R` = Earth's radius
- `φ` = latitude
- `λ` = longitude

For actual road distance, use:

**OpenRouteService** or another routing API.

---

## 16. Facility Recommendation Algorithm

Example:

```text
Detected Waste
      ↓
Plastic
      ↓
Find facilities accepting plastic
      ↓
Filter operational facilities
      ↓
Calculate distance
      ↓
Check processing capacity
      ↓
Calculate compatibility
      ↓
Return suitable facilities
```

Example output:

```text
Plastic Waste

Recommended Facility:
ABC Recycling Center

Distance: 8.4 km
Accepted: Plastic, PET
Capacity: 20 tons/day
Process: Mechanical Recycling
```

---

## 17. Recommendation Score

The application can calculate an internal suitability score.

Example:

\[
Score =
W_cC + W_dD + W_kK
\]

Where:

- `C` = compatibility
- `D` = distance factor
- `K` = capacity availability

The score should be used internally to select facilities, rather than presenting it as a subjective rating.

---

## 18. Dashboard

## Main Dashboard

```text
+------------------------------------------------+
|              EcoRecycle AI                     |
+------------------------------------------------+

 Selected Area: Karad, Maharashtra

 Total Waste Analyzed       500 Items

+------------+------------+------------+
| Plastic    | Organic    | Paper      |
| 32%        | 28%        | 18%        |
+------------+------------+------------+

+---------------------------------------------+
| Waste Composition                           |
|                                             |
| Plastic      ███████████████                |
| Organic      █████████████                  |
| Paper        █████████                      |
| Glass        ██████                         |
| Metal        ███                            |
+---------------------------------------------+

Nearby Recycling Facilities

1. ABC Plastic Recycling       8.4 km
2. XYZ Paper Recycling        11.2 km
3. Green Waste Processing     14.6 km
```

---

## 19. Map Interface

Use:

**Leaflet + OpenStreetMap**

Map displays:

- Selected area
- User-selected location
- Recycling facilities
- Waste collection points
- Facility categories

Example:

```text
                 MAP

          [Plastic Facility]
                  ●

    Selected Area
         ★

                         ●
                  [Paper Facility]

              ●
        [Organic Facility]
```

---

## 20. Frontend Architecture

The frontend must be optimized for **Vercel**.

### Technology

```text
React
Vite
JavaScript / TypeScript
Tailwind CSS
Leaflet
Recharts
Axios
```

### Frontend Structure

```text
frontend/
│
├── src/
│   ├── components/
│   │   ├── Navbar
│   │   ├── AreaSelector
│   │   ├── ImageUploader
│   │   ├── WasteChart
│   │   ├── FacilityCard
│   │   ├── MapView
│   │   └── RecommendationCard
│   │
│   ├── pages/
│   │   ├── Home
│   │   ├── Analyze
│   │   ├── Results
│   │   ├── Facilities
│   │   └── Dashboard
│   │
│   ├── services/
│   │   └── api.js
│   │
│   └── App.jsx
│
├── public/
├── package.json
└── vite.config.js
```

---

## 21. Backend Architecture

Backend should be optimized for **Render**.

### Recommended Stack

```text
Python
FastAPI
TensorFlow/PyTorch
SQLAlchemy
PostgreSQL
Pydantic
Uvicorn
```

Architecture:

```text
                    FastAPI
                       |
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
   ML Service      Analysis Service   Geo Service
       |               |                |
       ↓               ↓                ↓
 Deep Learning      Waste DB       Maps/Routing
       |               |
       └───────┬───────┘
               ↓
           PostgreSQL
```

---

## 22. Backend API

### Analyze Image

```http
POST /api/v1/analyze/image
```

Request:

```text
multipart/form-data
image
```

Response:

```json
{
  "waste_type": "plastic",
  "confidence": 0.94
}
```

### Analyze Multiple Images

```http
POST /api/v1/analyze/batch
```

Response:

```json
{
  "total_images": 100,
  "composition": {
    "plastic": 32,
    "organic": 28,
    "paper": 18,
    "glass": 12,
    "metal": 7,
    "ewaste": 3
  }
}
```

---

## 23. Area Analysis API

```http
POST /api/v1/area/analyze
```

Request:

```json
{
  "latitude": 16.6956,
  "longitude": 74.2317,
  "radius_km": 10
}
```

---

## 24. Recycling Recommendation API

```http
POST /api/v1/recommendations
```

Request:

```json
{
  "waste_type": "plastic",
  "quantity_kg": 120
}
```

Response:

```json
{
  "method": "Mechanical Recycling",
  "facilities": [
    {
      "name": "ABC Recycling",
      "distance_km": 8.4,
      "capacity_tpd": 20
    }
  ]
}
```

---

## 25. Facility Search API

```http
GET /api/v1/facilities/nearby
```

Parameters:

```text
latitude
longitude
waste_type
radius
```

---

## 26. Database Design

### Users

```text
users
---------
id
name
email
password_hash
role
created_at
```

### Waste Analysis

```text
waste_analysis
--------------
id
user_id
latitude
longitude
area_name
total_items
created_at
```

### Waste Results

```text
waste_results
-------------
id
analysis_id
waste_type
confidence
quantity
```

### Recycling Facilities

```text
recycling_facilities
--------------------
id
name
address
latitude
longitude
contact
capacity_tpd
status
verified
```

### Facility Waste Types

```text
facility_waste_types
--------------------
id
facility_id
waste_type
processing_method
```

---

## 27. Authentication

Optional MVP feature:

```text
Register
   ↓
Login
   ↓
JWT Authentication
   ↓
Dashboard
```

Roles:

```text
USER
ADMIN
FACILITY_OWNER
```

---

## 28. Admin Panel

Admin can:

- Add recycling facilities.
- Edit facility information.
- Remove invalid facilities.
- Verify facilities.
- Manage waste categories.
- View system analytics.
- Monitor AI predictions.
- Manage users.

---

## 29. AI Model Training

### Dataset

Possible datasets:

- TrashNet
- TACO Dataset
- Custom waste dataset

For better real-world performance, create a **custom Indian waste dataset** containing images from:

- Residential areas
- Markets
- Colleges
- Roads
- Public places
- Industrial areas

---

## 30. Training Pipeline

```text
Dataset
   ↓
Data Cleaning
   ↓
Image Labeling
   ↓
Train / Validation / Test
   ↓
Data Augmentation
   ↓
Transfer Learning
   ↓
Model Training
   ↓
Validation
   ↓
Evaluation
   ↓
Model Export
```

Example split:

```text
Training     70%
Validation   15%
Testing      15%
```

---

## 31. Model Evaluation

Track:

### Accuracy

\[
Accuracy =
\frac{Correct Predictions}{Total Predictions}
\]

### Precision

\[
Precision =
\frac{TP}{TP+FP}
\]

### Recall

\[
Recall =
\frac{TP}{TP+FN}
\]

### F1 Score

\[
F1 =
2 \times
\frac{Precision \times Recall}
{Precision + Recall}
\]

Also generate:

- Confusion Matrix
- Classification Report
- Per-class accuracy

---

## 32. Important Deep Learning Feature

Instead of only returning:

```text
Plastic
```

the model should return:

```text
Plastic
Confidence: 94%
```

And potentially:

```text
Detected Objects:
Plastic Bottle
Plastic Bag
PET Container
```

A future version can use:

**YOLO / object detection**

instead of only image classification.

---

## 33. MVP Version

The first version should remain compact.

### MVP includes:

- Area selection
- Image upload
- Deep Learning classification
- Waste composition analysis
- Recycling recommendation
- Nearby recycling facility search
- Map
- Dashboard

### Exclude initially:

- Complex route optimization
- IoT sensors
- Mobile application
- Live municipal integration
- Advanced forecasting
- Automated waste collection

This keeps the project realistic for a student/developer implementation.

---

## 34. Future Version

### Phase 2

Add:

- Waste quantity prediction
- Historical analysis
- Time-series forecasting
- Municipal dashboards
- Facility registration
- User reports

### Phase 3

Add:

- IoT smart bins
- Camera-based continuous waste monitoring
- Smart collection routing
- Waste truck tracking
- Carbon-emission estimation

### Phase 4

Add:

- AI-powered waste generation forecasting
- Computer vision object detection
- Automated recycling logistics
- Industrial demand prediction

---

## 35. Deployment Architecture

```text
                         INTERNET
                            |
             ┌──────────────┴──────────────┐
             ↓                             ↓
        VERCEL                         RENDER
       Frontend                        Backend
             |                             |
       React + Vite                    FastAPI
             |                             |
             |                     Deep Learning Model
             |                             |
             |                        PostgreSQL
             |                             |
             └──────────── API ────────────┘
                            |
                    External Services
                            |
                ┌───────────┴───────────┐
                ↓                       ↓
          OpenStreetMap             Routing API
```

---

## 36. Vercel Requirements

Frontend should be:

- Stateless
- SPA compatible
- Environment-variable based
- API-driven
- No local server dependency

`.env`

```env
VITE_API_BASE_URL=https://your-backend.onrender.com
```

---

## 37. Render Requirements

Backend:

```text
Python 3.11+
FastAPI
Uvicorn
TensorFlow/PyTorch
SQLAlchemy
PostgreSQL
```

Example start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Environment variables:

```env
DATABASE_URL=
MODEL_PATH=
MAP_API_KEY=
SECRET_KEY=
CORS_ORIGINS=
```

---

## 38. Project Structure

```text
EcoRecycleAI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── ml/
│   │   ├── database/
│   │   └── utils/
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/
│   ├── dataset/
│   ├── notebooks/
│   ├── train.py
│   ├── evaluate.py
│   └── models/
│
├── database/
│   └── schema.sql
│
├── docs/
│   └── architecture.md
│
├── .gitignore
└── README.md
```

---

## 39. Key Innovation

The project's innovation should not be presented as simply:

> "AI detects waste."

Instead, the complete innovation is:

> **A Deep Learning-powered spatial waste intelligence system that analyzes waste composition within a selected geographical area and connects identified waste categories with geographically accessible recycling facilities based on material compatibility, processing capability, capacity, and distance.**

This gives the project three major components:

```text
Computer Vision
       +
Geospatial Intelligence
       +
Recycling Recommendation
```

---

## 40. Example End-to-End Scenario

### User selects:

**Area:** Karad, Maharashtra  
**Radius:** 10 km

Uploads:

```text
100 waste images
```

AI detects:

```text
Plastic     32%
Organic     28%
Paper       18%
Glass       12%
Metal        7%
E-Waste      3%
```

System generates:

### Plastic

```text
Recommended:
Mechanical Recycling

Nearest compatible facility:
8.4 km
```

### Organic

```text
Recommended:
Composting / Biogas

Nearest compatible facility:
6.7 km
```

### Paper

```text
Recommended:
Pulping & Paper Recycling

Nearest compatible facility:
11.2 km
```

The dashboard then displays:

```text
                    WASTE ANALYSIS

             Total Items: 100

             Plastic       32%
             Organic       28%
             Paper         18%
             Glass         12%
             Metal          7%
             E-Waste        3%

                 RECOMMENDATIONS

Plastic → Mechanical Recycling → 8.4 km
Organic → Composting           → 6.7 km
Paper   → Paper Recycling       → 11.2 km

                    MAP
          [Recycling Facilities]
```

---

## 41. Success Metrics

| Metric | Target |
|---|---:|
| Waste classification accuracy | ≥ 85% |
| F1 Score | ≥ 0.80 |
| API response time | < 3 sec* |
| Facility search | < 2 sec* |
| Image upload | < 5 sec* |
| Supported waste classes | 8–10 |
| Facility matching accuracy | ≥ 90% |

\*Excluding cold starts and external API latency.

---

## 42. Final Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| UI | Tailwind CSS |
| Charts | Recharts |
| Maps | Leaflet + OpenStreetMap |
| Backend | Python FastAPI |
| Deep Learning | TensorFlow/PyTorch |
| Model | EfficientNet-B0 / MobileNetV3 |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT |
| API | REST |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| ML Model Storage | Render-compatible storage / object storage |
| Version Control | Git + GitHub |

## Recommended Final Architecture

**React/Vite on Vercel + FastAPI on Render + PostgreSQL + EfficientNet/MobileNet-based waste classifier + OpenStreetMap/Leaflet + recycling-facility database.**

This architecture keeps the application **compact enough for a student project**, while still giving it a clear **Deep Learning + AI + Geospatial + Business/Environmental impact** component suitable for an MCA major project.
