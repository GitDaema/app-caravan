# CaravanShare Azure VM 배포 가이드

이 문서는 Ubuntu 기반 Azure VM 에 CaravanShare(Express API + React 웹)를 배포하는 두 가지 시나리오를 정리합니다.

- 시나리오 A: Docker Compose 기반 (MariaDB + API + Nginx 컨테이너 + `/api` 리버스 프록시)
- 시나리오 B: Node + PM2 + Nginx 기반 (VM에서 직접 API 실행 + Nginx 정적 호스팅)

> 실제 OAuth Client ID/Secret, DB 비밀번호 등 비밀 값은 **모두 VM 내 `.env` 또는 환경 변수로만 관리**하고, Git 리포지토리에는 커밋하지 않습니다.

---

## 1. 공통 준비(Azure VM)

1. **Ubuntu VM 생성**
   - 이미지: Ubuntu 22.04 LTS 권장
   - 포트: 최소 `22`, `80`, `443` 가 NSG / 방화벽에서 허용
2. **필수 패키지 설치**

```bash
sudo apt update
sudo apt install -y curl git build-essential

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker + docker-compose-plugin + Nginx
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"
sudo apt install -y nginx
```

> Docker 를 방금 설치했다면 `newgrp docker` 또는 재로그인 후 `docker` 명령을 사용할 수 있습니다.

3. **프로젝트 클론**

```bash
git clone https://github.com/<your-account>/app-caravan.git
cd app-caravan
```

---

## 2. 시나리오 A – Docker Compose 기반 배포

구성:

- `db`: MariaDB 10.11 (내부 네트워크에서만 사용)
- `api`: Node 20 + Express + Prisma (컨테이너 내부 포트 `3000`)
- `web`: Nginx (정적 `web/dist` 제공 + `/api` -> `api:3000` 리버스 프록시)

> 이 시나리오는 주로 **개발/실험용**으로 생각하고, 실 서비스용 TLS(HTTPS)는 시나리오 B(Nginx + PM2)에서 처리하는 것을 권장합니다.

### 2-1. 루트 `.env` (Compose 용) 설정

루트 디렉터리(`app-caravan`)에서 `.env` 파일 생성:

```bash
cp .env.example .env
nano .env
```

필수 항목:

- `MARIADB_ROOT_PASSWORD`, `MARIADB_USER`, `MARIADB_PASSWORD`
- `DATABASE_URL` (예: `mysql://caravan:<비밀번호>@db:3306/caravanshare`)
- `SESSION_SECRET`
- `GOOGLE_*`, `NAVER_*`, `KAKAO_*` (발급 받은 실제 값)
- `FRONTEND_BASE_URL`  
  - 로컬/실험용: `http://localhost` 또는 `http://<VM-공인-IP>`

Compose 환경에서의 OAuth Redirect URL 예시는 다음과 같이 `/api` prefix 를 포함합니다.

- `http://<호스트>/api/auth/google/callback`
- `http://<호스트>/api/auth/naver/callback`
- `http://<호스트>/api/auth/kakao/callback`

### 2-2. 프론트엔드 빌드

```bash
cd web
npm install
npm run build
cd ..
```

빌드 결과는 `web/dist` 에 생성되며, `docker-compose.prod.yml` 의 Nginx 컨테이너에서 `/usr/share/nginx/html` 로 마운트됩니다.

### 2-3. Prisma 마이그레이션 & Seed (선택)

Compose 환경에서 DB 스키마와 데모 데이터를 준비합니다.

```bash
cd api
npm install
npx prisma migrate deploy
node prisma/seed.cjs   # admin/host/guest 계정 + 기본 카라반/예약
cd ..
```

### 2-4. Docker Compose(prod) 기동

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

구성 파일:

- `docker-compose.prod.yml`: `db`, `api`, `web` 서비스 정의
- `infra/nginx.caravanshare.conf.example`: Nginx 서버 블록 예시 (정적 웹 + `/api` 리버스 프록시)

확인:

- 브라우저에서 `http://<VM-공인-IP>` 접속
- `/api/health` 로 Express API 헬스 체크 (`{"status":"ok"}`)
- `/api/auth/me` 로 세션 쿠키 포함 요청 시 로그인 상태 확인

---

