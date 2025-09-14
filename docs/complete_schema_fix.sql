-- ========================================
-- 완전한 스키마 수정 스크립트
-- todos, thoughts, daily_reports 모든 테이블 수정
-- ========================================

BEGIN;

-- ========================================
-- 1. todos 테이블 수정
-- ========================================
DO $$
BEGIN
    -- user_id 컬럼 추가 (없는 경우에만)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'todos' AND column_name = 'user_id') THEN
        ALTER TABLE todos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'todos 테이블에 user_id 컬럼을 추가했습니다.';
    END IF;

    -- RLS 활성화
    ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

    -- 기존 RLS 정책 제거
    DROP POLICY IF EXISTS "Users can view own todos" ON todos;
    DROP POLICY IF EXISTS "Users can insert own todos" ON todos;
    DROP POLICY IF EXISTS "Users can update own todos" ON todos;
    DROP POLICY IF EXISTS "Users can delete own todos" ON todos;

    -- 새 RLS 정책 생성
    CREATE POLICY "Users can view own todos" ON todos
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own todos" ON todos
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own todos" ON todos
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own todos" ON todos
        FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE 'todos 테이블 RLS 정책을 설정했습니다.';
END $$;

-- ========================================
-- 2. thoughts 테이블 수정
-- ========================================
DO $$
BEGIN
    -- user_id 컬럼 추가 (없는 경우에만)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'thoughts' AND column_name = 'user_id') THEN
        ALTER TABLE thoughts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'thoughts 테이블에 user_id 컬럼을 추가했습니다.';
    END IF;

    -- 기존 type 제약조건 확인 및 수정
    ALTER TABLE thoughts DROP CONSTRAINT IF EXISTS thoughts_type_check;

    -- type을 morning으로 통일하되, 기존 데이터 보존을 위해 다양한 값 허용
    ALTER TABLE thoughts ADD CONSTRAINT thoughts_type_check
        CHECK (type IN ('morning', 'daily', 'evening', 'reflection'));

    -- RLS 활성화
    ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

    -- 기존 RLS 정책 제거
    DROP POLICY IF EXISTS "Users can view own thoughts" ON thoughts;
    DROP POLICY IF EXISTS "Users can insert own thoughts" ON thoughts;
    DROP POLICY IF EXISTS "Users can update own thoughts" ON thoughts;
    DROP POLICY IF EXISTS "Users can delete own thoughts" ON thoughts;

    -- 새 RLS 정책 생성
    CREATE POLICY "Users can view own thoughts" ON thoughts
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own thoughts" ON thoughts
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own thoughts" ON thoughts
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own thoughts" ON thoughts
        FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE 'thoughts 테이블 RLS 정책을 설정했습니다.';
END $$;

-- ========================================
-- 3. daily_reports 테이블 처리
-- ========================================
DO $$
BEGIN
    -- daily_report 테이블이 존재하고 daily_reports가 없다면 변경
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_report')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reports') THEN

        -- 테이블명 변경
        ALTER TABLE daily_report RENAME TO daily_reports;
        RAISE NOTICE 'daily_report을 daily_reports로 변경했습니다.';
    END IF;

    -- daily_reports 테이블이 없다면 생성
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'daily_reports') THEN
        CREATE TABLE daily_reports (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            date DATE NOT NULL,
            summary TEXT,
            gratitude TEXT,
            tomorrow_goals TEXT,
            mood TEXT DEFAULT '보통',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        RAISE NOTICE 'daily_reports 테이블을 새로 생성했습니다.';
    END IF;

    -- user_id 컬럼 추가 (없는 경우에만)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                  WHERE table_name = 'daily_reports' AND column_name = 'user_id') THEN
        ALTER TABLE daily_reports ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'daily_reports 테이블에 user_id 컬럼을 추가했습니다.';
    END IF;

    -- 유니크 제약조건 설정
    ALTER TABLE daily_reports DROP CONSTRAINT IF EXISTS daily_reports_date_key;
    ALTER TABLE daily_reports DROP CONSTRAINT IF EXISTS daily_report_date_key;
    ALTER TABLE daily_reports DROP CONSTRAINT IF EXISTS daily_reports_date_user_key;

    ALTER TABLE daily_reports ADD CONSTRAINT daily_reports_date_user_key UNIQUE (date, user_id);

    -- RLS 활성화
    ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

    -- 기존 RLS 정책 제거
    DROP POLICY IF EXISTS "Users can view own daily reports" ON daily_reports;
    DROP POLICY IF EXISTS "Users can insert own daily reports" ON daily_reports;
    DROP POLICY IF EXISTS "Users can update own daily reports" ON daily_reports;
    DROP POLICY IF EXISTS "Users can delete own daily reports" ON daily_reports;

    -- 새 RLS 정책 생성
    CREATE POLICY "Users can view own daily reports" ON daily_reports
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own daily reports" ON daily_reports
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own daily reports" ON daily_reports
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own daily reports" ON daily_reports
        FOR DELETE USING (auth.uid() = user_id);

    RAISE NOTICE 'daily_reports 테이블 RLS 정책을 설정했습니다.';
END $$;

-- ========================================
-- 4. 인덱스 생성 (성능 최적화)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_todos_user_date ON todos(user_id, date);
CREATE INDEX IF NOT EXISTS idx_thoughts_user_date ON thoughts(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_user_date ON daily_reports(user_id, date);

-- ========================================
-- 5. 최종 확인 및 통계
-- ========================================
DO $$
DECLARE
    todos_has_user_id BOOLEAN;
    thoughts_has_user_id BOOLEAN;
    daily_reports_exists BOOLEAN;
    daily_reports_has_user_id BOOLEAN;
BEGIN
    -- 각 테이블의 user_id 컬럼 확인
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'user_id'
    ) INTO todos_has_user_id;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'thoughts' AND column_name = 'user_id'
    ) INTO thoughts_has_user_id;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'daily_reports'
    ) INTO daily_reports_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_reports' AND column_name = 'user_id'
    ) INTO daily_reports_has_user_id;

    RAISE NOTICE '=== 스키마 수정 완료 ===';
    RAISE NOTICE 'todos user_id 컬럼: %', todos_has_user_id;
    RAISE NOTICE 'thoughts user_id 컬럼: %', thoughts_has_user_id;
    RAISE NOTICE 'daily_reports 테이블: %', daily_reports_exists;
    RAISE NOTICE 'daily_reports user_id 컬럼: %', daily_reports_has_user_id;
    RAISE NOTICE '========================';
END $$;

COMMIT;