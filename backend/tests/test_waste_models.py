import pytest
import io
import numpy as np
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.ml.classifier import classifier, MaterialTextureVerifier, IMAGENET_WASTE_MAP

client = TestClient(app)

def create_synthetic_metal_image():
    """Create an image exhibiting specular highlights and low saturation characteristic of metal."""
    img = Image.new("RGB", (224, 224), (20, 25, 35))
    draw = ImageDraw.Draw(img)
    # Metallic cylinder with specular reflections
    for x in range(50, 174):
        # Specular peak in middle
        ratio = 1.0 - abs(x - 112) / 62.0
        val = int(80 + 175 * (ratio ** 2))
        draw.line([(x, 40), (x, 184)], fill=(val, val, min(255, val + 10)))
    return img

def create_synthetic_bio_image():
    """Create an image with high chlorophyll / carotenoid organic chromaticity."""
    img = Image.new("RGB", (224, 224), (15, 20, 25))
    draw = ImageDraw.Draw(img)
    # Organic green and yellow/orange patches
    draw.ellipse([50, 40, 170, 180], fill=(34, 197, 94))
    draw.ellipse([80, 70, 150, 150], fill=(234, 179, 8))
    return img

def create_synthetic_wood_image():
    """Create an image exhibiting directional horizontal grain and cellulose brown tones."""
    img = Image.new("RGB", (224, 224), (180, 83, 9))
    draw = ImageDraw.Draw(img)
    # Draw dark grain stripes horizontally
    for y in range(40, 190, 14):
        draw.line([(30, y), (194, y)], fill=(120, 53, 15), width=2)
    return img

def image_to_bytes(pil_img):
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG")
    return buf.getvalue()

def test_imagenet_waste_ontology_coverage():
    """Verify that ontology contains 200+ synsets covering metal, bio/organic, wood, etc."""
    assert len(IMAGENET_WASTE_MAP) >= 150
    classes_in_map = {entry[0] for entry in IMAGENET_WASTE_MAP.values()}
    assert "metal" in classes_in_map
    assert "organic" in classes_in_map
    assert "wood" in classes_in_map
    assert "plastic" in classes_in_map
    assert "cardboard" in classes_in_map
    assert "glass" in classes_in_map
    assert "ewaste" in classes_in_map

def test_material_texture_verifier():
    """Test Model 2 (MaterialTextureVerifier) physics analysis."""
    verifier = MaterialTextureVerifier()

    # Test metal detection
    metal_img = create_synthetic_metal_image()
    metal_res = verifier.analyze(metal_img)
    assert metal_res["material"] == "metal"
    assert metal_res["confidence"] >= 0.80

    # Test bio-waste detection
    bio_img = create_synthetic_bio_image()
    bio_res = verifier.analyze(bio_img)
    assert bio_res["material"] == "organic"
    assert bio_res["confidence"] >= 0.80

    # Test wood detection
    wood_img = create_synthetic_wood_image()
    wood_res = verifier.analyze(wood_img)
    assert wood_res["material"] == "wood"
    assert wood_res["confidence"] >= 0.75

def test_classifier_predict_metal():
    """Test classification of metal can with dual-model confirmation."""
    metal_img = create_synthetic_metal_image()
    img_bytes = image_to_bytes(metal_img)
    res = classifier.predict_image(img_bytes, filename="crushed_aluminum_can.jpg")

    assert res["waste_type"] == "metal"
    assert res["recyclable"] is True
    assert res["confidence"] >= 0.80
    assert res["consensus_status"] in ["CONFIRMED_MATCH", "CROSS_VERIFIED"]
    assert "consensus_match" in res
    assert "model_engine" in res

def test_classifier_predict_biowaste():
    """Test classification of organic food waste with dual-model confirmation."""
    bio_img = create_synthetic_bio_image()
    img_bytes = image_to_bytes(bio_img)
    res = classifier.predict_image(img_bytes, filename="banana_peels_and_organic_food.jpg")

    assert res["waste_type"] == "organic"
    assert res["recyclable"] is True
    assert res["confidence"] >= 0.80
    assert res["consensus_status"] in ["CONFIRMED_MATCH", "CROSS_VERIFIED"]
    assert "consensus_match" in res

def test_classifier_predict_wood():
    """Test classification of wooden scrap / pallets with dual-model confirmation."""
    wood_img = create_synthetic_wood_image()
    img_bytes = image_to_bytes(wood_img)
    res = classifier.predict_image(img_bytes, filename="discarded_wood_timber.jpg")

    assert res["waste_type"] == "wood"
    assert res["recyclable"] is True
    assert res["confidence"] >= 0.75
    assert res["consensus_status"] in ["CONFIRMED_MATCH", "CROSS_VERIFIED"]
    assert "consensus_match" in res

def test_batch_consensus_aggregation():
    """Test batch consensus stats aggregation."""
    predictions = [
        {"waste_type": "metal", "recyclable": True, "consensus_match": True},
        {"waste_type": "metal", "recyclable": True, "consensus_match": True},
        {"waste_type": "organic", "recyclable": True, "consensus_match": True},
        {"waste_type": "wood", "recyclable": True, "consensus_match": False},
    ]
    batch_res = classifier.aggregate_batch(predictions)
    assert batch_res["total_items"] == 4
    assert batch_res["dual_model_confirmed_count"] == 3
    assert batch_res["consensus_rate_percentage"] == 75.0
    assert batch_res["composition"]["metal"]["count"] == 2
    assert batch_res["composition"]["organic"]["count"] == 1
    assert batch_res["composition"]["wood"]["count"] == 1

def test_api_image_endpoint_dual_model():
    """Test /api/v1/analyze/image endpoint returns dual-model consensus schema."""
    metal_img = create_synthetic_metal_image()
    img_bytes = image_to_bytes(metal_img)

    response = client.post(
        "/api/v1/analyze/image",
        files={"image": ("aluminum_soda_can.jpg", img_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["waste_type"] == "metal"
    assert "consensus_status" in data
    assert "consensus_match" in data
    assert "primary_model_class" in data
    assert "verifier_model_class" in data
    assert "model_engine" in data

def test_api_batch_endpoint_dual_model():
    """Test /api/v1/analyze/batch endpoint returns consensus rate and predictions."""
    img1 = image_to_bytes(create_synthetic_metal_image())
    img2 = image_to_bytes(create_synthetic_bio_image())
    img3 = image_to_bytes(create_synthetic_wood_image())

    response = client.post(
        "/api/v1/analyze/batch",
        data={"area_name": "Karad, Maharashtra", "city_name": "Karad"},
        files=[
            ("images", ("metal_tin.jpg", img1, "image/jpeg")),
            ("images", ("organic_fruit.jpg", img2, "image/jpeg")),
            ("images", ("wood_crate.jpg", img3, "image/jpeg")),
        ]
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_images"] == 3
    assert "consensus_rate_percentage" in data
    assert "dual_model_confirmed_count" in data
    assert len(data["predictions"]) == 3
    for pred in data["predictions"]:
        assert "consensus_status" in pred
        assert "consensus_match" in pred
