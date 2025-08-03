'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, Lightbulb, Book, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  Todo, 
  DayData, 
  Data, 
  CompletedItem,
  quotes,
  initializeData,
  loadData,
  saveData,
  calculateStats,
  migrateData
} from '../data';

// 탭 컴포넌트들 import
import DashboardTab from './tabs/DashboardTab';
import TodoTab from './tabs/TodoTab';
import ThoughtsTab from './tabs/ThoughtsTab';
import DiaryTab from './tabs/DiaryTab';
import StatsTab from './tabs/StatsTab';
import PWAInstall from './PWAInstall';

const SelfDevelopmentTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<Data>({});
  const [dailyQuote, setDailyQuote] = useState('');

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const loadedData = loadData();
    const migratedData = migrateData(loadedData);
    setData(migratedData);
    
    // 마이그레이션된 데이터가 기존 데이터와 다른 경우 저장
    if (JSON.stringify(loadedData) !== JSON.stringify(migratedData)) {
      saveData(migratedData);
    }
  }, []);

  // 날짜가 바뀔 때마다 명언 업데이트
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedQuote = localStorage.getItem(`dailyQuote_${today}`);
    
    if (savedQuote) {
      setDailyQuote(savedQuote);
    } else {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setDailyQuote(randomQuote);
      localStorage.setItem(`dailyQuote_${today}`, randomQuote);
    }
  }, [currentDate]);

  // 데이터 저장 함수
  const saveDataToStorage = (newData: Data) => {
    setData(newData);
    saveData(newData);
  };

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
      initializedData.todos = initializedData.todos.map((todo, index) => ({
        ...todo,
        priority: todo.priority || 'medium',
        order: todo.order !== undefined ? todo.order : index
      }));
    }

    return initializedData;
  };

  // 날짜별 데이터 업데이트
  const updateCurrentDayData = (updates: Partial<DayData>) => {
    const currentData = getCurrentDayData();
    const updatedData = { ...currentData, ...updates };
    const newData = {
      ...data,
      [currentDate]: updatedData
    };
    saveDataToStorage(newData);
  };

  // 투두리스트 관리
  const addTodo = (text: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    if (!text.trim()) return;
    const currentData = getCurrentDayData();
    const newOrder = currentData.todos.length > 0 ? Math.max(...currentData.todos.map(t => t.order)) + 1 : 0;
    const newTodos = [...currentData.todos, { 
      id: Date.now(), 
      text, 
      completed: false, 
      priority, 
      order: newOrder 
    }];
    updateCurrentDayData({ todos: newTodos });
  };

  const toggleTodo = (id: number) => {
    const currentData = getCurrentDayData();
    const todo = currentData.todos.find(t => t.id === id);
    if (!todo) return;

    if (todo.completed) {
      // 완료된 투두를 다시 미완료로 변경
      const newTodos = currentData.todos.map(t => 
        t.id === id ? { ...t, completed: false } : t
      );
      updateCurrentDayData({ todos: newTodos });
    } else {
      // 미완료 투두를 완료로 변경하고 completedItems에 추가
      const newTodos = currentData.todos.map(t => 
        t.id === id ? { ...t, completed: true } : t
      );
      
      const newCompletedItem = {
        id: Date.now(),
        text: todo.text,
        category: 'todo',
        completedAt: new Date().toISOString()
      };
      
      const newCompletedItems = [...currentData.completedItems, newCompletedItem];
      updateCurrentDayData({ todos: newTodos, completedItems: newCompletedItems });
    }
  };

  const deleteTodo = (id: number) => {
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.filter(todo => todo.id !== id);
    updateCurrentDayData({ todos: newTodos });
  };

  // 투두 수정
  const updateTodo = (id: number, updates: Partial<Todo>) => {
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    );
    updateCurrentDayData({ todos: newTodos });
  };

  // 투두 순서 변경 (드래그 앤 드롭용)
  const reorderTodos = (oldIndex: number, newIndex: number) => {
    const currentData = getCurrentDayData();
    const todos = [...currentData.todos].sort((a, b) => a.order - b.order);
    
    if (oldIndex === newIndex) return;
    
    const [movedTodo] = todos.splice(oldIndex, 1);
    todos.splice(newIndex, 0, movedTodo);
    
    // 새로운 순서로 order 값 재할당
    const updatedTodos = todos.map((todo, index) => ({
      ...todo,
      order: index
    }));
    
    updateCurrentDayData({ todos: updatedTodos });
  };

  // 완료된 일 아이템 관리
  const addCompletedItem = (text: string, category: string) => {
    if (!text.trim()) return;
    const currentData = getCurrentDayData();
    const newItem: CompletedItem = {
      id: Date.now(),
      text: text.trim(),
      category,
      completedAt: new Date().toISOString()
    };
    const newCompletedItems = [...currentData.completedItems, newItem];
    updateCurrentDayData({ completedItems: newCompletedItems });
  };

  const deleteCompletedItem = (id: number) => {
    const currentData = getCurrentDayData();
    const newCompletedItems = currentData.completedItems.filter(item => item.id !== id);
    updateCurrentDayData({ completedItems: newCompletedItems });
  };

  // 자기 암시 저장
  const saveAffirmation = (affirmation: string) => {
    localStorage.setItem('userAffirmation', affirmation);
    updateCurrentDayData({ selfAffirmation: affirmation });
  };

  // 명언 새로고침
  const refreshQuote = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(randomQuote);
    updateCurrentDayData({ quote: randomQuote });
  };

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

  // 통계 계산
  const stats = calculateStats(data);
  const dayData = getCurrentDayData();

  // 탭 컴포넌트들을 props와 함께 렌더링하는 함수들
  const renderDashboardTab = () => (
    <DashboardTab
      dayData={dayData}
      dailyQuote={dailyQuote}
      refreshQuote={refreshQuote}
      saveAffirmation={saveAffirmation}
    />
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

  const renderStatsTab = () => (
    <StatsTab
      stats={stats}
      data={data}
    />
  );

  const tabs = [
    { id: 'dashboard', name: '대시보드', icon: BarChart3, component: renderDashboardTab },
    { id: 'todo', name: 'TODO', icon: CheckCircle, component: renderTodoTab },
    { id: 'thoughts', name: '생각정리', icon: Lightbulb, component: renderThoughtsTab },
    { id: 'diary', name: '일기', icon: Book, component: renderDiaryTab },
    { id: 'stats', name: '통계', icon: TrendingUp, component: renderStatsTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || renderDashboardTab;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 xl:p-12">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🔥 나를 넘어라 🔥
          </h1>
          <p className="text-lg lg:text-xl text-gray-600">매일 매일 성장하기 위한 기록</p>
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
                  onClick={() => setActiveTab(tab.id)}
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