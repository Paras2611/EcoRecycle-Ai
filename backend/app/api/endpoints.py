from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, Header, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import WasteAnalysis, WasteResult, RecyclingFacility, User
from backend.app.ml.classifier import classifier
from backend.app.services.geo_service import haversine_distance
from backend.app.services.recommendation_service import (
    get_recommendation_for_waste,
    find_nearby_facilities
)
from backend.app.services.auth_service import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    ensure_demo_user
)
from backend.app.schemas.schemas import (
    ImageAnalysisResponse,
    BatchAnalysisResponse,
    AreaAnalysisRequest,
    FacilityItem,
    RecommendationRequest,
    RecommendationResponse,
    AreaAnalysisResultResponse,
    UserRegister,
    UserLogin,
    UserResponse,
    AuthResponse,
    SavedSessionItem
)

router = APIRouter(prefix="/api/v1", tags=["EcoRecycle API"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """System health and DB connectivity check."""
    facility_count = db.query(RecyclingFacility).count()
    return {
        "status": "healthy",
        "service": "EcoRecycle AI API",
        "version": "1.1.0",
        "database_connected": True,
        "facilities_indexed": facility_count
    }

@router.post("/analyze/image", response_model=ImageAnalysisResponse)
async def analyze_single_image(image: UploadFile = File(...)):
    """
    Analyze a single waste image using MobileNetV2 Deep Learning.
    Returns detected waste class, confidence score, and specific detected object.
    """
    contents = await image.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    pred = classifier.predict_image(contents, filename=image.filename or "")
    return pred

@router.post("/analyze/batch", response_model=BatchAnalysisResponse)
async def analyze_batch_images(
    images: List[UploadFile] = File(...),
    area_name: Optional[str] = Form("Karad, Maharashtra"),
    city_name: Optional[str] = Form(None),
    latitude: Optional[float] = Form(17.2880),
    longitude: Optional[float] = Form(74.1920),
    radius_km: Optional[float] = Form(25.0),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Analyze a batch of waste images for area composition estimation (PRD Section 10, 11 & 22).
    Saves city name and user association to database.
    """
    if not images:
        raise HTTPException(status_code=400, detail="No images provided.")

    # Determine user_id if token provided
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = payload["sub"]

    resolved_city = city_name.strip() if city_name and city_name.strip() else (area_name.split(",")[0].strip() if area_name else "Karad")
    resolved_area = f"{resolved_city}, Maharashtra" if "," not in (area_name or "") else area_name

    predictions = []
    for img in images:
        contents = await img.read()
        pred = classifier.predict_image(contents, filename=img.filename or "")
        predictions.append(pred)

    aggregated = classifier.aggregate_batch(predictions)

    # Persist session in DB
    try:
        analysis_session = WasteAnalysis(
            user_id=user_id,
            latitude=latitude,
            longitude=longitude,
            area_name=resolved_area,
            city_name=resolved_city,
            radius_km=radius_km,
            total_items=aggregated["total_items"]
        )
        db.add(analysis_session)
        db.flush()

        for idx, pred in enumerate(predictions):
            fn = images[idx].filename if idx < len(images) else "image.jpg"
            db.add(WasteResult(
                analysis_id=analysis_session.id,
                waste_type=pred["waste_type"],
                confidence=pred["confidence"],
                quantity=1,
                detected_object=pred.get("detected_object"),
                image_name=fn
            ))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: Failed to log analysis session: {e}")


    return {
        "total_images": aggregated["total_items"],
        "composition": aggregated["composition"],
        "recyclable_count": aggregated["recyclable_count"],
        "non_recyclable_count": aggregated["non_recyclable_count"],
        "recyclable_percentage": aggregated["recyclable_percentage"],
        "predictions": predictions
    }

@router.get("/facilities/nearby", response_model=List[FacilityItem])
def get_nearby_facilities(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0),
    radius_km: float = Query(50.0, gt=0, le=500.0),
    waste_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Find nearby recycling industries and processing plants based on distance and material compatibility.
    """
    results = find_nearby_facilities(
        db=db,
        latitude=latitude,
        longitude=longitude,
        waste_type=waste_type,
        radius_km=radius_km
    )
    return results

@router.post("/recommendations", response_model=RecommendationResponse)
def get_recycling_recommendation(
    payload: RecommendationRequest,
    db: Session = Depends(get_db)
):
    """
    Retrieve recommended recycling processes, best practices, environmental impact,
    and compatible nearby facilities for a specified waste stream.
    """
    proc_info = get_recommendation_for_waste(payload.waste_type)
    nearby = find_nearby_facilities(
        db=db,
        latitude=payload.latitude or 17.2880,
        longitude=payload.longitude or 74.1920,
        waste_type=payload.waste_type,
        radius_km=payload.radius_km or 50.0
    )

    return {
        "waste_type": payload.waste_type,
        "process_info": proc_info,
        "matched_facilities": nearby
    }

@router.post("/area/analyze", response_model=AreaAnalysisResultResponse)
def analyze_area_facilities(
    payload: AreaAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Geospatial area lookup returning all recycling facilities within the selected boundary.
    """
    facilities = find_nearby_facilities(
        db=db,
        latitude=payload.latitude,
        longitude=payload.longitude,
        radius_km=payload.radius_km
    )
    return {
        "area_name": payload.area_name or "Custom Area",
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "radius_km": payload.radius_km,
        "nearby_facilities": facilities
    }

# --- Mappls (MapmyIndia) Integration Endpoints (Resource & Quota Protected) ---

from backend.app.services.mappls_service import mappls_service

@router.get("/mappls/status")
def get_mappls_service_status():
    """
    Check Mappls service connectivity, quota-guard status, and cached entries.
    """
    return mappls_service.get_status()

@router.get("/mappls/reverse-geocode")
def reverse_geocode_location(
    latitude: float = Query(..., ge=-90.0, le=90.0),
    longitude: float = Query(..., ge=-180.0, le=180.0)
):
    """
    Reverse geocode coordinates using Mappls with intelligent caching to conserve quota.
    """
    return mappls_service.reverse_geocode(latitude, longitude)

@router.get("/mappls/driving-distance")
def get_driving_logistics(
    origin_lat: float = Query(..., ge=-90.0, le=90.0),
    origin_lon: float = Query(..., ge=-180.0, le=180.0),
    dest_lat: float = Query(..., ge=-90.0, le=90.0),
    dest_lon: float = Query(..., ge=-180.0, le=180.0)
):
    """
    Calculate logistics route distance & duration with cached results.
    """
    return mappls_service.get_driving_distance(origin_lat, origin_lon, dest_lat, dest_lon)

# --- User Authentication & Session Persistence Endpoints ---

@router.post("/auth/register", response_model=AuthResponse)
def register_user(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=get_password_hash(payload.password),
        role="USER"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
    }

@router.post("/auth/login", response_model=AuthResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    """Login with email & password, or use default demo credentials."""
    email_clean = payload.email.lower().strip()
    
    # Auto-seed demo user if logging into demo account
    if email_clean == "demo@ecorecycle.ai":
        user = ensure_demo_user(db)
    else:
        user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
    }

@router.get("/auth/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Retrieve currently authenticated user profile."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required.")

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at
    }

# --- Saved City Sessions Endpoints ---

@router.get("/user/sessions", response_model=List[SavedSessionItem])
def get_user_saved_sessions(
    city: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Retrieve past saved image analysis sessions with city tags.
    Allows filtering by city name so users can easily recall past sessions and find nearby recycling.
    """
    query = db.query(WasteAnalysis)

    # Filter by user if logged in
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            query = query.filter(WasteAnalysis.user_id == payload["sub"])

    if city and city.strip():
        city_filter = f"%{city.strip().lower()}%"
        query = query.filter(
            (WasteAnalysis.city_name.ilike(city_filter)) | 
            (WasteAnalysis.area_name.ilike(city_filter))
        )

    sessions = query.order_by(WasteAnalysis.created_at.desc()).limit(30).all()
    results = []

    for s in sessions:
        # Build waste breakdown summary
        breakdown = {}
        for r in s.results:
            breakdown[r.waste_type] = breakdown.get(r.waste_type, 0) + 1

        results.append({
            "id": s.id,
            "area_name": s.area_name,
            "city_name": s.city_name or s.area_name.split(",")[0],
            "latitude": s.latitude,
            "longitude": s.longitude,
            "radius_km": s.radius_km,
            "total_items": s.total_items,
            "created_at": s.created_at,
            "waste_summary": breakdown
        })

    return results

@router.get("/sessions/{session_id}/facilities", response_model=List[FacilityItem])
def get_session_nearby_facilities(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Find nearest recycling facilities for a specific saved city session.
    """
    session_obj = db.query(WasteAnalysis).filter(WasteAnalysis.id == session_id).first()
    if not session_obj:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Determine dominant waste type in this session
    dominant_waste = None
    if session_obj.results:
        from collections import Counter
        counts = Counter(r.waste_type for r in session_obj.results)
        dominant_waste = counts.most_common(1)[0][0]

    facilities = find_nearby_facilities(
        db=db,
        latitude=session_obj.latitude,
        longitude=session_obj.longitude,
        waste_type=dominant_waste,
        radius_km=session_obj.radius_km or 50.0
    )
    return facilities


