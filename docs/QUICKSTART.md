# CaravanShare Quickstart (Node + MariaDB + React)

이 문서는 새 PC에서 CaravanShare를 **빠르게 로컬 실행**해 보는 방법을 정리한 것입니다.

- 백엔드: Node.js 20 + Express + Prisma + MariaDB
- 프론트엔드: React 18 + Vite + Tailwind + React Query
- 인증: 세션 기반(Local + Google/Naver/Kakao OAuth, Passport)
- 추가 기능: 카라반 리뷰(Review), 예약 단위 메시지(Message)

기존 Python/FastAPI 코드는 `src/`, `backend/` 폴더에 그대로 보존되어 있으며,  
**모델/비즈니스 규칙 참고용**으로만 사용합니다. 실제 데모/배포 경로는 **`api/` + `web/`** 입니다.

---

## 1. 필수 사전 준비

- Node.js 20 LTS
- Docker + docker-compose (로컬에서 MariaDB + API 컨테이너 실행)
- Git, VS Code 등의 기본 개발 도구

---

## 2. 로컬 개발 환경 구성

### 2-1. MariaDB + API 컨테이너 실행

루트 디렉터리(`app-caravan`)에서:

```bash
docker compose up -d
```

구성:

- `db`: MariaDB 10.11 (`3306` – 로컬 DB 접속 테스트용 포트 공개)
- `api`: Node 20 + Express + Prisma (`3000`)

환경 변수(개발 기본 예시):

- DB: `mysql://caravan:<비밀번호>@db:3306/caravanshare`
- API: `http://localhost:3000`

### 2-2. API `.env` 생성 + 마이그레이션/시드

```bash
cd api
cp .env.example .env   # Windows PowerShell에서는 copy .env.example .env
nano .env              # 또는 VS Code 등으로 수정
```

필수 수정:

- `DATABASE_URL` 이 docker-compose 의 `db` 서비스(포트 `3306`) 를 가리키도록 설정
- `SESSION_SECRET` 는 충분히 랜덤한 문자열로 변경
- `FRONTEND_BASE_URL=http://localhost:5173`
- (선택) OAuth Provider 관련 `*_CLIENT_ID/SECRET`  
  → 소셜 로그인까지 테스트할 때만 채우고, 로컬 로그인만 쓸 경우 비워두어도 됩니다.

Prisma 마이그레이션 + 데모 데이터(seed):

```bash
cd api
npm install
npx prisma migrate deploy
node prisma/seed.cjs   # admin/host/guest + 기본 카라반/예약 생성
```

기본 계정:

- 관리자: `admin@example.com` / `password` (ADMIN)
- 호스트: `host@example.com` / `password` (HOST)
- 게스트: `guest@example.com` / `password` (GUEST)

### 2-3. 프론트엔드 개발 서버 실행

```bash
cd web
cp .env.local.example .env.local   # 필요한 값만 수정
npm install
npm run dev
```

기본 설정:

- Vite Dev Server: `http://localhost:5173`
- `.env.local`:
  - `VITE_API_BASE_URL=http://localhost:3000`

브라우저에서 `http://localhost:5173` 로 접속하면  
랜딩 페이지 → `/login` → `/app` 흐름을 통해 전체 데모를 볼 수 있습니다.

---

## 3. 인증 / 소셜 로그인 설정

### 3-1. 공통 개요

백엔드(`api/`)는 **세션 기반 인증**을 사용합니다.

- `express-session` (+ prod 환경에서는 MariaDB 세션 스토어 사용)
- 브라우저는 httpOnly 세션 쿠키로 로그인 상태 유지
- 주요 엔드포인트:
  - `POST /auth/login` – 이메일/비밀번호 로그인
  - `POST /auth/register` – 회원 가입
  - `POST /auth/logout` – 로그아웃
  - `GET /auth/me` – 현재 로그인된 사용자 정보
  - `GET /auth/google|naver|kakao` – 소셜 로그인 시작
  - `GET /auth/*/callback` – OAuth 콜백 (성공 시 `/app`, 실패 시 `/login?error=...`)

프론트엔드(`web/`)에서는:

- `/login` 페이지:
  - 상단: Google / Naver / Kakao 버튼 (`/auth/*` 로 이동)
  - 하단: 이메일/비밀번호 로그인 폼 (React Hook Form + Zod 검증)
  - `?error=...` 쿼리 파라미터로 소셜 로그인 오류 메시지 표시
- `/app` 페이지:
  - 진입 시 `GET /auth/me`로 세션 상태 확인 (없으면 `/login` 으로 리다이렉트)

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

각 포털 개발자 콘솔에서 애플리케이션을 생성하고, Redirect URI 를 다음처럼 설정합니다.

