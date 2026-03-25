# 🧭 TruePath: Word Meditation App

> **"매일 말씀으로 방향을 찾고, 삶을 단단하게 만드는 공간"**

TruePath는 바쁜 현대인들이 매일 신앙의 중심을 잡을 수 있도록 돕는 말씀 묵상 및 학습 플랫폼입니다. 세련된 UI와 풍부한 인터랙티브 요소를 통해 깊이 있는 묵상 경험을 제공합니다.

---

## ✨ 핵심 기능 (Key Features)

- **🌅 오늘의 말씀 (Daily Word)**: 매일 새롭게 추천되는 말씀을 통해 하루를 시작하세요. 아름다운 카드 디자인으로 묵상의 몰입감을 더합니다.
- **🔍 강력한 말씀 검색 (Powerful Search)**: 키워드나 출처(성경, 천성경 등)를 통해 원하는 말씀을 즉시 찾아볼 수 있습니다.
- **📚 주제별 라이브러리 (Categorized Library)**: 삶의 다양한 상황(위로, 도전, 사랑 등)에 맞는 말씀을 카테고리별로 탐색하세요.
- **🧠 인터랙티브 퀴즈 (Interactive Learning)**: 성경 및 교리 지식을 게임처럼 재미있게 익힐 수 있는 퀴즈 시스템을 제공합니다.
- **📱 PWA 기반 모바일 최적화 (Mobile First)**: 언제 어디서나 앱처럼 간편하게 접속하고 푸시 알림 설정을 통해 묵상 습관을 길러보세요.

---

## 🛠 기술 스택 (Tech Stack)

본 프로젝트는 최신 웹 기술을 사용하여 빠르고 안정적인 사용자 경험을 제공합니다.

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router 기반)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (최신 시각적 유연성)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database/ORM**: Prisma & PostgreSQL (Neon) - *연동 중*
- **Authentication**: NextAuth.js - *설정 중*
- **AI Integration**: OpenAI (향후 묵상 가이드 생성 예정)

---

## 🚀 시작하기 (Getting Started)

### 1. 환경 설정
`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 API 키와 DB URL을 설정하세요.

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 📂 프로젝트 구조 (Project Structure)

```text
/
├── app/                  # Next.js App Router (페이지 및 API)
├── components/           # 재사용 가능한 UI 컴포넌트
├── data/                 # 말씀 및 퀴즈 정적 데이터 (JSON)
├── lib/                  # 비즈니스 로직 및 데이터 처리 함수
├── public/               # 정적 에셋 (이미지, 아이콘 등)
└── scripts/              # 데이터 변환 및 전처리 스크립트
```

---

## 📝 데이터 관리 (Data Management)

프로젝트 루트의 `scripts/` 디렉토리에는 원본 데이터를 형식에 맞춰 변환하는 유틸리티가 포함되어 있습니다.
- `convert.js`: `raw.json` 말씀을 `words.json` 형식으로 변환
- `convert_all_quiz.js`: 퀴즈 데이터를 정규화된 JSON으로 변환

---

## 🚧 향후 로드맵 (Roadmap)

- [ ] **AI 묵상 가이드**: OpenAI를 연동하여 말씀에 대한 깊이 있는 해설 자동 생성
- [ ] **소셜 공유**: 오늘의 말씀을 이미지 카드로 만들어 SNS에 공유하는 기능
- [ ] **커뮤니티**: 사용자 간의 묵상 소감을 나눌 수 있는 게시판 도입
- [ ] **다국어 지원**: 영어, 일본어 등 글로벌 서비스 확장

---

© 2026 TruePath Team. All rights reserved.
