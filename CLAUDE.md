# CLAUDE.md

이 파일은 Claude Code가 이 프로젝트를 효율적으로 이해하고 작업할 수 있도록 하는 종합적인 가이드입니다.

## 📋 프로젝트 개요

### 🎯 목적
Push Myself는 **3-3-3 시스템** 기반의 체계적인 자기계발 PWA입니다.
- **DO**: 매일 3개 핵심 할일 (우선순위별 관리)
- **THINK**: 매일 3개 생각&배운점 (성찰과 학습)
- **RECORD**: 3가지 핵심 기록 (오늘 한줄, 감사일기, 내일 집중)

### 🏗️ 기술 스택
- **Frontend**: Next.js 15.4.5 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + RLS + Auth), localStorage (폴백)
- **Authentication**: Google OAuth 2.0 (PKCE flow)
- **PWA**: Service Worker, Web App Manifest
- **UI**: Lucide React, @dnd-kit (드래그앤드롭)
- **Deployment**: Vercel (HTTPS 필수)

### 🗂️ 아키텍처
```
/features          # 기능별 모듈화
  /auth            # 인증 (Google OAuth, Context)
  /shared          # 공통 타입, 서비스, 컴포넌트
  /dashboard       # 자기암시, 명언
  /todos           # DO 탭 (할일 관리)
  /thoughts        # THINK 탭 (생각&배운점)
  /diary           # RECORD 탭 (일일 기록)
  /stats           # STATS 탭 (성장 시각화)
/components        # 공통 UI 컴포넌트
/app              # Next.js 15 App Router
/public           # 정적 파일 (PWA 매니페스트, 아이콘)
```

## 🎨 개발 가이드라인

### 💻 코딩 스타일
```typescript
// ✅ Good - 명확한 함수명과 타입
const addMorningThought = (text: string): Thought => {
  return {
    id: Date.now(),
    text: text.trim(),
    type: 'morning',
    date: new Date().toISOString().split('T')[0]
  };
};

// ❌ Bad - 모호한 명명과 타입 누락
const add = (t) => ({ id: Date.now(), text: t, type: 'morning' });
```

### 📁 폴더 구조 규칙
- **Features**: 기능별로 독립적인 폴더
- **Components**: UI 컴포넌트만 포함
- **Services**: 비즈니스 로직과 데이터 처리
- **Types**: TypeScript 인터페이스 정의
- **Schemas**: 데이터베이스 스키마

### 🏷️ 파일 명명 규칙
```
TodoTab.tsx         # React 컴포넌트 (PascalCase)
todosService.ts     # 서비스 파일 (camelCase + Service)
types.ts           # 타입 정의 (소문자)
todo_schema.sql     # 스키마 파일 (snake_case)
```

## Key Commands

### Development Commands
```bash
npm run dev          # Start development server (포트 3000/3002)
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run supabase:setup  # Display Supabase setup instructions
```

## 🧠 핵심 비즈니스 로직

### 3-3-3 제한 시스템
```typescript
// 각 기능은 3개로 제한됩니다
const MAX_TODOS = 3;
const MAX_THOUGHTS = 3;
const RECORD_FIELDS = ['summary', 'gratitude', 'tomorrow_goals']; // 3개
```

### 데이터 흐름
```
User Input → MainPage Handler → updateCurrentDayData → 
Supabase Service → Local State Update
                ↓
         localStorage (폴백)
```

### 타입 시스템
```typescript
// 핵심 데이터 구조
interface DayData {
  todos: Todo[];           // DO: 최대 3개
  thoughts: Thought[];     // THINK: 최대 3개 (morning 타입만)
  dailyReport: DailyReport; // RECORD: 3개 필드
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  order_index: number;
  // 간소화: type, order 제거
}
```

## ⚠️ 주의사항

### 🚨 중요한 제약조건
1. **3개 제한**: 각 카테고리는 반드시 3개로 제한
2. **morning 타입만**: thoughts는 'morning' 타입만 사용
3. **즉시 저장**: 모든 입력은 실시간으로 저장
4. **날짜 기반**: 모든 데이터는 날짜(YYYY-MM-DD)로 구분
5. **인증 보안**: PKCE flow 사용, 토큰 URL 노출 방지
6. **RLS 정책**: 사용자별 데이터 격리 (Supabase)

### 🔄 상태 관리 패턴
```typescript
// ✅ 올바른 상태 업데이트
const updateCurrentDayData = (updates: Partial<DayData>) => {
  setCurrentDayData(prev => ({ ...prev, ...updates }));
  // Supabase 저장 로직...
};

// ❌ 직접 상태 변경 금지
currentDayData.todos.push(newTodo); // 이렇게 하지 마세요!
```

