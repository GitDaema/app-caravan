# ROLE

이 문서는 **CaravanShare** 프로젝트에서 AI 도우미(예: ChatGPT, Gemini)가 따라야 할  
현재 구조 요약과 작업 지침을 담은 가이드입니다.

이 리포지토리는 **FastAPI 백엔드 + Vite/React PWA 프론트엔드**를 중심으로 동작하며,  
추가로 `api/` 디렉터리에 Node.js 기반 코드가 존재하지만, **과제 평가와 품질 관리의 1차 대상은 FastAPI 백엔드와 PWA 프론트**입니다.

---

# GOAL (현재까지의 상태 요약)

- **Backend (FastAPI, Python)**  
  - 위치: `src/`, `backend/`  
  - 역할: `/api/v1` 이하 카라반 공유/예약 API 제공  
  - 테스트: `backend/tests/` 기반 Pytest 스위트 (커버리지 ~80% 이상)

- **Frontend (Vite + React PWA)**  
  - 위치: `web/`  
  - 역할: React SPA + PWA + (선택적) Capacitor 모바일 빌드  
  - 백엔드 연동: `VITE_API_BASE_URL` 환경 변수로 백엔드 URL 주입

- **Legacy / Optional Node API**  
  - 위치: `api/`  
  - Node.js + Express + Prisma 아키텍처의 코드가 남아 있지만,  
    **현재 과제에서의 주요 평가·수정 대상은 아님**. 특별히 요청하지 않는 한 적극적으로 손대지 말 것.

---

# CURRENT ARCHITECTURE (2025-11 기준)

## 1. Backend – FastAPI (Canonical)

### 구조

- 엔트리포인트
  - `src/main.py` – FastAPI `app` 생성, CORS 설정, `api_router` 포함
  - `backend/app/main.py` – `from src.main import app` 형태로 재노출 (Uvicorn/테스트용)
- 주요 모듈
  - `src/api/api.py` – 라우터 집합(로그인, 유저, 카라반, 예약, Google 인증, Dev)
  - `src/api/endpoints/*` – 실제 HTTP 엔드포인트
  - `src/services/*` – 도메인 서비스 (예약, 유저, 카라반, 가격 계산, 예약 검증)
  - `src/repositories/*` – Repository 패턴으로 DB 접근 캡슐화
  - `src/models/*` – SQLAlchemy ORM 모델 (`User`, `Caravan`, `Reservation`)
  - `src/exceptions/*` – 도메인 예외 정의 (예약/유저 관련)
  - `src/core/config.py` – 설정/환경 변수 관리 (pydantic-settings)
  - `src/database/session.py` – SQLAlchemy 세션/엔진

### 특징

- 레이어드 아키텍처:
  - API → Service → Repository → Model
  - 도메인 규칙/트랜잭션은 Service 레이어(예: `ReservationService`)에 모여 있음.
- 예약 도메인:
  - 중복 예약 방지: `[start_date, end_date)` 구간 겹침 검사 (`ReservationValidator`)
  - 트랜잭션: 잔액 차감 + 예약 생성/상태 변경을 하나의 세션에서 처리, 실패 시 롤백.
- DI:
  - `src/api/deps.py` 에서 FastAPI `Depends` 기반으로 DB 세션 + Service 인스턴스 주입.

## 2. Frontend – Vite + React PWA

### 구조

- 위치: `web/`
- 주요 파일/폴더:
  - `web/vite.config.ts` – Vite 설정
  - `web/capacitor.config.ts` – (선택) Capacitor 모바일 빌드 설정
  - `web/src/main.tsx`, `web/src/App.tsx` – React 엔트리/라우트
  - `web/src/pages/`, `web/src/components/`, `web/src/store/`, `web/src/api/`, `web/src/pwa.ts`

### 백엔드 통신

- 모든 API 호출은 `VITE_API_BASE_URL`를 기준으로 구성됩니다.
- 인증 전략(JWT/세션 쿠키 등)은 `src/api/` 혹은 `src/store/auth` 레벨에서 캡슐화하여,  
  UI 컴포넌트는 “데이터 요구사항”에만 집중하도록 설계되어 있습니다.

## 3. Tests

- 실제 테스트 코드 위치: `backend/tests/`
- 루트 `tests/`:
  - 제출 형식 및 일부 도구가 기대하는 상위 `tests/` 폴더 형식을 만족시키기 위한 **안내용 폴더**입니다.
  - `tests/README.md` 에서 `backend/tests/`로의 경로를 안내.
- 실행 예:
  - `pytest backend/tests -q`
  - `pytest --cov=src --cov-report=term-missing backend/tests`

테스트는 로그인/예약/취소/환불/호스트 권한/Google 로그인/유저 관리/카라반 검색 등  
**핵심 도메인 플로우**를 통합 테스트 수준에서 검증합니다.

---

