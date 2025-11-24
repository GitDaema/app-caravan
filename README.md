# CaravanShare (Caravan P2P Marketplace)

![Build Status](https://img.shields.io/github/actions/workflow/status/GitDaema/app-caravan/deploy.yml?label=CI%2FCD&style=flat-square&logo=githubactions)
![Deployment](https://img.shields.io/badge/Deployment-Azure%20VM-0078D4?style=flat-square&logo=microsoftazure)
![Main Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Prisma-339933?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

> **"누구나 쉽게 카라반을 공유하고 떠날 수 있는 웹 애플리케이션"**
>
> 게스트(여행자), 호스트(소유자), 관리자 역할을 모두 지원하는 올인원 P2P 예약 플랫폼입니다.  
> **Node.js(Express)** 기반의 프로덕션 환경과 Python(FastAPI) 기반의 레퍼런스 모델을 모두 포함하는 **Monorepo** 프로젝트입니다.

![Landing Page](images/landing.png)

## 📚 Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
  - [🏖️ User Experience (Guest)](#-user-experience-guest)
  - [🚐 Host Management](#-host-management)
  - [🌦️ Utilities & Tech](#-utilities--tech)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Deployment](#deployment)

---

## About The Project

**CaravanShare**는 캠핑과 여행을 사랑하는 사람들을 위한 카라반 공유 서비스입니다.
단순한 예약 기능을 넘어, **잔액 기반 결제 시뮬레이션**, **실시간 날씨 정보**, **1:1 메시징**, **소셜 로그인** 등 실제 상용 서비스에 준하는 사용자 경험을 제공합니다.

---

## Key Features

### 🏖️ User Experience (Guest)
* **통합 검색 및 필터링**: 지역, 날짜, 인원수, 가격대별로 최적의 카라반을 검색할 수 있습니다.
* **직관적인 예약 프로세스**:
    * 가상 잔액(Wallet)을 이용한 결제 및 환불 시뮬레이션.
    * 예약 전 호스트에게 **사전 문의(Pre-message)** 발송 가능.
* **마이 페이지**: 내 예약 현황 확인, 예약 취소, 리뷰 작성 기능 제공.
* **소셜 로그인**: Google, Naver, Kakao OAuth 2.0 연동을 통한 간편 가입/로그인.

### 🚐 Host Management
* **카라반 관리**: 보유 카라반 등록, 수정, 상태 변경(유지보수 모드 등).
* **예약 승인 및 관리**: 대시보드(HostPanel)를 통해 들어온 예약을 승인(Confirm)하거나 거절할 수 있습니다.
* **수익 관리**: 예약 확정 시 잔액이 입금되며, 취소 시 환불 로직이 자동으로 처리됩니다.

### 🌦️ Utilities & Tech
* **☁️ 스마트 날씨 패널 (Weather Integration)**:
    * **Open-Meteo API**를 활용하여 예약 시작일 기준 +2일까지의 날씨 예보를 제공합니다.
    * 위치 정보를 지오코딩하여 자동으로 해당 지역의 기온과 기상 상태(맑음, 비 등)를 시각화합니다.
* **💬 실시간 메시징**: 예약 확정 후 게스트와 호스트 간의 1:1 메시지 스레드를 지원합니다.
* **📱 PWA & Offline Support**:
    * 모바일 환경에 최적화된 **Progressive Web App**으로 설계되었습니다.
    * 네트워크 끊김 감지(Offline Banner) 및 앱 설치 유도(Install Prompt) 기능을 포함합니다.

---

## Repository Structure

이 프로젝트는 **Monorepo**로 구성되어 있으며, 주요 서비스는 아래와 같이 분리되어 있습니다.

```bash
├── api/             # [Main Backend] Node.js + Express + Prisma + MariaDB
│                      → 실제 배포 및 서비스 운영을 담당하는 API 서버
├── web/             # [Frontend] Vite + React + TypeScript + PWA
│                      → 사용자 인터페이스 및 클라이언트 로직
├── backend/         # [Reference Backend] Python + FastAPI + SQLAlchemy
│                      → 도메인 모델 설계 검증 및 비즈니스 로직 레퍼런스
├── src/             # (Legacy) FastAPI 초기 구조 아카이브
├── docs/            # 배포(Azure), 빠른 시작 가이드 등 문서 모음
└── tests/           # 통합 테스트 진입점 설명
```

> **Note**: 실제 프로덕션 배포는 `api/`와 `web/`을 사용합니다. `backend/`는 아키텍처 설계를 위한 참조 구현체입니다.

---

## Tech Stack

### 🚀 Production (Main Service)
실제 배포 및 운영되는 서비스의 기술 스택입니다.

| Category | Technology |
| :--- | :--- |
| **Backend** | ![NodeJS](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=nodedotjs) ![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express) |
| **Database** | ![MariaDB](https://img.shields.io/badge/MariaDB-10.11-003545?style=flat-square&logo=mariadb) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma) |
| **Frontend** | ![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwindcss) |
| **Mobile** | ![PWA](https://img.shields.io/badge/PWA-Supported-5A0FC8?style=flat-square&logo=pwa) |

### 🧪 Reference (Experimental / Design)
초기 도메인 설계 및 로직 검증을 위해 사용된 참조 구현체입니다.

| Category | Technology |
| :--- | :--- |
| **Legacy Backend** | ![FastAPI](https://img.shields.io/badge/FastAPI-Design_Ref-009688?style=flat-square&logo=fastapi) ![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python) |

---

## Getting Started

로컬 환경에서 전체 서비스(DB + API + Web)를 빠르게 실행하는 방법입니다.
상세한 내용은 [docs/QUICKSTART.md](docs/QUICKSTART.md)를 참고하세요.

### Prerequisites
* Node.js 20 LTS
* Docker & Docker Compose

### 1. Environment Setup
루트 디렉토리의 환경 변수 템플릿을 복사합니다.
```bash
cp .env.example .env
# .env 파일 내 MARIADB_PASSWORD, SESSION_SECRET 등을 설정해주세요.
```

### 2. Run Backend & DB (Docker)
MariaDB와 Express API 서버를 컨테이너로 실행합니다.
```bash
docker compose up -d
# http://localhost:3000/health 접속 시 'OK' 확인 가능
```

### 3. Run Frontend (Dev Mode)
```bash
cd web
cp .env.local.example .env.local  # VITE_API_BASE_URL=http://localhost:3000 확인
npm install
npm run dev
```
브라우저에서 [http://localhost:5173](http://localhost:5173)으로 접속합니다.

---

## Deployment

이 프로젝트는 **Microsoft Azure VM** 환경에 배포되어 있습니다.
Nginx를 리버스 프록시로 사용하며, HTTPS(Let's Encrypt)가 적용되어 있습니다.

* **배포 가이드**: [docs/DEPLOY_AZURE.md](docs/DEPLOY_AZURE.md)
* **아키텍처 설계**: [DESIGN.md](DESIGN.md)

### ✅ Grading Checklist (Self-Evaluation)
- [x] **Level 1**: Azure VM Deploy & Public IP Access
- [x] **Level 2**: HTTPS (Certbot) & Process Management (PM2)
- [x] **Level 3**: Custom Domain (caravanshare.xyz), CI/CD, DB Separation

---

## Contact
* **Author**: GitDaema
* **Repository**: [\[GitHub Link\]](https://github.com/GitDaema/app-caravan)