- Naver: `http://localhost:3000/auth/naver/callback`
- Kakao: `http://localhost:3000/auth/kakao/callback`

`api/.env` 의 Client ID/Secret 및 Callback URL 을 모두 채우면 됩니다.  
Kakao 의 경우 이메일 미제공/취소 등의 케이스에서  
`/login?error=kakao_no_email|kakao_cancelled` 로 안내합니다.

---

## 4. Host / Admin / Guest 플로우

Prisma seed 스크립트(`api/prisma/seed.cjs`)를 실행하면 다음 데모 계정/데이터가 생성됩니다.

- `admin@example.com` (role: `ADMIN`)
- `host@example.com` (role: `HOST`)
- `guest@example.com` (role: `GUEST`)
- 최소 2개 카라반, 2개 예약 (pending/confirmed 상태 조합)

### 4-1. Host 플로우

1. `host@example.com` / `password` 로 로그인
2. `/app` 의 `HostPanel` 카드에서:
   - 본인이 소유한 카라반의 예약 목록 확인
   - 예약 상태를 `pending → confirmed`, `confirmed → cancelled` 로 변경
3. `CaravanForm` 카드에서:
   - 이름/설명/위치/가격 입력 후 카라반 등록
   - 등록 즉시 `CaravanList` 에 반영
4. 예약별 메시지:
   - `HostPanel` 에서 특정 예약의 “메시지” 버튼 클릭 → `MessageThread` 열림
   - 게스트와 1:1 메시지 송수신 (`GET/POST /api/messages`)

### 4-2. Admin 플로우

1. `admin@example.com` / `password` 로 로그인
2. `/app` 의 `AdminReservations` 카드에서 전체 예약 목록 확인
3. `ProfileActions` 카드에서:
   - 잔액 +100 충전 버튼 클릭 → `PUT /api/users/me/balance` 호출
   - `BalanceCard` 에서 잔액 변화를 확인

### 4-3. Guest 플로우

1. `guest@example.com` / `password` 로 로그인
2. `CaravanList` 에서 카라반 선택, `ReservationForm` 에서 날짜 범위 선택 후 예약 생성
3. `ReservationList` 에서 본인 예약 목록 및 취소 기능 확인
4. `CaravanCalendar` 에서 선택한 카라반의 진행/예정 예약 구간 확인
5. 리뷰 작성:
   - `CaravanList` 에서 카라반 선택 후 `ReviewSection` 에서 리뷰 작성
   - 리스트에서 방금 작성한 리뷰가 보이는지 확인 (`GET/POST /api/reviews`)

---

## 5. 테스트 실행

### 5-1. 백엔드 테스트 (Jest + supertest)

```bash
cd api
npm test
```

예시 테스트:

- `test/health.test.ts`: `GET /health` 200 + `{ status: 'ok' }` 확인
- 일부 인증/소셜 콜백 happy path 테스트는 추후 보강 예정

> DB 접속이 필요한 테스트는 `SESSION_STORE=memory` 나 테스트 전용 DB 를 사용하는 방식으로 운용합니다.

### 5-2. 프론트엔드 테스트 (Vitest + RTL)

```bash
cd web
npm test          # 또는 npm run test:run
```

예시 테스트 범위:

- `/login` 페이지:
  - 이메일/비밀번호 검증
  - 소셜 로그인 버튼 렌더링
  - `?error=...` 기반 에러 메시지 출력
- `/app` 보호 영역:
  - 세션 없음 → 로그인 페이지로 리다이렉트
  - 세션 있음 → 대시보드 컴포넌트 렌더링

---

## 6. Azure VM 배포 개요

Ubuntu 기반 Azure VM 에 배포할 때는 두 가지 시나리오를 사용할 수 있습니다.

- A) Docker Compose 기반
  - `docker-compose.prod.yml` + `infra/nginx.caravanshare.conf.example` 사용
  - `web/dist` 를 Nginx 정적 파일로 서빙, `/api/*` 는 Express API 로 리버스 프록시
- B) Node + PM2 + Nginx 기반
  - VM 에서 직접 Node/MariaDB/Nginx 설치
  - PM2 로 `dist/server.js` 실행, Nginx 가 정적 파일 + `/api` 프록시

자세한 설정/설명은 `docs/DEPLOY_AZURE.md` 를 참고하세요.

---

## 7. 참고: 예전 Python/FastAPI 코드

- `src/`, `backend/` 폴더에는 기존 FastAPI + SQLAlchemy 구현이 남아 있습니다.
- 도메인 모델, 예약 비즈니스 규칙, 권한 설계 등은 해당 코드를 참고할 수 있습니다.
  다만 실제 과제 제출/운영 코드는 **`api/` + `web/` 방향**으로 유지/발전시키는 것이 원칙입니다.

