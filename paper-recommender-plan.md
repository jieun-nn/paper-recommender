# 최신 논문 추천 웹사이트 계획

## Context

분야별 최신 논문을 보여주고 Claude AI로 요약·추천해주는 웹사이트를 만든다.
사용자 인증은 추후 추가 예정이므로 초기엔 로그인 없이 누구나 사용 가능한 구조로 설계.

---

## 기술 스택

| 레이어 | 기술 | 이유 |
|--------|------|------|
| 프론트엔드 | **Next.js 14 (App Router)** | SSR/ISR로 논문 목록 빠른 로딩, SEO 유리 |
| 백엔드 | **Next.js API Routes** | 초기엔 풀스택으로 단순화, 추후 FastAPI 분리 가능 |
| 데이터베이스 | **Supabase (PostgreSQL)** | 무료 티어, 추후 인증 기능도 Supabase Auth로 확장 용이 |
| AI 요약/추천 | **Claude API (claude-sonnet-4-6)** | 논문 abstract 한국어 요약 + 관련 논문 추천 |
| 논문 데이터 | **arXiv API + Semantic Scholar API** | arXiv: 최신 프리프린트 / Semantic Scholar: 인용수·유사도 |
| 배포 | **Vercel** | Next.js 최적화, 무료 티어 |
| 스타일링 | **Tailwind CSS + LDSM 토큰** | LINE Design System 가이드를 CSS 변수로 구현 |

---

## 분야 구성 및 데이터 소스 매핑

**전체 논문을 수집**하되, 사이드바에서 분야별로 필터링해서 탐색할 수 있도록 구성.

### arXiv 전체 카테고리 수집 (주 데이터 소스)

| 대분류 | arXiv 카테고리 |
|--------|---------------|
| Computer Science | cs.* (cs.AI, cs.LG, cs.SE, cs.AR, cs.HC 등 전체) |
| Physics | physics.*, cond-mat.*, quant-ph, hep-*, gr-qc 등 |
| Mathematics | math.* |
| Statistics | stat.* |
| Electrical Engineering | eess.* |
| Economics | econ.* |
| Quantitative Biology | q-bio.* |
| Quantitative Finance | q-fin.* |

### Semantic Scholar (보조 소스)
- arXiv에 없는 분야 보완: **심리학**, 의학, 사회과학 등
- 인용수 데이터 및 유사 논문 추천에 활용

### UI 분류 레이블 (사용자가 보는 분야명)
arXiv 카테고리 코드를 사람이 읽기 쉬운 이름으로 매핑:

| 표시 이름 | 매핑 카테고리 |
|-----------|-------------|
| 물리 | physics.*, cond-mat.*, quant-ph |
| 반도체 | cond-mat.mes-hall, cond-mat.mtrl-sci |
| 하드웨어 | cs.AR, cs.ET, eess.* |
| 소프트웨어 | cs.SE, cs.PL, cs.OS |
| AI / 머신러닝 | cs.AI, cs.LG, stat.ML |
| 수학 | math.* |
| 디자인 | cs.HC, cs.GR |
| 심리 | q-bio.NC + Semantic Scholar |
| 기타 | 위 분류에 해당하지 않는 전체 |

---

## LDSM 디자인 시스템 적용 방침

LINE Design System for Messenger (LDSM) Foundation을 웹에서 Tailwind CSS 커스텀 토큰으로 구현.

### 레이아웃
- 기본 좌우 마진 **16pt** (`px-4`)
- 컬럼 그리드: 2/3/4 컬럼 반응형 (`grid-cols-2/3/4`)

### 타이포그래피 (CSS 변수로 정의)
```css
--text-heading1: 24px / Heavy
--text-heading2: 17px / Bold
--text-heading3: 14px / Bold
--text-body1:   16px / Regular
--text-body2:   14px / Regular
--text-body3:   13px / Regular
/* 최소 크기 12px 이하 사용 금지 */
```
- 시스템 폰트 사용: `-apple-system, BlinkMacSystemFont, 'Noto Sans KR', sans-serif`

### 색상 팔레트 (Tailwind 커스텀 컬러)
```js
colors: {
  'line-green':   { DEFAULT: '#06C755' },  // iOS 기준 LINE Green
  'line-blue':    { 400: '...', 500: '...', 600: '...', 700: '...' },
  'line-navy':    { 400: '...', ..., 900: '...' },
  'line-red':     { 400: '...' },
  'line-gray':    { 100: '...', ..., 900: '...' },
}
```
- 접근성: Gray 500 이상 텍스트에 대비비 3.0:1 이상 유지
- 불투명도 조정은 White/Black에만 5% 단위로 허용

