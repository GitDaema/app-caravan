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


def test_user_cancel_refund_restores_balance():
    client = TestClient(app)

    # Create a host and caravan
    r = client.post(
        "/api/v1/users/",
        json={"email": "host@test.com", "password": "pass", "full_name": "Host", "role": "host"},
    )
    assert r.status_code == 200, r.text
    host_id = r.json()["id"]
    token_host = _login(client, "host@test.com", "pass")
    headers_host = {"Authorization": f"Bearer {token_host}"}
    r = client.post(
        "/api/v1/caravans/",
        json={
            "name": "Cozy",
            "description": "Nice",
            "capacity": 2,
            "amenities": "AC",
            "location": "Seoul",
            "price_per_day": 100.0,
        },
        headers=headers_host,
    )
    assert r.status_code == 200, r.text
    caravan_id = r.json()["id"]

    # Create a guest user with balance
    r = client.post(
        "/api/v1/users/",
        json={"email": "guest@test.com", "password": "pass", "full_name": "Guest", "role": "guest"},
    )
    assert r.status_code == 200, r.text
    guest_id = r.json()["id"]

    # Top up guest balance directly for testing
    db = SessionLocal()
    guest = db.query(User).filter(User.id == guest_id).first()
    guest.balance = 1000.0
    db.add(guest)
    db.commit()
    db.close()

    token_guest = _login(client, "guest@test.com", "pass")
    headers_guest = {"Authorization": f"Bearer {token_guest}"}

    # Create reservation
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=2)
    r = client.post(
        "/api/v1/reservations/",
        json={"caravan_id": caravan_id, "start_date": start.isoformat(), "end_date": end.isoformat()},
        headers=headers_guest,
    )
    assert r.status_code == 201, r.text
    reservation = r.json()
    price = reservation["price"]
    rid = reservation["id"]

    # Capture balance after purchase
    db = SessionLocal()
    guest = db.query(User).filter(User.id == guest_id).first()
    balance_after_purchase = float(guest.balance)
    db.close()

    # Cancel
    r = client.post(f"/api/v1/reservations/{rid}/cancel", headers=headers_guest)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "cancelled"

    # Verify balance refunded
    db = SessionLocal()
    guest = db.query(User).filter(User.id == guest_id).first()
    assert float(guest.balance) == balance_after_purchase + float(price)
    db.close()

