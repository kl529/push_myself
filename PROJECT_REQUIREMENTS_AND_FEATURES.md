# Push Myself (나를 넘어라) - Project Requirements & Features Documentation

## 📋 프로젝트 개요 (Project Overview)

**Push Myself (나를 넘어라)**는 한국어 기반의 Progressive Web App (PWA)으로, 개인 성장과 자기계발을 지원하는 통합 관리 시스템입니다. 사용자가 일상의 목표를 설정하고, 생각을 정리하며, 일기를 작성하고, 통계를 통해 자신의 성장을 추적할 수 있도록 도와줍니다.

### 🎯 주요 목적
- **목표 관리**: 일일 투두리스트와 목표 설정
- **생각 정리**: 아침 생각과 하루 아이디어 기록
- **일기 작성**: 하루 요약, 감사 일기, 학습 내용, 기분 기록
- **성장 추적**: 통계와 분석을 통한 개인 발전 모니터링

---

## 🏗️ 기술 아키텍처 (Technical Architecture)

### Frontend Framework
- **Next.js 15.4.5** (React 19.1.0)
- **TypeScript 5** (완전한 타입 안전성)
- **Tailwind CSS 4** (반응형 UI 디자인)
- **PWA 지원** (next-pwa)

### Backend & Database
- **Supabase** (PostgreSQL 기반 BaaS)
- **localStorage** (오프라인 백업 및 폴백)
- **듀얼 스토리지 시스템** (온라인/오프라인 지원)

### UI/UX Libraries
- **Lucide React** (아이콘 시스템)
- **@dnd-kit** (드래그 앤 드롭 기능)
- **한국어 인터페이스** (완전 현지화)

---

## 📁 프로젝트 구조 (Project Structure)

### 🔄 Feature-Based Architecture
```
features/
├── todos/           # 투두 관리 기능
│   ├── components/  # TodoTab.tsx
│   ├── services/    # todosService.ts
│   └── schemas/     # todo_schema.sql
├── thoughts/        # 생각 정리 기능
│   ├── components/  # ThoughtsTab.tsx
│   ├── services/    # thoughtsService.ts
│   └── schemas/     # thoughts_schema.sql
├── diary/           # 일기 기능
│   ├── components/  # DiaryTab.tsx
│   ├── services/    # dailyReportService.ts
│   └── schemas/     # daily_report_schema.sql
└── shared/          # 공통 기능
    ├── components/  # DashboardTab.tsx, StatsTab.tsx
    ├── services/    # dataService.ts, supabase.ts
    ├── types/       # types.ts
    └── data/        # categories.ts, quotes.ts, utils.ts
```

### 🗂️ Core Directories
```
├── app/             # Next.js App Router
├── components/      # 메인 컴포넌트들
├── data/           # 레거시 데이터 파일들
├── lib/            # 유틸리티 및 서비스
├── public/         # 정적 파일들 (PWA 리소스 포함)
├── supabase/       # 데이터베이스 스키마
└── types/          # TypeScript 타입 정의
```

---

## 🚀 핵심 기능 (Core Features)

### 1. 📋 투두 관리 시스템 (Todo Management)

#### 주요 기능
- **드래그 앤 드롭** 순서 변경
- **우선순위 설정** (높음/보통/낮음)
- **완료 상태 토글**
- **실시간 Supabase 동기화**

#### 기술적 특징
```typescript
interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  order_index: number;
  type?: 'todo' | 'habit' | 'goal' | 'reminder';
  created_at: string;
  updated_at: string;
}
```

#### 데이터베이스 스키마
- **투두 테이블**: 날짜별 인덱싱, 순서 제약조건
- **자동 타임스탬프**: 생성/수정 시간 자동 관리
- **복합 인덱스**: 성능 최적화

### 2. 🧠 생각 정리 시스템 (Thoughts Management)

#### 구성 요소
- **아침 생각** (Morning Thoughts): 하루 시작 전 생각 정리
- **하루 아이디어** (Daily Ideas): 일상에서 떠오르는 아이디어들

#### 데이터 구조
```typescript
interface Thought {
  id?: number;
  text: string;
  type?: 'morning' | 'daily' | 'idea';
  date: string;
}
```

### 3. 📖 일기 시스템 (Diary System)

