# CaravanShare Azure VM 배포 가이드 (FastAPI 최신판)

이 문서는 Ubuntu 기반 Azure VM에 CaravanShare(FastAPI 백엔드 + React 웹)를 배포하는 두 가지 시나리오를 정리합니다.

- **시나리오 A**: Docker Compose 기반 (FastAPI 컨테이너 + SQLite 볼륨 + Nginx 컨테이너 + `/api` 리버스 프록시)
- **시나리오 B**: Python 가상환경 + PM2/Systemd + Nginx 직접 배포 (가장 쉽고 추천하는 HTTPS 도메인 연결 방식)

> 실제 OAuth Client ID/Secret, API 시크릿 키 등 보안 값은 **모두 VM 내 `.env` 또는 환경 변수로만 관리**하고, Git 리포지토리에는 커밋하지 않습니다.

---

## 1. 공통 준비 (Azure VM)

1. **Ubuntu VM 생성**
   - 이미지: Ubuntu 22.04 LTS 권장
   - 네트워크 설정: 인바운드 보안 규칙(NSG)에서 `22`, `80`, `443` 포트가 열려 있는지 확인합니다.

2. **필수 패키지 설치**
   ```bash
   sudo apt update
   sudo apt install -y curl git build-essential python3-pip python3-venv nginx certbot python3-certbot-nginx
   
   # Docker + docker-compose-plugin (시나리오 A 선택 시에만 필요)
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker "$USER"
   ```
   > Docker를 방금 설치했다면 `newgrp docker` 또는 재로그인 후 `docker` 명령을 사용할 수 있습니다.

3. **프로젝트 클론**
   ```bash
   git clone https://github.com/<your-account>/app-caravan.git
   cd app-caravan
   ```

---

## 2. 시나리오 A – Docker Compose 기반 배포

이 방식은 Docker 컨테이너들로 서비스를 간편하게 격리 구동할 때 유용합니다. (FastAPI 백엔드와 Nginx를 연동)

### 2-1. 빌드 준비 및 프론트엔드 빌드
배포 서버(VM) 내에서 프론트엔드 파일을 도메인 기준 주소로 미리 빌드해 놓아야 Nginx 컨테이너가 서빙할 수 있습니다.

```bash
# Node.js 20 LTS가 설치되어 있지 않다면 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd web
npm install

# 빌드 타겟 API 주소를 https://caravanshare.xyz/api/v1 으로 설정
echo "VITE_API_BASE_URL=https://caravanshare.xyz/api/v1" > .env.production
npm run build
cd ..
```

### 2-2. 루트 `.env` 설정
프로젝트 루트 디렉터리(`app-caravan`)에서 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
nano .env
```

환경 변수 설정:
```env
SECRET_KEY=<openssl rand -hex 32 등으로 생성한 랜덤하고 긴 문자열>
DATABASE_URL=sqlite:////app/data/caravan_booking.db
CORS_ORIGINS=https://caravanshare.xyz
GOOGLE_CLIENT_ID=<your-google-client-id>
FIREBASE_PROJECT_ID=<your-firebase-project-id>
```

### 2-3. Docker Compose 기동
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
* **동작 확인**: 브라우저에서 `https://caravanshare.xyz` 접속 후 확인.

---

## 3. 시나리오 B – Python 직접 실행 + Nginx + PM2 + HTTPS(TLS) 배포

이 방식은 **현재 `caravanshare.xyz` 도메인 + Azure VM**에 가장 쉽게 배포하고 Let's Encrypt 무료 TLS 인증서를 적용하는 권장 방식입니다.

### 3-1. 백엔드(FastAPI) 설치 및 DB 시드
1. **가상환경 구성 및 패키지 설치**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
2. **SQLite 데이터베이스 초기화 및 기본 데모 데이터 시딩**:
   ```bash
   python initial_data.py
   ```
   * 이 작업으로 관리자 계정(`admin@example.com` / 비밀번호 `password`) 및 기본 카라반 데이터가 로컬 SQLite(`caravan_booking.db`)에 채워집니다.

### 3-2. 백엔드 서비스 실행 (PM2 또는 Systemd)

기존에 노드 API용으로 설치된 PM2를 이용하여 가상환경의 Uvicorn 프로세스를 구동합니다.

```bash
# Node.js와 PM2가 없다면 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 기존 Express pm2 프로세스가 돌고 있다면 삭제
pm2 delete all

# 가상환경 내의 uvicorn을 이용하여 포트 8000에서 FastAPI 백엔드 실행
pm2 start ".venv/bin/uvicorn" --name "caravanshare-api" -- backend.app.main:app --host 127.0.0.1 --port 8000
pm2 save
pm2 startup systemd
```

* **로그 및 상태 확인**:
  ```bash
  pm2 status
  pm2 logs caravanshare-api
  ```

### 3-3. 프론트엔드 빌드 및 배포
1. **Vite 프로덕션 빌드**:
   ```bash
   cd web
   npm install
   
   # .env.production 파일 생성 및 저장
   echo "VITE_API_BASE_URL=https://caravanshare.xyz/api/v1" > .env.production
   npm run build
   cd ..
   ```
2. **빌드된 웹 파일 서빙 경로로 복사**:
   ```bash
   sudo mkdir -p /var/www/caravanshare-web
   sudo cp -r web/dist/* /var/www/caravanshare-web/
   ```

### 3-4. Nginx 설정
1. `/etc/nginx/sites-available/caravanshare` 설정 파일을 작성합니다.
   ```bash
   sudo nano /etc/nginx/sites-available/caravanshare
   ```

   **설정 파일 본문**:
   ```nginx
   server {
       listen 80;
       server_name caravanshare.xyz;

       root /var/www/caravanshare-web;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # /api/v1 요청을 로컬 8000 포트의 FastAPI로 프록시
       location /api/ {
           proxy_pass http://127.0.0.1:8000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
2. 사이트 활성화 및 Nginx 재시작:
   ```bash
   sudo ln -sf /etc/nginx/sites-available/caravanshare /etc/nginx/sites-enabled/caravanshare
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 3-5. HTTPS (SSL/TLS) 활성화 – Certbot
Let's Encrypt를 사용해 도메인에 대한 무료 TLS 인증서를 적용하고, Nginx에 HTTPS 포트(443)를 자동 셋업합니다.

```bash
sudo certbot --nginx -d caravanshare.xyz
```
* 진행 중 이메일 기입 및 약관 동의 절차를 거칩니다.
* HTTP 접속 시 HTTPS로 자동 리다이렉트(`Redirect`)하도록 선택하는 것을 권장합니다.
* 성공 후 브라우저에서 `https://caravanshare.xyz`로 보안 잠금 표시와 함께 정상 접속되는지 확인합니다.

---

## 4. 배포 후 동작 테스트 체크리스트

- [ ] `https://caravanshare.xyz/` 접속 시 랜딩 페이지가 표시되는가
- [ ] `/login` 에서 데모 계정으로 로그인이 가능한가
  * 관리자: `admin@example.com` / 비밀번호 `password`
  * 호스트: `host@example.com` / 비밀번호 `password`
- [ ] API가 정상 통신하는가 (브라우저 DevTools의 네트워크 탭에서 `/api/v1/...` 호출 시 200 응답 확인)
- [ ] 예약/카라반 검색이 정상 동작하는가
