'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle, 
  Lightbulb, 
  Book, 
  BarChart3, 
  BookOpen,
  Settings,
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { 
  Todo, 
  DayData, 
  Data, 
  WeeklyReport,
  WeeklyStats,
  Diary
} from '../features/shared/types/types';
import { 
  loadData, 
  updateDayData as updateDayDataSupabase,
  migrateFromLocalStorage,
  addTodo as addTodoSupabase,
  updateTodo as updateTodoSupabase,
  deleteTodo as deleteTodoSupabase,
  reorderTodos as reorderTodosSupabase
} from '../lib/dataService';
import { testSupabaseConnection, isSupabaseAvailable } from '../lib/supabase';

// 탭 컴포넌트들 import
import TodoTab from '../features/todos/components/TodoTab';
import ThoughtsTab from '../features/thoughts/components/ThoughtsTab';
import DiaryTab from '../features/diary/components/DiaryTab';
import StatsTab from '../features/stats/components/StatsTab';
import WeeklyReportTab from '../features/weekly-report/components/WeeklyReportTab';
import SettingsTab from './tabs/SettingsTab';
import { WeeklyReportService } from '../features/weekly-report/services/weeklyReportService';
import PWAInstall from './PWAInstall';
import Toast, { useToast } from './Toast';
import { restoreNotificationSchedule } from '../lib/notifications';