#### 일기 구성 요소
1. **있었던 일들**: 하루 중 완료한 활동들 (카테고리별 분류)
2. **하루 한줄 요약**: 하루를 한 문장으로 정리
3. **오늘 배운 것**: 새롭게 학습하거나 깨달은 내용
4. **감사 일기**: 하루 중 감사했던 일
5. **내일의 나에게**: 다음 날을 위한 메시지
6. **오늘의 기분**: 5단계 기분 상태 (😢😕😐🙂😊)

#### 카테고리 시스템
```typescript
const itemCategories = [
  { id: 'work', name: '업무/공부', icon: '💼' },
  { id: 'health', name: '건강/운동', icon: '💪' },
  { id: 'hobby', name: '취미/여가', icon: '🎨' },
  { id: 'social', name: '사교/관계', icon: '👥' },
  { id: 'household', name: '가사/정리', icon: '🏠' },
  { id: 'selfcare', name: '자기계발', icon: '🌟' },
  { id: 'other', name: '기타', icon: '📝' }
];
```

#### 기분 상태 시스템
- **한국어 기반**: '매우나쁨', '나쁨', '보통', '좋음', '매우좋음'
- **시각적 표현**: 이모지를 통한 직관적 인터페이스
- **통계 활용**: 장기간 기분 변화 추적

### 4. 📊 대시보드 (Dashboard)

#### 구성 요소
- **자기 암시 문구**: 동기부여 메시지
- **오늘의 명언**: 일일 영감 제공
- **빠른 통계**: 주요 지표 한눈에 보기

### 5. 📈 통계 분석 (Statistics & Analytics)

#### 제공 통계
- **총 활동 일수**: 앱 사용 지속성 측정
- **완료한 투두 수**: 생산성 지표
- **평균 기분**: 웰빙 지표
- **활동 패턴**: 날짜별 활동량 시각화

---

## 💾 데이터 관리 시스템 (Data Management System)

### 🔄 듀얼 스토리지 전략

#### 1. Supabase (Primary Storage)
- **실시간 동기화**: 클라우드 기반 데이터 저장
- **다중 기기 지원**: 어디서든 데이터 접근
- **자동 백업**: 데이터 손실 방지

#### 2. localStorage (Fallback Storage)
- **오프라인 지원**: 네트워크 없이도 사용 가능
- **빠른 응답**: 로컬 데이터 즉시 접근
- **자동 마이그레이션**: Supabase 연결 시 자동 동기화

### 📊 데이터베이스 스키마

