// 데이터 타입 정의
export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low'; // 중요도
  order: number; // 순서
  link?: string; // 링크
  description?: string; // 설명
}

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

export interface DayData {
  todos: Todo[];
  completedItems: CompletedItem[]; // 했던 일들 아이템 추가
  dailyThought: string;
  quote: string;
  diary: string;
  morningThoughts: ThoughtItem[]; // 아침 생각들을 아이템 형식으로
  mood: number;
  tasksReview: string;
  dailySummary: string;
  gratitude: string; // 감사일기 추가
  selfAffirmation: string;
  mustDo: MustDoItem[]; // 체크 가능한 형태로 변경
  dailyIdeas: ThoughtItem[]; // 하루 아이디어들을 아이템 형식으로
}

export interface Data {
  [date: string]: DayData;
}

export interface Stats {
  totalDays: number;
  completedTodos: number;
  completedItems: number;
  averageMood: string;
}

export interface MoodData {
  date: string;
  mood: number;
  todos: number;
  completed: number;
  completedItems: number;
} 