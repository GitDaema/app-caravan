# CaravanShare Quickstart (Node + MariaDB + React)

이 문서는 학교/랩 PC 에서 CaravanShare 를 빠르게 실행해 보는 방법을 정리한 것입니다.

- 백엔드: Node.js 20 + Express + Prisma + MariaDB
- 프론트엔드: React 18 + Vite + Tailwind + React Query
- 인증: 세션 기반(Local + Google/Naver/Kakao OAuth, Passport)

기존 Python/FastAPI 코드는 `src/`, `backend/` 폴더에 그대로 보존되어 있으며, 참고용으로만 사용합니다. 실제 데모/배포 경로는 `api/` + `web/` 입니다.

---

## 1. 필수 사전 준비

- Node.js 20 LTS
- Docker + docker-compose (로컬에서 MariaDB + API 컨테이너 실행용)
- Git, VS Code 등의 기본 개발 도구

---

## 2. 로컬 개발 환경 구성

### 2-1. MariaDB + API 컨테이너 실행

루트 디렉터리(`app-caravan`)에서:

```bash
docker compose up -d
```

구성:

- `db`: MariaDB 10.11 (`3306` → 로컬 DB 연결 테스트용 포트 공개)
- `api`: Node 20 + Express + Prisma (`3000`)

환경 변수(개발 기본값 예시):

- DB: `mysql://caravan:<비밀번호>@db:3306/caravanshare`
- API: `http://localhost:3000`

### 2-2. API `.env` 생성 및 마이그레이션 + Seed

```bash
cd api
cp .env.example .env   # Windows PowerShell 에서는 copy .env.example .env
nano .env              # 또는 VS Code 로 수정
```

필수 항목:

- `DATABASE_URL` – docker-compose 의 `db` 서비스를 가리키도록 유지 (`db:3306`)
- `SESSION_SECRET` – 충분히 랜덤한 문자열로 변경
- `FRONTEND_BASE_URL=http://localhost:5173`
- 각 OAuth Provider 의 `*_CLIENT_ID/SECRET` (없으면 소셜 로그인만 동작하지 않고, 로컬 로그인은 가능)

Prisma 마이그레이션 및 데모 데이터:

```bash
cd api
npm install
npx prisma migrate deploy
node prisma/seed.cjs   # admin/host/guest + 기본 카라반/예약 생성
```

데모 계정:

- 관리자: `admin@example.com` / `password`
- 호스트: `host@example.com` / `password`
- 게스트: `guest@example.com` / `password`

### 2-3. 프론트엔드 개발 서버 실행

```bash
cd web
cp .env.local.example .env.local   # 필요 시 수정
npm install
npm run dev
```

기본 설정:

- Vite Dev Server: `http://localhost:5173`
- `.env.local`:
  - `VITE_API_BASE_URL=http://localhost:3000`

브라우저에서 `http://localhost:5173` 로 접속하면 랜딩 페이지 → `/login` → `/app` 플로우를 확인할 수 있습니다.

---

## 3. 인증 / 소셜 로그인 설정

### 3-1. 공통 개요

백엔드(`api/`)는 세션 기반 인증을 사용합니다.

- `express-session` (+ prod 에서는 MariaDB 세션 스토어로 확장 가능)
- 브라우저는 httpOnly 세션 쿠키로 로그인 상태를 유지
- 주요 엔드포인트:
  - `POST /auth/login` – 이메일/비밀번호 로그인
  - `POST /auth/register` – 회원 가입
  - `POST /auth/logout` – 로그아웃
  - `GET /auth/me` – 현재 로그인한 사용자 정보
  - `GET /auth/google|naver|kakao` – 소셜 로그인 시작
  - `GET /auth/*/callback` – OAuth 콜백 (성공 시 세션 생성 후 `/app` 리다이렉트, 실패 시 `/login?error=...`)

프론트엔드(`web/`)에서는:

- `/login` 페이지:
  - 상단: Google / Naver / Kakao 버튼 → 각각 `/auth/*` 로 이동
  - 하단: 이메일/비밀번호 로그인 폼 (React Hook Form + Zod 검증)
  - `?error=...` 쿼리 파라미터에 따라 소셜 로그인 에러 메시지 표기
- `/app` 페이지:
  - 진입 시 `GET /auth/me` 로 세션 상태 확인 (없으면 `/login` 으로 리다이렉트)

### 3-2. Google OAuth

1. Google Cloud Console 에서 OAuth 클라이언트 생성
2. Redirect URI 등록:
   - 로컬: `http://localhost:3000/auth/google/callback`