#### Todos 테이블
```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0),
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  order_index INTEGER DEFAULT 0 NOT NULL,
  type TEXT DEFAULT 'todo' CHECK (type IN ('todo', 'habit', 'goal', 'reminder')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Daily Report 테이블
```sql
CREATE TABLE daily_report (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  summary TEXT DEFAULT '',
  gratitude TEXT DEFAULT '',
  lessons_learned TEXT DEFAULT '',
  tomorrow_goals TEXT DEFAULT '',
  mood TEXT DEFAULT '보통' CHECK (mood IN ('매우좋음', '좋음', '보통', '나쁨', '매우나쁨')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Diary 테이블
```sql
CREATE TABLE diary (
  id SERIAL PRIMARY KEY,
  daily_report_id INTEGER REFERENCES daily_report(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Thoughts 테이블
```sql
CREATE TABLE thoughts (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL CHECK (LENGTH(text) > 0),
  type TEXT DEFAULT 'idea' CHECK (type IN ('morning', 'daily', 'idea')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🌐 Progressive Web App (PWA) 기능

### 📱 PWA 특징
- **설치 가능**: 홈 스크린에 앱처럼 설치
- **오프라인 작동**: Service Worker를 통한 캐싱
- **반응형 디자인**: 모바일/데스크톱 최적화
- **푸시 알림 준비**: 향후 알림 기능 확장 가능

### 🎨 UI/UX 디자인
- **한국어 최적화**: 완전한 한국어 인터페이스
- **직관적 네비게이션**: 탭 기반 구조
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원
- **다크/라이트 모드**: 사용자 선호도에 맞는 테마

---

## 🔧 개발 환경 설정 (Development Setup)

### 필수 요구사항
- **Node.js** 18+ 
- **npm** 또는 **yarn**
- **Supabase 계정** (선택사항)

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 린트 검사
npm run lint

# Supabase 설정 안내
npm run supabase:setup
```

### 환경 변수 설정 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 📚 API 및 서비스 (API & Services)

### 🔌 서비스 레이어 구조

#### todosService.ts
```typescript
// 투두 관련 Supabase 작업
export const addTodoSupabase = async (date: string, todoData: Partial<Todo>)
export const updateTodoSupabase = async (id: number, updates: Partial<Todo>)
export const deleteTodoSupabase = async (id: number)
export const reorderTodosSupabase = async (todos: Todo[])
```

#### thoughtsService.ts
```typescript
// 생각 정리 관련 Supabase 작업
export const addThoughtSupabase = async (date: string, thoughtData: Partial<Thought>)
export const updateThoughtsInSupabase = async (date: string, thoughts: Thought[])
```

#### dailyReportService.ts
```typescript
// 일일 리포트 및 일기 관련 작업
export const updateDailyReport = async (date: string, updates: Partial<DailyReport>)
export const updateDiary = async (date: string, updates: Partial<Diary>)
```

### 🔄 데이터 플로우
```
User Action → Component Handler → Service Layer → Supabase/localStorage → State Update
                                              ↓
                                        Real-time Sync
```

---

## 🚀 배포 및 운영 (Deployment & Operations)

### 배포 플랫폼
- **Vercel** (권장): Next.js 최적화
- **Netlify**: 대안 플랫폼
- **자체 서버**: Docker 컨테이너 지원

### 성능 최적화
- **코드 스플리팅**: 필요시 로딩
- **이미지 최적화**: Next.js Image 컴포넌트
- **PWA 캐싱**: Service Worker 활용
- **데이터베이스 인덱싱**: 쿼리 성능 향상

---

## 🔮 향후 개발 계획 (Future Enhancements)

### 1단계: 기능 확장
- [ ] **푸시 알림**: 투두 리마인더
- [ ] **데이터 내보내기**: JSON/CSV 형식
- [ ] **테마 시스템**: 다크/라이트 모드 토글
- [ ] **검색 기능**: 전체 데이터 검색

### 2단계: 고급 기능
- [ ] **AI 분석**: 패턴 인식 및 제안
- [ ] **목표 추적**: 장기 목표 관리
- [ ] **습관 트래커**: 반복 활동 추적
- [ ] **팀 기능**: 공유 목표 및 협업

### 3단계: 확장
- [ ] **모바일 앱**: React Native 포팅
- [ ] **웹 확장 프로그램**: 브라우저 통합
- [ ] **API 개방**: 서드파티 통합
- [ ] **다국어 지원**: 영어 및 기타 언어

---

## 🛠️ 개발 가이드라인 (Development Guidelines)

### 코딩 표준
- **TypeScript**: 모든 컴포넌트 타입 안전성
- **ESLint**: 코드 품질 관리
- **Prettier**: 일관된 코드 포매팅
- **한국어 주석**: 복잡한 로직 설명

### Git 워크플로
- **Feature Branch**: 기능별 브랜치
- **Pull Request**: 코드 리뷰 필수
- **Semantic Commits**: 의미있는 커밋 메시지
- **CI/CD**: 자동화된 테스트 및 배포

### 테스트 전략
- **단위 테스트**: Jest + Testing Library
- **통합 테스트**: API 및 데이터베이스 연결
- **E2E 테스트**: Playwright (계획)
- **PWA 테스트**: Lighthouse 성능 측정

---

## 📞 지원 및 기여 (Support & Contributing)

### 문제 보고
GitHub Issues를 통해 버그 리포트 및 기능 요청을 해주세요.

### 기여 방법
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### 라이선스
MIT License - 자유롭게 사용, 수정, 배포 가능

---

## 📈 성과 지표 (Success Metrics)

### 사용자 참여도
- **일일 활성 사용자 (DAU)**
- **투두 완료율**
- **연속 사용 일수**
- **기능별 사용률**

### 기술적 지표
- **페이지 로드 속도**
- **PWA 점수** (Lighthouse)
- **오프라인 작동률**
- **데이터 동기화 성공률**

---

*이 문서는 Push Myself 프로젝트의 현재 상태를 반영하며, 개발 진행에 따라 지속적으로 업데이트됩니다.*

**버전**: 1.0.0  
**최종 업데이트**: 2025-01-27  
**작성자**: Claude Code Assistant