-- ========================================
-- 데이터베이스 정리 마이그레이션 스크립트
-- Push Myself (나를 넘어라) - 3-3-3 시스템 최적화
-- ========================================

-- 이 스크립트는 기존 데이터베이스를 3-3-3 시스템에 맞게 정리합니다.
-- 실행 전에 반드시 데이터베이스를 백업하세요!

BEGIN;

-- ========================================
-- 1. 불필요한 테이블 삭제
-- ========================================

-- 주간 회고 및 통계 관련 테이블들 제거
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS weekly_stats CASCADE;
DROP TABLE IF EXISTS diary CASCADE;

-- 설정 테이블들 제거 (앱에서 직접 처리)
DROP TABLE IF EXISTS thoughts_settings CASCADE;

-- ========================================
-- 2. daily_report 테이블 정리
-- ========================================

-- 불필요한 컬럼 제거
ALTER TABLE daily_report
DROP COLUMN IF EXISTS lessons_learned;

-- 중복 데이터가 있는 경우 먼저 정리 (가장 최근 updated_at을 가진 레코드만 유지)
WITH duplicates AS (
    SELECT id, date,
           ROW_NUMBER() OVER (PARTITION BY date ORDER BY updated_at DESC, id DESC) as rn
    FROM daily_report
)
DELETE FROM daily_report
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 날짜 컬럼에 UNIQUE 제약조건 추가 (아직 없다면)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'daily_report_date_key'
        AND conrelid = 'daily_report'::regclass
    ) THEN
        ALTER TABLE daily_report ADD CONSTRAINT daily_report_date_key UNIQUE (date);
    END IF;
END $$;

-- ========================================
-- 3. thoughts 테이블 정리
-- ========================================

-- 먼저 기존 데이터에서 morning이 아닌 타입들을 morning으로 변경
UPDATE thoughts
SET type = 'morning'
WHERE type != 'morning';

-- 기존 제약조건 제거
ALTER TABLE thoughts
DROP CONSTRAINT IF EXISTS thoughts_type_check;

-- type 컬럼의 제약조건을 morning만으로 변경
ALTER TABLE thoughts
ADD CONSTRAINT thoughts_type_check CHECK (type = 'morning');

-- ========================================
-- 4. todos 테이블 정리
-- ========================================

-- 불필요한 컬럼들 제거
ALTER TABLE todos
DROP COLUMN IF EXISTS type,
DROP COLUMN IF EXISTS "order";

-- order_index가 없다면 추가 (기존 order 값 사용)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'todos' AND column_name = 'order_index'
    ) THEN
        ALTER TABLE todos ADD COLUMN order_index INTEGER DEFAULT 0;
        -- 기존 order 컬럼이 있었다면 그 값을 복사 (이미 제거되었을 수 있음)
    END IF;
END $$;

-- ========================================
-- 5. 불필요한 함수들 제거
-- ========================================

-- 생각 관련 복잡한 함수들 제거
DROP FUNCTION IF EXISTS get_thoughts_count_by_type(DATE, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_daily_thoughts_count(DATE) CASCADE;
DROP FUNCTION IF EXISTS get_thoughts_stats(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_recent_thoughts(INTEGER, INTEGER, TEXT) CASCADE;
DROP FUNCTION IF EXISTS search_thoughts(TEXT, INTEGER, DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_monthly_thoughts_activity(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS analyze_thoughts_length(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS update_thoughts_updated_at() CASCADE;

-- ========================================
-- 6. 불필요한 인덱스들 제거
-- ========================================

-- 복잡한 인덱스들 제거 (기본 날짜 인덱스만 유지)
DROP INDEX IF EXISTS idx_thoughts_type_date;
DROP INDEX IF EXISTS idx_thoughts_created_at;
DROP INDEX IF EXISTS idx_thoughts_date_type_created;
DROP INDEX IF EXISTS idx_thoughts_text_search;
DROP INDEX IF EXISTS idx_diary_created_at;

-- ========================================
-- 7. 데이터 정합성 검증
-- ========================================

-- 각 날짜별 데이터 개수 확인 (3-3-3 제한 확인)
DO $$
DECLARE
    todo_violations INTEGER;
    thought_violations INTEGER;
BEGIN
    -- 하루에 3개 초과하는 할일이 있는 날짜 확인
    SELECT COUNT(DISTINCT date) INTO todo_violations
    FROM (
        SELECT date, COUNT(*) as cnt
        FROM todos
        GROUP BY date
        HAVING COUNT(*) > 3
    ) AS violations;

    -- 하루에 3개 초과하는 생각이 있는 날짜 확인
    SELECT COUNT(DISTINCT date) INTO thought_violations
    FROM (
        SELECT date, COUNT(*) as cnt
        FROM thoughts
        GROUP BY date
        HAVING COUNT(*) > 3
    ) AS violations;

    IF todo_violations > 0 THEN
        RAISE WARNING '할일이 3개를 초과하는 날짜가 % 개 있습니다.', todo_violations;
    END IF;

    IF thought_violations > 0 THEN
        RAISE WARNING '생각이 3개를 초과하는 날짜가 % 개 있습니다.', thought_violations;
    END IF;

    RAISE NOTICE '데이터 정합성 검증 완료';
    RAISE NOTICE '- 할일 3개 초과 날짜: % 개', todo_violations;
    RAISE NOTICE '- 생각 3개 초과 날짜: % 개', thought_violations;
END $$;

-- ========================================
-- 8. 통계 정보 출력
-- ========================================

DO $$
DECLARE
    total_todos INTEGER;
    total_thoughts INTEGER;
    total_reports INTEGER;
    active_dates INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_todos FROM todos;
    SELECT COUNT(*) INTO total_thoughts FROM thoughts;
    SELECT COUNT(*) INTO total_reports FROM daily_report;
    SELECT COUNT(DISTINCT date) INTO active_dates FROM (
        SELECT date FROM todos
        UNION
        SELECT date FROM thoughts
        UNION
        SELECT date FROM daily_report
    ) AS all_dates;

    RAISE NOTICE '=== 데이터베이스 정리 완료 ===';
    RAISE NOTICE '- 총 할일: % 개', total_todos;
    RAISE NOTICE '- 총 생각: % 개', total_thoughts;
    RAISE NOTICE '- 총 일일기록: % 개', total_reports;
    RAISE NOTICE '- 활동한 날짜: % 개', active_dates;
    RAISE NOTICE '================================';
END $$;

COMMIT;

-- ========================================
-- 주의사항
-- ========================================

-- 이 스크립트 실행 후:
-- 1. 애플리케이션 코드에서 제거된 필드들 참조 제거 필요
-- 2. 3-3-3 제한이 제대로 작동하는지 확인
-- 3. 기존 데이터가 올바르게 보이는지 테스트