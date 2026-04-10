# 🧭 TruePath (Word Meditation App)

**TruePath**는 사용자가 매일 성경 말씀과 원리 말씀을 묵상하고, 퀴즈를 통해 지혜를 쌓으며 신앙 생활을 풍성하게 할 수 있도록 돕는 프리미엄 웹 애플리케이션입니다.

---

## ✨ 주요 기능

- **오늘의 말씀**: 매일 새로운 말씀 카드와 함께 하루를 시작합니다.
- **주제별 탐색**: 사랑, 믿음, 소망 등 다양한 주제별로 말씀을 찾아볼 수 있습니다.
- **말씀 퀴즈**: 퀴즈를 통해 말씀을 더 깊이 암기하고 이해합니다.
- **통합 검색**: 원하는 구절이나 키워드를 즉시 찾아주는 강력한 검색 기능을 제공합니다.
- **후원하기**: Toss Payments 연동을 통한 서비스 운영 후원 기능을 제공합니다.

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **State Management**: SWR (Data Fetching)

### Backend & Infrastructure
- **Database**: PostgreSQL (Hosted on Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **Storage**: Supabase
- **Notifications**: Slack Webhook Integration

---

## 📂 프로젝트 구조

```text
/
├── app/                  # Next.js App Router (페이지 및 API)
│   ├── admin/            # 관리자 전용 대시보드
│   ├── api/              # 백엔드 API 엔드포인트
│   ├── category/         # 주제별 말씀 보기
│   ├── donate/           # 후원 페이지
│   ├── quiz/             # 말씀 퀴즈 게임
│   ├── search/           # 말씀 검색 기능
│   ├── today/            # 오늘의 말씀 상세
│   └── words/            # 말씀 상세 및 목록
├── components/           # 재사용 가능한 UI 컴포넌트
│   ├── common/           # 공통 UI 요소
│   ├── home/             # 홈 화면 전용 컴포넌트
│   └── search/           # 검색 관련 컴포넌트
├── data/                 # 정적 데이터 소스 (JSON)
├── lib/                  # 비즈니스 로직 및 유틸리티
├── public/               # 정적 자원 (이미지, 폰트, 매니페스트)
└── prisma/               # 데이터베이스 스키마 및 마이그레이션 (예정)
```

---

## 🚀 시작하기

### 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 입력합니다:
```bash
cp .env.example .env
```

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 📄 라이선스
이 프로젝트는 개인 프로젝트로, 무단 배포를 금합니다.
