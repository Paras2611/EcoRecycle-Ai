import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database.session import Base, engine
from backend.app.database.seed import seed_database
from backend.app.services.geo_service import haversine_distance
from backend.app.services.recommendation_service import calculate_suitability_score, get_recommendation_for_waste
from backend.app.ml.classifier import classifier

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

client = TestClient(app)

def test_haversine_distance():
    # Karad (approx 17.2880, 74.1920) to Kolhapur (approx 16.7050, 74.2433) is ~65-70 km
    dist = haversine_distance(17.2880, 74.1920, 16.7050, 74.2433)
    assert 60.0 < dist < 75.0

    # Distance to identical point must be 0
    zero_dist = haversine_distance(17.2880, 74.1920, 17.2880, 74.1920)
    assert zero_dist == 0.0

def test_suitability_scoring():
    # Compatible facility 5km away with 50 TPD
    score_close = calculate_suitability_score(True, 5.0, 50.0, 50.0)
    # Compatible facility 40km away with 50 TPD
    score_far = calculate_suitability_score(True, 40.0, 50.0, 50.0)
    assert score_close > score_far

    # Incompatible facility should receive 0 score
    incompatible_score = calculate_suitability_score(False, 2.0, 100.0, 50.0)
    assert incompatible_score == 0.0

def test_knowledge_base():
    rec = get_recommendation_for_waste("plastic")
    assert "Mechanical Recycling" in rec["primary_process"]
    assert "CO2" in rec["eco_impact"]

def test_batch_aggregation():
    sample_preds = [
        {"waste_type": "plastic", "recyclable": True},
        {"waste_type": "plastic", "recyclable": True},
        {"waste_type": "paper", "recyclable": True},
        {"waste_type": "other", "recyclable": False},
    ]
    res = classifier.aggregate_batch(sample_preds)
    assert res["total_items"] == 4
    assert res["composition"]["plastic"]["count"] == 2
    assert res["composition"]["plastic"]["percentage"] == 50.0
    assert res["composition"]["paper"]["percentage"] == 25.0
    assert res["recyclable_percentage"] == 75.0

def test_api_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert data["facilities_indexed"] >= 9

def test_api_nearby_facilities():
    # Query facilities around Karad
    response = client.get("/api/v1/facilities/nearby?latitude=17.2880&longitude=74.1920&radius_km=150")
    assert response.status_code == 200
    facilities = response.json()
    assert len(facilities) > 0
    # Must have name, distance_km, and accepted_waste
    assert "name" in facilities[0]
    assert "distance_km" in facilities[0]

def test_api_recommendations():
    payload = {
        "waste_type": "plastic",
        "quantity_kg": 150,
        "latitude": 17.2880,
        "longitude": 74.1920,
        "radius_km": 100.0
    }
    response = client.post("/api/v1/recommendations", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["waste_type"] == "plastic"
    assert "process_info" in data
    assert len(data["matched_facilities"]) > 0

def test_api_single_image_analysis():
    # Send mock image bytes
    mock_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDRplastic_test"
    files = {"image": ("plastic_bottle.png", mock_bytes, "image/png")}
    response = client.post("/api/v1/analyze/image", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["waste_type"] == "plastic"
    assert data["confidence"] > 0.5
