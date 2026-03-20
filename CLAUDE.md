# CLAUDE.md — Paper Recommender

## 프로젝트 개요

분야별 최신 논문을 수집하고 Claude AI로 한국어 요약·추천을 제공하는 웹사이트.

- **플랜 파일**: `/Users/songjieun/Documents/paper-recommender-plan.md`
- **진행 상황**: `progress.md` (프로젝트 루트)

---

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 14 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS + LDSM 디자인 토큰 (`src/styles/ldsm.css`) |
| 데이터베이스 | Supabase (PostgreSQL) |
| AI | Claude API (`claude-sonnet-4-6`) |
| 논문 데이터 | arXiv API + Semantic Scholar API |
| 배포 | Vercel |

---

## 디렉터리 구조

```
src/
├── app/
│   ├── page.tsx                   # 메인 피드
│   ├── paper/[id]/page.tsx        # 논문 상세
│   └── api/
│       ├── papers/route.ts        # GET /api/papers?field=&sort=
│       ├── papers/[id]/route.ts   # GET /api/papers/:id (상세 + 추천)
│       └── cron/route.ts          # POST /api/cron (논문 갱신)
├── components/
│   ├── PaperCard.tsx
│   ├── FieldSidebar.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── arxiv.ts                   # arXiv API 클라이언트
│   ├── semantic-scholar.ts        # Semantic Scholar API 클라이언트
│   ├── claude.ts                  # Claude API 요약/추천
│   ├── supabase.ts                # Supabase 클라이언트
│   └── fields.ts                  # 분야 카테고리 매핑 정의
├── styles/
│   └── ldsm.css                   # LDSM 디자인 토큰 CSS 변수
└── types/
    └── paper.ts                   # Paper, Summary 타입 정의
supabase/
└── schema.sql                     # DB 스키마
```

---

## 환경 변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
CRON_SECRET=
```

---

## 분야 카테고리 매핑

`src/lib/fields.ts`에 정의. 모든 arXiv 카테고리를 수집하되, 사용자에게는 아래 이름으로 표시:

| 표시 이름 | arXiv 카테고리 |
|-----------|-------------|
| 물리 | physics.*, cond-mat.*, quant-ph |
| 반도체 | cond-mat.mes-hall, cond-mat.mtrl-sci |
| 하드웨어 | cs.AR, cs.ET, eess.* |
| 소프트웨어 | cs.SE, cs.PL, cs.OS |
| AI / 머신러닝 | cs.AI, cs.LG, stat.ML |
| 수학 | math.* |
| 디자인 | cs.HC, cs.GR |
| 심리 | q-bio.NC + Semantic Scholar |
| 기타 | 위 분류 외 전체 |

---

## LDSM 디자인 원칙

- 기본 좌우 마진: **16px** (`px-4`)
- 최소 폰트 크기: **12px** (그 이하 금지)
- 색상 변경 시 Gray 500 이상 텍스트에 대비비 3.0:1 이상 유지
- 불투명도는 White/Black만 5% 단위로 조정 가능
- 아이콘: 24×24px 그리드, stroke 1.3pt 기준

---

## 코딩 규칙

- TypeScript strict 모드 사용
- API 응답은 항상 `{ data, error }` 형태로 반환
- 에러는 console.error + 적절한 HTTP 상태 코드 반환
- Claude API 호출 결과는 Supabase에 캐싱 (재호출 방지)
- 논문 요약은 항상 **한국어 3줄** 이내

---

## 주요 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사
```
