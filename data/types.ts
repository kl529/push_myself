// 데이터 타입 정의
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  order_index: number; // Supabase 필드 (primary)
  order?: number; // 호환성을 위한 필드 (order_index와 동일한 값)
  type?: 'todo' | 'habit' | 'goal' | 'reminder';
  link?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Thought {
  id?: number; // 선택적으로 변경
  text: string;
  type?: 'morning' | 'daily' | 'idea';
  date: string;
  // timestamp 필드 제거 - Supabase에서 created_at, updated_at 사용
}

export interface DailyReport {
  date: string;
  summary: string;
  gratitude: string;
  lessons_learned: string;
  tomorrow_goals: string;
  mood: '매우좋음' | '좋음' | '보통' | '나쁨' | '매우나쁨'; // mood 값 수정
  created_at: string;
  updated_at: string;
}

export interface Diary {
  daily_report_id: number;
  content: string;
  category: string; // 추가
  created_at: string;
  updated_at: string;
}

// 기존 호환성을 위한 타입들
export interface CompletedItem {
  id: number;
  text: string;
  category: string;
  completedAt: string;
}

export interface ThoughtItem {
  id: number;
  text: string;
  timestamp: string;
}

export interface MustDoItem {
  id: number;
  text: string;
  completed: boolean;
  order: number;
}

// 새로운 구조의 DayData (legacy 필드들과 호환성 유지)
export interface DayData {
  todos: Todo[];
  thoughts: Thought[];
  dailyReport: DailyReport;
  diary: Diary[];
}

export interface Data {
  [date: string]: DayData;
}

export interface Stats {
  totalDays: number;
  completedTodos: number;
  averageMood: string;
}

export interface MoodData {
  date: string;
  mood: number;
  todos: number;
} 

// 주간 회고 인터페이스
export interface WeeklyReport {
  id?: number;
  week_start_date: string; // 주의 시작 날짜 (월요일)
  week_end_date: string;   // 주의 마지막 날짜 (일요일)
  what_went_well: string;  // 이번 주에 잘한 것
  what_didnt_go_well: string; // 아쉬운 점
  what_learned: string;    // 배운 점 / 인사이트
  next_week_goals: string; // 다음 주 목표 / 전략
  weekly_summary: string;  // 한 줄 회고
  created_at: string;
  updated_at: string;
}

// 자기 암시 설정 인터페이스
export interface SelfAffirmation {
  id?: number;
  affirmation_text: string; // 자기 암시 문구
  is_active: boolean;       // 현재 사용 중인지
  display_order: number;    // 표시 순서
  created_at: string;
  updated_at: string;
}

// 확장된 통계를 위한 주간 데이터
export interface WeeklyStats {
  week_start_date: string;
  daily_reports_written: number;    // 작성한 데일리 리포트 수
  completed_tasks: number;          // 완료한 작업 수
  mood_average: number;             // 평균 기분 (1-5)
  thoughts_count: number;           // 생각 기록 수
}
