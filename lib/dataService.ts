import { supabase, isSupabaseAvailable } from './supabase';
import {
  DayData,
  Data,
  Stats,
  MoodData,
  DailyReport,
  Todo
} from '../features/shared/types/types';
import { updateTodosInSupabase } from '../features/todos/services/todosService';
import { updateThoughtsInSupabase } from '../features/thoughts/services/thoughtsService';
import { updateDailyReport as updateDailyReportService } from '../features/diary/services/dailyReportService';

// 새로운 데이터 구조 초기화
export const initializeData = (): DayData => ({
  todos: [],
  thoughts: [],
  dailyReport: {
    date: new Date().toISOString().split('T')[0],
    summary: '',
    gratitude: '',
    tomorrow_goals: '',
    mood: '보통',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  diary: []
});

// Supabase에서 데이터 로드 (todos와 thoughts만 활성화)
export const loadData = async (): Promise<Data> => {
  // Supabase가 사용 불가능한 경우 로컬스토리지에서 로드
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에서 데이터를 로드합니다.');
    return loadDataFromLocalStorage();
  }

  try {
    console.log('Supabase에서 전체 데이터 로드 시작...');
    
    // todos, thoughts, daily_reports 로드 (diary는 제거됨)
    const { data: todosData, error: todosError } = await supabase!.from('todos').select('*');
    const { data: thoughtsData } = await supabase!.from('thoughts').select('*');
    const { data: dailyReportData } = await supabase!.from('daily_reports').select('*');
    
    if (todosError) {
      console.error('Todos 로드 오류:', todosError.message);
      console.log('로컬스토리지에서 데이터를 로드합니다.');
      return loadDataFromLocalStorage();
    }

    console.log('Supabase 데이터 로드 결과:', {
      todos: todosData?.length || 0,
      thoughts: thoughtsData?.length || 0,
      dailyReports: dailyReportData?.length || 0
    });

    // 데이터를 날짜별로 그룹화
    const result: Data = {};
    
    // 모든 날짜 데이터를 수집
    const allDatesSet = new Set([
      ...todosData.map(t => t.date),
      ...(thoughtsData || []).map(t => t.date),
      ...(dailyReportData || []).map(t => t.date)
    ]);
    const allDates = Array.from(allDatesSet);

    allDates.forEach(date => {
      const todosForDate = todosData
        .filter(t => t.date === date)
        .map(t => ({ ...t, order: t.order_index || 0 }));
      
      const thoughtsForDate = thoughtsData?.filter(t => t.date === date) || [];
      const dailyReportForDate = dailyReportData?.find(d => d.date === date);

      result[date] = {
        todos: todosForDate,
        thoughts: thoughtsForDate,
        dailyReport: dailyReportForDate || {
          date,
          summary: '',
          gratitude: '',
          tomorrow_goals: '',
          mood: '보통',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        diary: [] // diary 기능은 더 이상 사용하지 않음
      };
    });

    // 로컬스토리지에서 다른 데이터 로드하여 병합
    const localData = loadDataFromLocalStorage();
    Object.keys(localData).forEach(date => {
      if (result[date]) {
      } else {
        // 로컬스토리지에만 있는 날짜 데이터 추가
        result[date] = localData[date];
      }
    });

    return result;
  } catch (error) {
    console.error('Supabase 데이터 로드 중 오류:', error);
    console.log('로컬스토리지에서 데이터를 로드합니다.');
    return loadDataFromLocalStorage();
  }
};

// 전체 데이터 저장 (임시로 로컬스토리지만 사용)
export const saveData = async (data: Data): Promise<void> => {
  console.log('임시로 로컬스토리지에만 저장합니다.');
  saveDataToLocalStorage(data);

  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 로컬스토리지에 저장합니다.');
    saveDataToLocalStorage(data);
    return;
  }

  try {
    // 각 날짜별로 데이터 저장
    const promises = Object.entries(data).map(([date, dayData]) => 
      updateDayData(date, dayData)
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Supabase 데이터 저장 중 오류:', error);
    saveDataToLocalStorage(data);
  }
};

// 일일 리포트 업데이트 (로컬스토리지만 사용)
export const updateDailyReport = async (date: string, updates: Partial<DailyReport>): Promise<void> => {
  return updateDailyReportService(date, updates);
};


// 날짜별 전체 데이터 업데이트 (todos는 Supabase, 나머지는 로컬스토리지)
export const updateDayData = async (date: string, dayData: DayData): Promise<void> => {
  // 항상 로컬스토리지에는 저장
  updateDayDataInLocalStorage(date, dayData);

  if (isSupabaseAvailable()) {
    try {
      // 각각의 서비스에서 처리
      await Promise.all([
        updateTodosInSupabase(date, dayData.todos || []),
        updateThoughtsInSupabase(date, dayData.thoughts || []),
        updateDailyReportService(date, dayData.dailyReport || {}),
        // updateDiaryService는 updateDailyReportService 내에서 처리되므로 제거
        // updateDiaryService(date, dayData.diary || {})
      ]);
    } catch (error) {
      console.error('Supabase 데이터 업데이트 중 오류:', error);
    }
  }
};

// 통계 계산
export const calculateStats = (data: Data): Stats => {
  const allDates = Object.keys(data);
  const totalDays = allDates.length;
  
  const completedTodos = allDates.reduce((acc: number, date: string) => {
    return acc + (data[date].todos?.filter(todo => todo.completed).length || 0);
  }, 0);
  
  const averageMood = allDates.length > 0 
    ? allDates.reduce((acc: number, date: string) => {
        const mood = data[date].dailyReport?.mood || '보통';
        return acc + (mood === '좋음' ? 4 : mood === '보통' ? 3 : mood === '나쁨' ? 2 : 1);
      }, 0) / allDates.length
    : 3;
  
  return { 
    totalDays, 
    completedTodos, 
    averageMood: averageMood.toFixed(1) 
  };
};

// 최근 7일 데이터 생성
export const getLast7DaysData = (data: Data): MoodData[] => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => ({
    date: new Date(date).getMonth() + 1 + '/' + new Date(date).getDate(),
    mood: data[date]?.dailyReport?.mood === '좋음' ? 4 : 
          data[date]?.dailyReport?.mood === '보통' ? 3 : 
          data[date]?.dailyReport?.mood === '나쁨' ? 2 : 1,
    todos: data[date]?.todos?.length || 0,
    completed: data[date]?.todos?.filter(t => t.completed).length || 0
  }));
};

