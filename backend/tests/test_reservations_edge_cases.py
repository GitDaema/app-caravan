from datetime import date, timedelta

from fastapi.testclient import TestClient

from backend.app.main import app
from initial_data import init_db
from src.database.session import SessionLocal
from src.models.user import User


def setup_module() -> None:
    init_db()


def _client() -> TestClient:
    return TestClient(app)


def _login(client: TestClient, email: str, password: str) -> str:
    r = client.post(
        "/api/v1/login/access-token",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def _create_user(client: TestClient, email: str, role: str = "guest") -> int:
    r = client.post(
        "/api/v1/users/",
        json={"email": email, "password": "pass", "full_name": "User", "role": role},
    )
    assert r.status_code == 200, r.text
    return r.json()["id"]


def _create_host_and_caravan(client: TestClient, email: str) -> tuple[int, int, dict]:
    host_id = _create_user(client, email, role="host")
    token = _login(client, email, "pass")
    headers = {"Authorization": f"Bearer {token}"}

    r = client.post(
        "/api/v1/caravans/",
        json={
            "name": f"Van {email}",
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

    # Give host some balance so reservation creation can succeed when used as guest.
    db = SessionLocal()
    u = db.query(User).filter(User.id == host_id).first()
    u.balance = 1000.0
    db.add(u)
    db.commit()
    db.close()

    return host_id, caravan_id, headers


def test_non_admin_cannot_access_all_reservations():
    client = _client()

    # Create a non-admin user and login
    user_email = "user-no-admin@test.com"
    _create_user(client, user_email, role="guest")
    token = _login(client, user_email, "pass")
    headers = {"Authorization": f"Bearer {token}"}

    r = client.get("/api/v1/reservations/all", headers=headers)
    assert r.status_code == 403, r.text
    assert r.json()["detail"] == "admin_only"


def test_non_host_cannot_update_reservation_status():
    client = _client()

    # Setup host + caravan + reservation as in smoke tests
    host_email = "edge-host@test.com"
    host_id, caravan_id, host_headers = _create_host_and_caravan(client, host_email)

    # Create reservation using host account (acts as guest in this context)
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=2)
    r = client.post(
        "/api/v1/reservations/",
        json={"caravan_id": caravan_id, "start_date": start.isoformat(), "end_date": end.isoformat()},
        headers=host_headers,
    )
    assert r.status_code == 201, r.text
    res_id = r.json()["id"]

    # Create another non-host user and attempt to change status
    other_email = "non-host@test.com"
    _create_user(client, other_email, role="guest")
    other_token = _login(client, other_email, "pass")
    other_headers = {"Authorization": f"Bearer {other_token}"}

    resp = client.post(
        f"/api/v1/reservations/{res_id}/status",
        json={"status": "cancelled"},
        headers=other_headers,
    )
    assert resp.status_code == 403, resp.text
    assert resp.json()["detail"] == "host_only"


def test_cannot_reactivate_cancelled_reservation():
    client = _client()

    # Setup host + caravan + reservation
    host_email = "edge-host2@test.com"
    host_id, caravan_id, host_headers = _create_host_and_caravan(client, host_email)

    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=2)
    r = client.post(
        "/api/v1/reservations/",
        json={"caravan_id": caravan_id, "start_date": start.isoformat(), "end_date": end.isoformat()},
        headers=host_headers,
    )
    assert r.status_code == 201, r.text
    res_id = r.json()["id"]

    # Cancel by host
    cancel = client.post(
        f"/api/v1/reservations/{res_id}/status",
        json={"status": "cancelled"},
        headers=host_headers,
    )
    assert cancel.status_code == 200, cancel.text

    # Attempt to reactivate cancelled reservation
    reactivate = client.post(
        f"/api/v1/reservations/{res_id}/status",
        json={"status": "confirmed"},
        headers=host_headers,
    )
    assert reactivate.status_code == 409, reactivate.text
    assert reactivate.json()["detail"] == "cannot_update_cancelled"


def test_cancel_nonexistent_reservation_returns_404():
    client = _client()

    # Use admin from initial_data as authenticated user
    token = _login(client, "admin@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/api/v1/reservations/999999/cancel", headers=headers)
    assert resp.status_code == 404, resp.text
    assert resp.json()["detail"] == "reservation_not_found"

