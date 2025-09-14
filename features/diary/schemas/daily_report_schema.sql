-- 3-3-3 시스템: RECORD 섹션 (일일 데이터)
CREATE TABLE IF NOT EXISTS daily_report (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  summary TEXT DEFAULT '' NOT NULL, -- 오늘 한줄 요약
  gratitude TEXT DEFAULT '' NOT NULL, -- 감사일기
  tomorrow_goals TEXT DEFAULT '' NOT NULL, -- 내일 집중할 일
  mood TEXT DEFAULT '보통' CHECK (mood IN ('매우좋음', '좋음', '보통', '나쁨', '매우나쁨')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ========================================
-- 인덱스 생성
-- ========================================

-- 날짜별 조회용 인덱스 (3-3-3 시스템의 핵심 조회 패턴)
CREATE INDEX IF NOT EXISTS idx_daily_report_date ON daily_report(date);

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

-- ========================================
-- RLS (Row Level Security) 활성화
-- ========================================

ALTER TABLE daily_report ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 보안 정책 (Security Policies)
-- ========================================

-- 일일 데이터 정책: 모든 사용자가 접근 가능
CREATE POLICY "Enable all access for daily_report" ON daily_report
  FOR ALL USING (true) WITH CHECK (true);