3. `api/.env` 에 설정:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

### 3-3. Naver / Kakao OAuth

각 포털 개발자 콘솔에서 애플리케이션을 생성하고, Redirect URI 를 다음과 같이 설정합니다.

- Naver: `http://localhost:3000/auth/naver/callback`
- Kakao: `http://localhost:3000/auth/kakao/callback`

`api/.env` 에 Client ID/Secret 및 Callback URL을 채웁니다.  
Kakao 의 경우 이메일 미제공/동의 취소 등의 케이스는 `/login?error=kakao_no_email|kakao_cancelled` 로 안내됩니다.

---

## 4. Host / Admin 플로우 체험

Prisma seed 스크립트(`api/prisma/seed.cjs`)를 실행하면 다음 데모 계정 및 데이터가 생성됩니다.

- `admin@example.com` (role: `ADMIN`)
- `host@example.com` (role: `HOST`)
- `guest@example.com` (role: `GUEST`)
- 최소 2개 카라반, 2개 예약 (pending/confirmed 상태 혼합)

### 4-1. Host 플로우

1. `host@example.com` / `password` 로 로그인
2. `/app` → `HostPanel` 카드에서:
   - 본인이 소유한 카라반에 대한 예약 목록 확인
   - 예약 상태를 `pending → confirmed` 또는 `confirmed → cancelled` 로 변경
3. `CaravanForm` 카드로 새 카라반 등록:
   - 이름/설명/위치/가격 입력 후 등록 → `CaravanList` 에 즉시 반영

### 4-2. Admin 플로우

1. `admin@example.com` / `password` 로 로그인
2. `/app` → `AdminReservations` 카드에서 전체 예약 목록 확인
3. `ProfileActions` 카드에서:
   - 잔액 +100 충전 버튼 → `PUT /api/users/me/balance` 호출 → `BalanceCard` 에 잔액 반영

### 4-3. Guest 플로우

1. `guest@example.com` / `password` 로 로그인
2. `CaravanList` 에서 카라반 선택, `ReservationForm` 에서 날짜 범위 선택 후 예약 생성
3. `ReservationList` 에서 본인 예약 목록 확인 및 취소
4. `CaravanCalendar` 에서 선택한 카라반의 예약 구간(진행/확정)을 달력으로 확인

---

## 5. 테스트 실행

### 5-1. 백엔드 테스트 (Jest + supertest)

```bash
cd api
npm test
```

현재 포함된 테스트 (예시):

- `test/health.test.ts`: `GET /health` 200 + `{ status: 'ok' }` 확인
- Day7 작업 이후 `/auth/login`, `/auth/me`, 소셜 콜백 등에 대한 happy path 테스트가 추가될 예정입니다.

> DB 접속이 필요한 테스트는 `SESSION_STORE=memory` 또는 테스트 전용 DB 를 사용하는 방식으로 확장할 수 있습니다.

### 5-2. 프론트엔드 테스트 (Vitest + RTL)

```bash
cd web
npm test          # 또는 npm run test:run
```

테스트 범위(예시):

- `/login` 페이지:
  - 이메일/비밀번호 폼 검증
  - 소셜 로그인 버튼 렌더링
  - `?error=...` 기반 에러 메시지 노출
- `/app` 접근 제어:
  - 세션 없음 → 로그인 페이지 리다이렉트
  - 세션 있음 → 대시보드 렌더링

---

## 6. Azure VM 배포 개요

Ubuntu 기반 Azure VM 에 배포할 때는 두 가지 시나리오 중 하나를 선택할 수 있습니다.

- A) Docker Compose 기반
  - `docker-compose.prod.yml` + `infra/nginx.caravanshare.conf.example` 사용
  - `web/dist` 를 Nginx 로 정적 서빙, `/api/*` 는 Express API 로 리버스 프록시
- B) Node + PM2 + Nginx 기반
  - VM 에서 직접 Node/MariaDB/Nginx 설치
  - PM2 로 `dist/server.js` 실행, Nginx 가 정적 파일 + `/api` 프록시

자세한 단계별 설명은 `docs/DEPLOY_AZURE.md` 를 참고하세요.

---

## 7. 참고: 이전 Python/FastAPI 코드

- `src/`, `backend/` 폴더에는 기존 FastAPI + SQLAlchemy 구현이 남아 있습니다.
- 데이터 모델, 예약 비즈니스 규칙, 권한 설계 등은 이 코드에서도 참고할 수 있지만,
  **실제 과제 제출용 코드는 `api/` + `web/` 방향**으로 유지/발전시키면 됩니다.