## 3. 시나리오 B – Node + PM2 + Nginx + HTTPS(TLS) 배포

이 방식은 **현재 `caravanshare.xyz` 도메인 + Azure VM** 에 실제로 적용하는 것을 전제로 합니다.

- MariaDB / Node / Prisma / PM2 는 VM 에서 직접 실행
- Nginx 가 정적 파일 서빙 및 `/api` 리버스 프록시, 그리고 **TLS(HTTPS) 종료** 역할 담당
- TLS 인증서는 **Let’s Encrypt + certbot --nginx** 로 발급

### 3-1. MariaDB 설치 & DB 준비

```bash
sudo apt install -y mariadb-server
sudo systemctl enable --now mariadb

sudo mysql_secure_installation
```

DB / 계정 생성 예시:

```sql
CREATE DATABASE caravanshare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'caravan'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON caravanshare.* TO 'caravan'@'localhost';
FLUSH PRIVILEGES;
```

### 3-2. API `.env` (VM용, HTTPS/도메인 기준)

```bash
cd app-caravan/api
cp .env.example .env
nano .env
```

Azure VM + `caravanshare.xyz` 기준 예시:

```env
NODE_ENV=production
PORT=3000

DATABASE_URL=mysql://caravan:<비밀번호>@localhost:3306/caravanshare

SESSION_SECRET=<랜덤하고 긴 값>
SESSION_COOKIE_NAME=caravanshare.sid
SESSION_STORE=mysql

# 프론트엔드 최상위 주소(도메인 기준)
FRONTEND_BASE_URL=https://caravanshare.xyz

# OAuth (반드시 Redirect URI 와 일치)
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=https://caravanshare.xyz/api/auth/google/callback

NAVER_CLIENT_ID=<your-naver-client-id>
NAVER_CLIENT_SECRET=<your-naver-client-secret>
NAVER_CALLBACK_URL=https://caravanshare.xyz/api/auth/naver/callback

KAKAO_CLIENT_ID=<your-kakao-client-id>
KAKAO_CLIENT_SECRET=<your-kakao-client-secret>
KAKAO_CALLBACK_URL=https://caravanshare.xyz/api/auth/kakao/callback
```

> **중요**: 각 OAuth Provider 콘솔에 등록하는 Redirect URI 는 위 `*_CALLBACK_URL` 값과 **완전히 동일**해야 합니다. (스킴 `https`, 도메인 `caravanshare.xyz`, 경로 `/api/auth/*/callback`)

이후 API 의 의존성을 설치하고 마이그레이션/Seed 를 적용합니다.

```bash
npm install
npx prisma migrate deploy
node prisma/seed.cjs   # 선택: 데모 계정/데이터 생성
npm run build          # dist/server.js 생성
```

### 3-3. PM2 로 API 실행

전역 PM2 설치:

```bash
sudo npm install -g pm2
```

API 실행 및 부팅 시 자동 시작 설정:

```bash
cd app-caravan/api
pm2 start dist/server.js --name caravanshare-api
pm2 save
pm2 startup systemd    # 화면에 출력되는 명령을 sudo 로 한 번 더 실행
```

PM2 상태/로그 확인:

```bash
pm2 status
pm2 logs caravanshare-api
```

### 3-4. 프론트엔드 빌드 & 배포

```bash
cd app-caravan/web
npm install

# 프로덕션 빌드 시 API Base URL 을 도메인/HTTPS 기준으로 설정
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://caravanshare.xyz/api
EOF

npm run build

sudo mkdir -p /var/www/caravanshare-web
sudo cp -r dist/* /var/www/caravanshare-web/
```

### 3-5. Nginx HTTP 설정 (초기, HTTPS 발급 전)

먼저 HTTP(80) 기준으로 Nginx 서버 블록을 설정합니다. 도메인: `caravanshare.xyz` 기준 예시입니다.

`/etc/nginx/sites-available/caravanshare` 파일 생성:

```nginx
server {
    listen 80;
    server_name caravanshare.xyz;

    root /var/www/caravanshare-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # /api/* (공개 URL) -> Express API (로컬 3000) 프록시
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

심볼릭 링크 생성 및 설정 테스트:

```bash
sudo ln -s /etc/nginx/sites-available/caravanshare /etc/nginx/sites-enabled/caravanshare
sudo nginx -t
sudo systemctl reload nginx
```

이 시점에서 `http://caravanshare.xyz/` 로 접속이 되어야 합니다.

