import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.mappls_service import mappls_service

client = TestClient(app)

def test_mappls_preset_cache():
    """Verify that preset coordinates hit local cache with 0 API requests."""
    initial_api_calls = mappls_service.stats["api_requests_made"]
    initial_cache_hits = mappls_service.stats["cache_hits"]
    
    # Karad coordinates
    result = mappls_service.reverse_geocode(17.2880, 74.1920)
    
    assert "Karad" in result["locality"]
    assert result["cache_hit"] is True
    assert mappls_service.stats["api_requests_made"] == initial_api_calls
    assert mappls_service.stats["cache_hits"] == initial_cache_hits + 1

def test_mappls_driving_distance_cache():
    """Verify driving distance estimation with caching."""
    # Karad to Satara
    dist1 = mappls_service.get_driving_distance(17.288, 74.192, 17.681, 74.018)
    assert dist1["road_distance_km"] > 0
    assert dist1["estimated_duration_minutes"] > 0

    hits_before = mappls_service.stats["cache_hits"]
    # Repeat call must be a cache hit
    dist2 = mappls_service.get_driving_distance(17.288, 74.192, 17.681, 74.018)
    assert dist2["cache_hit"] is True
    assert mappls_service.stats["cache_hits"] == hits_before + 1

def test_mappls_endpoints():
    """Test the Mappls API endpoints through FastAPI test client."""
    # Status endpoint
    status_resp = client.get("/api/v1/mappls/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert status_data["cost_guard_active"] is True
    assert "cached_locations_count" in status_data

    # Reverse geocode endpoint
    geo_resp = client.get("/api/v1/mappls/reverse-geocode?latitude=17.2880&longitude=74.1920")
    assert geo_resp.status_code == 200
    geo_data = geo_resp.json()
    assert "Karad" in geo_data["locality"]

    # Driving distance endpoint
    dist_resp = client.get("/api/v1/mappls/driving-distance?origin_lat=17.288&origin_lon=74.192&dest_lat=17.681&dest_lon=74.018")
    assert dist_resp.status_code == 200
    dist_data = dist_resp.json()
    assert dist_data["road_distance_km"] > 0
