# CaravanShare Vercel + Render 초고속 무료 배포 가이드

이 문서는 Azure VM 만료 상황에서 가장 빠르고(10분 이내), 유지비용 없이 무료로, 그리고 안정적으로 서비스를 배포할 수 있는 **Vercel(프론트엔드) + Render(백엔드)** 연동 배포 방법을 설명합니다.

이 방식은 복잡한 리눅스 서버 접속(SSH), 방화벽 설정(NSG/UFW), Nginx 리버스 프록시 세팅 및 SSL(Certbot) 발급 과정이 **전부 생략**됩니다.

---

## 1. 백엔드 배포 (Render.com)

Render는 깃허브 저장소를 연동하여 백엔드 API를 배포해 주는 가장 대중적인 무료 클라우드 플랫폼입니다.

1. **Render 회원가입 및 로그인**
   - [Render 홈페이지(render.com)](https://render.com)에 접속하여 깃허브(GitHub) 계정으로 가입/로그인합니다.

2. **새로운 Web Service 생성**
   - 대시보드 우측 상단의 **[New]** -> **[Web Service]**를 클릭합니다.
   - **[Build and deploy from a Git repository]**를 선택하고 Next를 누릅니다.
   - 본인의 `app-caravan` 저장소(Repository)를 찾아 **[Connect]**를 누릅니다.

3. **서비스 상세 설정 입력**
   - **Name**: `caravanshare-api` (원하는 이름)
   - **Region**: `Singapore (Southeast Asia)` (한국과 가장 가까워 빠름)
   - **Branch**: `main`
   - **Language**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `bash start.sh` 
     * *(중요: 제가 추가해 둔 `start.sh`를 사용하면 서버가 재시작되어 SQLite 데이터가 리셋되어도 항상 데모 데이터가 자동 복구됩니다.)*
   - **Instance Type**: `Free` (무료 요금제 선택)

4. **환경 변수(Environment Variables) 설정**
   - 아래의 **[Advanced]** 버튼을 클릭하여 환경 변수 항목에 다음 값을 추가합니다.
     * `SECRET_KEY`: `09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7` (혹은 랜덤한 문자열)
     * `DATABASE_URL`: `sqlite:///./caravan_booking.db`
     * `CORS_ORIGINS`: `*` (모든 Origin 허용)

5. **배포(Create Web Service) 클릭**
   - 하단의 **[Create Web Service]** 버튼을 누릅니다.
   - 3~4분 뒤 빌드가 완료되면 대시보드 상단에 **`https://caravanshare-api-xxxx.onrender.com`** 형식의 무료 HTTPS 주소가 생성됩니다. 이 주소를 복사해 둡니다.

---

## 2. 프론트엔드 배포 (Vercel.com)

Vercel은 React 정적 파일을 초고속 에지(CDN) 서버를 통해 배포해 주는 완전 무료 플랫폼입니다.

1. **Vercel 회원가입 및 로그인**
   - [Vercel 홈페이지(vercel.com)](https://vercel.com)에 접속하여 깃허브(GitHub) 계정으로 가입/로그인합니다.

2. **새 프로젝트 추가**
   - 대시보드 우측 상단의 **[Add New]** -> **[Project]**를 클릭합니다.
   - 본인의 `app-caravan` 저장소를 찾아 **[Import]**를 누릅니다.

3. **프로젝트 설정 수정 (매우 중요)**
   - **Root Directory**: `web`으로 설정합니다. (Edit 버튼을 눌러 `web` 폴더를 지정)
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Build and Output Settings**: 기본값 유지 (`npm run build` 및 `dist` 아웃풋 자동 인지)

4. **환경 변수(Environment Variables) 설정**
   - **Environment Variables** 섹션을 펼치고 아래 값을 입력하여 Add를 누릅니다.
     * **Key**: `VITE_API_BASE_URL`
     * **Value**: `https://[1단계에서 복사한 Render 백엔드 주소]/api/v1`
       * *(예: `https://caravanshare-api-xxxx.onrender.com/api/v1`)*

5. **배포(Deploy) 클릭**
   - **[Deploy]** 버튼을 클릭합니다.
   - 약 1분 이내에 빌드가 완료되며 대시보드에 **`https://app-caravan-xxxx.vercel.app`** 형식의 전용 무료 도메인이 생성됩니다.

---

## 3. 완료 및 서비스 확인

이제 발급된 Vercel 주소로 접속하면 안전하고 빠르게 배포된 캐러밴 공유 앱을 테스트하실 수 있습니다.
- **관리자 계정**: `admin@example.com` / `password`
- **호스트 계정**: `host@example.com` / `password`