### 📱 PWA 고려사항
- 오프라인 동작 지원 필수
- localStorage 폴백 구현 (Supabase 연결 실패 시)
- Service Worker 자동 등록 (app/layout.tsx)
- HTTPS 배포 필수 (PWA 설치용)
- 반응형 디자인 (모바일 우선)

## 🔧 자주 사용하는 패턴

### 1. 컴포넌트 구조
```typescript
interface ComponentProps {
  dayData: DayData;
  updateCurrentDayData: (updates: Partial<DayData>) => void;
  showWarning: (message: string) => void;
}

const Component: React.FC<ComponentProps> = ({
  dayData, updateCurrentDayData, showWarning
}) => {
  // 3개 제한 체크
  const items = dayData.items?.filter(item => item.type === 'target') || [];
  if (items.length >= 3) {
    showWarning('최대 3개까지만 가능합니다.');
    return;
  }
  
  // 즉시 업데이트
  updateCurrentDayData({ 
    items: [...items, newItem] 
  });
};
```

### 2. 서비스 레이어 패턴
```typescript
// Supabase 우선, localStorage 폴백
export const saveData = async (data: any) => {
  try {
    if (supabase) {
      await supabase.from('table').insert(data);
    } else {
      localStorage.setItem('key', JSON.stringify(data));
    }
  } catch (error) {
    // 폴백으로 localStorage 사용
    localStorage.setItem('key', JSON.stringify(data));
  }
};
```

### 3. 3개 제한 체크 패턴
```typescript
const checkLimitAndAdd = (items: any[], newItem: any, maxCount: number = 3) => {
  if (items.length >= maxCount) {
    showWarning(`최대 ${maxCount}개까지만 가능합니다.`);
    return false;
  }
  return true;
};
```

## 🚀 개발 워크플로우

### 🌿 브랜치 전략
```
main              # 프로덕션 브랜치
├── feature/*     # 새 기능 개발
├── bugfix/*      # 버그 수정  
└── hotfix/*      # 긴급 수정
```

### 🧪 테스트 방법
```bash
# 개발 서버 실행
npm run dev

# 린트 체크
npm run lint

# 빌드 테스트
npm run build

# PWA 테스트 (HTTPS 필요)
# Chrome DevTools > Application > Service Workers
```

### 📊 테스트 체크리스트
- [ ] 3-3-3 제한이 올바르게 작동하는가?
- [ ] 온라인/오프라인 모드 모두 정상인가?
- [ ] 드래그앤드롭이 순서를 올바르게 저장하는가?
- [ ] PWA 설치가 정상적으로 작동하는가?
- [ ] 모든 디바이스에서 반응형이 작동하는가?

### 🚢 배포 프로세스
```bash
# 1. 빌드 확인
npm run build

# 2. 환경변수 설정 (.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 3. Vercel/Netlify 배포
# PWA 기능을 위해 HTTPS 필수
```

## 📚 데이터베이스 스키마

### 핵심 테이블
```sql
-- todos: DO 탭 데이터
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  order_index INTEGER DEFAULT 0,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- thoughts: THINK 탭 데이터  
CREATE TABLE thoughts (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'morning', -- 고정값
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- daily_reports: RECORD 탭 데이터
CREATE TABLE daily_reports (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  summary TEXT,     -- 오늘 한줄
  gratitude TEXT,   -- 감사일기
  tomorrow_goals TEXT, -- 내일 집중
  mood TEXT DEFAULT '보통',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 개발 팁

### 💡 빠른 작업을 위한 팁
1. **컴포넌트 수정 시**: 해당 feature 폴더 내에서만 작업
2. **타입 변경 시**: `features/shared/types/types.ts` 먼저 수정
3. **데이터 구조 변경**: 마이그레이션 스크립트 필요 여부 확인
4. **UI 수정**: Tailwind 클래스 활용, 일관된 디자인 유지

### 🔍 디버깅 가이드
```typescript
// 상태 디버깅
console.log('Current DayData:', currentDayData);

// Supabase 연결 확인
console.log('Supabase connected:', !!supabase);

// localStorage 데이터 확인
console.log('Local data:', localStorage.getItem('push-myself-data'));
```

### 📝 커밋 메시지 컨벤션
```
feat: add drag and drop to todo list
fix: resolve PWA installation issue  
refactor: simplify data structure for 3-3-3 system
docs: update README with setup instructions
style: improve mobile responsive design
```

## 🔄 마이그레이션 가이드

### localStorage → Supabase
```typescript
// 자동 마이그레이션 로직이 구현되어 있음
// .env.local 설정 시 자동으로 데이터 이동
```

### 스키마 업데이트
```bash
# 스키마 변경 시 실행
npm run supabase:setup
# 가이드에 따라 Supabase에서 수동 실행
```

---

이 가이드를 통해 Claude Code가 프로젝트를 완전히 이해하고 효율적으로 작업할 수 있습니다. 추가 질문이나 불명확한 부분이 있다면 언제든지 문의하세요!