'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Lightbulb, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Todo, 
  DayData, 
  Data, 
  CompletedItem,
  initializeData
} from '../features/shared/data';
import { 
  loadData, 
  updateDayData as updateDayDataSupabase,
  migrateFromLocalStorage
} from '../features/shared/services/dataService';
import {
  addTodo as addTodoSupabase,
  updateTodo as updateTodoSupabase,
  deleteTodo as deleteTodoSupabase,
  reorderTodos as reorderTodosSupabase
} from '../features/todos/services/todosService';
import { testSupabaseConnection, isSupabaseAvailable } from '../features/shared/services/supabase';

// 탭 컴포넌트들 import
// import DashboardTab from '../features/shared/components/DashboardTab';
import TodoTab from '../features/todos/components/TodoTab';
import ThoughtsTab from '../features/thoughts/components/ThoughtsTab';
import DiaryTab from '../features/diary/components/DiaryTab';
// import StatsTab from '../features/shared/components/StatsTab';
import PWAInstall from './PWAInstall';
import SupabaseStatus from './SupabaseStatus';

const SelfDevelopmentTracker = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'todo');
  const [data, setData] = useState<Data>({});
  // const [dailyQuote, setDailyQuote] = useState('');

  // Supabase 연결 상태 관리
  // const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  // URL 파라미터 변경 감지
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['todo', 'thoughts', 'diary'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Supabase 연결 테스트 및 데이터 로드
  useEffect(() => {
    const initializeDataSource = async () => {
      console.log('데이터 소스 초기화 시작...');
      
      // Supabase 사용 가능 여부 확인
      if (!isSupabaseAvailable()) {
        console.log('Supabase 환경 변수가 설정되지 않음. 로컬스토리지 모드로 전환.');
        // setSupabaseStatus('offline');
        const localData = await loadData();
        setData(localData);
        return;
      }

      try {
        // Supabase 연결 테스트
        console.log('Supabase 연결 테스트 중...');
        const isConnected = await testSupabaseConnection();
        
        if (isConnected) {
          console.log('Supabase 연결 성공');
          // setSupabaseStatus('connected');
          
          // 로컬스토리지에서 Supabase로 마이그레이션 시도
          await migrateFromLocalStorage();
          
          // Supabase에서 데이터 로드
          const loadedData = await loadData();
          setData(loadedData);
        } else {
          console.log('Supabase 연결 실패 또는 테이블이 생성되지 않음. 로컬스토리지 모드로 전환.');
          console.log('📋 Supabase 테이블을 생성하려면:');
          console.log('1. https://supabase.com 대시보드 접속');
          console.log('2. SQL Editor에서 supabase/schema.sql 내용 실행');
          console.log('3. 페이지 새로고침');
          // setSupabaseStatus('offline');
          const localData = await loadData();
          setData(localData);
        }
      } catch (error) {
        console.error('데이터 초기화 중 오류:', error);
        // setSupabaseStatus('offline');
        const localData = await loadData();
        setData(localData);
      }
    };
    
    initializeDataSource();
  }, []);

  // 날짜가 바뀔 때마다 명언 업데이트 (현재 사용하지 않음)
  // useEffect(() => {
  //   const today = new Date().toISOString().split('T')[0];
  //   const savedQuote = localStorage.getItem(`dailyQuote_${today}`);
  //   
  //   if (savedQuote) {
  //     setDailyQuote(savedQuote);
  //   } else {
  //     const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  //     setDailyQuote(randomQuote);
  //     localStorage.setItem(`dailyQuote_${today}`, randomQuote);
  //   }
  // }, [currentDate]);

  // 데이터 저장 함수 (현재 사용하지 않음)
  // const saveDataToStorage = async (newData: Data) => {
  //   setData(newData);
  //   try {
  //     await saveData(newData);
  //   } catch (error) {
  //     console.error('데이터 저장 중 오류:', error);
  //   }
  // };

  // 현재 날짜 데이터 가져오기
  const getCurrentDayData = () => {
    const existingData = data[currentDate];
    if (!existingData) {
      return initializeData();
    }
    
    // 기존 데이터에 누락된 필드가 있는 경우 초기화
    const initializedData = {
      ...initializeData(),
      ...existingData,
      completedItems: existingData.completedItems || []
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

    // thoughts 배열을 morningThoughts와 dailyIdeas로 변환 (현재 사용하지 않으므로 주석처리)
    // if (initializedData.thoughts && initializedData.thoughts.length > 0) {
    //   const morningThoughts = initializedData.thoughts
    //     .filter((thought: Thought) => thought.type === 'morning')
    //     .map((thought: Thought) => ({
    //       id: thought.id || Date.now(),
    //       text: thought.text,
    //       timestamp: new Date().toISOString()
    //     }));
    //   
    //   const dailyIdeas = initializedData.thoughts
    //     .filter((thought: Thought) => thought.type === 'daily')
    //     .map((thought: Thought) => ({
    //       id: thought.id || Date.now(),
    //       text: thought.text,
    //       timestamp: new Date().toISOString()
    //     }));
    //   
    //   initializedData.morningThoughts = morningThoughts;
    //   initializedData.dailyIdeas = dailyIdeas;
    // } else {
    //   initializedData.morningThoughts = initializedData.morningThoughts || [];
    //   initializedData.dailyIdeas = initializedData.dailyIdeas || [];
    // }

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
    
    // 로컬 상태 업데이트
    setData(newData);
    
    // Supabase에 업데이트
    try {
      await updateDayDataSupabase(currentDate, updatedData);
    } catch (error) {
      console.error('Supabase 업데이트 중 오류:', error);
    }
  };

  // 투두리스트 관리
  const addTodo = async (text: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!text.trim()) return;
    const currentData = getCurrentDayData();
    const newOrder = currentData.todos.length > 0 ? Math.max(...currentData.todos.map((t: Todo) => t.order_index)) + 1 : 0;
    
    // Supabase에 투두 추가
    const newTodo = await addTodoSupabase(currentDate, {
      text,
      completed: false,
      priority,
      order_index: newOrder
      // link와 description은 제외 (기본값 또는 null 사용)
    });

    if (newTodo) {
      // 로컬 상태 업데이트
      const newTodos = [...currentData.todos, newTodo];
      await updateCurrentDayData({ todos: newTodos });
    }
  };

  const toggleTodo = async (id: number) => {
    const currentData = getCurrentDayData();
    const todo = currentData.todos.find((t: Todo) => t.id === id);
    if (!todo) return;

    const updates = { completed: !todo.completed };
    
    // Supabase에서 투두 업데이트
    await updateTodoSupabase(id, updates);

    if (todo.completed) {
      // 완료된 투두를 다시 미완료로 변경
      const newTodos = currentData.todos.map((t: Todo) => 
        t.id === id ? { ...t, completed: false } : t
      );
      await updateCurrentDayData({ todos: newTodos });
    } else {
      // 미완료 투두를 완료로 변경하고 completedItems에 추가
      const newTodos = currentData.todos.map((t: Todo) => 
        t.id === id ? { ...t, completed: true } : t
      );
      
      const newCompletedItem = {
        id: Date.now(),
        text: todo.text,
        category: 'todo',
        completedAt: new Date().toISOString()
      };
      
      const newCompletedItems = [...(currentData.completedItems || []), newCompletedItem];
      await updateCurrentDayData({ todos: newTodos, completedItems: newCompletedItems });
    }
  };

  const deleteTodo = async (id: number) => {
    // Supabase에서 투두 삭제
    await deleteTodoSupabase(id);
    
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.filter((todo: Todo) => todo.id !== id);
    await updateCurrentDayData({ todos: newTodos });
  };

  // 투두 수정
  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    // Supabase에서 투두 업데이트
    await updateTodoSupabase(id, updates);
    
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.map((todo: Todo) => 
      todo.id === id ? { ...todo, ...updates } : todo
    );
    await updateCurrentDayData({ todos: newTodos });
  };

  // 투두 순서 변경 (드래그 앤 드롭용)
  const reorderTodos = async (oldIndex: number, newIndex: number) => {
    const currentData = getCurrentDayData();
    const todos = [...currentData.todos].sort((a, b) => a.order_index - b.order_index);
    
    if (oldIndex === newIndex) return;
    
    const [movedTodo] = todos.splice(oldIndex, 1);
    todos.splice(newIndex, 0, movedTodo);
    
    // 새로운 순서로 order_index 값 재할당
    const updatedTodos = todos.map((todo, index) => ({
      ...todo,
      order_index: index,
      order: index
    }));
    
    // Supabase에서 순서 변경 (새로운 함수 사용)
    await reorderTodosSupabase(currentDate, updatedTodos);
    
    await updateCurrentDayData({ todos: updatedTodos });
  };

  // 완료된 일 아이템 관리
  const addCompletedItem = async (text: string, category: string) => {
    if (!text.trim()) return;
    const currentData = getCurrentDayData();
    const newItem: CompletedItem = {
      id: Date.now(),
      text: text.trim(),
      category,
      completedAt: new Date().toISOString()
    };
    const newCompletedItems = [...(currentData.completedItems || []), newItem];
    await updateCurrentDayData({ completedItems: newCompletedItems });
  };

  const deleteCompletedItem = async (id: number) => {
    const currentData = getCurrentDayData();
    const newCompletedItems = (currentData.completedItems || []).filter((item: CompletedItem) => item.id !== id);
    await updateCurrentDayData({ completedItems: newCompletedItems });
  };

  // 자기 암시 저장 (현재 사용하지 않음)
  // const saveAffirmation = (affirmation: string) => {
  //   localStorage.setItem('userAffirmation', affirmation);
  // };

  // 명언 새로고침 (현재 사용하지 않음)
  // const refreshQuote = async () => {
  //   const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  //   setDailyQuote(randomQuote);
  //   localStorage.setItem(`dailyQuote_${currentDate}`, randomQuote);
  // };

  // 날짜 네비게이션 함수들
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

  // const goToToday = () => { // Removed
  //   setCurrentDate(new Date().toISOString().split('T')[0]); // Removed
  // }; // Removed

  // 날짜 포맷팅 함수들
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

  // 통계 계산 (현재 사용하지 않음)
  // const stats = calculateStats(data);
  const dayData = getCurrentDayData();

  // 탭 컴포넌트들을 props와 함께 렌더링하는 함수들
  // const renderDashboardTab = () => (
  //   <DashboardTab
  //     dayData={dayData}
  //     dailyQuote={dailyQuote}
  //     refreshQuote={refreshQuote}
  //     saveAffirmation={saveAffirmation}
  //   />
  // );

  const renderTodoTab = () => (
    <TodoTab
      dayData={dayData}
      addTodo={addTodo}
      toggleTodo={toggleTodo}
      deleteTodo={deleteTodo}
      updateTodo={updateTodo}
      reorderTodos={reorderTodos}
      updateCurrentDayData={updateCurrentDayData}
    />
  );

  const renderThoughtsTab = () => (
    <ThoughtsTab
      dayData={dayData}
      updateCurrentDayData={updateCurrentDayData}
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

  // const renderStatsTab = () => (
  //   <StatsTab
  //     stats={stats}
  //     data={data}
  //   />
  // );

  const tabs = [
    // { id: 'dashboard', name: '대시보드', icon: BarChart3, component: renderDashboardTab },
    { id: 'todo', name: 'TODO', icon: CheckCircle, component: renderTodoTab },
    { id: 'thoughts', name: '생각정리', icon: Lightbulb, component: renderThoughtsTab },
    { id: 'diary', name: '일기', icon: Book, component: renderDiaryTab },
    // { id: 'stats', name: '통계', icon: TrendingUp, component: renderStatsTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || renderTodoTab;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 xl:p-12">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🔥 나를 넘어라 🔥
          </h1>
          <p className="text-lg lg:text-xl text-gray-600">매일 매일 성장하기 위한 기록</p>
          
          {/* 연결 상태 표시 */}
          <div className="mt-4">
            <SupabaseStatus onStatusChange={() => {}} />
          </div>
        </div>

        {/* 날짜 선택 */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousDay}
                className="p-3 lg:p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <div className="flex-1 text-center mx-4">
                <div className="flex flex-col items-center">
                  {dateInfo.label && (
                    <span className={`text-sm font-medium px-3 py-1 rounded-full mb-2 ${
                      dateInfo.isToday 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {dateInfo.label}
                    </span>
                  )}
                  <div className="text-2xl lg:text-3xl font-bold text-gray-800">
                    {dateInfo.date}
                  </div>
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="mt-3 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <button
                onClick={goToNextDay}
                className="p-3 lg:p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    router.push(`/?tab=${tab.id}`, { scroll: false });
                  }}
                  className={`flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-medium transition-all duration-200 text-base lg:text-lg ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md hover:scale-105'
                  }`}
                >
                  <Icon className="h-5 w-5 lg:h-6 lg:w-6" />
                  {tab.name}
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
        <div className="text-center text-gray-500 text-base lg:text-lg rounded-2xl p-6">
          하루가 모여 인생이 바뀐다.
        </div>
      </div>
      
      {/* PWA 설치 프롬프트 */}
      <PWAInstall />
    </div>
  );
};

export default SelfDevelopmentTracker;