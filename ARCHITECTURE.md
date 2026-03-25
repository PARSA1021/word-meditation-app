# 🧭 TruePath (Word Meditation App) 아키텍처

이 문서는 **TruePath**의 기술적인 구조와 설계를 설명합니다.

## 1. 프로젝트 개요

TruePath는 사용자가 매일 말씀을 묵상하고 관련 퀴즈를 풀며 신앙을 키워나갈 수 있도록 돕는 웹 애플리케이션입니다.

## 2. 기술 스택

- **프레임워크**: [Next.js](https://nextjs.org/) 16.1.6
- **UI 라이브러리**: [React](https://reactjs.org/) 19.2.3
- **스타일링**: [Tailwind CSS](https://tailwindcss.com/)
- **언어**: [TypeScript](https://www.typescriptlang.org/)
- **패키지 매니저**: npm

## 3. 프로젝트 구조

```
/
├── app/                  # Next.js App Router (라우팅 및 UI)
│   ├── admin/
│   ├── api/addWord/
│   ├── category/
│   ├── home/
│   ├── quiz/
│   ├── search/
│   ├── today/
│   ├── layout.tsx        # 공통 레이아웃
│   └── page.tsx          # 메인 페이지
├── components/           # 재사용 가능한 React 컴포넌트
├── data/                 # 정적 데이터 (JSON 파일)
├── lib/                  # 데이터 처리 및 비즈니스 로직
├── public/               # 정적 에셋 (이미지, 폰트 등)
├── scripts/              # 데이터 변환 등 유틸리티 스크립트
├── next.config.ts        # Next.js 설정
├── package.json          # 프로젝트 의존성 및 스크립트
└── tsconfig.json         # TypeScript 설정
```

### 3.1. `app` 디렉토리 (App Router)

Next.js 13 버전부터 도입된 App Router를 사용하여 라우팅과 페이지 UI를 관리합니다. 각 폴더는 URL 경로에 해당하며, `page.tsx` 파일이 해당 경로의 UI를, `layout.tsx` 파일이 공통 레이아웃을 정의합니다.

- **주요 라우트:**
    - `/`: 메인 페이지
    - `/admin`: 관리자 페이지
    - `/category`: 카테고리별 말씀 보기
    - `/quiz`: 퀴즈 풀기
    - `/search`: 말씀 검색
    - `/today`: 오늘의 말씀

### 3.2. `components` 디렉토리

애플리케이션 전반에서 재사용되는 React 컴포넌트들이 위치합니다.

- `BottomNav.tsx`: 하단 네비게이션 바
- `DailyWord.tsx`: 오늘의 말씀 카드
- `NotificationSetup.tsx`: 알림 설정 컴포넌트
- `QuoteCard.tsx`: 말씀 인용 카드

### 3.3. `data` 디렉토리

말씀, 퀴즈 등 애플리케이션에서 사용하는 정적 데이터가 JSON 형태로 저장되어 있습니다.

- `words.json`: 전체 말씀 데이터
- `bibleQuiz.json`, `divineQuiz.json`: 퀴즈 데이터

### 3.4. `lib` 디렉토리

데이터를 가공하거나 비즈니스 로직을 처리하는 함수들이 위치합니다.

- `words.ts`: `words.json` 데이터를 읽고 가공하는 함수 (예: `getWordStats`)
- `quiz.ts`: 퀴즈 관련 로직

## 4. 데이터 흐름

1.  **데이터 소스**: `data` 디렉토리의 JSON 파일들 (`words.json`, `*Quiz.json`)
2.  **데이터 처리**: `lib` 디렉토리의 함수들이 JSON 데이터를 읽고, 필터링, 정렬 등 필요한 형태로 가공합니다.
3.  **컴포넌트 렌더링**: React 컴포넌트(`app/**/*.tsx`, `components/**/*.tsx`)는 `lib`에서 가공된 데이터를 받아와 사용자에게 보여줍니다.
4.  **API 라우트**: `/api/addWord` 와 같은 API 라우트를 통해 클라이언트 측에서 서버에 데이터를 요청하거나 전송할 수 있습니다. (현재 구현은 단어 추가 기능으로 보입니다.)

## 5. 주요 기능 및 설계

### 5.1. 말씀 묵상

- **오늘의 말씀**: 메인 페이지(`app/page.tsx`)에서 `DailyWord` 컴포넌트를 통해 매일 다른 말씀을 보여줍니다.
- **카테고리별 보기**: `/category` 페이지에서 주제별로 말씀을 모아볼 수 있습니다.
- **말씀 검색**: `/search` 페이지에서 키워드를 통해 원하는 말씀을 검색할 수 있습니다.

### 5.2. 퀴즈

- `/quiz` 페이지에서 성경 또는 교리에 대한 퀴즈를 풀 수 있습니다.
- 퀴즈 데이터는 `data` 디렉토리의 JSON 파일을 사용하며, `lib/quiz.ts`에서 관련 로직을 처리합니다.

### 5.3. 하단 네비게이션

- `BottomNav` 컴포넌트는 `app/layout.tsx`에 포함되어 모든 페이지 하단에 고정된 네비게이션 메뉴를 제공합니다. 이를 통해 사용자는 주요 페이지(홈, 오늘의 말씀, 퀴즈 등)로 쉽게 이동할 수 있습니다.

## 6. 향후 개선 방향

- **데이터베이스 연동**: 현재 정적 JSON 파일을 데이터 소스로 사용하고 있으나, 사용자가 직접 말씀을 추가하거나 관리자 기능이 고도화될 경우 데이터베이스(예: PostgreSQL, MongoDB) 연동을 고려할 수 있습니다.
- **사용자 인증**: 사용자별 묵상 기록, 퀴즈 점수 등을 관리하기 위해 사용자 인증 시스템(예: NextAuth.js) 도입이 필요합니다.
- **상태 관리**: 애플리케이션이 복잡해짐에 따라 클라이언트 상태 관리를 위한 라이브러리(예: Zustand, Recoil) 도입을 고려할 수 있습니다.
- **테스팅**: 컴포넌트 및 비즈니스 로직의 안정성을 높이기 위해 Jest, React Testing Library 등을 사용한 테스트 코드 작성이 필요합니다.
