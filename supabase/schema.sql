-- Paper Recommender — Supabase Schema
-- Run this in Supabase SQL Editor

-- 논문 테이블
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY,              -- arXiv ID (e.g., "2401.12345") or Semantic Scholar ID
  source TEXT NOT NULL DEFAULT 'arxiv', -- 'arxiv' | 'semantic_scholar'
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  abstract TEXT,
  field_label TEXT,                 -- UI 표시 분야 (물리, 소프트웨어, 심리 등)
  arxiv_categories TEXT[] DEFAULT '{}', -- 원본 arXiv 카테고리 코드
  published_at TIMESTAMPTZ,
  citation_count INT DEFAULT 0,
  arxiv_url TEXT,
  doi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claude 요약 테이블
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  summary_ko TEXT NOT NULL,         -- 한국어 3줄 요약
  keywords TEXT[] DEFAULT '{}',     -- 핵심 키워드
  model TEXT DEFAULT 'claude-sonnet-4-6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (paper_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS papers_field_label_idx ON papers(field_label);
CREATE INDEX IF NOT EXISTS papers_published_at_idx ON papers(published_at DESC);
CREATE INDEX IF NOT EXISTS papers_citation_count_idx ON papers(citation_count DESC);

-- Full-text search 인덱스
CREATE INDEX IF NOT EXISTS papers_title_fts ON papers USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS papers_abstract_fts ON papers USING gin(to_tsvector('english', COALESCE(abstract, '')));

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER papers_updated_at
  BEFORE UPDATE ON papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS (Row Level Security) — 읽기는 누구나, 쓰기는 service role만
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "papers_public_read" ON papers FOR SELECT USING (true);
CREATE POLICY "summaries_public_read" ON summaries FOR SELECT USING (true);
