-- ========================================
-- 생각정리 기능 전용 데이터베이스 스키마
-- Push Myself (나를 넘어라) - 개인 성장 추적 PWA
-- ========================================

-- ========================================
-- 생각 테이블 (Thoughts)
-- ========================================
CREATE TABLE IF NOT EXISTS thoughts (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0), -- 빈 문자열 방지
  type TEXT NOT NULL CHECK (type IN ('morning', 'daily', 'idea')), -- 생각 유형 제한
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================
-- 생각정리 최적화된 인덱스 생성
-- ========================================

-- 1. 날짜별 생각 조회 (가장 많이 사용)
CREATE INDEX IF NOT EXISTS idx_thoughts_date ON thoughts(date);

-- 2. 생각 유형별 조회 (아침 생각, 하루 생각, 아이디어)
CREATE INDEX IF NOT EXISTS idx_thoughts_type_date ON thoughts(type, date);

-- 3. 최근 생각 조회 (타임라인)
CREATE INDEX IF NOT EXISTS idx_thoughts_created_at ON thoughts(created_at DESC);

-- 4. 텍스트 검색을 위한 GIN 인덱스 (한글 지원)
-- CREATE INDEX IF NOT EXISTS idx_thoughts_text_search 
--   ON thoughts USING GIN (to_tsvector('korean', text));

-- 5. 복합 인덱스 (날짜 + 유형 + 생성시간)
CREATE INDEX IF NOT EXISTS idx_thoughts_date_type_created 
  ON thoughts(date, type, created_at DESC);

-- ========================================
-- 트리거 및 함수
-- ========================================

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_thoughts_updated_at()
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
  EXECUTE FUNCTION update_thoughts_updated_at();

-- ========================================
-- RLS (Row Level Security) 활성화
-- ========================================

ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 보안 정책 (Security Policies)
-- ========================================

-- 생각 테이블 정책 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Enable all access for thoughts" ON thoughts
  FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 생각정리 전용 함수들
-- ========================================

-- 특정 날짜의 생각 개수 조회 (유형별)
CREATE OR REPLACE FUNCTION get_thoughts_count_by_type(target_date DATE, thought_type TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM thoughts 
    WHERE date = target_date AND type = thought_type
  );
END;
$$ LANGUAGE plpgsql;

-- 특정 날짜의 전체 생각 개수
CREATE OR REPLACE FUNCTION get_daily_thoughts_count(target_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM thoughts 
    WHERE date = target_date
  );
END;
$$ LANGUAGE plpgsql;

