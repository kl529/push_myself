import { DayData, Data, Stats, MoodData } from '../types/types';

// 데이터 구조 초기화
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

// 로컬스토리지에서 데이터 로드
export const loadData = (): Data => {
  if (typeof window === 'undefined') return {};
  
  const savedData = localStorage.getItem('selfDevelopmentData');
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (error) {
      console.error('데이터 로드 중 오류:', error);
      return {};
    }
  }
  return {};
};

// 데이터 저장
export const saveData = (data: Data): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('selfDevelopmentData', JSON.stringify(data));
  } catch (error) {
    console.error('데이터 저장 중 오류:', error);
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
        return acc + (typeof mood === 'string' 
          ? (mood === '좋음' ? 4 : mood === '보통' ? 3 : mood === '나쁨' ? 2 : 1)
          : mood);
      }, 0) / allDates.length
    : 3;
  
  return { 
    totalDays, 
    completedTodos, 
    averageMood: averageMood.toFixed(1) 
  };
};

// 날짜별 데이터 업데이트
export const updateDayData = (data: Data, currentDate: string, updates: Partial<DayData>): Data => {
  const currentData = data[currentDate] || initializeData();
  
  return {
    ...data,
    [currentDate]: {
      ...currentData,
      ...updates
    }
  };
};

// 최근 7일 데이터 생성
export const getLast7DaysData = (data: Data): MoodData[] => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return last7Days.map(date => {
    const dayData = data[date];
    const mood = dayData?.dailyReport?.mood || '보통';
    const moodValue = typeof mood === 'string' 
      ? (mood === '좋음' ? 4 : mood === '보통' ? 3 : mood === '나쁨' ? 2 : 1)
      : mood;
    
    return {
      date: new Date(date).getMonth() + 1 + '/' + new Date(date).getDate(),
      mood: moodValue,
      todos: dayData?.todos?.length || 0,
      completed: dayData?.todos?.filter(t => t.completed).length || 0,
    };
  });
};

// 데이터 마이그레이션 (기존 문자열 형식에서 배열 형식으로)
export const migrateData = (data: Data): Data => {
  const migratedData: Data = {};
  
  Object.keys(data).forEach(date => {
    const dayData = data[date] as any; // 기존 데이터 구조를 위해 any 사용
    const migratedDayData = { ...dayData };
    
    // morningThought를 morningThoughts로 마이그레이션
    if (dayData.morningThought && typeof dayData.morningThought === 'string' && dayData.morningThought.trim()) {
      migratedDayData.morningThoughts = [{
        id: Date.now(),
        text: dayData.morningThought,
        timestamp: new Date().toISOString()
      }];
      delete migratedDayData.morningThought;
    } else if (!dayData.morningThoughts) {
      migratedDayData.morningThoughts = [];
    }
    
    // dailyIdea를 dailyIdeas로 마이그레이션
    if (dayData.dailyIdea && typeof dayData.dailyIdea === 'string' && dayData.dailyIdea.trim()) {
      migratedDayData.dailyIdeas = [{
        id: Date.now(),
        text: dayData.dailyIdea,
        timestamp: new Date().toISOString()
      }];
      delete migratedDayData.dailyIdea;
    } else if (!dayData.dailyIdeas) {
      migratedDayData.dailyIdeas = [];
    }
    
    // mustDo를 새로운 형태로 마이그레이션
    if (dayData.mustDo && Array.isArray(dayData.mustDo)) {
      if (typeof dayData.mustDo[0] === 'string') {
        // 기존 문자열 배열을 새로운 형태로 변환
        migratedDayData.mustDo = dayData.mustDo.map((text: string, index: number) => ({
          id: index + 1,
          text: text || '',
          completed: false,
          order: index
        }));
      }
    } else if (!dayData.mustDo) {
      migratedDayData.mustDo = [
        { id: 1, text: '', completed: false, order: 0 },
        { id: 2, text: '', completed: false, order: 1 },
        { id: 3, text: '', completed: false, order: 2 }
      ];
    }
    
    migratedData[date] = migratedDayData as DayData;
  });
  
  return migratedData;
}; 