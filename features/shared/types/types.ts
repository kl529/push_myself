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
  completedItems?: CompletedItem[]; // 기존 호환성을 위한 필드
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

export interface WeeklyReport {
  id?: number;
  week_start_date: string;
  week_end_date: string;
  what_went_well: string;
  what_didnt_go_well: string;
  what_learned: string;
  next_week_goals: string;
  weekly_summary: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyStats {
  id?: number;
  week_start_date: string;
  week_end_date: string;
  completed_tasks: number;
  total_tasks: number;
  mood_average: number;
  thoughts_count: number;
  total_diary_entries: number;
  daily_reports_written: number;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
} 