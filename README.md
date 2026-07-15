# 🌿 TruePath — 프리미엄 말씀 묵상 플랫폼

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

</div>

> **TruePath**는 매일 말씀과 원리 말씀을 통해 삶의 방향을 찾고 영적 성장을 도와주는 **프리미엄 웹 애플리케이션**입니다. 최신 **PostgreSQL + Prisma** 백엔드와 **OpenAI** 기반 **AI 전도·묵상 자동 생성** 기능을 제공하며, **Next‑Auth** 로 보호된 관리자 대시보드를 갖추고 있습니다.

---

## 📚 목차

- [🪄 프로젝트 소개](#-프로젝트-소개)
- [🚀 핵심 사용자 흐름](#-핵심-사용자-흐름)
- [✨ 주요 기능](#-주요-기능)
- [🛠 기술 스택](#-기술-스택)
- [🗄 아키텍처·인프라](#-아키텍처·인프라)
- [⚡ 시작하기](#-시작하기)
- [🔐 인증 및 환경 변수](#-인증-및-환경-변수)
- [🧭 스크립트·데이터베이스 관리](#-스크립트·데이터베이스-관리)
- [📦 배포 체크리스트](#-배포-체크리스트)
- [🤝 기여 가이드](#-기여-가이드)
- [📌 운영 팁](#-운영-팁)
- [📄 라이선스](#-라이선스)

---

## 🪄 프로젝트 소개

TruePath는 **말씀 중심의 깊이 있는 묵상 경험**을 제공하기 위해 만든 차세대 풀스택 플랫폼입니다.

- **Daily Inspiration** – 매일 자동 업데이트되는 말씀 카드와 몰입형 묵상 모드
- **Advanced Search** – 초성·형태소·Full‑text 검색을 지원하는 고성능 검색 엔진
- **Interactive Quiz** – 말씀 암기를 위한 게임화된 퀴즈
- **AI Script Generation** *(신규)* – OpenAI (gpt‑4o‑mini) 로 DB에 저장된 말씀을 조합해 `설교·묵상·기도` 3문단을 자동 생성
- **Admin Dashboard** – Next‑Auth 로 보호된 관리자 페이지, 스크립트 관리, 통계 및 Slack 알림

---

## 🚀 핵심 사용자 흐름

```text
랜딩 페이지 (/) 
   ↓
오늘의 말씀 & 묵상 
   ↓
고도화된 검색 (/search, /category) 
   ↓
인터랙티브 퀴즈 (/quiz) 
   ↓
후원 페이지 (/donate) 
   ↓
[관리자] AI 스크립트 자동 생성 (/admin/evangelism)
```

---

## ✨ 주요 기능

### 🌅 Daily Inspiration – 오늘의 말씀 & 묵상
- 매일 엄선된 말씀 카드 제공
- `unstable_cache` 로 0.2 s 이하 초고속 로딩
- 몰입형 UI·다크·라이트 테마 전환 지원

### 🔍 Advanced Search Engine – 지능형 말씀 검색
- **초성·형태소·Full‑text** 검색 (PostgreSQL `tsvector` 활용)
- 실시간 하이라이팅·스마트 필터링
- 검색 결과 페이지에서 카테고리별 정렬 및 무한 스크롤 구현

### 🤖 AI Script Generation *(새로운 기능)*
- **Prompt** 예시: `{{category}}에 어울리는 전도 설교 3문단 생성`
- **Output**: `title`, `content`, `type`(SERMON|MEDITATION|PRAYER) 자동 저장
- **관리자 UI**: 스크립트 리스트, 복사 버튼, 스켈레톤 로딩 UI 제공

### 📚 Curated Library – 주제별 말씀 라이브러리
- 천성경, 원리강론, 평화신경 등 다양한 카테고리 제공
- 카테고리 별 페이지에서 카드형 UI 로 직관적 탐색

### 🧩 Interactive Quiz – 말씀 퀴즈
- 빈칸 채우기·즉시 피드백·해설 제공
- 점수 시스템 및 랭킹 페이지 (선택 구현)

### 🤍 Donation & Sponsorship – 후원 시스템
- Toss Payments 연동 (간편 결제)
- 후원 내역 대시보드 제공 (관리자 전용)

---

## 🛠 기술 스택

| 구분 | 기술 |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Database** | PostgreSQL (Neon Serverless), Prisma ORM |
| **AI / LLM** | OpenAI API (gpt‑4o‑mini) |
| **Auth** | Next‑Auth (JWT Session) |
| **CI/CD** | GitHub Actions, Vercel |

---

## 🗄 아키텍처·인프라

![Architecture Diagram](https://raw.githubusercontent.com/PARSA1021/word-meditation-app/main/.github/architecture.png)

- **Neon DB** – Serverless PostgreSQL, 자동 스케일링 지원
- **Prisma** – 타입‑안전 ORM, `postinstall` 스크립트(`prisma generate`) 로 배포 시 자동 실행
- **GitHub Actions** – `main` 브랜치 푸시 시 `npm run lint && npm run test && npm run build` 자동 검증
- **Vercel Edge** – Edge Runtime + Server‑Side Rendering 최적화, API 라우트는 Edge Function 으로 동작
- **OpenAI** – 전도·묵상 스크립트 생성에 전용 키 사용, 쿼터 관리 필요

---

## ⚡ 시작하기

### 1️⃣ 레포지토리 클론
```bash
git clone https://github.com/PARSA1021/word-meditation-app.git
cd word-meditation-app
```

### 2️⃣ 의존성 설치 (CI 친화적)
```bash
npm ci   # lock 파일 기반 deterministic install
```

### 3️⃣ 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 만들고 아래 내용을 채워 주세요. (**인증·인프라** 섹션 참고)

### 4️⃣ 데이터베이스 초기화
```bash
npx prisma generate               # Prisma Client 생성 (postinstall 에서도 자동 실행)
npx prisma db push               # 스키마를 Neon DB에 적용
npx tsx scripts/seed-words.ts    # (선택) 기존 JSON 데이터를 DB에 시드
```

### 5️⃣ 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 으로 접속하면 완전한 프리미엄 UI를 확인할 수 있습니다.

---

## 🔐 인증 및 환경 변수
관리자 페이지와 AI 스크립트 자동 생성 API는 **Next‑Auth** 로 보호됩니다. 아래 변수들은 반드시 `.env.local` 에 정의해야 합니다.

```env
# ── Database ──────────────────────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@neon-host.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://USER:PASSWORD@neon-host.aws.neon.tech/neondb?sslmode=require"

# ── Next‑Auth ────────────────────────────────────────────────────
NEXTAUTH_SECRET="$(openssl rand -base64 32)"   # 강력한 32바이트 비밀키
NEXTAUTH_URL="http://localhost:3000"          # 배포 시 Vercel 도메인 입력

# ── Admin Login ─────────────────────────────────────────────────
ADMIN_PASSWORD="YourSecurePassword"

# ── OpenAI (AI Script Generation) ─────────────────────────────────
OPENAI_API_KEY="sk-..."
```
> **Tip**: `openssl rand -base64 32` 로 강력한 `NEXTAUTH_SECRET` 를 쉽게 생성할 수 있습니다.

---

## 🧭 스크립트·데이터베이스 관리

| 스크립트 | 설명 |
|---|---|
| `npm run dev` | 로컬 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run start` | 빌드된 앱 실행 |
| `npx prisma generate` | Prisma Client 재생성 (postinstall 자동) |
| `npx prisma db push` | 스키마를 DB에 동기화 |
| `npx tsx scripts/seed-words.ts` | 초기 JSON 데이터를 DB에 삽입 |

---

## 📦 배포 체크리스트
- [ ] Vercel 프로젝트를 생성하고 GitHub 레포와 연결
- [ ] `package.json` 의 `postinstall` (`prisma generate`) 스크립트가 포함됐는지 확인
- [ ] Vercel 환경 변수에 **모든** `.env.local` 내용 입력 (`DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_PASSWORD`, `OPENAI_API_KEY` 등)
- [ ] API 라우트 (`/api/evangelism/*`) 를 **Edge Function** 으로 활성화
- [ ] OpenAI 사용량(쿼터) 확인 – 429 오류 방지를 위해 키 재충전 필요
- [ ] `vercel --prod` 로 수동 프로덕션 배포 후 관리자 UI 동작 확인

---

## 🤝 기여 가이드
1. 레포지토리를 포크합니다.
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feat/awesome-feature`).
3. 코드를 구현하고, **테스트**와 **Lint** 를 실행합니다.
   ```bash
   npm run lint && npm test
   ```
4. 변경 내용을 상세히 서술한 Pull Request 를 제출합니다.
5. CI 워크플로우가 **통과** 되면 머지합니다.

---

## 📌 운영 팁
- **캐시**: 대부분의 읽기 전용 페이지는 `unstable_cache` 를 사용합니다. 캐시 무효화는 배포 시 자동, 혹은 `CACHE_VERSION` 환경 변수를 증가시켜 수동으로 할 수 있습니다.
- **모니터링**: Vercel Analytics + (선택) Sentry 로 에러 추적 및 응답 시간 모니터링을 설정하세요.
- **OpenAI 쿼터**: 무료 플랜은 제한적이니, 사용량을 정기적으로 확인하고 필요 시 키를 교체하거나 유료 플랜으로 업그레이드합니다.
- **DB 백업**: Neon DB은 자동 스냅샷을 제공하지만, 중요한 시점은 `pg_dump` 로 수동 백업을 권장합니다.

---

<div align="center">

### 🌿 TruePath

**Find Your Direction Through the Word**

© 2026 TruePath. All rights reserved.

</div>