export interface Paper {
  id: string
  source: 'arxiv' | 'semantic_scholar'
  title: string
  authors: string[]
  abstract: string | null
  field_label: string | null
  arxiv_categories: string[]
  published_at: string | null
  citation_count: number
  arxiv_url: string | null
  doi: string | null
  created_at: string
  updated_at: string
  summary?: Summary
}

export interface Summary {
  id: string
  paper_id: string
  summary_ko: string
  keywords: string[]
  model: string
  created_at: string
}

export type SortOption = 'latest' | 'citations'
export type FieldLabel =
  | '전체'
  | '물리'
  | '반도체'
  | '하드웨어'
  | '소프트웨어'
  | 'AI / 머신러닝'
  | '수학'
  | '디자인'
  | '심리'
  | '기타'
