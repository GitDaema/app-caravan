Backend (FastAPI)

Local run
- Create venv and install: `pip install -r requirements.txt`
- Initialize DB (drop+create dev): `python initial_data.py`
- Start server: `uvicorn backend.app.main:app --reload`

Environment variables
- `SECRET_KEY`: JWT signing secret (defaults for dev)
- `DATABASE_URL`: e.g. `sqlite:///./caravan_booking.db`
- `GOOGLE_CLIENT_ID`: Audience for Google ID token verification (optional; GIS path)
- `FIREBASE_PROJECT_ID`: Firebase Authentication project ID to verify Firebase ID tokens (optional; Firebase path)

Key endpoints
- `POST /api/v1/login/access-token` (local login)
- `POST /api/v1/auth/google/verify` (Google ID Token → JWT)
- `POST /api/v1/users` (signup; role optional)
- `POST /api/v1/caravans` (host only)
- `GET/POST /api/v1/reservations`
- `GET /api/v1/reservations/host` (host-only; reservations for caravans I own)
- `GET /api/v1/caravans/{caravan_id}/calendar` (ranges for calendar; [start,end))

Tests
- `pytest -q`
