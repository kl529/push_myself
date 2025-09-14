// 3-3-3 시스템 타입 정의
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  order_index: number;
  link?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Thought {
  id?: number;
  text: string;
  type: 'morning'; // 3-3-3 구조에서는 morning만 사용
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface DailyReport {
  date: string;
  summary: string; // 오늘 한줄
  gratitude: string; // 감사일기
  tomorrow_goals: string; // 내일 집중
  mood: '매우좋음' | '좋음' | '보통' | '나쁨' | '매우나쁨';
  created_at?: string;
  updated_at?: string;
}

// 3-3-3 구조에 맞는 DayData
export interface DayData {
  todos: Todo[]; // DO: 최대 3개
  thoughts: Thought[]; // THINK: 최대 3개 (morning 타입만)
  dailyReport: DailyReport; // RECORD: 3개 필드 (summary, gratitude, tomorrow_goals)
  diary?: any[]; // 호환성을 위한 필드 - 향후 제거 예정
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