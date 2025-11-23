from fastapi.testclient import TestClient

from backend.app.main import app
from initial_data import init_db


def setup_module() -> None:
    # Recreate DB and seed initial admin user
    init_db()


def _client() -> TestClient:
    return TestClient(app)


def _login(client: TestClient, email: str, password: str) -> str:
    resp = client.post(
        "/api/v1/login/access-token",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


def _create_user(client: TestClient, email: str, role: str = "guest") -> int:
    resp = client.post(
        "/api/v1/users/",
        json={"email": email, "password": "pass", "full_name": "User", "role": role},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["id"]


def test_create_user_conflict_returns_400():
    client = _client()
    email = "conflict-user@test.com"

    _create_user(client, email, role="guest")

    resp = client.post(
        "/api/v1/users/",
        json={"email": email, "password": "pass", "full_name": "User", "role": "guest"},
    )
    assert resp.status_code == 400, resp.text
    assert "already exists" in resp.json()["detail"]


def test_admin_can_promote_guest_to_host():
    client = _client()

    target_email = "promote-target@test.com"
    user_id = _create_user(client, target_email, role="guest")

    token = _login(client, "admin@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(f"/api/v1/users/{user_id}/promote", headers=headers)
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert data["id"] == user_id
    assert data["role"] == "host"


def test_promote_nonexistent_user_returns_404():
    client = _client()

    token = _login(client, "admin@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/api/v1/users/999999/promote", headers=headers)
    assert resp.status_code == 404, resp.text
    assert resp.json()["detail"] == "user_not_found"


def test_non_admin_cannot_promote_to_host():
    client = _client()

    user1_email = "user1-promote@test.com"
    user2_email = "user2-promote@test.com"
    user2_id = _create_user(client, user2_email, role="guest")
    _create_user(client, user1_email, role="guest")

    token = _login(client, user1_email, "pass")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(f"/api/v1/users/{user2_id}/promote", headers=headers)
    assert resp.status_code == 403, resp.text
    assert resp.json()["detail"] == "admin_only"


def test_admin_topup_updates_balance():
    client = _client()

    email = "topup-user@test.com"
    user_id = _create_user(client, email, role="guest")

    token = _login(client, "admin@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    # First top-up
    resp = client.post(
        f"/api/v1/users/{user_id}/topup",
        json={"amount": 50.0},
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()
    assert float(data["balance"]) == 50.0

    # Second top-up to ensure additive behavior
    resp2 = client.post(
        f"/api/v1/users/{user_id}/topup",
        json={"amount": 25.0},
        headers=headers,
    )
    assert resp2.status_code == 200, resp2.text
    data2 = resp2.json()
    assert float(data2["balance"]) == 75.0


def test_topup_negative_amount_returns_400():
    client = _client()

    email = "topup-negative@test.com"
    user_id = _create_user(client, email, role="guest")

    token = _login(client, "admin@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        f"/api/v1/users/{user_id}/topup",
        json={"amount": -10.0},
        headers=headers,
    )
    assert resp.status_code == 400, resp.text
    assert resp.json()["detail"] == "amount_must_be_positive"


def test_topup_nonexistent_user_returns_404():
    client = _client()

    token = _login(client, "admin@example.com", "password")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/api/v1/users/999999/topup",
        json={"amount": 10.0},
        headers=headers,
    )
    assert resp.status_code == 404, resp.text
    assert resp.json()["detail"] == "user_not_found"

