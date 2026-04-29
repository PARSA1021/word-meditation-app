# 🧭 TruePath: Premium Word Meditation App

**TruePath**는 사용자가 매일 성경 말씀과 원리 말씀을 통해 삶의 방향을 찾고, 영적 성장을 이룰 수 있도록 돕는 프리미엄 웹 애플리케이션입니다. 고도화된 검색 엔진과 인터랙티브한 퀴즈, 그리고 감각적인 UI/UX를 통해 깊이 있는 묵상 경험을 제공합니다.

---

## ✨ 핵심 기능 (Key Features)

### 1. 🌅 오늘의 말씀 & 묵상 (Daily Inspiration)
- **매일 새로운 말씀**: 매일 엄선된 말씀 카드를 통해 하루를 시작할 수 있습니다.
- **몰입형 묵상 모드**: 특정 구절에 집중하여 깊이 있게 사색할 수 있는 전용 뷰를 제공합니다.

### 2. 🔭 지능형 말씀 검색 (Advanced Search Engine)
- **강력한 검색 알고리즘**: 초성 검색(ㄱㄴㄷ), 형태소 기반 검색(Stemming), 유의어 검색을 지원합니다.
- **정확한 구문 검색**: 큰따옴표(`""`)를 이용한 정확한 문장 매칭 기능을 제공합니다.
- **스마트 중복 제거**: 수만 개의 데이터 중 유사하거나 중복된 내용을 지능적으로 필터링하여 최적의 결과를 보여줍니다.
- **실시간 하이라이팅**: 검색어와 일치하는 부분을 시각적으로 강조하여 가독성을 높였습니다.

### 3. 📁 방대한 주제별 라이브러리 (Curated Library)
- **다양한 소스 지원**: 성경, 천성경(한/영), 원리강론, 평화신경, 천일국 뜻길 등 방대한 텍스트를 포함합니다.
- **테마별 분류**: 사랑, 믿음, 소망, 지혜 등 사용자의 상황과 감정에 맞는 주제별 탐색이 가능합니다.

### 4. ✨ 인터랙티브 말씀 퀴즈 (Interactive Quiz)
- **학습 모드**: 성경 퀴즈와 원리강론 퀴즈 두 가지 모드를 제공합니다.
- **게이미피케이션**: 빈칸 채우기 형식의 인터랙티브한 UI와 즉각적인 정답 확인, 상세 해설을 통해 말씀을 즐겁게 암기할 수 있습니다.

### 5. 🤍 후원 및 운영 (Donation System)
- **Toss Payments 연동**: 서비스의 안정적인 운영을 위한 간편 후원 기능을 제공합니다.
- **기부 내역 관리**: 후원자들의 소중한 마음을 관리하고 기록합니다.

### 6. 📊 관리자 대시보드 및 분석 (Admin & Analytics)
- **통계 가시화**: 전체 말씀 수, 카테고리별 분포 등 플랫폼 데이터를 한눈에 확인합니다.
- **사용자 행동 분석**: 익명화된 활동 데이터를 수집하여 서비스 개선에 활용합니다.
- **실시간 알림**: 주요 이벤트 발생 시 Slack Webhook을 통해 관리자에게 즉각적인 알림을 전송합니다.

---

## 🎨 디자인 철학 (Design Aesthetics)

- **Calm & Premium**: 마음의 평화를 주는 차분한 컬러 팔레트와 세련된 타이포그래피를 사용합니다.
- **Fluid Motion**: Framer Motion을 활용한 부드러운 전환 효과로 프리미엄한 사용자 경험을 제공합니다.
- **Responsive Layout**: 모바일, 태블릿, 데스크톱 등 모든 환경에서 최적화된 인터페이스를 유지합니다.

---

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **State Management**: SWR (Data Fetching)

### Backend & Infrastructure
- **Database**: PostgreSQL (Hosted on Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Payment**: Toss Payments SDK
- **Communication**: Slack Webhook Integration
- **Storage**: Supabase

---

## 📂 프로젝트 구조 (Project Structure)

```text
/
├── app/                  # Next.js App Router (페이지 및 API)
│   ├── admin/            # 관리자 전용 대시보드
│   ├── api/              # 백엔드 API (검색, 분석, 결제, 인증)
│   ├── category/         # 주제별 말씀 탐색
│   ├── donate/           # 후원 페이지
│   ├── library/          # 전체 말씀 라이브러리
│   ├── quiz/             # 인터랙티브 말씀 퀴즈
│   ├── search/           # 고도화된 말씀 검색
│   ├── today/            # 오늘의 묵상 상세
│   └── words/            # 말씀 상세 및 목록
├── components/           # 재사용 가능한 UI 컴포넌트 (Atomic Design)
├── context/              # 전역 상태 관리를 위한 React Context
├── data/                 # 정적 데이터 소스 (JSON)
├── hooks/                # 커스텀 React Hooks
├── lib/                  # 핵심 비즈니스 로직 및 서버 유틸리티
├── public/               # 정적 자원 (이미지, 폰트, 아이콘)
└── prisma/               # DB 스키마 및 마이그레이션 관리
```

---

## 🚀 시작하기 (Getting Started)

1. **의존성 설치**:
   ```bash
   npm install
   ```

2. **환경 변수 설정**:
   `.env.example` 파일을 참고하여 `.env` 파일을 생성하고 필요한 API 키와 DB URL을 입력합니다.

3. **개발 서버 실행**:
   ```bash
   npm run dev
   ```

---

## 📄 라이선스 (License)

이 프로젝트는 개인 프로젝트로, 무단 복제 및 배포를 금합니다.
