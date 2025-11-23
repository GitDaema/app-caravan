from fastapi.testclient import TestClient

from backend.app.main import app
from initial_data import init_db


def setup_module() -> None:
    # Recreate DB and seed initial data for each test module run
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


def _create_host(client: TestClient, email: str) -> tuple[int, dict]:
    resp = client.post(
        "/api/v1/users/",
        json={"email": email, "password": "pass", "full_name": "Host", "role": "host"},
    )
    assert resp.status_code == 200, resp.text
    host_id = resp.json()["id"]

    token = _login(client, email, "pass")
    headers = {"Authorization": f"Bearer {token}"}
    return host_id, headers


def _create_caravan(
    client: TestClient,
    headers: dict,
    *,
    name: str,
    location: str,
    price_per_day: float,
    capacity: int,
) -> int:
    resp = client.post(
        "/api/v1/caravans/",
        json={
            "name": name,
            "description": "Test caravan",
            "capacity": capacity,
            "amenities": "AC",
            "location": location,
            "price_per_day": price_per_day,
        },
        headers=headers,
    )
    assert resp.status_code == 200, resp.text
    return resp.json()["id"]


def test_caravan_search_filters_by_location_price_and_capacity():
    client = _client()

    _, headers = _create_host(client, "search-host@test.com")

    # Only caravans with location containing "Search-Seoul", price in [100, 250],
    # and capacity >= 3 should match the filter below.
    c1_id = _create_caravan(
        client,
        headers,
        name="C1",
        location="Search-Seoul",
        price_per_day=50.0,
        capacity=2,
    )
    c2_id = _create_caravan(
        client,
        headers,
        name="C2",
        location="Search-Seoul",
        price_per_day=200.0,
        capacity=4,
    )
    c3_id = _create_caravan(
        client,
        headers,
        name="C3",
        location="Search-Busan",
        price_per_day=80.0,
        capacity=4,
    )

    resp = client.get(
        "/api/v1/caravans/",
        params={
            "location": "Search-Seoul",
            "min_price": 100.0,
            "max_price": 250.0,
            "min_capacity": 3,
        },
    )
    assert resp.status_code == 200, resp.text
    data = resp.json()

    ids = {c["id"] for c in data}
    assert c2_id in ids
    assert c1_id not in ids
    assert c3_id not in ids

