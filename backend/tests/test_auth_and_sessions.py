import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from PIL import Image
import io

client = TestClient(app)

def test_auth_and_city_sessions():
    # 1. Register new user
    reg_email = "test_eco_user@ecorecycle.ai"
    client.post("/api/v1/auth/register", json={
        "name": "Eco Researcher",
        "email": reg_email,
        "password": "secretpassword123"
    })

    # 2. Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": reg_email,
        "password": "secretpassword123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token

    # 3. Get Me
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == reg_email

    # 4. Upload with City Name
    img = Image.new("RGB", (64, 64), color=(30, 144, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    upload_res = client.post(
        "/api/v1/analyze/batch",
        files=[("images", ("blue_plastic.jpg", buf.getvalue(), "image/jpeg"))],
        data={"city_name": "Kolhapur", "latitude": 16.7050, "longitude": 74.2433, "radius_km": 40.0},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert upload_res.status_code == 200

    # 5. Fetch sessions by city
    sessions_res = client.get("/api/v1/user/sessions?city=Kolhapur", headers={"Authorization": f"Bearer {token}"})
    assert sessions_res.status_code == 200
    sessions = sessions_res.json()
    assert len(sessions) >= 1
    assert "Kolhapur" in sessions[0]["city_name"]
