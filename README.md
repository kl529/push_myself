# Push Myself (나를 넘어라) 🚀

**매일 1% 성장하는 당신을 위한 3-3-3 시스템 기반 자기계발 추적 앱**

![PWA](https://img.shields.io/badge/PWA-Enabled-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🎯 프로젝트 소개

Push Myself는 **"본질에 집중하자"**는 철학 하에 개발된 개인 성장 추적 PWA입니다. 복잡한 기능들을 걷어내고 **3-3-3 시스템**에만 집중하여 매일의 성장을 체계적으로 관리할 수 있습니다.

### ✨ 핵심 철학: 3-3-3 시스템
- **DO**: 매일 3개의 핵심 업무
- **THINK**: 매일 3개의 생각 & 배운점  
- **RECORD**: 3가지 핵심 기록
  - 오늘 한줄 요약
  - 감사일기 
  - 내일 집중할 일

## 🔥 주요 기능

### 📱 DO - 핵심 업무 관리
- **3개 제한**: 정말 중요한 일에만 집중
- **우선순위 설정**: 높음/보통/낮음 단계
- **드래그 앤 드롭**: 직관적인 순서 조정
- **상세 정보**: 링크, 설명 추가 가능
- **자기암시**: 개인 맞춤형 동기부여 메시지

### 💭 THINK - 생각 & 배운점
- **3개 제한**: 핵심적인 인사이트만 기록
- **간단한 UI**: 빠른 입력과 삭제
- **순서 표시**: 생각의 우선순위 확인

### 📝 RECORD - 일일 기록
- **오늘 한줄**: 하루를 한 문장으로 요약
- **감사일기**: 감사했던 일 기록
- **내일 집중**: 다음 날 가장 중요한 일
- **즉시 저장**: 입력과 동시에 자동 저장

### 📊 STATS - 성장 시각화
- **연속 달성 일수**: 3-3-3 완료 기록 추적
- **GitHub 스타일 잔디**: 1년 단위 활동 현황
- **클릭으로 상세보기**: 특정 날짜 기록 확인
- **성장 지표**: 총 활동일수, 오늘 현황 등

## 📱 PWA 기능

이 앱은 PWA(Progressive Web App)로 제작되어 다음과 같은 기능을 제공합니다:

- **홈 화면 설치**: 모바일 기기의 홈 화면에 앱 아이콘으로 설치 가능
- **오프라인 지원**: 인터넷 연결 없이도 기본 기능 사용 가능
- **앱과 같은 경험**: 네이티브 앱과 유사한 사용자 경험
- **자동 업데이트**: 새로운 버전이 자동으로 업데이트됨

## 🛠️ 기술 스택

### Frontend
- **Next.js 15.4.5** - React 기반 풀스택 프레임워크
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 퍼스트 CSS
- **PWA** - 앱 설치 및 오프라인 지원

### Backend & Database  
- **Supabase** - 실시간 데이터베이스 및 인증
- **PostgreSQL** - 안정적인 관계형 데이터베이스
- **localStorage** - 오프라인 폴백 스토리지

### UI/UX
- **Lucide React** - 일관된 아이콘 시스템
- **DnD Kit** - 드래그 앤 드롭 인터랙션
- **반응형 디자인** - 모든 디바이스 지원

## 🚀 시작하기

### 1. 설치 및 실행
```bash
# 레포지토리 클론
git clone https://github.com/yourusername/push-myself.git
cd push-myself

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. 환경 설정 (선택사항)
클라우드 동기화를 원하는 경우:
```bash
# .env.local 파일 생성
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 데이터베이스 설정 (Supabase 사용 시)
```bash
# 스키마 확인 및 설정 가이드
npm run supabase:setup
```

## 📱 PWA 설치

### 모바일 (iOS/Android)
1. 브라우저에서 앱 접속
2. "홈 화면에 추가" 선택
3. 네이티브 앱처럼 사용

### 데스크톱 (Chrome/Edge)
1. 주소표시줄 우측의 설치 아이콘 클릭
2. "설치" 확인
3. 독립 앱으로 실행

## 💡 사용 방법

### 일일 루틴
1. **아침**: DO 탭에서 3개 핵심 업무 설정
2. **하루 중**: THINK 탭에서 인사이트 기록
3. **저녁**: RECORD 탭에서 하루 정리
4. **주기적으로**: STATS에서 성장 현황 확인

### 팁
- **3개 제한을 지키세요**: 더 많은 것보다 집중이 중요
- **매일 기록하세요**: 꾸준함이 성장의 핵심
- **감사 표현**: 긍정적 마인드셋 형성
- **내일 준비**: 다음 날 명확한 목표 설정

## 📊 데이터 관리

### 자동 백업
- **Supabase 연동**: 클라우드 자동 동기화
- **localStorage**: 오프라인 상태에서도 안전한 로컬 저장
- **실시간 저장**: 입력과 동시에 자동 저장

### 데이터 이동
- 환경변수 설정 시 localStorage → Supabase 자동 마이그레이션
- 계정 간 데이터 이동 지원

## 🌟 특징

### 🎨 사용자 경험
- **직관적 UI**: 복잡함 없는 깔끔한 인터페이스
- **빠른 응답**: 즉시 반응하는 사용자 인터랙션
- **일관된 디자인**: 모든 화면에서 통일된 경험

### 📱 접근성
- **반응형**: 모바일/태블릿/데스크톱 최적화
- **오프라인**: 네트워크 없이도 기본 기능 사용 가능
- **설치 가능**: PWA로 네이티브 앱 경험

### 🔒 개인정보
- **로컬 우선**: 개인정보는 기본적으로 로컬에 저장
- **선택적 클라우드**: 원하는 경우에만 클라우드 동기화
- **데이터 소유권**: 사용자가 완전히 통제

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사인사

- [Next.js](https://nextjs.org/) - 강력한 React 프레임워크
- [Supabase](https://supabase.com/) - 훌륭한 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - 효율적인 스타일링
- [Lucide](https://lucide.dev/) - 아름다운 아이콘

---

**매일 1% 성장하여 1년 후 37배 더 나은 자신을 만나보세요! 🌱**

Made with ❤️ by [Your Name]
