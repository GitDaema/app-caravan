from fastapi.testclient import TestClient

from backend.app.main import app
from initial_data import init_db


def setup_module():
    # recreate DB and seed admin
    init_db()


def test_login_admin_success():
    client = TestClient(app)
    resp = client.post(
        "/api/v1/login/access-token",
        data={"username": "admin@example.com", "password": "password"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data and data["token_type"] == "bearer"

