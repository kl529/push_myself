-- ========================================
-- Push Myself (나를 넘어라) - 인증 기반 데이터베이스 스키마
-- 3-3-3 시스템 + Google OAuth 인증
-- ========================================

-- ========================================
-- 1. TODOS 테이블 (DO - 3개 핵심 업무)
-- ========================================

-- 기존 테이블 삭제 (초기화가 필요한 경우)
-- DROP TABLE IF EXISTS todos CASCADE;

CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0),
  completed BOOLEAN DEFAULT false NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')) NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL CHECK (order_index >= 0),
  date DATE NOT NULL,
  link TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- TODOS 인덱스
CREATE INDEX IF NOT EXISTS idx_todos_user_date ON todos(user_id, date);
CREATE INDEX IF NOT EXISTS idx_todos_user_date_order ON todos(user_id, date, order_index);
CREATE INDEX IF NOT EXISTS idx_todos_user_date_completed ON todos(user_id, date, completed);

-- TODOS RLS 정책
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own todos" ON todos;
DROP POLICY IF EXISTS "Users can create their own todos" ON todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON todos;

CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 2. THOUGHTS 테이블 (THINK - 3개 생각&배운점)
-- ========================================

-- 기존 테이블 삭제 (초기화가 필요한 경우)  
-- DROP TABLE IF EXISTS thoughts CASCADE;

CREATE TABLE IF NOT EXISTS thoughts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0),
  type TEXT DEFAULT 'morning' CHECK (type IN ('morning')) NOT NULL, -- 3-3-3 시스템에서는 morning만 사용
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- THOUGHTS 인덱스
CREATE INDEX IF NOT EXISTS idx_thoughts_user_date ON thoughts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_thoughts_user_type_date ON thoughts(user_id, type, date);
CREATE INDEX IF NOT EXISTS idx_thoughts_user_date_created ON thoughts(user_id, date, created_at DESC);

-- THOUGHTS RLS 정책
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can create their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can update their own thoughts" ON thoughts;
DROP POLICY IF EXISTS "Users can delete their own thoughts" ON thoughts;

CREATE POLICY "Users can view their own thoughts" ON thoughts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own thoughts" ON thoughts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own thoughts" ON thoughts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own thoughts" ON thoughts
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 3. DAILY_REPORTS 테이블 (RECORD - 3가지 핵심 기록)
-- ========================================

-- 기존 테이블 삭제 (초기화가 필요한 경우)
-- DROP TABLE IF EXISTS daily_reports CASCADE;

CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  summary TEXT, -- 오늘 한줄 요약
  gratitude TEXT, -- 감사일기
  tomorrow_goals TEXT, -- 내일 집중할 일
  mood TEXT DEFAULT '보통' CHECK (mood IN ('매우좋음', '좋음', '보통', '나쁨', '매우나쁨')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date) -- 사용자별 날짜 유니크 제약
);

-- DAILY_REPORTS 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_mood_date ON daily_reports(user_id, mood, date);

-- DAILY_REPORTS RLS 정책
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own daily reports" ON daily_reports;
DROP POLICY IF EXISTS "Users can create their own daily reports" ON daily_reports;
DROP POLICY IF EXISTS "Users can update their own daily reports" ON daily_reports;
DROP POLICY IF EXISTS "Users can delete their own daily reports" ON daily_reports;

CREATE POLICY "Users can view their own daily reports" ON daily_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily reports" ON daily_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily reports" ON daily_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily reports" ON daily_reports
  FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- 4. 트리거 함수
-- ========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_todos_updated_at ON todos;
DROP TRIGGER IF EXISTS update_thoughts_updated_at ON thoughts;
DROP TRIGGER IF EXISTS update_daily_reports_updated_at ON daily_reports;

CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_thoughts_updated_at
  BEFORE UPDATE ON thoughts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. 유용한 함수들
-- ========================================

-- 특정 사용자의 특정 날짜 완료된 todos 개수
CREATE OR REPLACE FUNCTION get_user_completed_todos_count(user_uuid UUID, target_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM todos
    WHERE user_id = user_uuid AND date = target_date AND completed = true
  );
END;
$$ LANGUAGE plpgsql;

-- 특정 사용자의 특정 날짜 생각 개수
CREATE OR REPLACE FUNCTION get_user_thoughts_count(user_uuid UUID, target_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM thoughts
    WHERE user_id = user_uuid AND date = target_date
  );
END;
$$ LANGUAGE plpgsql;

-- 특정 사용자의 3-3-3 달성 여부 확인
CREATE OR REPLACE FUNCTION check_user_333_completion(user_uuid UUID, target_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
  todo_count INTEGER;
  thought_count INTEGER;
  has_report BOOLEAN;
BEGIN
  -- 완료된 todos 개수 (3개 이상)
  SELECT COUNT(*) INTO todo_count
  FROM todos
  WHERE user_id = user_uuid AND date = target_date AND completed = true;
  
  -- 생각 개수 (3개 이상)
  SELECT COUNT(*) INTO thought_count
  FROM thoughts
  WHERE user_id = user_uuid AND date = target_date;
  
  -- 일일 보고서 존재 여부 (3개 필드 모두 작성)
  SELECT COUNT(*) > 0 INTO has_report
  FROM daily_reports
  WHERE user_id = user_uuid 
    AND date = target_date
    AND summary IS NOT NULL 
    AND summary != ''
    AND gratitude IS NOT NULL 
    AND gratitude != ''
    AND tomorrow_goals IS NOT NULL 
    AND tomorrow_goals != '';
  
  RETURN (todo_count >= 3 AND thought_count >= 3 AND has_report);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. Google OAuth 설정 안내
-- ========================================

-- Google OAuth 설정을 위해 Supabase 대시보드에서 다음 설정을 완료하세요:
-- 1. Authentication > Settings > Auth Providers에서 Google 활성화
-- 2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
-- 3. 승인된 리디렉션 URI에 다음 추가: https://[your-project].supabase.co/auth/v1/callback
-- 4. 클라이언트 ID와 클라이언트 시크릿을 Supabase에 입력
-- 5. Site URL을 실제 도메인으로 설정

-- ========================================
-- 7. 마이그레이션을 위한 임시 정책 (선택사항)
-- ========================================

-- 로컬 데이터 마이그레이션을 위해 임시로 사용할 수 있는 정책
-- 마이그레이션 완료 후 삭제하세요

/*
-- 임시 마이그레이션 정책 (마이그레이션 완료 후 삭제할 것)
CREATE POLICY "Allow migration for todos" ON todos
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow migration for thoughts" ON thoughts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow migration for daily_reports" ON daily_reports
  FOR ALL USING (true) WITH CHECK (true);
*/

-- 스키마 생성 완료
SELECT 'Push Myself 인증 기반 데이터베이스 스키마 생성 완료!' as message;