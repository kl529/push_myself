-- ========================================
-- TODO 기능 관련 데이터베이스 스키마
-- ========================================

-- 기존 제약조건 제거 (이미 테이블이 있는 경우)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'todos') THEN
    ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_link_check;
    ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_description_check;
  END IF;
END $$;

-- 투두 테이블 (개선된 버전)
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0), -- 빈 문자열 방지
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')) NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL CHECK (order_index >= 0), -- 음수 방지
  type TEXT DEFAULT 'todo' CHECK (type IN ('todo', 'habit', 'goal', 'reminder')) NOT NULL,
  link TEXT, -- 링크 (빈 문자열 허용)
  description TEXT, -- 설명 (빈 문자열 허용)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- 복합 제약조건: 같은 날짜에서 order_index 중복 방지
  CONSTRAINT unique_date_order UNIQUE (date, order_index)
);

-- ========================================
-- TODO 최적화된 인덱스 생성
-- ========================================

-- 1. 가장 많이 사용되는 쿼리: 날짜별 투두 조회 (완료 상태별 정렬)
CREATE INDEX IF NOT EXISTS idx_todos_date_order ON todos(date, order_index);

-- 2. 완료 상태별 필터링 (날짜 + 완료여부)
CREATE INDEX IF NOT EXISTS idx_todos_date_completed ON todos(date, completed);

-- 3. 최근 활동 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);

-- 4. 텍스트 검색을 위한 GIN 인덱스 (옵션)
-- CREATE INDEX IF NOT EXISTS idx_todos_text_search ON todos USING GIN (to_tsvector('english', text));

-- 5. 우선순위별 조회 (필요시)
-- CREATE INDEX IF NOT EXISTS idx_todos_date_priority ON todos(date, priority) WHERE completed = false;

-- ========================================
-- TODO 트리거 및 함수
-- ========================================

-- updated_at 자동 업데이트를 위한 트리거 함수 (공통 함수)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- TODO 테이블 트리거 생성
CREATE TRIGGER update_todos_updated_at 
  BEFORE UPDATE ON todos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TODO RLS (Row Level Security) 설정
-- ========================================

-- RLS 활성화
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 기본 정책 (모든 사용자가 읽기/쓰기 가능)
CREATE POLICY "Enable all access for todos" ON todos
  FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- TODO 관련 유용한 함수들 (아래는 안함)
-- ========================================

-- 특정 날짜의 완료된 투두 개수 조회
CREATE OR REPLACE FUNCTION get_completed_todos_count(target_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM todos 
    WHERE date = target_date AND completed = true
  );
END;
$$ LANGUAGE plpgsql;

-- 특정 날짜의 전체 투두 개수 조회
CREATE OR REPLACE FUNCTION get_total_todos_count(target_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM todos 
    WHERE date = target_date
  );
END;
$$ LANGUAGE plpgsql;