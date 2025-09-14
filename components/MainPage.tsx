'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Lightbulb,
  Book,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  X,
  ExternalLink,
  Github,
  Mail
} from 'lucide-react';
import {
  Todo,
  DayData,
  Data
} from '../features/shared/types/types';
import { 
  loadData, 
  updateDayData as updateDayDataSupabase,
  addTodo as addTodoSupabase,
  updateTodo as updateTodoSupabase,
  deleteTodo as deleteTodoSupabase,
  reorderTodos as reorderTodosSupabase
} from '../lib/dataService';
import { testSupabaseConnection, isSupabaseAvailable } from '../lib/supabase';

// Authentication imports
import { useAuth } from '../features/auth/contexts/AuthContext';
import LoginModal from '../features/auth/components/LoginModal';
import UserProfile from '../features/auth/components/UserProfile';

// 탭 컴포넌트들 import
import TodoTab from '../features/todos/components/TodoTab';
import ThoughtsTab from '../features/thoughts/components/ThoughtsTab';
import DiaryTab from '../features/diary/components/DiaryTab';
import StatsTab from '../features/shared/components/StatsTab';
import SettingsTab from './tabs/SettingsTab';
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
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'todo');
  const [data, setData] = useState<Data>({});
  
  // Authentication from context
  const { user, loading: isAuthLoading, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Toast 훅
  const { toasts, removeToast, showWarning } = useToast();



  // URL 파라미터 변경 감지
  useEffect(() => {
    const tab = searchParams.get('tab');
    const validTabs = ['todo', 'thoughts', 'diary', 'stats'];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 데이터 초기화 - authentication이 완료된 후에 실행
  useEffect(() => {
    if (isAuthLoading) return; // authentication이 완료될 때까지 기다림

    const initializeDataSource = async () => {
      console.log('데이터 소스 초기화 시작... User:', user?.email || 'No user');
      
      if (!isSupabaseAvailable() || !user) {
        console.log('Supabase 환경 변수가 설정되지 않았거나 사용자 인증이 필요함. 로컬스토리지 모드로 전환.');
        const localData = await loadData();
        setData(localData);
        return;
      }

      try {
        console.log('Supabase 연결 테스트 중...');
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          console.log('Supabase 연결 성공 - 사용자별 데이터 로드');
          // Note: migrateFromLocalStorage는 auth service에서 처리하므로 여기서는 제거
          const loadedData = await loadData();
          setData(loadedData);
          
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
  }, [isAuthLoading, user]); // authentication 상태와 사용자 정보 변경시 다시 실행

  // Authentication은 이제 AuthContext에서 관리됨



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


  // 자기암시 관리
  const saveAffirmation = (affirmation: string) => {
    localStorage.setItem('userAffirmation', affirmation);
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

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
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
    />
  );

  const renderStatsTab = () => (
    <StatsTab
      data={data}
    />
  );



  const tabs = [
    { id: 'todo', name: 'DO', icon: CheckCircle, component: renderTodoTab },
    { id: 'thoughts', name: 'THINK', icon: Lightbulb, component: renderThoughtsTab },
    { id: 'diary', name: 'RECORD', icon: Book, component: renderDiaryTab },
    { id: 'stats', name: 'STATS', icon: BarChart3, component: renderStatsTab },
    // { id: 'settings', name: '설정', icon: Settings, component: renderSettingsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || renderTodoTab;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-6">
        {/* 헤더 - 모바일 최적화 */}
        <div className="mb-4 lg:mb-6">
          {/* Authentication Status Bar - 모바일 최적화 */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-3 lg:mb-4">
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="hidden sm:inline">클라우드 동기화 활성화</span>
                  <span className="sm:hidden">동기화 ON</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="hidden sm:inline">로컬 모드</span>
                  <span className="sm:hidden">로컬</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <UserProfile user={user} />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-2 text-xs sm:text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  로그인
                </button>
              )}
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="도움말"
              >
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">
              나를 넘어라
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 px-4 sm:px-0">매일 1% 성장하기 위해서는 매일 3개만 해도 충분합니다.</p>
          </div>
        </div>

        {/* 간단한 날짜 선택 - 모바일 최적화 */}
        <div className="mb-3 lg:mb-4">
          <div className="flex flex-col items-center gap-3 max-w-sm sm:max-w-md mx-auto px-4 sm:px-0">
            <div className="flex items-center gap-2 sm:gap-3 w-full justify-center">
              <button
                onClick={goToPreviousDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                title="이전 날짜"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              </button>

              <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border shadow-sm">
                {dateInfo.isToday && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">오늘</span>
                )}
                <input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="text-sm font-medium text-black bg-transparent border-none outline-none cursor-pointer min-w-0"
                />
              </div>

              <button
                onClick={goToNextDay}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                title="다음 날짜"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 - 모바일 최적화 */}
        <div className="mb-4 lg:mb-6">
          <div className="grid grid-cols-4 gap-1 sm:gap-2 lg:gap-3 max-w-xl sm:max-w-2xl mx-auto px-2 sm:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/?tab=${tab.id}`, { scroll: false });
                  }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-3 sm:py-3 lg:px-4 lg:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base touch-manipulation ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-black hover:bg-gray-100 shadow-sm active:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
                  <span className="whitespace-nowrap leading-tight">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 활성 탭 컨텐츠 */}
        <div className="mb-4">
          <ActiveComponent />
        </div>

        {/* 푸터 - 모바일 최적화 */}
        <div className="text-center text-black text-sm sm:text-base lg:text-lg rounded-2xl p-4 lg:p-6 mt-8 lg:mt-12">
          하루가 모여 인생이 바뀐다.
        </div>
      </div>
      
      {/* PWA 설치 프롬프트 */}
      <PWAInstall />
      
      {/* Toast 알림 */}
      <Toast toasts={toasts} onRemoveToast={removeToast} />
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowHelpModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">도움말</h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Service Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-blue-500" />
                  Push Myself이란?
                </h3>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Push Myself는 <span className="font-semibold text-blue-600">3-3-3 시스템</span>을 기반으로 한 개인 성장 추적 앱입니다.
                </p>
                <div className="text-red-500 leading-relaxed mb-3 space-y-3 bg-gray-100 p-4 rounded-lg">
                  <p>
                    매일매일 반복되는 일상이 지루하지만 뭔가를 더하긴 힘들고, 성장은 하며 더 잘살고 싶으신가요?
                  </p>
                  <p>
                    하루 1%만 성장해도 1년에는 37.8배 성장할 수 있습니다. 하루 1% 성장은 힘든게 아닙니다. 하루 3가지 할일을 하고, 자신의 생각을 기록하고, 하루를 기록만 해도 충분합니다.
                  </p>
                  <p>
                    하루 10분의 기록이 당신의 인생을 바꿉니다. 하루에 3개만 실천해보세요. 당신의 인생이 바뀌는 첫걸음이 될겁니다.
                  </p>
                  <p>
                    꾸준한 노력만이 성공으로 가는 가장 빠른 지름길입니다.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li><span className="font-semibold text-blue-600">DO:</span> 매일 3개의 핵심 업무</li>
                    <li><span className="font-semibold text-green-600">THINK:</span> 매일 3개의 생각 & 배운점</li>
                    <li><span className="font-semibold text-purple-600">RECORD:</span> 3가지 핵심 기록 (오늘 한줄, 감사일기, 내일 집중)</li>
                  </ul>
                </div>
              </div>

              {/* Usage Instructions */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <Book className="h-5 w-5 mr-2 text-green-500" />
                  사용방법
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-blue-600">1. DO 탭:</span>
                    <p className="ml-4">하루에 가장 중요한 3가지 일을 설정하고 완료체크하세요.</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">2. THINK 탭:</span>
                    <p className="ml-4">오늘 생각한 것이나 배운 점을 3가지까지 기록하세요.</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-600">3. RECORD 탭:</span>
                    <p className="ml-4">하루를 돌아보며 요약, 감사일기, 내일 목표를 작성하세요.</p>
                  </div>
                  <div>
                    <span className="font-medium text-orange-600">4. STATS 탭:</span>
                    <p className="ml-4">지금까지의 기록을 시각화하여 성장을 확인하세요.</p>
                  </div>
                </div>
              </div>

              {/* Contact & Links */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">문의 및 링크</h3>
                <div className="space-y-3">
                  <a
                    href="https://github.com/kl529/push_myself"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-black transition-colors"
                  >
                    <Github className="h-5 w-5 mr-3" />
                    GitHub Repository
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                  <a
                    href="mailto:jiwon803@gmail.com"
                    className="flex items-center text-gray-700 hover:text-black transition-colors"
                  >
                    <Mail className="h-5 w-5 mr-3" />
                    문의하기: jiwon803@gmail.com
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-center text-sm text-gray-500">
                  매일 1% 성장하기 위해서는 매일 3개만 해도 충분합니다 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfDevelopmentTracker;