# Project Rules & Context: Housing Hub (public-housing-guide)

이 프로젝트는 LH, SH, 민간임대 등 도처에 흩어진 복잡한 임대주택 공고 정보를 한눈에 분류, 분석 및 비교하기 위한 Next.js 웹 애플리케이션입니다.
새로운 AI 에이전트 또는 개발자가 이 세션에 참여하면 본 규칙과 개발 컨텍스트를 읽고 즉시 일관성 있는 개발을 이어가야 합니다.

---

## 🛠️ Tech Stack & Conventions

* **Core Framework**: Next.js 16.2.10 (App Router), React 19, TypeScript
* **Styling**: **Vanilla CSS & CSS Modules**를 지향합니다. (Tailwind CSS 설정이 설치되어 있으나, UI의 커스터마이징 유연성과 프리미엄 스타일 유지를 위해 `globals.css` 및 개별 CSS 변수를 적극 활용합니다.)
* **Next.js async APIs**:
  - `page.tsx` 및 레이아웃 등에서 `params`와 `searchParams`는 **Promise** 타입이므로 반드시 `await` 하거나 React의 `use()` 훅을 사용해 해제(unwrap)한 후 사용해야 합니다.
  - 예시: `const { slug } = await params;` 또는 `const filters = use(searchParams);`

---

## 📂 Project Structure & Key Files

* [`src/types/index.ts`](file:///d:/home/src/types/index.ts): 공고(`Announcement`) 및 주택형(`HouseType`) 데이터 구조 정의.
* [`src/data/mockData.ts`](file:///d:/home/src/data/mockData.ts): LH, SH, 민간임대를 포괄하는 샘플 데이터셋.
* [`src/app/globals.css`](file:///d:/home/src/app/globals.css): 라이트/다크 테마 토큰 및 애플리케이션 전체 구조 스타일링.
* [`src/components/ThemeToggle.tsx`](file:///d:/home/src/components/ThemeToggle.tsx): 다크/라이트 모드 스위칭 클라이언트 컴포넌트 (`localStorage` 기반).
* [`src/components/KakaoMap.tsx`](file:///d:/home/src/components/KakaoMap.tsx): 카카오맵 SDK 연동 컴포넌트. (API 키 부재/오류 시 한강 및 마커 비율 좌표를 활용한 자체 가상 맵 Fallback 렌더링).
* [`src/components/Dashboard.tsx`](file:///d:/home/src/components/Dashboard.tsx): 대시보드 리스트 및 조건 필터(공급처, 보증금/월세 슬라이더, 정렬 등).
* [`src/components/DetailView.tsx`](file:///d:/home/src/components/DetailView.tsx): 상세 내역 테이블 및 보증금 상호전환 모의 계산기.
* [`src/components/ComparePanel.tsx`](file:///d:/home/src/components/ComparePanel.tsx): 장바구니형 주택형 비교 바 및 평당가(보증금/월세), 2년 거주 총지출 비교표 모달.
* [`src/app/page.tsx`](file:///d:/home/src/app/page.tsx): 전체 레이아웃 조립 및 React 상태 관리.

---

## 🔑 Environment Variables & API Settings

* **Kakao Maps API Key**: Vercel 및 로컬 `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_CLIENT_KEY` 변수로 등록합니다.
* **중요 설정 (카카오 디벨로퍼스)**:
  1. **플랫폼 등록**: `http://localhost:3000` 및 배포 도메인(`https://public-housing-guide.vercel.app`)을 JavaScript SDK 도메인에 반드시 추가해야 합니다.
  2. **지도 활성화**: **[제품 설정] > [카카오맵]**에서 상태를 **ON**으로 활성화해야 SDK 로딩 에러(403)를 피할 수 있습니다.

---

## 🚀 Next Roadmap (다음 개발 목표)

추후 개발을 이어나갈 때 우선적으로 다뤄야 할 기능 리스트입니다:

1. **실시간 Open API 연동 (공공데이터포털)**
   - 공공데이터포털(data.go.kr)에서 `한국토지주택공사_분양임대공고문 조회 서비스` 및 `분양임대공고별 공급정보 조회 서비스` 신청.
   - Next.js Route Handlers(API 라우트)를 작성하여 서버사이드에서 API 인증키로 공고를 주기적으로 페치(fetch)해오는 프록시 서버 구축.
2. **자동 HWP/PDF 분석 엔진 파이프라인**
   - LH/SH 공고에서 제공하는 깨진 한글 파일(HWP) 및 PDF 테이블 문서를 Gemini API(OCR 및 테이블 정형화 기능)를 사용해 JSON 데이터 모델(`HouseType[]`)로 실시간 파싱 및 정제하는 백엔드 서버 기능 추가.
3. **사용자 알림 및 마이페이지**
   - 본인이 희망하는 지역/보증금/평형대의 공고가 올라왔을 때 카카오톡 알림톡 혹은 이메일로 알림을 보내주는 구독형 알림 서비스 연동.
   - 찜한 공고 리스트를 관리할 수 있는 가벼운 Firebase 혹은 Supabase 데이터베이스 및 사용자 로그인 연동.

---

## 🚀 GitHub Commit & Workflow Rules

1. **Commit Message Convention**:
   - Use standardized prefixes for commit messages:
     - `feat:` for new features or data layers.
     - `fix:` for bug fixes or filtering corrections.
     - `refactor:` for code restructurings or layout cleanups.
     - `docs:` for markdown updates.
     - `style:` for CSS adjustments.
   - Example: `feat: Implement flat unit search, cascading regions, price/pyeong filters, and direct apply links`

2. **Pre-Commit Verification**:
   - Always run local compile checks (`npm run build` or similar validation task) before committing. Never commit code that breaks TypeScript types or production bundles.

3. **Remote Synchronization**:
   - Once a set of tasks is successfully verified and committed locally, push the changes to the remote repository (`origin/main`) to maintain team synchronization.

## 📝 Documentation & UI Formatting Constraints

1. **Strictly Prohibit Redundant Expressions (Same Meaning Repetitions)**:
   - Never write redundant terms representing the exact same meaning side-by-side (e.g., avoid "시작하기 (Getting Started)", "전설의 레전드", "역전의 역전"). Use one clean representation (preferably English for technical titles, such as simply "Getting Started" or "Setup").
   
2. **Minimize Emojis & Childish Embellishments**:
   - Do not use colorful or excessive emojis (e.g., 🚀, 🟢, 💡, 📍, 📋) in the UI code, documentation, or response messages. Maintain a professional, clean, and premium typography-oriented look.
