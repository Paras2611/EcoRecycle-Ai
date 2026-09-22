from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class ImageAnalysisResponse(BaseModel):
    waste_type: str
    confidence: float
    detected_object: Optional[str] = None
    recyclable: bool
    consensus_status: Optional[str] = None
    consensus_match: Optional[bool] = None
    primary_model_class: Optional[str] = None
    primary_model_conf: Optional[float] = None
    verifier_model_class: Optional[str] = None
    verifier_model_conf: Optional[float] = None
    model_engine: Optional[str] = None

class CompositionItem(BaseModel):
    count: int
    percentage: float

class BatchAnalysisResponse(BaseModel):
    total_images: int
    composition: Dict[str, CompositionItem]
    recyclable_count: int
    non_recyclable_count: int
    recyclable_percentage: float
    consensus_rate_percentage: Optional[float] = None
    dual_model_confirmed_count: Optional[int] = None
    predictions: List[ImageAnalysisResponse]

class AreaAnalysisRequest(BaseModel):
    area_name: Optional[str] = "Karad, Maharashtra"
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    radius_km: float = Field(default=25.0, gt=0, le=200.0)

class FacilityItem(BaseModel):
    id: str
    name: str
    address: str
    latitude: float
    longitude: float
    contact: Optional[str] = None
    capacity_tpd: float
    status: str
    verified: bool
    distance_km: float
    accepted_waste: List[str]
    processing_methods: Dict[str, str]
    is_compatible: bool
    suitability_score: float

class RecommendationRequest(BaseModel):
    waste_type: str
    quantity_kg: Optional[float] = 100.0
    latitude: Optional[float] = 17.2880
    longitude: Optional[float] = 74.1920
    radius_km: Optional[float] = 50.0

class RecommendedProcessInfo(BaseModel):
    primary_process: str
    methods: List[str]
    eco_impact: str
    best_practice: str

class RecommendationResponse(BaseModel):
    waste_type: str
    process_info: RecommendedProcessInfo
    matched_facilities: List[FacilityItem]

class AreaAnalysisResultResponse(BaseModel):
    area_name: str
    latitude: float
    longitude: float
    radius_km: float
    nearby_facilities: List[FacilityItem]

# --- User Auth & Saved Sessions Schemas ---

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: Optional[Any] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class SavedSessionItem(BaseModel):
    id: str
    area_name: str
    city_name: Optional[str] = None
    latitude: float
    longitude: float
    radius_km: float
    total_items: int
    created_at: Any
    waste_summary: Optional[Dict[str, int]] = None

