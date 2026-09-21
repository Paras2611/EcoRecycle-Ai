import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.database.session import engine, Base
from backend.app.database.seed import seed_database
from backend.app.api.endpoints import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist and seed initial data
    Base.metadata.create_all(bind=engine)
    count = seed_database()
    print(f"[EcoRecycle AI] Database initialized with {count} facilities indexed.")
    yield
    # Shutdown
    print("[EcoRecycle AI] Backend shutdown complete.")

app = FastAPI(
    title="EcoRecycle AI — Spatial Waste Intelligence API",
    description="Deep Learning-based waste classification, area composition analysis, and geospatial recycling recommendation engine.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server & Vercel production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "project": "EcoRecycle AI",
        "description": "Deep Learning + Geospatial Waste Recycling Recommender",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=port, reload=True)
