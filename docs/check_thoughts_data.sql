-- thoughts 테이블의 현재 상태 확인

-- 1. 전체 데이터 개수와 type별 분포 확인
SELECT type, COUNT(*) as count
FROM thoughts
GROUP BY type
ORDER BY count DESC;

-- 2. NULL 값이 있는지 확인
SELECT COUNT(*) as null_count
FROM thoughts
WHERE type IS NULL;

-- 3. 'morning'이 아닌 데이터 샘플 확인 (최대 10개)
SELECT id, text, type, date, created_at
FROM thoughts
WHERE type != 'morning' OR type IS NULL
LIMIT 10;