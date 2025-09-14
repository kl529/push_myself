-- ========================================
-- 3-3-3 시스템: THINK 섹션 (생각&배운점)
-- Push Myself (나를 넘어라) - 개인 성장 추적 PWA
-- ========================================

-- ========================================
-- 생각 테이블 (Thoughts)
-- ========================================
CREATE TABLE IF NOT EXISTS thoughts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0), -- 빈 문자열 방지
  type TEXT NOT NULL DEFAULT 'morning' CHECK (type = 'morning'), -- 3-3-3 시스템에서는 morning만 사용
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================
-- 인덱스 생성 (3-3-3 시스템 최적화)
-- ========================================

-- 날짜별 생각 조회 (3-3-3 시스템의 핵심 조회 패턴)
CREATE INDEX IF NOT EXISTS idx_thoughts_date ON thoughts(date);

-- ========================================
-- 트리거 및 함수
-- ========================================

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- thoughts 테이블 트리거
CREATE TRIGGER update_thoughts_updated_at_trigger
  BEFORE UPDATE ON thoughts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (Row Level Security) 활성화
-- ========================================

ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 보안 정책 (Security Policies)
-- ========================================

-- 생각 테이블 정책: 모든 사용자가 접근 가능
CREATE POLICY "Enable all access for thoughts" ON thoughts
  FOR ALL USING (true) WITH CHECK (true);