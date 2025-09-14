-- ========================================
-- 중복 daily_report 데이터 정리 스크립트
-- ========================================

-- 실행 전에 반드시 데이터베이스를 백업하세요!

BEGIN;

-- 1. 중복된 날짜들을 확인
SELECT date, COUNT(*) as count
FROM daily_report
GROUP BY date
HAVING COUNT(*) > 1
ORDER BY date;

-- 2. 중복 데이터 정리 (가장 최근 updated_at을 가진 레코드만 유지)
WITH duplicates AS (
    SELECT id, date,
           ROW_NUMBER() OVER (PARTITION BY date ORDER BY updated_at DESC, id DESC) as rn
    FROM daily_report
)
DELETE FROM daily_report
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 3. 정리 결과 확인
SELECT date, COUNT(*) as count
FROM daily_report
GROUP BY date
HAVING COUNT(*) > 1;

-- 4. UNIQUE 제약조건 추가
ALTER TABLE daily_report
ADD CONSTRAINT daily_report_date_key UNIQUE (date);

COMMIT;