-- 특정 기간의 생각 통계 (유형별)
CREATE OR REPLACE FUNCTION get_thoughts_stats(start_date DATE, end_date DATE)
RETURNS TABLE(
  thought_type TEXT,
  count BIGINT,
  avg_length NUMERIC,
  first_thought DATE,
  last_thought DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.type as thought_type,
    COUNT(*) as count,
    ROUND(AVG(LENGTH(t.text)), 2) as avg_length,
    MIN(t.date) as first_thought,
    MAX(t.date) as last_thought
  FROM thoughts t
  WHERE t.date >= start_date AND t.date <= end_date
  GROUP BY t.type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- 최근 생각들 조회 (페이지네이션 지원)
CREATE OR REPLACE FUNCTION get_recent_thoughts(
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0,
  thought_type TEXT DEFAULT NULL
)
RETURNS TABLE(
  id INTEGER,
  date DATE,
  text TEXT,
  type TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.date,
    t.text,
    t.type,
    t.created_at
  FROM thoughts t
  WHERE (thought_type IS NULL OR t.type = thought_type)
  ORDER BY t.created_at DESC
  LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- 생각 텍스트 검색 (한글 지원)
CREATE OR REPLACE FUNCTION search_thoughts(
  search_query TEXT,
  limit_count INTEGER DEFAULT 20,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  id INTEGER,
  date DATE,
  text TEXT,
  type TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.date,
    t.text,
    t.type,
    t.created_at,
    ts_rank(to_tsvector('korean', t.text), plainto_tsquery('korean', search_query)) as rank
  FROM thoughts t
  WHERE to_tsvector('korean', t.text) @@ plainto_tsquery('korean', search_query)
    AND (start_date IS NULL OR t.date >= start_date)
    AND (end_date IS NULL OR t.date <= end_date)
  ORDER BY rank DESC, t.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- 월별 생각 활동 통계
CREATE OR REPLACE FUNCTION get_monthly_thoughts_activity(target_year INTEGER)
RETURNS TABLE(
  month INTEGER,
  month_name TEXT,
  total_thoughts BIGINT,
  morning_thoughts BIGINT,
  daily_thoughts BIGINT,
  ideas BIGINT,
  avg_thoughts_per_day NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(MONTH FROM t.date)::INTEGER as month,
    CASE EXTRACT(MONTH FROM t.date)::INTEGER
      WHEN 1 THEN '1월' WHEN 2 THEN '2월' WHEN 3 THEN '3월' WHEN 4 THEN '4월'
      WHEN 5 THEN '5월' WHEN 6 THEN '6월' WHEN 7 THEN '7월' WHEN 8 THEN '8월'
      WHEN 9 THEN '9월' WHEN 10 THEN '10월' WHEN 11 THEN '11월' WHEN 12 THEN '12월'
    END as month_name,
    COUNT(*) as total_thoughts,
    COUNT(*) FILTER (WHERE t.type = 'morning') as morning_thoughts,
    COUNT(*) FILTER (WHERE t.type = 'daily') as daily_thoughts,
    COUNT(*) FILTER (WHERE t.type = 'idea') as ideas,
    ROUND(COUNT(*)::NUMERIC / EXTRACT(DAYS FROM DATE_TRUNC('month', t.date) + INTERVAL '1 month' - DATE_TRUNC('month', t.date)), 2) as avg_thoughts_per_day
  FROM thoughts t
  WHERE EXTRACT(YEAR FROM t.date) = target_year
  GROUP BY EXTRACT(MONTH FROM t.date)
  ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- 생각 길이 분석 (짧은/보통/긴 생각 분류)
CREATE OR REPLACE FUNCTION analyze_thoughts_length(start_date DATE, end_date DATE)
RETURNS TABLE(
  length_category TEXT,
  count BIGINT,
  percentage NUMERIC,
  avg_length NUMERIC
) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  -- 전체 생각 개수
  SELECT COUNT(*) INTO total_count
  FROM thoughts
  WHERE date >= start_date AND date <= end_date;
  
  RETURN QUERY
  SELECT 
    CASE 
      WHEN LENGTH(t.text) <= 20 THEN '짧은 생각 (20자 이하)'
      WHEN LENGTH(t.text) <= 100 THEN '보통 생각 (21-100자)'
      ELSE '긴 생각 (100자 초과)'
    END as length_category,
    COUNT(*) as count,
    CASE 
      WHEN total_count > 0 THEN ROUND((COUNT(*)::NUMERIC / total_count) * 100, 2)
      ELSE 0
    END as percentage,
    ROUND(AVG(LENGTH(t.text)), 2) as avg_length
  FROM thoughts t
  WHERE t.date >= start_date AND t.date <= end_date
  GROUP BY 
    CASE 
      WHEN LENGTH(t.text) <= 20 THEN '짧은 생각 (20자 이하)'
      WHEN LENGTH(t.text) <= 100 THEN '보통 생각 (21-100자)'
      ELSE '긴 생각 (100자 초과)'
    END
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 생각정리 설정 테이블
-- ========================================

-- 생각정리 전용 설정
CREATE TABLE IF NOT EXISTS thoughts_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 생각정리 설정 기본값
INSERT INTO thoughts_settings (key, value, description) VALUES 
  ('thoughts_per_page', '10', '페이지당 생각 표시 개수'),
  ('enable_korean_search', 'true', '한글 텍스트 검색 활성화'),
  ('auto_save_thoughts', 'true', '생각 자동 저장 활성화'),
  ('show_thought_stats', 'true', '생각 통계 표시'),
  ('default_thought_type', 'daily', '기본 생각 유형')
ON CONFLICT (key) DO NOTHING;

-- 설정 테이블 트리거
CREATE TRIGGER update_thoughts_settings_updated_at 
  BEFORE UPDATE ON thoughts_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_thoughts_updated_at();

-- 설정 테이블 RLS
ALTER TABLE thoughts_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for thoughts_settings" ON thoughts_settings
  FOR ALL USING (true) WITH CHECK (true);