# Google OAuth 설정 가이드

Push Myself 앱에서 Google 로그인 기능을 활성화하려면 다음 단계를 따라주세요.

## 📋 필요한 작업

### 1. Google Cloud Console 설정

#### 1.1 Google Cloud Console 접속
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다
2. 새 프로젝트를 생성하거나 기존 프로젝트를 선택합니다

#### 1.2 Google+ API 활성화
1. 좌측 메뉴에서 `APIs & Services` > `Library` 선택
2. `Google+ API`를 검색하고 활성화
3. `Google Identity Services`도 활성화

#### 1.3 OAuth 2.0 클라이언트 ID 생성
1. 좌측 메뉴에서 `APIs & Services` > `Credentials` 선택
2. `+ CREATE CREDENTIALS` > `OAuth client ID` 클릭
3. Application type을 `Web application`으로 선택
4. 다음 정보를 입력:

**Name**: `Push Myself OAuth Client`

**Authorized JavaScript origins** (개발환경):
```
http://localhost:3000
https://localhost:3000
```

**Authorized redirect URIs**:
```
https://[YOUR-SUPABASE-PROJECT-REF].supabase.co/auth/v1/callback
```

> ⚠️ `[YOUR-SUPABASE-PROJECT-REF]`는 Supabase 프로젝트의 실제 참조 ID로 교체해야 합니다.
> Supabase 대시보드 > Settings > General에서 확인할 수 있습니다.

#### 1.4 운영환경 설정 (배포 시)
배포된 도메인에 대해서도 추가 설정이 필요합니다:

**Authorized JavaScript origins** (운영환경):
```
https://your-domain.com
https://www.your-domain.com
```

### 2. Supabase 설정

#### 2.1 Supabase 대시보드 접속
1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 해당 프로젝트 선택

#### 2.2 Google Provider 활성화
1. 좌측 메뉴에서 `Authentication` > `Providers` 선택
2. `Google` 프로바이더를 찾아서 활성화
3. Google Cloud Console에서 생성한 정보를 입력:
   - **Client ID**: Google OAuth 클라이언트 ID
   - **Client Secret**: Google OAuth 클라이언트 시크릿

#### 2.3 Site URL 설정
1. `Authentication` > `Settings` 선택
2. **Site URL**을 설정:
   - 개발환경: `http://localhost:3000`
   - 운영환경: `https://your-domain.com`

#### 2.4 Redirect URLs 설정
다음 URL들을 **Redirect URLs**에 추가:
```
http://localhost:3000/**
https://your-domain.com/**
```

### 3. 데이터베이스 스키마 적용

프로젝트에 포함된 `database_schema_auth.sql` 파일을 Supabase에서 실행:

1. Supabase 대시보드 > `SQL Editor` 이동
2. `database_schema_auth.sql` 파일의 내용을 복사하여 붙여넣기
3. `RUN` 버튼 클릭하여 실행

이 스크립트는 다음을 포함합니다:
- ✅ 사용자별 데이터 분리를 위한 `user_id` 필드 추가
- ✅ Row Level Security (RLS) 정책 설정
- ✅ 인덱스 및 트리거 생성
- ✅ 3-3-3 시스템 관련 함수들

### 4. 환경 변수 설정

프로젝트 루트의 `.env.local` 파일을 생성하고 다음 변수들을 설정:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 기타 환경 변수 (필요시)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> 📍 Supabase 대시보드 > Settings > API에서 URL과 anon key를 확인할 수 있습니다.

## 🔧 테스트 방법

### 개발환경에서 테스트
1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 `http://localhost:3000` 접속
3. 우측 상단의 `로그인` 버튼 클릭
4. `Google로 로그인` 버튼 클릭
5. Google 계정으로 로그인 진행

### 확인 사항
- ✅ Google 로그인 팝업이 정상적으로 열리는가?
- ✅ 로그인 완료 후 사용자 프로필이 표시되는가?
- ✅ "클라우드 동기화 활성화" 상태가 표시되는가?
- ✅ 로컬 데이터가 사용자 계정으로 마이그레이션되는가?

## 🚨 문제 해결

### 일반적인 오류들

#### 1. "redirect_uri_mismatch" 오류
- Google Cloud Console의 **Authorized redirect URIs**에 올바른 Supabase 콜백 URL이 등록되었는지 확인
- URL이 정확히 일치하는지 확인 (마지막 슬래시 등)

#### 2. "Origin mismatch" 오류
- Google Cloud Console의 **Authorized JavaScript origins**에 현재 도메인이 등록되었는지 확인

#### 3. 로그인 후 데이터가 보이지 않음
- Supabase RLS 정책이 올바르게 설정되었는지 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

#### 4. "Invalid provider" 오류
- Supabase에서 Google provider가 활성화되었는지 확인
- Client ID와 Client Secret이 올바르게 입력되었는지 확인

### 로그 확인
브라우저 개발자 도구의 콘솔에서 다음과 같은 로그들을 확인:
- `Supabase 클라이언트가 성공적으로 생성되었습니다.`
- `Supabase에서 사용자별 전체 데이터 로드 시작...`
- `로컬 데이터를 사용자 계정으로 마이그레이션 중...`

## 🔒 보안 고려사항

### 환경 변수 보안
- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- 운영환경에서는 안전한 환경 변수 관리 시스템 사용

### Supabase RLS
- Row Level Security가 모든 테이블에 활성화되어 있어 사용자는 자신의 데이터만 접근 가능
- 정책 수정 시 보안 검토 필수

### Google OAuth 스코프
현재 앱에서 요청하는 Google 권한:
- 기본 프로필 정보 (이름, 이메일)
- 프로필 사진 (선택사항)

## 📞 지원

설정 과정에서 문제가 발생하면:
1. 브라우저 개발자 도구의 콘솔 로그 확인
2. Supabase 대시보드의 Auth 로그 확인
3. 이 가이드의 단계를 다시 확인

---

✨ 설정이 완료되면 사용자들이 Google 계정으로 로그인하여 모든 기기에서 동기화된 데이터를 사용할 수 있습니다!