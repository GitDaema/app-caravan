Web (Vite + React + TS)

Local development
- Node 18+ recommended
- Install deps: `npm install`
- Start dev server: `npm run dev` (http://localhost:5173)

Env (.env)
- `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`)
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN` (if using Google sign-in)

Routes
- `/` Landing
- `/login` Google or local login (exchanges for API JWT)
- `/app` Dashboard (caravans, reservations, balance)

New UI
- Host Panel: manage reservations you host (approve/cancel)
- Caravan Calendar: highlights reserved days for selected caravan
- Reservation list: cancel button with status chips

Tests
- `npm run test` (watch) or `npm run test:run` (CI)
