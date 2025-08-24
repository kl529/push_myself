-- 일일 데이터 테이블 (Daily Report)
CREATE TABLE IF NOT EXISTS daily_report (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  summary TEXT DEFAULT '' NOT NULL, -- 하루 한줄 요약
  gratitude TEXT DEFAULT '' NOT NULL, -- 감사 일기
  lessons_learned TEXT DEFAULT '' NOT NULL, -- 배운 점
  tomorrow_goals TEXT DEFAULT '' NOT NULL, -- 내일의 나에게
  mood TEXT DEFAULT '보통' CHECK (mood IN ('매우좋음', '좋음', '보통', '나쁨', '매우나쁨')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 일일 데이터 테이블 (Diary)
CREATE TABLE IF NOT EXISTS  diary (
  id SERIAL PRIMARY KEY,
  daily_report_id INTEGER NOT NULL,
  content TEXT DEFAULT '' NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('other', 'work', 'life', 'health', 'finance', 'relationship', 'personal', 'other')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_diary_daily_report 
    FOREIGN KEY (daily_report_id) REFERENCES daily_report(id) 
    ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========================================
-- 일기 관련 최적화된 인덱스 생성
-- ========================================

-- 1. 일일 데이터 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_report_date ON daily_report(date);

-- 2. 일기 조회용 인덱스
CREATE INDEX IF NOT EXISTS idx_diary_created_at ON diary(created_at DESC);

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

-- daily_report 테이블 트리거
CREATE TRIGGER update_daily_report_updated_at 
  BEFORE UPDATE ON daily_report 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- diary 테이블 트리거
CREATE TRIGGER update_diary_updated_at 
  BEFORE UPDATE ON diary 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS (Row Level Security) 활성화
-- ========================================

ALTER TABLE daily_report ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 보안 정책 (Security Policies)
-- ========================================

-- 일일 데이터 정책
CREATE POLICY "Enable all access for daily_report" ON daily_report
  FOR ALL USING (true) WITH CHECK (true);

-- 일기 정책
CREATE POLICY "Enable all access for diary" ON diary
  FOR ALL USING (true) WITH CHECK (true);