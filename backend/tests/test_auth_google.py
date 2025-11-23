from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import app
from initial_data import init_db


def setup_module() -> None:
    # recreate DB and seed admin
    init_db()


def _client() -> TestClient:
    return TestClient(app)


def test_google_verify_creates_guest_and_returns_token():
    client = _client()

    fake_email = "oauth-user@example.com"

    with patch("src.api.endpoints.auth_google.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "iss": "https://accounts.google.com",
            "email": fake_email,
            "name": "OAuth User",
        }

        resp = client.post(
            "/api/v1/auth/google/verify",
            json={"idToken": "dummy-token"},
        )

        assert resp.status_code == 200, resp.text
        data = resp.json()
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == fake_email
        assert data["user"]["role"] in ("guest", "UserRole.GUEST")


def test_google_verify_invalid_token_returns_401():
    client = _client()

    # Force verification to fail so that the endpoint treats the token as invalid.
    with patch("src.api.endpoints.auth_google.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.side_effect = Exception("invalid")

        resp = client.post(
            "/api/v1/auth/google/verify",
            json={"idToken": "bad-token"},
        )

        assert resp.status_code == 401, resp.text
        assert resp.json()["detail"] == "invalid_google_token"

