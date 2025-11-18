# CaravanShare Azure VM 배포 가이드

이 문서는 Ubuntu 기반 Azure VM 에 CaravanShare(Express API + React 웹 앱)를 배포하는 두 가지 시나리오를 정리합니다.

- 시나리오 A: Docker Compose 기반 (MariaDB + API + Nginx 정적 웹 + `/api` 리버스 프록시)
- 시나리오 B: Node + PM2 + Nginx 기반 (API는 PM2로, 웹은 Nginx 정적 서빙)

> 실제 도메인, OAuth Client ID/Secret, DB 비밀번호 등 비밀값은 **모두 VM 의 `.env` 또는 환경 변수로만 관리**하고, Git 저장소에는 커밋하지 않습니다.

---

## 1. 공통 준비 (Azure VM)

1. **Ubuntu VM 생성**
   - 이미지: Ubuntu 22.04 LTS 권장
   - 포트: 최소 `22`, `80`, `443` 에 대해 NSG / 방화벽 허용
2. **필수 패키지 설치**

```bash
sudo apt update
sudo apt install -y curl git build-essential

# Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker + docker-compose-plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
sudo apt install -y nginx
```

> Docker 사용 후에는 `newgrp docker` 또는 재로그인 후 `docker` 명령을 사용합니다.

3. **레포 클론**

```bash
git clone https://github.com/<your-account>/app-caravan.git
cd app-caravan
```

---

## 2. 시나리오 A – Docker Compose 기반 배포

구성:

- `db`: MariaDB 10.11 (내부 네트워크에서만 사용)
- `api`: Node 20 + Express + Prisma (컨테이너 내부 포트 `3000`)
- `web`: Nginx (정적 `web/dist` 서빙 + `/api` -> `api:3000` 리버스 프록시)

### 2-1. 환경 변수 설정

루트 디렉터리(`app-caravan`)에 `.env` 파일 생성:

```bash
cp .env.example .env
nano .env
```

필수 항목:

- `MARIADB_ROOT_PASSWORD`, `MARIADB_USER`, `MARIADB_PASSWORD`
- `DATABASE_URL` (예: `mysql://caravan:<비밀번호>@db:3306/caravanshare`)
- `SESSION_SECRET`
- `GOOGLE_*`, `NAVER_*`, `KAKAO_*` (실제 발급값)
- `FRONTEND_BASE_URL` (예: `https://your-domain` 또는 임시로 `http://<VM-공인-IP>`)

> OAuth Redirect URL 예시 (도메인 기준):  
> - `https://your-domain/api/auth/google/callback`  
> - `https://your-domain/api/auth/naver/callback`  
> - `https://your-domain/api/auth/kakao/callback`

### 2-2. 프론트엔드 빌드

```bash
cd web
npm install
npm run build
cd ..
```

빌드 결과는 `web/dist` 에 생성되며, `docker-compose.prod.yml` 의 Nginx 컨테이너에서 `/usr/share/nginx/html` 로 마운트됩니다.

### 2-3. Prisma 마이그레이션 및 Seed (선택)

Compose 를 올리기 전에 한 번 DB 스키마와 데모 데이터를 준비합니다.

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
- `infra/nginx.caravanshare.conf.example`: Nginx 서버 블록 예시 (웹 정적 서빙 + `/api` 리버스 프록시)

확인:

- 브라우저에서 `http://<VM-공인-IP>` 접속
- `/api/health` → Express API 헬스 체크 (`{"status":"ok"}`)
- `/api/auth/me` → 세션 쿠키 포함 요청 시 로그인 상태 확인

---

## 3. 시나리오 B – Node + PM2 + Nginx 기반 배포

이 방식은 Docker 없이 VM 상에서 직접 Node/Prisma/MariaDB 를 실행합니다.

### 3-1. MariaDB 설치 및 DB 준비

```bash
sudo apt install -y mariadb-server
sudo systemctl enable --now mariadb

sudo mysql_secure_installation
```

DB / 사용자 생성 예시:

```sql
CREATE DATABASE caravanshare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'caravan'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON caravanshare.* TO 'caravan'@'localhost';
FLUSH PRIVILEGES;
```

### 3-2. API(.env) 및 마이그레이션

```bash
cd app-caravan/api
cp .env.example .env
nano .env
```

주요 항목:

- `DATABASE_URL=mysql://caravan:<비밀번호>@localhost:3306/caravanshare`
- `SESSION_SECRET`, `FRONTEND_BASE_URL=https://your-domain`
- 각 OAuth Provider 의 `*_CLIENT_ID/SECRET` 및 `*_CALLBACK_URL`

이후:

```bash
npm install
npx prisma migrate deploy
node prisma/seed.cjs   # 선택: 데모 계정/데이터
npm run build
```

### 3-3. PM2 로 API 실행

전역 PM2 설치:

```bash
sudo npm install -g pm2
```

API 실행 및 자동 재시작 설정:

```bash
cd app-caravan/api
pm2 start dist/server.js --name caravanshare-api
pm2 save
pm2 startup systemd    # 출력되는 명령 한 번 실행
```

### 3-4. 프론트엔드 빌드 및 배포

```bash
cd app-caravan/web
npm install
npm run build
sudo mkdir -p /var/www/caravanshare-web
sudo cp -r dist/* /var/www/caravanshare-web/
```

### 3-5. Nginx 설정 (예시)

`/etc/nginx/sites-available/caravanshare` 파일 생성:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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

심볼릭 링크 생성 및 Nginx 재시작:

```bash
sudo ln -s /etc/nginx/sites-available/caravanshare /etc/nginx/sites-enabled/caravanshare
sudo nginx -t
sudo systemctl reload nginx
```

> HTTPS 사용 시에는 `certbot --nginx` 등을 이용해 TLS 인증서를 발급/적용합니다.

---

## 4. 배포 후 체크리스트

- [ ] `http(s)://your-domain/` 접속 시 랜딩 페이지가 정상 표시되는지
- [ ] `/login` → Google/Naver/Kakao 소셜 로그인 후 `/app` 으로 이동하는지
- [ ] `/app` 에서
  - [ ] `admin@example.com` / `host@example.com` / `guest@example.com` (비밀번호 `password`) 로 데모 로그인 가능한지
  - [ ] Host Panel 에서 예약 상태 변경(confirmed/cancelled)이 동작하는지
  - [ ] Admin Reservations 에서 전체 예약 목록이 보이는지
- [ ] `pm2 status` 또는 `docker compose ps` 로 API 컨테이너/프로세스 상태가 정상인지

배포 중 문제가 발생하면:

- API 로그: `pm2 logs caravanshare-api` 또는 `docker compose logs api`
- Nginx 로그: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