### 3-6. HTTPS(TLS) 활성화 – certbot + Nginx

이제 Let’s Encrypt 기반 무료 TLS 인증서를 발급하고, Nginx 에 자동 적용합니다.

1. **certbot 설치 (Nginx 플러그인 포함)**

```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. **인증서 발급 및 Nginx 설정 자동 갱신**

```bash
sudo certbot --nginx -d caravanshare.xyz
```

인터랙티브 질문에 대해 이메일/약관 동의 후, HTTP → HTTPS 리다이렉트 옵션을 **사용**으로 선택하면, Nginx 설정이 자동으로 다음과 유사하게 변경됩니다.

```nginx
server {
    listen 80;
    server_name caravanshare.xyz;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name caravanshare.xyz;

    ssl_certificate /etc/letsencrypt/live/caravanshare.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/caravanshare.xyz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/caravanshare-web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> `certbot` 는 `/etc/letsencrypt` 경로에 인증서를 저장하고, `/etc/cron.d` 또는 systemd timer 를 통해 자동 갱신을 설정합니다. `sudo certbot renew --dry-run` 으로 갱신 테스트를 해 볼 수 있습니다.

3. **포트/방화벽 확인**

- Azure NSG: `80`, `443` 인바운드 허용
- VM 방화벽(ufw 사용 시): `sudo ufw allow 80,443/tcp`

이제 브라우저에서 **`https://caravanshare.xyz` 로 접속**해야 하고, 주소창에 잠금 아이콘(HTTPS)이 표시되어야 합니다.

### 3-7. OAuth Redirect URI 정리

HTTPS 활성화 이후, 각 Provider 콘솔에서 Redirect URI 를 다음과 같이 통일합니다.

- Google: `https://caravanshare.xyz/api/auth/google/callback`
- Naver: `https://caravanshare.xyz/api/auth/naver/callback`
- Kakao: `https://caravanshare.xyz/api/auth/kakao/callback`

`api/.env` 의 `GOOGLE_CALLBACK_URL`, `NAVER_CALLBACK_URL`, `KAKAO_CALLBACK_URL` 값도 반드시 위와 동일하게 맞춰야 합니다.

> 로컬 개발 시에는 기존대로 `http://localhost:3000/auth/google|naver|kakao/callback` 을 사용하고, `FRONTEND_BASE_URL=http://localhost:5173`, `VITE_API_BASE_URL=http://localhost:3000` 을 사용합니다.  
> **프로덕션(Azure + 도메인)** 에서는 `FRONTEND_BASE_URL=https://caravanshare.xyz`, `VITE_API_BASE_URL=https://caravanshare.xyz/api` 로 고정하는 식으로, 환경을 명확히 분리하는 것이 좋습니다.

---

## 4. 배포 후 체크리스트

- [ ] `https://caravanshare.xyz/` 접속 시 랜딩 페이지가 정상 표시되는지
- [ ] `/login` 에서 Google/Naver/Kakao 소셜 로그인 및 `/app` 리다이렉트가 정상 동작하는지
- [ ] `/app` 에서
  - [ ] `admin@example.com` / `host@example.com` / `guest@example.com` (비밀번호 `password`) 로 모두 로그인 가능한지
  - [ ] Host Panel 에서 예약 상태 변경(pending/confirmed/cancelled)이 정상 동작하는지
  - [ ] Admin Reservations 에서 전체 예약 목록이 보이는지
- [ ] API 헬스 체크
  - [ ] `curl -k https://caravanshare.xyz/api/health` 결과가 `{"status":"ok"}` 인지
- [ ] 세션/인증
  - [ ] 로그인 후 브라우저의 쿠키에 `caravanshare.sid` 가 HTTPS 전용(Secure) 쿠키로 설정되는지
- [ ] 프로세스 상태
  - [ ] `pm2 status` 에서 `caravanshare-api` 가 online 인지
  - [ ] (Docker 시나리오 사용 시) `docker compose ps` 에서 `api`, `web`, `db` 상태가 정상인지

배포 중 문제가 발생하면:

- API 로그: `pm2 logs caravanshare-api` 또는 `docker compose logs api`
- Nginx 로그: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

