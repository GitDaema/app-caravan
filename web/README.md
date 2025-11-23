Web Frontend (Vite + React PWA)
================================

`web/` 디렉터리는 Vite + React + TypeScript 기반으로 구현된 **PWA 지원 카라반 공유 웹 프론트엔드**입니다.  
브라우저 및 모바일(브라우저 설치 / Capacitor 빌드)에서 동작하며, 백엔드 API와 HTTP를 통해 통신합니다.

---

## 1. 프론트엔드 개요

- React + Vite 기반 SPA
- TypeScript 사용
- PWA 지원 (서비스 워커, 오프라인 캐시, 설치 가능 웹앱)
- Capacitor 를 사용한 선택적 모바일 앱 패키징 지원

프론트엔드는 **백엔드에서 제공하는 REST API**를 호출하여:

- 로그인/로그아웃 및 사용자 세션 관리
- 카라반 목록·검색 및 상세 조회
- 예약 생성/취소 및 목록 조회
- 유저 잔액 조회/충전 등

과 같은 기능을 화면으로 제공합니다.  
구체적인 API 스펙 자체는 백엔드에서 정의되며, 이 문서에서는 “어떻게 연결하는지(환경 설정)”에 초점을 맞춥니다.

---

## 2. 설치 및 실행 (Setup & Run)

아래 모든 명령은 `web/` 디렉터리 기준입니다.

### 의존성 설치

```bash
cd web
npm install
```

권장 Node.js 버전은 **18 이상**입니다.

### 개발 서버 실행

```bash
npm run dev
```

- 기본 개발 주소: `http://localhost:5173`
- 백엔드 API 서버가 별도로 떠 있어야 UI가 정상적으로 동작합니다  
  (예: FastAPI 백엔드가 `http://localhost:8000` 혹은 `http://localhost:3000` 등에서 실행 중).

### 환경 변수 (.env)

프론트엔드는 Vite 규칙에 따라 **환경 변수는 모두 `VITE_` prefix** 를 사용합니다.

1. 예시 파일 복사

```bash
cp .env.local.example .env.local
```

2. 핵심 변수 설정

- `VITE_API_BASE_URL`
  - 백엔드 API의 루트 URL 입니다.
  - 예시:
    - FastAPI 개발 서버를 직접 사용할 때: `http://localhost:8000`
    - 리버스 프록시 또는 Node API 게이트웨이를 경유할 때: `http://localhost:3000`
  - 프론트엔드는 이 값을 기준으로 `fetch` 요청을 구성합니다. 예:
    - `${VITE_API_BASE_URL}/api/v1/login/access-token`
    - `${VITE_API_BASE_URL}/api/v1/users/…`
    - `${VITE_API_BASE_URL}/api/v1/caravans/…`
    - `${VITE_API_BASE_URL}/api/v1/reservations/…`

- 기타 선택적 변수 (예: Firebase, 추가 외부 서비스 연동)에 대한 설명은 필요 시 확장할 수 있도록 `.env.local.example` 에 주석으로 남기는 것을 원칙으로 합니다.

**중요:**  
프론트엔드 입장에서는 “백엔드가 어떤 기술로 구현되었는지”보다  
“REST API가 어느 URL에서, 어떤 스킴(HTTP/HTTPS)으로 제공되는지”가 중요합니다.  
운영/스테이징/로컬 환경별로 `VITE_API_BASE_URL` 을 적절히 분리해 사용하는 것을 권장합니다.

---

## 3. 폴더 구조 요약

아래는 프론트엔드 소스 코드의 주요 위치만 간략히 정리한 것입니다.  
구체적인 컴포넌트/훅/스토어 구조는 코드와 주석을 함께 참고하면 됩니다.

```text
web/
  ├── index.html          # Vite 진입 HTML
  ├── vite.config.ts      # Vite 설정
  ├── capacitor.config.ts # (선택) Capacitor 모바일 빌드 설정
  └── src/
      ├── main.tsx        # React 엔트리 포인트
      ├── App.tsx         # 라우팅 및 글로벌 레이아웃
      ├── pages/          # 페이지 단위 화면 (예: 로그인, 대시보드, 예약 목록 등)
      ├── components/     # 재사용 가능한 UI 컴포넌트 (폼, 카드, 모달 등)
      ├── hooks/          # 커스텀 훅 (예: 데이터 페칭, 인증 상태 관리)
      ├── store/          # 전역 상태 관리(예: auth 상태, 사용자 정보 등)
      ├── api/            # 백엔드 API 호출 래퍼/클라이언트 (fetch/axios 등)
      ├── styles/         # 전역 스타일, 테마, 유틸리티 CSS
      └── pwa.ts          # PWA 등록/서비스 워커 관련 설정
```

### 백엔드와의 통신 관점 정리

- 모든 API 호출은 `VITE_API_BASE_URL` 을 기준으로 구성된 HTTP 요청입니다.
- 인증/세션 전략(예: JWT, 세션 쿠키 등)에 따라:
  - `Authorization` 헤더에 토큰을 붙이거나,
  - `credentials: "include"` 옵션으로 쿠키 기반 세션을 함께 전송합니다.
- 이러한 세부 구현은 `src/api/` 또는 `src/store/` 레이어에서 캡슐화하여,  
  개별 컴포넌트는 “데이터를 가져오고, 상태를 갱신한다”는 역할에 집중할 수 있도록 합니다.

---

프론트엔드와 백엔드의 전체적인 아키텍처 및 도메인 설계 의도는 루트의 `DESIGN.md` 를 참고하면 됩니다.  
이 문서는 어디까지나 “프론트엔드를 어떻게 띄우고, 어디를 고쳐야 백엔드와 잘 통신하는지”를 안내하는 것을 목표로 합니다.

