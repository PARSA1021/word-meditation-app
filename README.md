# 🌿 TruePath — Official Website

> **매일 성경 말씀과 원리 말씀을 통해 삶의 방향을 찾고 영적 성장을 돕는 프리미엄 웹 애플리케이션**

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38BDF8?logo=tailwindcss&logoColor=white)

</div>

---

# 📚 Table of Contents

- [✨ 프로젝트 소개](#-프로젝트-소개)
- [🎯 핵심 사용자 흐름](#-핵심-사용자-흐름)
- [🚀 주요 기능](#-주요-기능)
- [🛠 기술 스택](#-기술-스택)
- [📁 프로젝트 구조](#-프로젝트-구조)
- [⚡ 시작하기](#-시작하기)
- [🌐 주요 페이지](#-주요-페이지)
- [🗄 데이터베이스 및 인프라](#-데이터베이스-및-인프라)
- [📄 유지보수 가이드](#-유지보수-가이드)
- [🎨 UI/UX 및 애니메이션](#-uiux-및-애니메이션)
- [🔐 환경 변수 예시](#-환경-변수-예시)
- [📌 운영 참고 사항](#-운영-참고-사항)

---

# ✨ 프로젝트 소개

**TruePath**는 말씀 중심의 깊이 있는 묵상 경험을 제공하기 위해 제작된  
차세대 프리미엄 말씀 묵상 플랫폼입니다.

단순히 말씀을 읽는 것을 넘어,

- 🌅 오늘의 말씀을 통해 하루를 시작하고
- 🔍 지능형 검색으로 필요한 말씀을 빠르게 탐색하며
- 🧠 인터랙티브 퀴즈를 통해 말씀을 자연스럽게 암기하고
- 🤍 후원 시스템을 통해 플랫폼 운영을 지원할 수 있도록 설계되었습니다.

---

# 🎯 핵심 사용자 흐름

```text
랜딩 페이지 (/)
   ↓
오늘의 말씀 & 묵상 경험
   ↓
고도화된 말씀 탐색 (/search, /category)
   ↓
인터랙티브 퀴즈 학습 (/quiz)
   ↓
후원 및 플랫폼 참여 (/donate)
```

---

# 🚀 주요 기능

## 🌅 Daily Inspiration — 오늘의 말씀 & 묵상

- 매일 엄선된 말씀 카드 제공
- 집중형 몰입 묵상 모드 지원
- 감성적인 타이포그래피 및 차분한 컬러 시스템
- 하루의 방향성과 영적 안정감을 제공하는 UI 설계

---

## 🔍 Advanced Search Engine — 지능형 말씀 검색

### 지원 기능

- 초성 검색 (`ㄱㄴㄷ`)
- 형태소 기반 검색 (Stemming)
- 유의어 탐색
- 정확 구문 검색 (`"..."`)
- 실시간 하이라이팅
- 중복 결과 지능형 필터링

### 목표

수만 개의 말씀 데이터 속에서도  
사용자가 원하는 구절을 빠르고 직관적으로 찾을 수 있도록 설계되었습니다.

---

## 📚 Curated Library — 주제별 말씀 라이브러리

다양한 말씀 자료를 테마별로 체계적으로 분류하여 제공합니다.

### 지원 콘텐츠

- 성경
- 천성경 (한/영)
- 원리강론
- 평화신경
- 기타 말씀 자료

### 주요 카테고리

- 사랑
- 믿음
- 희망
- 평화
- 감사
- 관계
- 성장

---

## 🧠 Interactive Quiz — 인터랙티브 말씀 퀴즈

게이미피케이션 요소가 적용된 학습 시스템입니다.

### 주요 특징

- 빈칸 채우기 퀴즈
- 즉각적인 정답 피드백
- 상세 해설 제공
- 학습 모드 지원
- 말씀 암기 강화

---

## 🤍 Donation & Admin — 후원 및 관리자 시스템

### 후원 시스템

- Toss Payments 연동
- 간편 결제 지원
- 후원 내역 관리

### 관리자 기능

- 운영 통계 시각화
- Slack Webhook 실시간 알림
- 콘텐츠 및 사용자 관리
- 플랫폼 운영 대시보드

---

# 🛠 기술 스택

| 분야 | 기술 |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Data Fetching | SWR |
| Data Source | Local JSON Files |
| Validation | Zod |
| Deployment | Vercel |

---

# 📁 프로젝트 구조

```bash
word-meditation-app/
│
├── public/                     # 이미지, 폰트, 아이콘 등 정적 자원
│
├── src/
│   ├── app/                    # Next.js App Router
│   │
│   ├── admin/                  # 관리자 대시보드
│   ├── api/                    # API Routes
│   ├── category/               # 카테고리별 말씀 탐색
│   ├── donate/                 # 후원 페이지
│   ├── library/                # 전체 라이브러리
│   ├── quiz/                   # 말씀 퀴즈
│   ├── search/                 # 말씀 검색 엔진
│   ├── today/                  # 오늘의 묵상
│   └── words/                  # 말씀 상세 페이지
│
├── components/                 # 공통 UI 컴포넌트
├── context/                    # 글로벌 Context 관리
├── hooks/                      # Custom Hooks
├── lib/                        # 유틸리티 및 설정
├── styles/                     # 글로벌 스타일
└── types/                      # TypeScript 타입 정의
```

---

# ⚡ 시작하기

## 1️⃣ 저장소 클론

```bash
git clone https://github.com/your-repo/truepath.git
cd truepath
```

---

## 2️⃣ 패키지 설치

```bash
npm install
```

---

## 3️⃣ 환경 변수 설정

`.env.example` 파일을 참고하여 `.env.local` 파일 생성

```bash
cp .env.example .env.local
```

---

## 4️⃣ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소 접속:

```text
http://localhost:3000
```

---

# 🚀 프로덕션 빌드

## Build

```bash
npm run build
```

## Start

```bash
npm run start
```

운영 환경에서는:

- Hybrid Rendering
- Route Optimization
- Server Components
- Edge Runtime 최적화

등이 적용됩니다.

---

# 🌐 주요 페이지

| Route | Description |
|---|---|
| `/` | 랜딩 페이지 및 오늘의 말씀 |
| `/search` | 지능형 말씀 검색 |
| `/library` | 전체 말씀 라이브러리 |
| `/category` | 주제별 카테고리 탐색 |
| `/quiz` | 인터랙티브 말씀 퀴즈 |
| `/donate` | 후원 페이지 |
| `/admin` | 관리자 대시보드 |

---

# 🗄 데이터베이스 및 인프라

## Database

- 현재는 `data/*.json` 파일을 기반으로 데이터를 로드합니다.
- 복잡한 데이터베이스 설정 없이도 클라이언트에서 빠르게 콘텐츠를 탐색할 수 있습니다.

## External Services

- Vercel Deployment

---

# 📄 유지보수 가이드

## 콘텐츠 관리

- 말씀 데이터 추가 및 수정
- JSON 및 DB 데이터 동기화
- 카테고리 메타데이터 관리

---

## 인프라 운영

- Vercel 배포 상태 확인
- Database 백업 및 모니터링
- Slack Webhook 상태 점검

---

## 결제 시스템 유지보수

- Toss Payments 키 갱신
- 정산 주기 확인
- 결제 로그 모니터링

---

# 🎨 UI/UX 및 애니메이션

## Framer Motion 예시

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Meditation Content */}
</motion.div>
```

### 참고 사항

- 지나치게 긴 애니메이션은 UX 저하 가능
- 모바일 성능 최적화 테스트 권장
- 스크롤 기반 애니메이션 충돌 여부 확인 필요

---

# 🔐 환경 변수 예시

`.env.example` 파일을 참고하세요.
현재 버전은 정적 파일 기반으로 작동하여 복잡한 환경 변수가 필요하지 않습니다.

```env
# 향후 확장 시 필요한 환경 변수들 (현재는 필요하지 않음)
# DATABASE_URL=
# NEXTAUTH_SECRET=
```

---

# 📌 운영 참고 사항

## SEO 및 메타데이터

### 수정 위치

```bash
src/app/layout.tsx
```

또는 각 페이지별:

```tsx
export const metadata = {
  title: "...",
  description: "...",
};
```

---

## Open Graph 이미지

```bash
/public/images/
```

### 권장 사이즈

```text
1200 × 630 px
```

---

## 배포 후 권장 작업

- 카카오톡 링크 캐시 갱신
- Facebook Sharing Debugger 갱신
- 검색 엔진 색인 요청

---

# 🧩 향후 확장 예정 기능

- AI 기반 말씀 추천 시스템
- 사용자 맞춤 묵상 기록
- 다국어 지원 강화
- 오프라인 PWA 지원
- 음성 기반 말씀 낭독
- 커뮤니티 및 그룹 묵상 기능

---

# 🤍 Philosophy

> “말씀을 읽는 것을 넘어,  
> 말씀 안에서 길을 찾도록.”

TruePath는 단순한 정보 플랫폼이 아니라  
사용자의 삶 속에서 실제로 방향성과 위로를 제공하는  
영적 동반자가 되는 것을 목표로 합니다.

---

<div align="center">

### 🌿 TruePath

**Find Your Direction Through the Word**

© TruePath. All rights reserved.

</div>