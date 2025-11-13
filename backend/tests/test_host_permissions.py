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


def _create_host_and_caravan(client: TestClient, email: str) -> tuple[int, int, dict]:
    # create host
    r = client.post(
        "/api/v1/users/",
        json={
            "email": email,
            "password": "pass",
            "full_name": "Host",
            "role": "host",
        },
    )
    assert r.status_code == 200, r.text
    host_id = r.json()["id"]

    token = _login(client, email, "pass")
    headers = {"Authorization": f"Bearer {token}"}

    # create caravan
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

    return host_id, caravan_id, headers


def test_host_can_only_manage_their_reservations():
    client = TestClient(app)

    # Setup two hosts, each with a caravan
    h1_id, c1_id, h1_headers = _create_host_and_caravan(client, "host1@test.com")
    h2_id, c2_id, h2_headers = _create_host_and_caravan(client, "host2@test.com")

    # Top up balances directly for testing
    db = SessionLocal()
    for hid in (h1_id, h2_id):
        u = db.query(User).filter(User.id == hid).first()
        u.balance = 1000.0
        db.add(u)
    db.commit()
    db.close()

    # Create reservations for each caravan by respective host accounts
    start = date.today() + timedelta(days=1)
    end = start + timedelta(days=2)

    r1 = client.post(
        "/api/v1/reservations/",
        json={"caravan_id": c1_id, "start_date": start.isoformat(), "end_date": end.isoformat()},
        headers=h1_headers,
    )
    assert r1.status_code == 201, r1.text
    res1_id = r1.json()["id"]

    r2 = client.post(
        "/api/v1/reservations/",
        json={"caravan_id": c2_id, "start_date": start.isoformat(), "end_date": end.isoformat()},
        headers=h2_headers,
    )
    assert r2.status_code == 201, r2.text
    res2_id = r2.json()["id"]

    # Host1 lists their reservations via host endpoint -> should only see their caravan's reservations
    lh = client.get("/api/v1/reservations/host", headers=h1_headers)
    assert lh.status_code == 200, lh.text
    ids = {r["id"] for r in lh.json()}
    assert res1_id in ids
    assert res2_id not in ids

    # Host1 cannot change Host2's reservation
    upd_forbidden = client.post(
        f"/api/v1/reservations/{res2_id}/status", json={"status": "cancelled"}, headers=h1_headers
    )
    assert upd_forbidden.status_code == 403

    # Host1 can change their own reservation status
    upd_ok = client.post(
        f"/api/v1/reservations/{res1_id}/status", json={"status": "cancelled"}, headers=h1_headers
    )
    assert upd_ok.status_code == 200
    assert upd_ok.json()["status"] == "cancelled"

    # Cancelled reservation should not be re-activated by host (terminal)
    reactivate = client.post(
        f"/api/v1/reservations/{res1_id}/status", json={"status": "confirmed"}, headers=h1_headers
    )
    assert reactivate.status_code == 409
