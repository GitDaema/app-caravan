from datetime import date, timedelta

from fastapi.testclient import TestClient

from backend.app.main import app
from initial_data import init_db
from src.database.session import SessionLocal
from src.models.user import User


def setup_module():
    init_db()


def _login(client: TestClient, email: str, password: str) -> str:
    r = client.post(
        "/api/v1/login/access-token",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200
    return r.json()["access_token"]


def test_create_reservation_smoke():
    client = TestClient(app)

    # 1) Create HOST user
    host_email = "host@test.com"
    r = client.post(
        "/api/v1/users/",
        json={
            "email": host_email,
            "password": "pass",
            "full_name": "Host",
            "role": "host",
        },
    )
    assert r.status_code == 200, r.text
    host_id = r.json()["id"]

    # 2) Login as host
    token = _login(client, host_email, "pass")
    headers = {"Authorization": f"Bearer {token}"}

    # 3) Create caravan
    r = client.post(
        "/api/v1/caravans/",
        json={
            "name": "Cozy Van",
            "description": "Nice",
            "capacity": 3,
            "amenities": "AC,Fridge",
            "location": "Seoul",
            "price_per_day": 100.0,
        },
        headers=headers,
    )
    assert r.status_code == 200, r.text
    caravan_id = r.json()["id"]

    # 4) Top-up host balance directly (test-only)
    db = SessionLocal()
    host = db.query(User).filter(User.id == host_id).first()
    host.balance = 1000.0
    db.add(host)
    db.commit()
    db.close()

    # 5) Create reservation
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=2)
    r = client.post(
        "/api/v1/reservations/",
        json={
            "caravan_id": caravan_id,
            "start_date": start.isoformat(),
            "end_date": end.isoformat(),
        },
        headers=headers,
    )
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["price"] == 200.0