### 아이콘
- 기본 그리드 **24×24px**, 패딩 2px, stroke 1.3pt
- 커스텀 아이콘 제작 시 45° 각도 기준

---

## 핵심 기능 (MVP)

### 1. 분야별 논문 피드
- **모든 분야 논문 수집** (arXiv 전체 카테고리 + Semantic Scholar 보완)
- 사이드바에서 분야 필터 선택 (물리, 반도체, 하드웨어, 소프트웨어, AI/ML, 수학, 디자인, 심리, 기타)
- 최신순 / 인용수 정렬

### 2. 논문 카드
- 제목, 저자, 날짜, 분야 태그
- Claude API가 생성한 **3줄 한국어 요약**
- arXiv 원문 링크

### 3. 논문 상세 페이지
- 전체 abstract + Claude 한국어 요약
- "이 논문과 유사한 논문 추천" (Semantic Scholar 유사도 or Claude 분석)
- 논문 내 핵심 키워드 추출

### 4. 검색
- 키워드/저자 검색
- 분야 필터

---

## 데이터 흐름

```
[arXiv API] ──→ [Next.js API Route] ──→ [Claude API 요약]
                         │                        │
                   [Supabase DB]  ←──────────────┘
                         │
                   캐싱 (24시간마다 최신 논문 갱신)
                         │
                  [Next.js 프론트]
```

- 논문 fetch + Claude 요약은 **백그라운드 cron job** (Vercel Cron 또는 GitHub Actions)으로 주기적 실행
- 한 번 요약된 논문은 DB에 저장 → Claude API 비용 절감

---

## 디렉터리 구조

```
paper-recommender/
├── app/
│   ├── page.tsx                 # 메인 피드
│   ├── paper/[id]/page.tsx      # 논문 상세
│   ├── api/
│   │   ├── papers/route.ts      # 논문 목록 조회
│   │   ├── papers/[id]/route.ts # 논문 상세 + 추천
│   │   └── cron/route.ts        # 논문 갱신 크론
├── components/
│   ├── PaperCard.tsx
│   ├── FieldSidebar.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── arxiv.ts                 # arXiv API 클라이언트
│   ├── semantic-scholar.ts      # Semantic Scholar API 클라이언트
│   └── claude.ts                # Claude API 요약/추천
└── supabase/
    └── schema.sql               # papers, summaries 테이블
```

---

## DB 스키마 (Supabase)

```sql
-- 논문 테이블
CREATE TABLE papers (
  id TEXT PRIMARY KEY,          -- arXiv ID
  title TEXT,
  authors TEXT[],
  abstract TEXT,
  field TEXT,                   -- 분야 (cs.AI, physics 등)
  published_at TIMESTAMP,
  citation_count INT,
  arxiv_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claude 요약 테이블
CREATE TABLE summaries (
  paper_id TEXT REFERENCES papers(id),
  summary_ko TEXT,              -- 한국어 3줄 요약
  keywords TEXT[],              -- 핵심 키워드
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 개발 단계

### Phase 1 — 기본 뼈대
- [ ] Next.js 프로젝트 세팅 (Tailwind + LDSM 토큰 설정)
- [ ] Supabase 연결 및 스키마 생성
- [ ] arXiv API 연동 → DB 저장

### Phase 2 — AI 기능
- [ ] Claude API 연동 → 논문 요약 생성
- [ ] 논문 카드 + 상세 페이지 UI

### Phase 3 — 추천 + 검색
- [ ] Semantic Scholar API 연동 (유사 논문)
- [ ] 검색 기능 (full-text search)
- [ ] 분야별 필터링

### Phase 4 — 마무리 (추후)
- [ ] Vercel Cron으로 매일 새 논문 자동 수집
- [ ] 사용자 인증 추가 (Supabase Auth) → 즐겨찾기, 읽음 표시

---

## 검증 방법

1. 로컬에서 `npm run dev` → 메인 피드에 논문 카드 표시 확인
2. 논문 클릭 → 상세 페이지에서 Claude 요약 노출 확인
3. 분야 변경 시 해당 분야 논문으로 피드 갱신 확인
4. 검색창에 키워드 입력 → 관련 논문 필터링 확인
5. Vercel 배포 후 실제 URL에서 동작 확인
