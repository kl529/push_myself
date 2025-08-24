# Supabase 설정 가이드

이 프로젝트는 이제 Supabase를 사용하여 데이터를 저장합니다. 다음 단계를 따라 설정해주세요.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성합니다.
2. 프로젝트가 생성되면 `Settings` > `API`에서 다음 정보를 확인합니다:
   - Project URL
   - anon public key

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**중요**: 환경 변수가 설정되지 않으면 앱이 자동으로 로컬스토리지 모드로 전환됩니다.

## 3. 데이터베이스 스키마 생성

Supabase 대시보드의 `SQL Editor`에서 `supabase/sql` 파일의 내용을 실행하세요:

## 4. 데이터 마이그레이션

앱을 처음 실행하면 기존 로컬스토리지의 데이터가 자동으로 Supabase로 마이그레이션됩니다.

## 5. 보안 설정 (선택사항)

더 안전한 설정을 원한다면 RLS 정책을 수정할 수 있습니다:

```sql
-- 인증된 사용자만 접근 가능하도록 설정
CREATE POLICY "Enable read access for authenticated users" ON todos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON todos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON todos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 다른 테이블들도 동일하게 설정
CREATE POLICY "Enable read access for authenticated users" ON thoughts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON daily_report
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON diary
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 6. 문제 해결

### 데이터가 로드되지 않는 경우
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 프로젝트가 활성 상태인지 확인
- 브라우저 콘솔에서 오류 메시지 확인
- 환경 변수가 없으면 자동으로 로컬스토리지 모드로 전환됩니다

### 데이터 저장이 안 되는 경우
- RLS 정책이 올바르게 설정되었는지 확인
- Supabase API 키가 올바른지 확인
- Supabase 오류 시 자동으로 로컬스토리지로 폴백됩니다

### 환경 변수 오류
```
Error: 데이터 로드 중 오류: {}
```
이 오류가 발생하면:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수 값이 올바른지 확인
3. 앱을 재시작 (npm run dev)
4. 환경 변수가 없어도 앱이 정상 작동합니다 (로컬스토리지 모드)

## 7. 개발 모드

개발 중에는 `npm run dev` 명령어로 앱을 실행하세요. 환경 변수는 자동으로 로드됩니다.
