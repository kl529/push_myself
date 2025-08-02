'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Book, Heart, BarChart3, Target, Lightbulb, Coffee, Moon, TrendingUp, Plus, Trash2, Edit3, Save, RefreshCw, Star } from 'lucide-react';

// 타입 정의
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface DayData {
  todos: Todo[];
  dailyThought: string;
  quote: string;
  diary: string;
  morningThought: string;
  mood: number;
  tasksReview: string;
  dailySummary: string;
  selfAffirmation: string;
  mustDo: string[];
  dailyIdea: string; // 하루 1개 아이디어 추가
}

interface Data {
  [date: string]: DayData;
}

interface Stats {
  totalDays: number;
  completedTodos: number;
  averageMood: string;
}

interface MoodData {
  date: string;
  mood: number;
  todos: number;
  completed: number;
}

// 명언 데이터베이스
const quotes = [
  "성공은 최종 목표가 아니라, 매일의 작은 노력의 결과입니다.",
  "오늘 할 수 있는 일을 내일로 미루지 마세요.",
  "가장 큰 영광은 넘어지지 않는 것이 아니라, 매번 일어서는 데에 있습니다.",
  "당신이 생각하는 것보다 당신은 더 강합니다.",
  "작은 진전이라도 매일 이루어내면 큰 변화를 만들 수 있습니다.",
  "실패는 성공의 어머니입니다. 포기하지 마세요.",
  "오늘의 투자는 내일의 성공입니다.",
  "자신을 믿으세요. 당신은 생각보다 더 많은 것을 알고 있습니다.",
  "매일 조금씩 성장하면, 1년 후에는 완전히 다른 사람이 됩니다.",
  "긍정적인 마음가짐이 긍정적인 결과를 만듭니다.",
  "시간은 가장 귀중한 자산입니다. 현명하게 사용하세요.",
  "목표를 향해 한 걸음씩 나아가면 언젠가는 도달합니다.",
  "어려움은 성장의 기회입니다.",
  "오늘 하루를 최선을 다해 살아보세요.",
  "당신의 잠재력은 무한합니다.",
  "작은 습관이 큰 변화를 만듭니다.",
  "끝까지 해보기 전까지는 불가능이라고 말하지 마세요.",
  "매일의 선택이 당신의 미래를 결정합니다.",
  "성공의 비밀은 시작하는 것입니다.",
  "당신은 충분히 좋습니다."
];

const SelfDevelopmentTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<Data>({});
  const [dailyQuote, setDailyQuote] = useState('');
  const [showAffirmation, setShowAffirmation] = useState(false);

  // 데이터 구조 초기화
  const initializeData = (date: string): DayData => ({
    todos: [],
    dailyThought: '',
    quote: '',
    diary: '',
    morningThought: '',
    mood: 3,
    tasksReview: '',
    dailySummary: '',
    selfAffirmation: '',
    mustDo: ['', '', ''],
    dailyIdea: ''
  });

  // 로컬스토리지에서 데이터 로드
  useEffect(() => {
    const savedData = localStorage.getItem('selfDevelopmentData');
    if (savedData) {
      setData(JSON.parse(savedData));
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

  // 자기 암시 표시 (페이지 로드 시)
  useEffect(() => {
    const savedAffirmation = localStorage.getItem('userAffirmation');
    if (savedAffirmation) {
      setShowAffirmation(true);
      setTimeout(() => setShowAffirmation(false), 5000); // 5초 후 자동 숨김
    }
  }, []);

  // 데이터 저장
  const saveData = (newData: Data) => {
    const updatedData = { ...data, ...newData };
    setData(updatedData);
    localStorage.setItem('selfDevelopmentData', JSON.stringify(updatedData));
  };

  // 현재 날짜 데이터 가져오기
  const getCurrentDayData = () => {
    return data[currentDate] || initializeData(currentDate);
  };

  // 날짜별 데이터 업데이트
  const updateDayData = (updates: Partial<DayData>) => {
    const newData = {
      ...data,
      [currentDate]: {
        ...getCurrentDayData(),
        ...updates
      }
    };
    saveData(newData);
  };

  // 투두리스트 관리
  const addTodo = (text: string) => {
    if (!text.trim()) return;
    const currentData = getCurrentDayData();
    const newTodos = [...currentData.todos, { id: Date.now(), text, completed: false }];
    updateDayData({ todos: newTodos });
  };

  const toggleTodo = (id: number) => {
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    updateDayData({ todos: newTodos });
  };

  const deleteTodo = (id: number) => {
    const currentData = getCurrentDayData();
    const newTodos = currentData.todos.filter(todo => todo.id !== id);
    updateDayData({ todos: newTodos });
  };

  // 자기 암시 저장
  const saveAffirmation = (affirmation: string) => {
    localStorage.setItem('userAffirmation', affirmation);
    updateDayData({ selfAffirmation: affirmation });
  };

  // 명언 새로고침
  const refreshQuote = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(randomQuote);
    updateDayData({ quote: randomQuote });
  };

  // 통계 계산
  const getStats = (): Stats => {
    const allDates = Object.keys(data);
    const totalDays = allDates.length;
    const completedTodos = allDates.reduce((acc: number, date: string) => {
      return acc + (data[date].todos?.filter(todo => todo.completed).length || 0);
    }, 0);
    const averageMood = allDates.length > 0 
      ? allDates.reduce((acc: number, date: string) => acc + (data[date].mood || 3), 0) / allDates.length
      : 3;
    
    return { totalDays, completedTodos, averageMood: averageMood.toFixed(1) };
  };

  const dayData = getCurrentDayData();
  const stats = getStats();

  // 탭별 컴포넌트들
  const DashboardTab = () => (
    <div className="space-y-8 lg:space-y-10">
      {/* 자기 암시 알림 */}
      {showAffirmation && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 lg:p-10 rounded-2xl shadow-xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-8 w-8 lg:h-10 lg:w-10 mr-4" />
              <div>
                <h3 className="text-xl lg:text-2xl font-semibold mb-2">오늘의 자기 암시</h3>
                <p className="text-lg lg:text-xl">{localStorage.getItem('userAffirmation') || dayData.selfAffirmation}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAffirmation(false)}
              className="text-white hover:text-gray-200 text-2xl lg:text-3xl"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 오늘의 명언 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-8 lg:p-10 rounded-2xl shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center">
              <Book className="h-6 w-6 lg:h-8 lg:w-8 mr-3" />
              오늘의 명언
            </h3>
            <p className="text-lg lg:text-xl xl:text-2xl italic leading-relaxed">"{dailyQuote}"</p>
          </div>
          <button
            onClick={refreshQuote}
            className="ml-6 p-3 lg:p-4 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
            title="새로운 명언 보기"
          >
            <RefreshCw className="h-6 w-6 lg:h-8 lg:w-8" />
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        <div className="bg-blue-50 p-6 lg:p-8 rounded-2xl shadow-sm border">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600 mr-3" />
            <h3 className="font-semibold text-blue-900 text-lg lg:text-xl">기록 일수</h3>
          </div>
          <p className="text-3xl lg:text-4xl xl:text-5xl font-bold text-blue-600">{stats.totalDays}일</p>
        </div>
        <div className="bg-green-50 p-6 lg:p-8 rounded-2xl shadow-sm border">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-green-600 mr-3" />
            <h3 className="font-semibold text-green-900 text-lg lg:text-xl">완료한 할일</h3>
          </div>
          <p className="text-3xl lg:text-4xl xl:text-5xl font-bold text-green-600">{stats.completedTodos}개</p>
        </div>
        <div className="bg-purple-50 p-6 lg:p-8 rounded-2xl shadow-sm border">
          <div className="flex items-center mb-4">
            <Heart className="h-6 w-6 lg:h-8 lg:w-8 text-purple-600 mr-3" />
            <h3 className="font-semibold text-purple-900 text-lg lg:text-xl">평균 기분</h3>
          </div>
          <p className="text-3xl lg:text-4xl xl:text-5xl font-bold text-purple-600">{stats.averageMood}/5</p>
        </div>
        <div className="bg-orange-50 p-6 lg:p-8 rounded-2xl shadow-sm border md:col-span-2 lg:col-span-1">
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 lg:h-8 lg:w-8 text-orange-600 mr-3" />
            <h3 className="font-semibold text-orange-900 text-lg lg:text-xl">오늘의 목표</h3>
          </div>
          <p className="text-3xl lg:text-4xl xl:text-5xl font-bold text-orange-600">
            {dayData.mustDo.filter(item => item.trim()).length}/3
          </p>
        </div>
      </div>

      {/* 오늘 꼭 해야할 것 3가지 */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Target className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-red-600" />
          오늘 꼭 해야할 것 3가지
        </h3>
        <div className="space-y-4 lg:space-y-6">
          {dayData.mustDo.map((item: string, index: number) => (
            <input
              key={index}
              type="text"
              value={item}
              onChange={(e) => {
                const newMustDo = [...dayData.mustDo];
                newMustDo[index] = e.target.value;
                updateDayData({ mustDo: newMustDo });
              }}
              placeholder={`${index + 1}번째 중요한 일`}
              className="w-full p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg lg:text-xl"
            />
          ))}
        </div>
      </div>

      {/* 오늘 기분 */}
      <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
        <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
          <Heart className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-pink-600" />
          오늘 기분 (1-5)
        </h3>
        <div className="flex space-x-3 lg:space-x-4">
          {[1, 2, 3, 4, 5].map((mood) => (
            <button
              key={mood}
              onClick={() => updateDayData({ mood })}
              className={`p-4 lg:p-6 rounded-xl font-semibold text-lg lg:text-xl transition-colors ${
                dayData.mood === mood
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
        <div className="mt-4 text-base lg:text-lg text-gray-600">
          {dayData.mood === 1 && '😢 매우 우울'}
          {dayData.mood === 2 && '😔 우울'}
          {dayData.mood === 3 && '😐 보통'}
          {dayData.mood === 4 && '😊 좋음'}
          {dayData.mood === 5 && '😄 매우 좋음'}
        </div>
      </div>
    </div>
  );

  const TodoTab = () => {
    const [newTodo, setNewTodo] = useState('');

    return (
      <div className="space-y-8 lg:space-y-10">
        <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg border">
          <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
            <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 mr-3 text-blue-600" />
            투두리스트 작성
          </h3>
          <div className="flex gap-3 lg:gap-4 mb-6">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="새로운 할 일을 입력하세요"
              className="flex-1 p-4 lg:p-5 border rounded-xl focus:ring-2 focus:ring-blue-500 text-lg lg:text-xl"
              onKeyPress={(e) => e.key === 'Enter' && (addTodo(newTodo), setNewTodo(''))}
            />
            <button
              onClick={() => (addTodo(newTodo), setNewTodo(''))}
              className="px-6 lg:px-8 py-4 lg:py-5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center text-lg lg:text-xl"
            >
              <Plus className="h-5 w-5 lg:h-6 lg:w-6" />
            </button>
          </div>
          
          <div className="space-y-3 lg:space-y-4">
            {dayData.todos.length === 0 ? (
              <div className="text-center py-12 lg:py-16 text-gray-500">
                <CheckCircle className="h-16 w-16 lg:h-20 lg:w-20 mx-auto mb-4 text-gray-300" />
                <p className="text-lg lg:text-xl">아직 할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>
              </div>
            ) : (
              dayData.todos.map((todo: Todo) => (
                <div key={todo.id} className="flex items-center gap-4 p-4 lg:p-6 bg-gray-50 rounded-xl">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`p-2 rounded-lg ${todo.completed ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8" />
                  </button>
                  <span className={`flex-1 text-lg lg:text-xl ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.text}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5 lg:h-6 lg:w-6" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const ThoughtsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Coffee className="h-5 w-5 mr-2 text-amber-600" />
          아침 생각정리
        </h3>
        <textarea
          value={dayData.morningThought}
          onChange={(e) => updateDayData({ morningThought: e.target.value })}
          placeholder="아침에 떠오른 생각들을 정리해보세요. 오늘 하루를 어떻게 보내고 싶은지, 어떤 마음가짐으로 시작하고 싶은지 적어보세요."
          className="w-full p-4 border rounded-lg h-32 focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
          하루 1개 아이디어 정리
        </h3>
        <textarea
          value={dayData.dailyIdea}
          onChange={(e) => updateDayData({ dailyIdea: e.target.value })}
          placeholder="오늘 떠오른 창의적인 아이디어나 영감을 적어보세요. 작은 아이디어도 큰 변화의 시작이 될 수 있습니다."
          className="w-full p-4 border rounded-lg h-32 focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Book className="h-5 w-5 mr-2 text-indigo-600" />
          하루 1개 생각정리
        </h3>
        <textarea
          value={dayData.dailyThought}
          onChange={(e) => updateDayData({ dailyThought: e.target.value })}
          placeholder="오늘 하루 중 가장 인상 깊었던 생각을 정리해보세요"
          className="w-full p-4 border rounded-lg h-32 focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          자기암시 설정
        </h3>
        <div className="mb-4">
          <textarea
            value={dayData.selfAffirmation}
            onChange={(e) => updateDayData({ selfAffirmation: e.target.value })}
            placeholder="자신에게 해주고 싶은 긍정적인 말을 적어보세요. 이 메시지는 매일 대시보드에서 보여집니다."
            className="w-full p-4 border rounded-lg h-24 focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => saveAffirmation(dayData.selfAffirmation)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            자기 암시 저장
          </button>
          <button
            onClick={() => setShowAffirmation(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            지금 보기
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          저장된 자기 암시는 매일 페이지를 열 때 자동으로 표시됩니다.
        </p>
      </div>
    </div>
  );

  const DiaryTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Book className="h-5 w-5 mr-2 text-blue-600" />
          일기
        </h3>
        <textarea
          value={dayData.diary}
          onChange={(e) => updateDayData({ diary: e.target.value })}
          placeholder="오늘 하루는 어땠나요? 자유롭게 작성해보세요"
          className="w-full p-4 border rounded-lg h-40 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
          했던 일들 할일 정리
        </h3>
        <textarea
          value={dayData.tasksReview}
          onChange={(e) => updateDayData({ tasksReview: e.target.value })}
          placeholder="오늘 했던 일들을 돌아보고 내일 할 일을 정리해보세요"
          className="w-full p-4 border rounded-lg h-32 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Moon className="h-5 w-5 mr-2 text-gray-600" />
          하루 한줄 요약
        </h3>
        <input
          type="text"
          value={dayData.dailySummary}
          onChange={(e) => updateDayData({ dailySummary: e.target.value })}
          placeholder="오늘 하루를 한 줄로 요약한다면?"
          className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-gray-500"
        />
      </div>
    </div>
  );

  const StatsTab = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const moodData: MoodData[] = last7Days.map(date => ({
      date: new Date(date).getMonth() + 1 + '/' + new Date(date).getDate(),
      mood: data[date]?.mood || 0,
      todos: data[date]?.todos?.length || 0,
      completed: data[date]?.todos?.filter(t => t.completed).length || 0
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
            <div className="text-sm text-blue-800">총 기록일</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completedTodos}</div>
            <div className="text-sm text-green-800">완료한 할일</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.averageMood}</div>
            <div className="text-sm text-purple-800">평균 기분</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Object.values(data).filter((d: DayData) => d.diary?.length > 0).length}
            </div>
            <div className="text-sm text-orange-800">일기 작성일</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">최근 7일 기분 변화</h3>
          <div className="space-y-2">
            {moodData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm">{day.date}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-gradient-to-r from-red-400 to-green-400 h-4 rounded-full"
                    style={{ width: `${(day.mood / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-right">{day.mood}/5</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">할일 완료율</h3>
          <div className="space-y-2">
            {moodData.map((day, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-sm">{day.date}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: day.todos > 0 ? `${(day.completed / day.todos) * 100}%` : '0%' }}
                  ></div>
                </div>
                <div className="w-20 text-sm text-right">{day.completed}/{day.todos}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', name: '대시보드', icon: BarChart3, component: DashboardTab },
    { id: 'todo', name: '투두리스트', icon: CheckCircle, component: TodoTab },
    { id: 'thoughts', name: '생각정리', icon: Lightbulb, component: ThoughtsTab },
    { id: 'diary', name: '일기', icon: Book, component: DiaryTab },
    { id: 'stats', name: '통계', icon: TrendingUp, component: StatsTab }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || DashboardTab;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 xl:p-12">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4">✨ 자기계발 기록소 ✨</h1>
          <p className="text-lg lg:text-xl text-gray-600">매일매일 성장하는 나를 기록해보세요</p>
        </div>

        {/* 날짜 선택 */}
        <div className="mb-8 flex justify-center">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="p-4 lg:p-5 border rounded-xl text-xl lg:text-2xl font-semibold focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
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
                  className={`flex items-center gap-2 px-6 py-3 lg:px-8 lg:py-4 rounded-xl font-medium transition-colors text-base lg:text-lg ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
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
        <div className="mb-12">
          <ActiveComponent />
        </div>

        {/* 푸터 */}
        <div className="text-center text-gray-500 text-base lg:text-lg">
          오늘도 한 걸음 더 성장하는 여러분을 응원합니다! 💪
        </div>
      </div>
    </div>
  );
};

export default SelfDevelopmentTracker;