// 로컬스토리지에서 Supabase로 데이터 마이그레이션
export const migrateFromLocalStorage = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Supabase가 사용 불가능한 경우 마이그레이션 건너뛰기
  if (!isSupabaseAvailable()) {
    console.log('Supabase가 사용 불가능합니다. 마이그레이션을 건너뜁니다.');
    return;
  }
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    if (savedData) {
      // 기존 데이터를 새로운 구조로 변환하는 로직 필요
      console.log('로컬스토리지에서 Supabase로 데이터 마이그레이션 완료');
    }
  } catch (error) {
    console.error('데이터 마이그레이션 중 오류:', error);
  }
};

// 로컬스토리지 관련 함수들 (폴백용)
const loadDataFromLocalStorage = (): Data => {
  if (typeof window === 'undefined') return {};
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // completedItems 필드가 누락된 경우 초기화
      Object.keys(parsedData).forEach(date => {
        if (!parsedData[date].completedItems) {
          parsedData[date].completedItems = [];
        }
      });
      
      return parsedData;
    }
  } catch (error) {
    console.error('로컬스토리지 데이터 로드 중 오류:', error);
  }
  
  return {};
};

const saveDataToLocalStorage = (data: Data): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('selfDevelopmentData', JSON.stringify(data));
  } catch (error) {
    console.error('로컬스토리지 데이터 저장 중 오류:', error);
  }
};



const updateDayDataInLocalStorage = (date: string, dayData: DayData): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedData = localStorage.getItem('selfDevelopmentData');
    const currentData = savedData ? JSON.parse(savedData) : {};
    
    currentData[date] = {
      ...currentData[date],
      ...dayData,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem('selfDevelopmentData', JSON.stringify(currentData));
  } catch (error) {
    console.error('로컬스토리지 날짜별 데이터 업데이트 중 오류:', error);
  }
};

// 할일 관리 함수들
export const addTodo = async (date: string, todoData: Partial<Todo>): Promise<Todo | null> => {
  if (!isSupabaseAvailable()) {
    // 로컬스토리지 폴백
    const newTodo: Todo = {
      id: Date.now(),
      text: todoData.text || '',
      completed: false,
      priority: todoData.priority || 'medium',
      order_index: todoData.order_index || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return newTodo;
  }

  try {
    const { data, error } = await supabase!
      .from('todos')
      .insert([{
        date,
        text: todoData.text,
        completed: todoData.completed || false,
        priority: todoData.priority || 'medium',
        order_index: todoData.order_index || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      order: data.order_index
    };
  } catch (error) {
    console.error('Todo 추가 중 오류:', error);
    return null;
  }
};

export const updateTodo = async (id: number, updates: Partial<Todo>): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return;
  }

  try {
    const { error } = await supabase!
      .from('todos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Todo 업데이트 중 오류:', error);
  }
};

export const deleteTodo = async (id: number): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return;
  }

  try {
    const { error } = await supabase!
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Todo 삭제 중 오류:', error);
  }
};

export const reorderTodos = async (date: string, todos: Todo[]): Promise<void> => {
  if (!isSupabaseAvailable()) {
    return;
  }

  try {
    const updates = todos.map(todo => ({
      id: todo.id,
      order_index: todo.order_index,
      updated_at: new Date().toISOString()
    }));

    for (const update of updates) {
      await supabase!
        .from('todos')
        .update({ 
          order_index: update.order_index,
          updated_at: update.updated_at
        })
        .eq('id', update.id);
    }
  } catch (error) {
    console.error('Todo 순서 변경 중 오류:', error);
  }
};

