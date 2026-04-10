# 🧭 TruePath 아키텍처 가이드

이 문서는 **TruePath**의 기술적 설계와 데이터 흐름, 핵심 시스템 구조를 설명합니다.

---

## 1. 개요
TruePath는 정적 데이터 탐색 환경에서 완전한 데이터베이스 연동 환경으로 진화한 **Full-stack 말씀 묵상 플랫폼**입니다.

## 2. 기술 스택 핵심 역학
- **프레임워크**: Next.js 16 (App Router)를 통한 서버 사이드 렌더링(SSR) 및 정적 사이트 생성(SSG) 최적화.
- **데이터 레이어**: Neon(PostgreSQL) 기반 DB와 Prisma ORM을 사용하여 데이터의 영속성 보장.
- **인증 시스템**: NextAuth.js를 통한 안전한 사용자 관리.
- **실시간 통계**: Supabase 및 커스텀 API를 통한 사용자 활동 분석.

## 3. 핵심 시스템 구조

### 3.1. 데이터 소스 전략 (Hybrid)
- **Static Content**: `data/*.json` 파일을 통해 핵심 말씀 데이터를 고성능으로 로드합니다.
- **Dynamic Content**: 사용자별 묵상 기록, 통계, 후원 정보는 PostgreSQL DB에서 관리합니다.

### 3.2. API 계층 구조
- `/api/words`: 말씀 검색 및 목록 제공.
- `/api/analytics`: 사용자 행동 데이터 수집.
- `/api/payment`: Toss Payments 연동 결제 처리.

## 4. 데이터 흐름
1. **Client Request**: 사용자가 페이지에 접속하거나 검색을 수행합니다.
2. **Server Logic**: `lib/` 내의 서비스 함수들이 JSON 파일 또는 DB에서 필요한 데이터를 추출합니다.
3. **UI Rendering**: React 19 컴포넌트가 최적화된 데이터를 받아 Framer Motion 애니메이션과 함께 렌더링합니다.

## 5. 보안 및 최적화
- **Server Actions**: 민감한 작업은 서버에서 직접 처리하여 클라이언트 노출을 방지합니다.
- **Edge Runtime**: 일부 API는 응답성 향상을 위해 Edge Runtime 활용을 고려합니다.
- **SEO**: 전용 메타데이터 설정을 통해 검색 엔진 최적화를 기본 적용합니다.

---

## 6. 향후 과제
- **PWA 기술 고도화**: 오프라인 모드 지원 강화.
- **AI 큐레이션**: OpenAI API를 통한 사용자 맞춤형 말씀 추천 엔진 고도화.
