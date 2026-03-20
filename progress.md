# Progress — Paper Recommender

## 현황 요약

| Phase | 상태 | 설명 |
|-------|------|------|
| Phase 1 — 기본 뼈대 | ✅ 완료 | 프로젝트 세팅, API 클라이언트, DB 스키마, UI, 빌드 성공 |
| Phase 2 — AI 기능 | ⏳ 대기 | Claude 요약, 논문 카드 UI |
| Phase 3 — 추천+검색 | ⏳ 대기 | 유사 논문, 검색, 필터 |
| Phase 4 — 인증+자동화 | ⏳ 대기 | Supabase Auth, Vercel Cron |

---

## Phase 1 — 기본 뼈대

- [x] Next.js 14 프로젝트 생성 (TypeScript, Tailwind, App Router)
- [x] 패키지 설치 (@anthropic-ai/sdk, @supabase/supabase-js, xml2js)
- [x] CLAUDE.md 작성
- [x] progress.md 작성
- [x] .env.local 템플릿 생성
- [x] LDSM 디자인 토큰 CSS 설정
- [x] Tailwind 커스텀 컬러 설정
- [x] 타입 정의 (`src/types/paper.ts`)
- [x] 분야 매핑 정의 (`src/lib/fields.ts`)
- [x] Supabase 클라이언트 (`src/lib/supabase.ts`)
- [x] arXiv API 클라이언트 (`src/lib/arxiv.ts`)
- [x] Semantic Scholar API 클라이언트 (`src/lib/semantic-scholar.ts`)
- [x] Claude API 클라이언트 (`src/lib/claude.ts`)
- [x] Supabase 스키마 (`supabase/schema.sql`)
- [x] FieldSidebar 컴포넌트
- [x] SearchBar 컴포넌트
- [x] PaperCard 컴포넌트
- [x] 메인 피드 페이지 (`app/page.tsx`)
- [x] 논문 상세 페이지 (`app/paper/[id]/page.tsx`)
- [x] API Routes (papers, papers/[id], cron)

---

## Phase 2 — AI 기능

- [ ] Supabase 프로젝트 연결 (환경 변수 설정)
- [ ] Claude API 키 설정
- [ ] 실제 논문 데이터 수집 테스트
- [ ] 논문 요약 생성 테스트

---

## Phase 3 — 추천+검색

- [ ] 유사 논문 추천 (Semantic Scholar)
- [ ] 키워드 검색 기능
- [ ] 분야별 필터링 정교화

---

## Phase 4 — 인증+자동화

- [ ] Vercel 배포
- [ ] Vercel Cron 설정 (매일 새 논문 수집)
- [ ] Supabase Auth 연동 (즐겨찾기, 읽음 표시)

---

## 메모 / 결정 사항

- 심리학 분야는 arXiv에 전용 카테고리가 없어 Semantic Scholar API 메인으로 수집
- Claude 요약은 DB에 캐싱하여 API 비용 절감
- 환경 변수 설정 전까지 mock 데이터로 UI 개발 가능
