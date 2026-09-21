from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.session import get_db
from backend.app.models.models import WasteAnalysis, WasteResult, RecyclingFacility
from backend.app.ml.classifier import classifier
from backend.app.services.geo_service import haversine_distance
from backend.app.services.recommendation_service import (
    get_recommendation_for_waste,
    find_nearby_facilities
)
from backend.app.schemas.schemas import (
    ImageAnalysisResponse,
    BatchAnalysisResponse,
    AreaAnalysisRequest,
    FacilityItem,
    RecommendationRequest,
    RecommendationResponse,
    AreaAnalysisResultResponse
)

router = APIRouter(prefix="/api/v1", tags=["EcoRecycle API"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """System health and DB connectivity check."""
    facility_count = db.query(RecyclingFacility).count()
    return {
        "status": "healthy",
        "service": "EcoRecycle AI API",
        "version": "1.0.0",
        "database_connected": True,
        "facilities_indexed": facility_count
    }

@router.post("/analyze/image", response_model=ImageAnalysisResponse)
async def analyze_single_image(image: UploadFile = File(...)):
    """
    Analyze a single waste image using Deep Learning.
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
    latitude: Optional[float] = Form(17.2880),
    longitude: Optional[float] = Form(74.1920),
    radius_km: Optional[float] = Form(25.0),
    db: Session = Depends(get_db)
):
    """
    Analyze a batch of waste images for area composition estimation (PRD Section 10, 11 & 22).
    Aggregates percentage shares and saves analysis session to database.
    """
    if not images:
        raise HTTPException(status_code=400, detail="No images provided.")

    predictions = []
    for img in images:
        contents = await img.read()
        pred = classifier.predict_image(contents, filename=img.filename or "")
        predictions.append(pred)

    aggregated = classifier.aggregate_batch(predictions)

    # Persist session in DB
    try:
        analysis_session = WasteAnalysis(
            latitude=latitude,
            longitude=longitude,
            area_name=area_name,
            radius_km=radius_km,
            total_items=aggregated["total_items"]
        )
        db.add(analysis_session)
        db.flush()

        for pred in predictions:
            db.add(WasteResult(
                analysis_id=analysis_session.id,
                waste_type=pred["waste_type"],
                confidence=pred["confidence"],
                quantity=1,
                detected_object=pred.get("detected_object")
            ))
        db.commit()
    except Exception as e:
        db.rollback()
        # Continue and return predictions even if DB log has a hiccup
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
