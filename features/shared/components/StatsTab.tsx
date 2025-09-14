import React, { useState } from 'react';
import { CheckCircle, Circle, Brain, BookOpen, TrendingUp, Calendar, History, X } from 'lucide-react';
import { Data, DayData } from '../types/types';

interface StatsTabProps {
  data: Data;
}

const StatsTab: React.FC<StatsTabProps> = ({ data }) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayData = data[today] || {
    todos: [],
    thoughts: [],
    dailyReport: {
      date: today,
      summary: '',
      gratitude: '',
      tomorrow_goals: '',
      mood: '보통',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  };

  // 3-3-3 현황 계산
  const todosCompleted = todayData.todos?.filter(todo => todo.completed).length || 0;
  const totalTodos = Math.min(todayData.todos?.length || 0, 3);
  const thoughtsCount = Math.min(todayData.thoughts?.length || 0, 3);
  const recordsCount = [
    todayData.dailyReport?.summary?.trim(),
    todayData.dailyReport?.gratitude?.trim(),
    todayData.dailyReport?.tomorrow_goals?.trim()
  ].filter(Boolean).length;

  // 최근 7일 데이터
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const weekStats = last7Days.map(date => {
    const dayData = data[date] || { todos: [], thoughts: [], dailyReport: null };
    return {
      date: new Date(date).getDate(),
      todos: Math.min(dayData.todos?.length || 0, 3),
      completed: dayData.todos?.filter(todo => todo.completed).length || 0,
      thoughts: Math.min(dayData.thoughts?.length || 0, 3),
      records: dayData.dailyReport ? [
        dayData.dailyReport.summary?.trim(),
        dayData.dailyReport.gratitude?.trim(),
        dayData.dailyReport.tomorrow_goals?.trim()
      ].filter(Boolean).length : 0
    };
  });

  const totalDays = Object.keys(data).length;
  const totalCompletedTodos = Object.values(data).reduce((acc, day) =>
    acc + (day.todos?.filter(todo => todo.completed).length || 0), 0);

  // 이전 기록 데이터 (최근 30일)
  const getHistoryData = () => {
    return Object.keys(data)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // 최신순 정렬
      .slice(0, 30) // 최근 30일
      .map(date => {
        const dayData = data[date];
        return {
          date,
          formattedDate: new Date(date).toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
            weekday: 'short'
          }),
          todos: dayData.todos || [],
          thoughts: dayData.thoughts || [],
          dailyReport: dayData.dailyReport,
          completedTodos: dayData.todos?.filter(todo => todo.completed).length || 0,
          totalTodos: Math.min(dayData.todos?.length || 0, 3),
          thoughtsCount: Math.min(dayData.thoughts?.length || 0, 3),
          recordsCount: dayData.dailyReport ? [
            dayData.dailyReport.summary?.trim(),
            dayData.dailyReport.gratitude?.trim(),
            dayData.dailyReport.tomorrow_goals?.trim()
          ].filter(Boolean).length : 0
        };
      });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* 오늘의 3-3-3 현황 - 최상단 강조 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-2xl border-2 border-blue-200">
        <h3 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 text-center">🎯 오늘의 3-3-3 현황</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {/* DO */}
          <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700 text-sm lg:text-base">DO (할일)</h4>
              <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-green-500" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              {todosCompleted}/3
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
              <div
                className="bg-green-500 h-2 lg:h-3 rounded-full transition-all duration-300"
                style={{ width: `${(todosCompleted / 3) * 100}%` }}
              />
            </div>
            <p className="text-xs lg:text-sm text-gray-600 mt-2">
              {todosCompleted === 3 ? '완성! 🎉' : `${3 - todosCompleted}개 남음`}
            </p>
          </div>

          {/* THINK */}
          <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700 text-sm lg:text-base">THINK (생각)</h4>
              <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              {thoughtsCount}/3
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
              <div
                className="bg-purple-500 h-2 lg:h-3 rounded-full transition-all duration-300"
                style={{ width: `${(thoughtsCount / 3) * 100}%` }}
              />
            </div>
            <p className="text-xs lg:text-sm text-gray-600 mt-2">
              {thoughtsCount === 3 ? '완성! 🎉' : `${3 - thoughtsCount}개 남음`}
            </p>
          </div>

          {/* RECORD */}
          <div className="bg-white p-4 lg:p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-700 text-sm lg:text-base">RECORD (기록)</h4>
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              {recordsCount}/3
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3">
              <div
                className="bg-blue-500 h-2 lg:h-3 rounded-full transition-all duration-300"
                style={{ width: `${(recordsCount / 3) * 100}%` }}
              />
            </div>
            <p className="text-xs lg:text-sm text-gray-600 mt-2">
              {recordsCount === 3 ? '완성! 🎉' : `${3 - recordsCount}개 남음`}
            </p>
          </div>
        </div>
      </div>

      {/* 최근 7일 활동 */}
      <div className="bg-white p-4 lg:p-6 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between gap-2 lg:gap-3 mb-4 lg:mb-6">
          <div className="flex items-center gap-2 lg:gap-3">
            <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
            <h3 className="text-lg lg:text-xl font-bold text-gray-800">최근 7일 활동</h3>
          </div>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="inline-flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-xs lg:text-sm"
          >
            <History className="w-3 h-3 lg:w-4 lg:h-4" />
            이전 기록
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 lg:gap-3">
          {weekStats.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-xs lg:text-sm font-medium text-gray-600 mb-2">
                {day.date}일
              </div>
              <div className="space-y-1 lg:space-y-2">
                {/* DO */}
                <div className="flex justify-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Circle
                      key={i}
                      className={`w-2 h-2 lg:w-3 lg:h-3 ${
                        i < day.completed ? 'fill-green-500 text-green-500' :
                        i < day.todos ? 'fill-gray-300 text-gray-300' :
                        'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* THINK */}
                <div className="flex justify-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Circle
                      key={i}
                      className={`w-2 h-2 lg:w-3 lg:h-3 ${
                        i < day.thoughts ? 'fill-purple-500 text-purple-500' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* RECORD */}
                <div className="flex justify-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Circle
                      key={i}
                      className={`w-2 h-2 lg:w-3 lg:h-3 ${
                        i < day.records ? 'fill-blue-500 text-blue-500' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <Circle className="w-3 h-3 lg:w-4 lg:h-4 fill-green-500 text-green-500" />
            <span className="text-gray-600">완료한 할일</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <Circle className="w-3 h-3 lg:w-4 lg:h-4 fill-purple-500 text-purple-500" />
            <span className="text-gray-600">생각 기록</span>
          </div>
          <div className="flex items-center gap-2 text-xs lg:text-sm">
            <Circle className="w-3 h-3 lg:w-4 lg:h-4 fill-blue-500 text-blue-500" />
            <span className="text-gray-600">일일 기록</span>
          </div>
        </div>
      </div>

      {/* 전체 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 lg:p-6 rounded-2xl border border-green-200">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            <h4 className="font-bold text-gray-800 text-base lg:text-lg">활동 일수</h4>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1 lg:mb-2">
            {totalDays}일
          </div>
          <p className="text-xs lg:text-sm text-gray-600">
            지금까지 기록한 날
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            <h4 className="font-bold text-gray-800 text-base lg:text-lg">완료한 할일</h4>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1 lg:mb-2">
            {totalCompletedTodos}개
          </div>
          <p className="text-xs lg:text-sm text-gray-600">
            총 달성한 할일 수
          </p>
        </div>
      </div>

      {/* 이전 기록 모달 */}
      {showHistoryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
              <h2 className="text-lg lg:text-xl font-bold text-gray-800 flex items-center gap-2 lg:gap-3">
                <History className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-600" />
                이전 기록 (최근 30일)
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" />
              </button>
            </div>

            <div className="p-4 lg:p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-3 lg:space-y-4">
                {getHistoryData().map((day, index) => (
                  <div key={day.date} className="bg-gray-50 p-4 lg:p-5 rounded-xl border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 lg:gap-4 mb-3 lg:mb-4">
                      <h3 className="font-semibold text-gray-800 text-sm lg:text-base">
                        {day.formattedDate}
                        {day.date === today && (
                          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">오늘</span>
                        )}
                      </h3>
                      <div className="flex gap-4 lg:gap-6 text-xs lg:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-green-500" />
                          {day.completedTodos}/3
                        </span>
                        <span className="flex items-center gap-1">
                          <Brain className="w-3 h-3 lg:w-4 lg:h-4 text-purple-500" />
                          {day.thoughtsCount}/3
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" />
                          {day.recordsCount}/3
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                      {/* DO */}
                      <div>
                        <h4 className="font-medium text-gray-700 text-xs lg:text-sm mb-2 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-green-500" />
                          DO (할일)
                        </h4>
                        <div className="space-y-1">
                          {day.todos.length > 0 ? day.todos.map((todo, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs lg:text-sm">
                              <Circle className={`w-2 h-2 lg:w-3 lg:h-3 ${
                                todo.completed ? 'fill-green-500 text-green-500' : 'text-gray-300'
                              }`} />
                              <span className={todo.completed ? 'text-gray-700' : 'text-gray-500'}>
                                {todo.text || '(내용 없음)'}
                              </span>
                            </div>
                          )) : (
                            <span className="text-xs lg:text-sm text-gray-400">할일 없음</span>
                          )}
                        </div>
                      </div>

                      {/* THINK */}
                      <div>
                        <h4 className="font-medium text-gray-700 text-xs lg:text-sm mb-2 flex items-center gap-1">
                          <Brain className="w-3 h-3 lg:w-4 lg:h-4 text-purple-500" />
                          THINK (생각)
                        </h4>
                        <div className="space-y-1">
                          {day.thoughts.length > 0 ? day.thoughts.map((thought, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs lg:text-sm">
                              <Circle className="w-2 h-2 lg:w-3 lg:h-3 fill-purple-500 text-purple-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 line-clamp-2">
                                {thought.text || '(내용 없음)'}
                              </span>
                            </div>
                          )) : (
                            <span className="text-xs lg:text-sm text-gray-400">생각 없음</span>
                          )}
                        </div>
                      </div>

                      {/* RECORD */}
                      <div>
                        <h4 className="font-medium text-gray-700 text-xs lg:text-sm mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3 lg:w-4 lg:h-4 text-blue-500" />
                          RECORD (기록)
                        </h4>
                        <div className="space-y-1 text-xs lg:text-sm text-gray-600">
                          {day.dailyReport ? (
                            <>
                              {day.dailyReport.summary && (
                                <div>
                                  <span className="font-medium">요약: </span>
                                  <span>{day.dailyReport.summary}</span>
                                </div>
                              )}
                              {day.dailyReport.gratitude && (
                                <div>
                                  <span className="font-medium">감사: </span>
                                  <span>{day.dailyReport.gratitude}</span>
                                </div>
                              )}
                              {day.dailyReport.tomorrow_goals && (
                                <div>
                                  <span className="font-medium">내일: </span>
                                  <span>{day.dailyReport.tomorrow_goals}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">기록 없음</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {getHistoryData().length === 0 && (
                  <div className="text-center py-8 lg:py-12 text-gray-500">
                    <History className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg lg:text-xl">아직 기록이 없습니다</p>
                    <p className="text-sm lg:text-base mt-2">데이터를 입력하면 여기에 나타납니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsTab;