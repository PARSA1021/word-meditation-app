# 🧭 TruePath 아키텍처 가이드

이 문서는 **TruePath**의 기술적 설계와 데이터 흐름, 핵심 시스템 구조를 설명합니다.

---

## 1. 개요
TruePath는 정적 데이터 탐색에 최적화된 **말씀 묵상 플랫폼**입니다.
복잡한 데이터베이스 설정 없이도 빠르고 효율적으로 동작하도록 설계되었습니다.

## 2. 기술 스택 핵심 역학
- **프레임워크**: Next.js 16 (App Router)를 통한 서버 사이드 렌더링(SSR) 및 정적 사이트 생성(SSG) 최적화.
- **데이터 레이어**: `data/*.json` 파일을 기반으로 한 정적 데이터 로딩. 빠른 읽기와 검색 속도 보장.
- **스타일링**: Tailwind CSS v4, Framer Motion을 활용한 부드럽고 직관적인 UI/UX.

## 3. 핵심 시스템 구조

### 3.1. 데이터 소스 전략 (Static JSON 기반)
- **Static Content**: 애플리케이션의 모든 말씀 데이터, 카테고리 정보는 `data/*.json` 파일을 통해 핵심 기능에 고성능으로 로드됩니다.
- **Mock Services**: 현재 후원(`donate`)과 같은 동적 기능은 Mock API 상태로 구현되어 있으며, 향후 DB 연동이 쉽도록 `features` 패턴을 사용해 로직이 격리되어 있습니다.

### 3.2. API 계층 구조
- `/api/words`: 말씀 검색 및 단일/목록 데이터 제공.
- `/api/donate/manual`: 후원 폼 처리를 위한 Mock API (zod 검증 포함).

## 4. 데이터 흐름
1. **Client Request**: 사용자가 페이지에 접속하거나 검색을 수행합니다.
2. **Server Logic**: `features/` 또는 `lib/` 내의 서비스 함수들이 JSON 파일에서 필요한 데이터를 추출하고 필터링합니다.
3. **UI Rendering**: React 19 컴포넌트가 최적화된 데이터를 받아 애니메이션과 함께 렌더링합니다.

## 5. 아키텍처 설계 패턴
- **Feature-Sliced Design (FSD) 영감**: `features/` 디렉토리에 도메인별(donation, meditation, quiz, search) 응집도 높은 로직과 서비스를 배치했습니다.
- **Shared & Context**: 전역에서 재사용되는 UI, Context, 유틸리티 함수들은 `shared/` 및 `context/` 에 위치합니다.

---

## 6. 향후 과제 (DB & Auth 확장성)
현재 애플리케이션은 서버리스 정적 애플리케이션에 가깝지만, 추후 사용자 맞춤형 묵상 기록 및 실제 결제 연동을 위해 다음과 같은 아키텍처로 확장될 수 있도록 설계되었습니다.
- **Prisma & DB (PostgreSQL/Neon)**: `saveDonation` 같은 Mock 함수 내부에 Prisma 로직을 쉽게 주입할 수 있도록 서비스 레이어를 분리.
- **NextAuth.js**: 사용자 세션 관리를 위한 인증 계층 도입.
