-- ========================================
-- daily_reports 테이블 스키마 수정
-- 테이블명 변경 및 user_id 컬럼 추가
-- ========================================

BEGIN;

-- 기존 daily_report 테이블을 daily_reports로 변경하고 user_id 추가
DO $$
BEGIN
    -- daily_report 테이블이 존재하고 daily_reports가 없다면 변경
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_report')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reports') THEN

        -- 테이블명 변경
        ALTER TABLE daily_report RENAME TO daily_reports;

        -- user_id 컬럼 추가 (auth.users 참조)
        ALTER TABLE daily_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

        -- 기존 제약조건도 이름 변경
        ALTER INDEX IF EXISTS daily_report_date_key RENAME TO daily_reports_date_user_key;

        -- user_id가 포함된 복합 유니크 제약조건으로 변경
        ALTER TABLE daily_reports DROP CONSTRAINT IF EXISTS daily_reports_date_key;
        ALTER TABLE daily_reports DROP CONSTRAINT IF EXISTS daily_report_date_key;
        ALTER TABLE daily_reports ADD CONSTRAINT daily_reports_date_user_key UNIQUE (date, user_id);

        RAISE NOTICE 'daily_report 테이블을 daily_reports로 변경하고 user_id 컬럼을 추가했습니다.';

    -- daily_reports 테이블이 이미 존재한다면 user_id 컬럼만 확인/추가
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reports') THEN

        -- user_id 컬럼이 없다면 추가
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name = 'daily_reports' AND column_name = 'user_id') THEN
            ALTER TABLE daily_reports ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'daily_reports 테이블에 user_id 컬럼을 추가했습니다.';
        END IF;

        -- 복합 유니크 제약조건 확인/추가
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'daily_reports_date_user_key') THEN
            ALTER TABLE daily_reports DROP CONSTRAINT IF EXISTS daily_reports_date_key;
            ALTER TABLE daily_reports ADD CONSTRAINT daily_reports_date_user_key UNIQUE (date, user_id);
            RAISE NOTICE 'daily_reports 테이블에 복합 유니크 제약조건을 추가했습니다.';
        END IF;

    -- 두 테이블 모두 없다면 새로 생성
    ELSE
        CREATE TABLE daily_reports (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            summary TEXT,
            gratitude TEXT,
            tomorrow_goals TEXT,
            mood TEXT DEFAULT '보통',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            CONSTRAINT daily_reports_date_user_key UNIQUE (date, user_id)
        );

        -- RLS 활성화
        ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

        -- RLS 정책 생성
        CREATE POLICY "Users can view own daily reports" ON daily_reports
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert own daily reports" ON daily_reports
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update own daily reports" ON daily_reports
            FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete own daily reports" ON daily_reports
            FOR DELETE USING (auth.uid() = user_id);

        RAISE NOTICE 'daily_reports 테이블을 새로 생성했습니다.';
    END IF;
END $$;

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);

COMMIT;

-- 최종 확인
DO $$
DECLARE
    table_exists BOOLEAN;
    user_id_exists BOOLEAN;
    constraint_exists BOOLEAN;
BEGIN
    -- 테이블 존재 확인
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'daily_reports'
    ) INTO table_exists;

    -- user_id 컬럼 존재 확인
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_reports' AND column_name = 'user_id'
    ) INTO user_id_exists;

    -- 제약조건 존재 확인
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'daily_reports_date_user_key'
    ) INTO constraint_exists;

    RAISE NOTICE '=== 스키마 수정 완료 ===';
    RAISE NOTICE 'daily_reports 테이블 존재: %', table_exists;
    RAISE NOTICE 'user_id 컬럼 존재: %', user_id_exists;
    RAISE NOTICE '복합 유니크 제약조건 존재: %', constraint_exists;
    RAISE NOTICE '========================';
END $$;