// 초기 데이터 함수
const initializeEmptyData = (): DayData => ({
  todos: [],
  thoughts: [],
  dailyReport: {
    date: new Date().toISOString().split('T')[0],
    summary: '',
    gratitude: '',
    lessons_learned: '',
    tomorrow_goals: '',
    mood: '보통',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  diary: []
});

const SelfDevelopmentTracker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentWeek, setCurrentWeek] = useState(getWeekStartDate(new Date()));
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'todo');
  const [data, setData] = useState<Data>({});
  const [weeklyReports, setWeeklyReports] = useState<{ [weekStart: string]: WeeklyReport }>({});
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  
  // Toast 훅
  const { toasts, removeToast, showWarning } = useToast();

  // 주의 시작 날짜 계산 (월요일)
  function getWeekStartDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  // 주의 종료 날짜 계산 (일요일)
  function getWeekEnd(weekStart: string): string {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  }


  // URL 파라미터 변경 감지
  useEffect(() => {
    const tab = searchParams.get('tab');
    const validTabs = ['todo', 'thoughts', 'diary', 'stats', 'weekly-report', 'settings'];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 데이터 초기화
  useEffect(() => {
    const initializeDataSource = async () => {
      console.log('데이터 소스 초기화 시작...');
      
      if (!isSupabaseAvailable()) {
        console.log('Supabase 환경 변수가 설정되지 않음. 로컬스토리지 모드로 전환.');
        const localData = await loadData();
        setData(localData);
        return;
      }

      try {
        console.log('Supabase 연결 테스트 중...');
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          console.log('Supabase 연결 성공');
          await migrateFromLocalStorage();
          const loadedData = await loadData();
          setData(loadedData);
          
          // 주간 회고 데이터 로드
          try {
            const allWeeklyReports = await WeeklyReportService.getAllWeeklyReports();
            const weeklyReportsMap: { [weekStart: string]: WeeklyReport } = {};
            allWeeklyReports.forEach(report => {
              weeklyReportsMap[report.week_start_date] = report;
            });
            setWeeklyReports(weeklyReportsMap);
          } catch (error) {
            console.error('주간 회고 로드 실패:', error);
          }
        } else {
          console.log('Supabase 연결 실패. 로컬스토리지 모드로 전환.');
          const localData = await loadData();
          setData(localData);
        }
        
        // 알림 스케줄 복원
        restoreNotificationSchedule();
      } catch (error) {
        console.error('데이터 초기화 중 오류:', error);
        const localData = await loadData();
        setData(localData);
      }
    };
    
    initializeDataSource();
  }, []);


  // 주간 통계 계산
  const calculateWeeklyStats = React.useCallback(() => {
    const statsMap: { [weekStart: string]: WeeklyStats } = {};
    
    Object.keys(data).forEach(date => {
      const weekStart = getWeekStartDate(new Date(date));
      const dayData = data[date];
      
      if (!statsMap[weekStart]) {
        statsMap[weekStart] = {
          week_start_date: weekStart,
          week_end_date: getWeekEnd(weekStart),
          daily_reports_written: 0,
          completed_tasks: 0,
          total_tasks: 0,
          mood_average: 0,
          thoughts_count: 0,
          total_diary_entries: 0,
          completion_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      const stats = statsMap[weekStart];
      
      // 데일리 리포트 작성 여부
      if (dayData.dailyReport?.summary?.trim()) {
        stats.daily_reports_written++;
      }
      
      // 완료한 작업 수
      stats.completed_tasks += dayData.todos?.filter(todo => todo.completed).length || 0;
      
      // 생각 기록 수
      stats.thoughts_count += dayData.thoughts?.length || 0;
      
      // 기분 평균 (나중에 계산)
      if (dayData.dailyReport?.mood) {
        const moodValue = getMoodValue(dayData.dailyReport.mood);
        stats.mood_average += moodValue;
      }
    });
    
    // 기분 평균 계산 완료
    const weeklyStatsArray = Object.values(statsMap).map(stats => ({
      ...stats,
      mood_average: stats.daily_reports_written > 0 
        ? stats.mood_average / stats.daily_reports_written 
        : 0
    }));
    
    setWeeklyStats(weeklyStatsArray);
  }, [data]);

  useEffect(() => {
    calculateWeeklyStats();
  }, [calculateWeeklyStats]);

  // 현재 날짜 데이터 가져오기
  const getCurrentDayData = (): DayData => {
    const existingData = data[currentDate];
    if (!existingData) {
      return initializeEmptyData();
    }
    
    // 기존 데이터에 누락된 필드가 있는 경우 초기화
    const initializedData: DayData = {
      ...initializeEmptyData(),
      ...existingData
    };

    // 기존 투두들에 누락된 필드들 초기화
    if (initializedData.todos) {
      initializedData.todos = initializedData.todos.map((todo: Todo, index: number) => ({
        ...todo,
        priority: todo.priority || 'medium',
        order_index: todo.order_index !== undefined ? todo.order_index : index,
        order: todo.order_index !== undefined ? todo.order_index : index
      }));
    }

    return initializedData;
  };

  // 날짜별 데이터 업데이트
  const updateCurrentDayData = async (updates: Partial<DayData>) => {
    const currentData = getCurrentDayData();
    const updatedData = { ...currentData, ...updates };
    
    const newData = {
      ...data,
      [currentDate]: updatedData
    };
    
    setData(newData);
    
    try {
      await updateDayDataSupabase(currentDate, updatedData);
    } catch (error) {
      console.error('Supabase 업데이트 중 오류:', error);
    }
  };


  const getMoodValue = (mood: string): number => {
    switch (mood) {
      case '매우좋음': return 5;
      case '좋음': return 4;
      case '보통': return 3;
      case '나쁨': return 2;
      case '매우나쁨': return 1;
      default: return 3;
    }
  };

  // 투두 관리 함수들
  const addTodo = async (text: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!text.trim()) return;
    const currentData = getCurrentDayData();
    const newOrder = currentData.todos.length > 0 ? Math.max(...currentData.todos.map((t: Todo) => t.order_index)) + 1 : 0;
    
    const newTodo = await addTodoSupabase(currentDate, {
      text,
      completed: false,
      priority,
      order_index: newOrder
    });

    if (newTodo) {
      const newTodos = [...currentData.todos, newTodo];
      await updateCurrentDayData({ todos: newTodos });
    }
  };

  const toggleTodo = async (id: number) => {
    const currentData = getCurrentDayData();
    const todo = currentData.todos.find((t: Todo) => t.id === id);
    if (!todo) return;

    const updates = { completed: !todo.completed };
    await updateTodoSupabase(id, updates);

    const newTodos = currentData.todos.map((t: Todo) => 
      t.id === id ? { ...t, completed: !todo.completed } : t
    );
    await updateCurrentDayData({ todos: newTodos });
  };

  const deleteTodo = async (id: number) => {
    await deleteTodoSupabase(id);
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.filter((todo: Todo) => todo.id !== id);
    await updateCurrentDayData({ todos: newTodos });
  };

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    await updateTodoSupabase(id, updates);
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.map((todo: Todo) => 
      todo.id === id ? { ...todo, ...updates } : todo
    );
    await updateCurrentDayData({ todos: newTodos });
  };

  const reorderTodos = async (oldIndex: number, newIndex: number) => {
    const currentData = getCurrentDayData();
    const todos = [...currentData.todos].sort((a, b) => a.order_index - b.order_index);
    
    if (oldIndex === newIndex) return;
    
    const [movedTodo] = todos.splice(oldIndex, 1);
    todos.splice(newIndex, 0, movedTodo);
    
    const updatedTodos = todos.map((todo, index) => ({
      ...todo,
      order_index: index,
      order: index
    }));
    
    await reorderTodosSupabase(currentDate, updatedTodos);
    await updateCurrentDayData({ todos: updatedTodos });
  };

  // 완료된 일 아이템 관리
  const addCompletedItem = async (text: string, category: string) => {
    if (!text.trim()) return;
    const currentData = getCurrentDayData();
    
    // 있었던 일들 3개 제한 체크
    if ((currentData.diary || []).length >= 3) {
      showWarning('있었던 일들은 하루에 최대 3개까지만 추가할 수 있습니다.');
      return;
    }
    
    const newDiaryEntry: Diary = {
      daily_report_id: Date.now(), // 임시로 timestamp 사용
      content: text.trim(),
      category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const newDiaryEntries = [...(currentData.diary || []), newDiaryEntry];
    await updateCurrentDayData({ diary: newDiaryEntries });
  };

  const deleteCompletedItem = async (id: number) => {
    const currentData = getCurrentDayData();
    const newDiary = currentData.diary?.filter((item) => item.daily_report_id !== id) || [];
    await updateCurrentDayData({ diary: newDiary });
  };

  // 자기암시 관리
  const saveAffirmation = (affirmation: string) => {
    localStorage.setItem('userAffirmation', affirmation);
  };


  // 주간 회고 관리
  const handleSaveWeeklyReport = async (report: WeeklyReport) => {
    try {
      // Supabase에 저장 시도
      const savedReport = await WeeklyReportService.saveWeeklyReport(report);
      if (savedReport) {
        setWeeklyReports(prev => ({
          ...prev,
          [report.week_start_date]: savedReport
        }));
        console.log('주간 회고가 성공적으로 저장되었습니다.');
      } else {
        // Supabase 저장 실패시 로컬에만 저장
        setWeeklyReports(prev => ({
          ...prev,
          [report.week_start_date]: report
        }));
        console.warn('Supabase 저장에 실패했습니다. 로컬에만 저장되었습니다.');
      }
    } catch (error) {
      console.error('주간 회고 저장 중 오류 발생:', error);
      // 오류시 로컬에라도 저장
      setWeeklyReports(prev => ({
        ...prev,
        [report.week_start_date]: report
      }));
    }
  };

  // 명언 새로고침

  // 날짜 네비게이션
  const goToPreviousDay = () => {
    const current = new Date(currentDate);
    current.setDate(current.getDate() - 1);
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const current = new Date(currentDate);
    current.setDate(current.getDate() + 1);
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  // 주간 네비게이션
  const handleNavigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(currentWeek);
    const days = direction === 'prev' ? -7 : 7;
    current.setDate(current.getDate() + days);
    setCurrentWeek(getWeekStartDate(current));
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

    const dayName = dayNames[date.getDay()];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();

    if (isToday) {
      return { label: '오늘', date: `${month} ${day}일 (${dayName})`, isToday: true };
    } else if (isYesterday) {
      return { label: '어제', date: `${month} ${day}일 (${dayName})`, isToday: false };
    } else if (isTomorrow) {
      return { label: '내일', date: `${month} ${day}일 (${dayName})`, isToday: false };
    } else {
      return { label: '', date: `${month} ${day}일 (${dayName})`, isToday: false };
    }
  };

  const dateInfo = formatDate(currentDate);
  const dayData = getCurrentDayData();

  // 탭 컴포넌트 렌더링 함수들
  const renderSettingsTab = () => (
    <SettingsTab />
  );

  const renderTodoTab = () => (
    <TodoTab
      dayData={dayData}
      addTodo={addTodo}
      toggleTodo={toggleTodo}
      deleteTodo={deleteTodo}
      updateTodo={updateTodo}
      reorderTodos={reorderTodos}
      updateCurrentDayData={updateCurrentDayData}
      showWarning={showWarning}
      saveAffirmation={saveAffirmation}
    />
  );

  const renderThoughtsTab = () => (
    <ThoughtsTab
      dayData={dayData}
      updateCurrentDayData={updateCurrentDayData}
      showWarning={showWarning}
    />
  );

  const renderDiaryTab = () => (
    <DiaryTab
      dayData={dayData}
      updateCurrentDayData={updateCurrentDayData}
      addCompletedItem={addCompletedItem}
      deleteCompletedItem={deleteCompletedItem}
    />
  );

  const renderStatsTab = () => (
    <StatsTab
      data={data}
      weeklyStats={weeklyStats}
      onNavigateWeek={handleNavigateWeek}
      currentWeek={currentWeek}
    />
  );

  const renderWeeklyReportTab = () => (
    <WeeklyReportTab
      weeklyReport={weeklyReports[currentWeek] || null}
      currentWeek={currentWeek}
      onSaveWeeklyReport={handleSaveWeeklyReport}
      onNavigateWeek={handleNavigateWeek}
    />
  );


  const tabs = [
    { id: 'todo', name: 'TODO', icon: CheckCircle, component: renderTodoTab },
    { id: 'thoughts', name: '생각정리', icon: Lightbulb, component: renderThoughtsTab },
    { id: 'diary', name: '일기', icon: Book, component: renderDiaryTab },
    { id: 'stats', name: '통계', icon: BarChart3, component: renderStatsTab },
    { id: 'weekly-report', name: '주간회고', icon: BookOpen, component: renderWeeklyReportTab },
    { id: 'settings', name: '설정', icon: Settings, component: renderSettingsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || renderTodoTab;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 xl:p-12">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">
            나를 넘어라
          </h2>
          <p className="text-sm lg:text-base text-gray-600">매일 1% 성장하기 위해서는 매일 3개만 해도 충분합니다.</p>
        </div>

        {/* 간단한 날짜 선택 (특정 탭에서만 표시) */}
        {!['stats', 'weekly-report'].includes(activeTab) && (
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="이전 날짜"
              >
                <ChevronLeft className="h-5 w-5 text-black" />
              </button>
              
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border shadow-sm">
                {dateInfo.isToday && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">오늘</span>
                )}
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="text-sm font-medium text-black bg-transparent border-none outline-none cursor-pointer"
                />
              </div>
              
              <button
                onClick={goToNextDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="다음 날짜"
              >
                <ChevronRight className="h-5 w-5 text-black" />
              </button>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 - 3개씩 배치 */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-2 lg:gap-3 max-w-2xl mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/?tab=${tab.id}`, { scroll: false });
                  }}
                  className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-3 lg:px-4 lg:py-3 rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-black hover:bg-gray-100 shadow-sm hover:shadow-md hover:scale-105'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span className="whitespace-nowrap">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 활성 탭 컨텐츠 */}
        <div className="mb-4">
          <ActiveComponent />
        </div>

        {/* 푸터 */}
        <div className="text-center text-black text-base lg:text-lg rounded-2xl p-6">
          하루가 모여 인생이 바뀐다.
        </div>
      </div>
      
      {/* PWA 설치 프롬프트 */}
      <PWAInstall />
      
      {/* Toast 알림 */}
      <Toast toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default SelfDevelopmentTracker;