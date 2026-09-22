import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.ml.classifier import classifier
from backend.app.services.recommendation_service import get_recommendation_for_waste

client = TestClient(app)

def create_mock_scene_image():
    """Create a test image representing a waste scene."""
    img = Image.new("RGB", (300, 300), color=(15, 23, 42))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()

def test_phase2_waste_detection_model_objects():
    """
    Test Phase 2 Waste Detection Model:
    Verifies that the model detects 4 discrete objects:
    Object 1 -> Plastic
    Object 2 -> Metal
    Object 3 -> Paper
    Object 4 -> Cardboard
    with valid bounding boxes, labels, and confidence.
    """
    img_bytes = create_mock_scene_image()
    res = classifier.detect_scene_objects(img_bytes, filename="phase2_multi_object_waste_scene.jpg")

    assert res["total_objects"] == 4
    detected = res["detected_objects"]
    assert len(detected) == 4

    # Verify Object 1 -> Plastic
    obj1 = detected[0]
    assert obj1["name"] == "Object 1"
    assert obj1["waste_type"] == "plastic"
    assert obj1["confidence"] >= 0.85
    assert len(obj1["bbox"]) == 4

    # Verify Object 2 -> Metal
    obj2 = detected[1]
    assert obj2["name"] == "Object 2"
    assert obj2["waste_type"] == "metal"
    assert obj2["confidence"] >= 0.85
    assert len(obj2["bbox"]) == 4

    # Verify Object 3 -> Paper
    obj3 = detected[2]
    assert obj3["name"] == "Object 3"
    assert obj3["waste_type"] == "paper"
    assert obj3["confidence"] >= 0.85
    assert len(obj3["bbox"]) == 4

    # Verify Object 4 -> Cardboard
    obj4 = detected[3]
    assert obj4["name"] == "Object 4"
    assert obj4["waste_type"] == "cardboard"
    assert obj4["confidence"] >= 0.85
    assert len(obj4["bbox"]) == 4

def test_phase2_composition_analysis():
    """
    Test Composition Analysis:
    Verifies 4 detected objects yield 25.0% distribution per stream
    and 100% recyclability.
    """
    img_bytes = create_mock_scene_image()
    res = classifier.detect_scene_objects(img_bytes, filename="phase2_scene.jpg")

    comp = res["composition"]
    assert "plastic" in comp
    assert comp["plastic"]["count"] == 1
    assert comp["plastic"]["percentage"] == 25.0

    assert "metal" in comp
    assert comp["metal"]["count"] == 1
    assert comp["metal"]["percentage"] == 25.0

    assert "paper" in comp
    assert comp["paper"]["count"] == 1
    assert comp["paper"]["percentage"] == 25.0

    assert "cardboard" in comp
    assert comp["cardboard"]["count"] == 1
    assert comp["cardboard"]["percentage"] == 25.0

    assert res["recyclable_percentage"] == 100.0
    assert res["recyclable_count"] == 4
    assert res["non_recyclable_count"] == 0

def test_phase2_recycling_recommendations():
    """
    Test Recycling Recommendations for detected streams:
    Plastic, Metal, Paper, Cardboard.
    """
    for wt in ["plastic", "metal", "paper", "cardboard"]:
        rec = get_recommendation_for_waste(wt)
        assert rec is not None
        assert "primary_process" in rec
        assert len(rec["methods"]) > 0
        assert len(rec["eco_impact"]) > 0
        assert len(rec["best_practice"]) > 0

    # Specifically check cardboard
    cardboard_rec = get_recommendation_for_waste("cardboard")
    assert "Corrugated" in cardboard_rec["primary_process"]

def test_phase2_detect_objects_endpoint():
    """
    Test end-to-end POST /api/v1/detect/objects endpoint:
    Pipeline:
      Waste Detection Model -> 4 Objects -> Composition -> Recommendations -> Nearby Facilities
    """
    img_bytes = create_mock_scene_image()
    response = client.post(
        "/api/v1/detect/objects",
        files={"image": ("phase2_multi_object_waste_scene.jpg", img_bytes, "image/jpeg")},
        data={
            "area_name": "Karad, Maharashtra",
            "city_name": "Karad",
            "latitude": 17.2880,
            "longitude": 74.1920,
            "radius_km": 50.0
        }
    )

    assert response.status_code == 200
    data = response.json()

    # 1. Detected Objects
    assert data["total_objects"] == 4
    assert len(data["detected_objects"]) == 4
    types = [obj["waste_type"] for obj in data["detected_objects"]]
    assert types == ["plastic", "metal", "paper", "cardboard"]

    # 2. Composition Analysis
    assert data["composition"]["plastic"]["percentage"] == 25.0
    assert data["composition"]["metal"]["percentage"] == 25.0
    assert data["composition"]["paper"]["percentage"] == 25.0
    assert data["composition"]["cardboard"]["percentage"] == 25.0
    assert data["recyclable_percentage"] == 100.0

    # 3. Recommendations
    assert "plastic" in data["recommendations"]
    assert "metal" in data["recommendations"]
    assert "paper" in data["recommendations"]
    assert "cardboard" in data["recommendations"]

    # 4. Nearby Facilities
    assert "nearby_facilities" in data
    assert len(data["nearby_facilities"]) > 0
    # Check that nearby facilities accept at least one of the detected materials
    found_types = set()
    for f in data["nearby_facilities"]:
        found_types.update([w.lower() for w in f["accepted_waste"]])
    assert "plastic" in found_types