# GUIDELINES – 앞으로의 작업을 위한 지침

## 1. 수정 범위 우선순위

1. **FastAPI 백엔드 (`src/`, `backend/`)**
   - 과제 평가, 품질 점수, 테스트 커버리지 측면에서 가장 중요한 영역입니다.
   - 신규 기능/버그 수정/리팩토링이 필요하다면 가능한 한 이 영역에서 처리할 것을 우선 고려합니다.
2. **React PWA 프론트 (`web/`)**
   - UI/UX, PWA 동작, API 연동 문제는 여기서 해결합니다.
   - 단, 백엔드 공용 규약(API 경로/응답 구조)를 깨지 않도록 주의합니다.
3. **Node `api/` 백엔드**
   - 명시적으로 요청받지 않는 한, **구조 변경·대규모 수정은 피합니다.**
   - 필요한 경우에도 “레거시/참고용 코드”라는 전제를 잊지 말고,  
     FastAPI 백엔드와 충돌하지 않도록 범위를 매우 제한적으로 잡으십시오.

## 2. 변경 원칙 (Surgical Fix)

GOAL.md 의 요구사항을 존중하여, 다음 원칙을 따릅니다.

- **Public API 안정성**
  - 엔드포인트 경로, HTTP 메서드, 주요 요청/응답 스키마는 함부로 바꾸지 않습니다.
  - 반드시 바꿔야 한다면, 테스트/프론트 코드까지 함께 업데이트하고, 문서(README/DESIGN/GEMINI)에 반영합니다.
- **구조/파일명 유지**
  - 폴더 구조 및 파일명 변경은 매우 높은 리스크를 가지므로, 과제 마감 전에는 피하는 것을 기본으로 합니다.
- **로직 흐름 최소 변경**
  - 버그 수정/기능 추가 시, 기존 제어 흐름을 크게 바꾸기보다는  
    작은 헬퍼 함수/Docstring/주석/검증 추가 등으로 “핀셋 수정”을 우선 고려합니다.
- **테스트 우선**
  - 코드 변경 후에는 반드시 `pytest backend/tests` 를 돌려 안정성을 확인합니다.
  - 새로운 경계 조건이나 에러 케이스를 다루는 경우, 가능하면 테스트 파일을 추가/수정하여 회귀를 방지합니다.

## 3. 코드 품질 / 리팩토링 지침

- **길고 복잡한 함수**
  - 현재 `ReservationService` 일부 메서드, Google 인증 엔드포인트 등은 길지만,  
    Docstring과 테스트로 관리되고 있습니다.
  - 대규모 분해보다는, 의미 있는 주석/Docstring을 추가하고, 테스트로 행동을 고정하는 방향을 우선합니다.
- **DI/레이어드 아키텍처 유지**
  - API 엔드포인트에서 레포지토리를 직접 생성하기보다는, `deps.py`를 통해 Service를 주입받는 패턴을 유지합니다.
  - 새로운 비즈니스 규칙이 생기면 우선 Service 레이어에 배치하고, API 레벨에서는 thin translation (HTTP ↔ 도메인) 만 담당하게 합니다.
- **예외 처리**
  - 도메인 에러는 `src/exceptions/` 계층에서 정의하고,  
    API 레이어에서 HTTP 코드로 명시적으로 매핑합니다.
  - 새로운 에러 케이스를 추가할 때, 가능한 한 **도메인 예외 타입 + 매핑 로직 + 테스트** 3종 세트를 함께 갱신합니다.

## 4. 문서 업데이트 지침

코드를 바꿨다면, 다음 문서 중 어떤 것을 수정해야 하는지 항상 점검하십시오.

- **README.md (루트)** – 전체 개요/Quick Start/디렉터리 안내가 바뀌었을 때.
- **backend/README.md** – FastAPI 서버 설정/실행/주요 기능이 바뀌었을 때.
- **web/README.md** – 프론트엔드 실행 방식, 환경 변수, 빌드 플로우가 바뀌었을 때.
- **tests/README.md** – 테스트 위치/실행 명령이 바뀌었을 때.
- **DESIGN.md** – 아키텍처나 중요한 기술적 의사결정이 바뀌었을 때.
- **GEMINI.md (본 문서)** – “어떤 부분을 주로 건드려야 하는지, 앞으로의 방향성” 이 바뀌었을 때.

문서와 코드가 서로 다른 이야기를 하지 않도록, **중요한 설계 변경은 반드시 문서에도 반영**하는 것을 원칙으로 합니다.

---

이 문서는 “다음 AI/개발자가 이 리포지토리에 들어왔을 때,  
어디를 봐야 하고 어디를 조심해야 하는지”를 안내하는 **항해 지도**입니다.  
새로운 작업을 시작하기 전에, 여기의 원칙과 현재 구조를 한 번씩 다시 확인해 주세요.

