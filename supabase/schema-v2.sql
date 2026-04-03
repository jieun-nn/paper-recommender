-- ============================================================
-- Schema v2: 세부전공 분류 + 사용자 프로필 + Auth
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 1. papers 테이블에 sub_field 컬럼 추가
ALTER TABLE papers ADD COLUMN IF NOT EXISTS sub_field TEXT;

-- sub_field 인덱스
CREATE INDEX IF NOT EXISTS papers_sub_field_idx ON papers(sub_field);

-- 2. 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  degree_level    TEXT CHECK (degree_level IN ('bachelor', 'graduate')),
  department      TEXT,
  sub_field       TEXT,   -- 선택한 세부전공 (NULL이면 학과 기반 추천)
  field_label     TEXT,   -- 학과 기반 분야 (sub_field가 없을 때 사용)
  use_dept_recs   BOOLEAN DEFAULT FALSE,  -- TRUE: 학과 기반 / FALSE: 세부전공 기반
  onboarding_done BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필만 읽기/쓰기 가능
DROP POLICY IF EXISTS "Users can manage own profile" ON user_profiles;
CREATE POLICY "Users can manage own profile" ON user_profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON user_profiles;
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
