import React, { useState } from 'react';
import { TrendingUp, Calendar, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { DayData } from '../../shared/types/types';

interface StatsTabProps {
  data: { [date: string]: DayData };
}

// 기록 모아보기 모달
const RecordsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  data: { [date: string]: DayData };
}> = ({ isOpen, onClose, data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  const allRecords = Object.keys(data)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map(date => ({
      date,
      data: data[date]
    }))
    .filter(record => {
      const todos = record.data.todos?.filter(todo => todo.completed) || [];
      const thoughts = record.data.thoughts?.filter(thought => thought.type === 'morning') || [];
      const hasReport = !!(record.data.dailyReport?.summary || record.data.dailyReport?.gratitude || record.data.dailyReport?.tomorrow_goals);
      return todos.length > 0 || thoughts.length > 0 || hasReport;
    });

  const totalPages = Math.ceil(allRecords.length / itemsPerPage);
  const currentRecords = allRecords.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">📚 나의 기록 모아보기</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] space-y-4">
          {currentRecords.map(({ date, data: dayData }) => {
            const completedTodos = dayData.todos?.filter(todo => todo.completed) || [];
            const thoughts = dayData.thoughts?.filter(thought => thought.type === 'morning') || [];
            const hasReport = !!(dayData.dailyReport?.summary || dayData.dailyReport?.gratitude || dayData.dailyReport?.tomorrow_goals);

            return (
              <div key={date} className="border rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-bold text-lg text-gray-800">
                    {new Date(date).toLocaleDateString('ko-KR', { 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    })}
                  </h4>
                  <div className="text-sm text-gray-500">
                    DO:{completedTodos.length} | THINK:{thoughts.length} | RECORD:{hasReport ? '✓' : '✗'}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* DO */}
                  {completedTodos.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-blue-700 mb-2">🎯 DO</h5>
                      <ul className="text-sm space-y-1">
                        {completedTodos.slice(0, 3).map((todo, idx) => (
                          <li key={idx} className="text-gray-700 line-clamp-1">• {todo.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* THINK */}
                  {thoughts.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-orange-700 mb-2">💡 THINK</h5>
                      <ul className="text-sm space-y-1">
                        {thoughts.slice(0, 3).map((thought, idx) => (
                          <li key={idx} className="text-gray-700 line-clamp-1">• {thought.text}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* RECORD */}
                  {hasReport && (
                    <div>
                      <h5 className="font-semibold text-green-700 mb-2">📝 RECORD</h5>
                      <div className="text-sm space-y-1">
                        {dayData.dailyReport?.summary && (
                          <p className="text-gray-700 line-clamp-1">오늘: {dayData.dailyReport.summary}</p>
                        )}
                        {dayData.dailyReport?.gratitude && (
                          <p className="text-gray-700 line-clamp-1">감사: {dayData.dailyReport.gratitude}</p>
                        )}
                        {dayData.dailyReport?.tomorrow_goals && (
                          <p className="text-gray-700 line-clamp-1">내일: {dayData.dailyReport.tomorrow_goals}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm text-gray-600">
              {currentPage + 1} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// 날짜별 기록 상세 모달
const DayDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  dayData: any;
  date: string;
}> = ({ isOpen, onClose, dayData, date }) => {
  if (!isOpen) return null;

  const completedTodos = dayData?.todos?.filter((todo: any) => todo.completed) || [];
  const thoughts = dayData?.thoughts?.filter((thought: any) => thought.type === 'morning') || [];
  const hasReport = !!(dayData?.dailyReport?.summary || dayData?.dailyReport?.gratitude || dayData?.dailyReport?.tomorrow_goals);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            📅 {new Date(date).toLocaleDateString('ko-KR', { 
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!dayData ? (
          <div className="text-center py-8 text-gray-500">
            <p>이 날짜에는 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* DO */}
            <div>
              <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                <span className="text-lg">🎯</span>
                <span className="ml-2">DO ({completedTodos.length})</span>
              </h4>
              {completedTodos.length > 0 ? (
                <ul className="space-y-2">
                  {completedTodos.map((todo: any, idx: number) => (
                    <li key={idx} className="text-gray-700 p-2 bg-blue-50 rounded-lg">• {todo.text}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">완료된 업무가 없습니다.</p>
              )}
            </div>

            {/* THINK */}
            <div>
              <h4 className="font-semibold text-orange-700 mb-3 flex items-center">
                <span className="text-lg">💡</span>
                <span className="ml-2">THINK ({thoughts.length})</span>
              </h4>
              {thoughts.length > 0 ? (
                <ul className="space-y-2">
                  {thoughts.map((thought: any, idx: number) => (
                    <li key={idx} className="text-gray-700 p-2 bg-orange-50 rounded-lg">• {thought.text}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">기록된 생각이 없습니다.</p>
              )}
            </div>

            {/* RECORD */}
            <div>
              <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                <span className="text-lg">📝</span>
                <span className="ml-2">RECORD</span>
              </h4>
              {hasReport ? (
                <div className="space-y-3">
                  {dayData.dailyReport?.summary && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-1">오늘 한 줄</p>
                      <p className="text-gray-700">{dayData.dailyReport.summary}</p>
                    </div>
                  )}
                  {dayData.dailyReport?.gratitude && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-1">감사일기</p>
                      <p className="text-gray-700">{dayData.dailyReport.gratitude}</p>
                    </div>
                  )}
                  {dayData.dailyReport?.tomorrow_goals && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-1">내일 집중</p>
                      <p className="text-gray-700">{dayData.dailyReport.tomorrow_goals}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">기록이 없습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatsTab: React.FC<StatsTabProps> = ({ data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 오늘 현황 계산
  const getTodayStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = data[today];
    
    if (!todayData) {
      return { completedTodos: 0, thoughtsCount: 0, hasReport: false };
    }
    
    const completedTodos = todayData.todos?.filter(todo => todo.completed).length || 0;
    const thoughtsCount = todayData.thoughts?.filter(thought => thought.type === 'morning').length || 0;
    const hasReport = !!(todayData.dailyReport?.summary && todayData.dailyReport?.gratitude && todayData.dailyReport?.tomorrow_goals);
    
    return { completedTodos, thoughtsCount, hasReport };
  };

  // 연속 달성 일수 계산
  const calculateStreakDays = () => {
    const allDates = Object.keys(data).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    
    // 최근 날짜부터 역순으로 확인
    for (let i = allDates.length - 1; i >= 0; i--) {
      const date = allDates[i];
      const dayData = data[date];
      
      const completedTodos = dayData.todos?.filter(todo => todo.completed).length || 0;
      const thoughtsCount = dayData.thoughts?.filter(thought => thought.type === 'morning').length || 0;
      const hasReport = !!(dayData.dailyReport?.summary && dayData.dailyReport?.gratitude && dayData.dailyReport?.tomorrow_goals);
      
      if (completedTodos >= 3 && thoughtsCount >= 3 && hasReport) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        if (i === allDates.length - 1) {
          // 오늘부터 연속이 끊어진 경우
          currentStreak = 0;
        }
        break;
      }
    }
    
    return { currentStreak, maxStreak };
  };

  // GitHub 잔디심기 스타일 데이터 (올해 전체)
  const getGrassData = () => {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1); // 올해 1월 1일
    const endOfYear = new Date(currentYear, 11, 31); // 올해 12월 31일
    
    // 1월 1일이 무슨 요일인지 확인 (0=일, 1=월, ..., 6=토)
    const startDayOfWeek = startOfYear.getDay();
    // 월요일을 시작으로 하기 위해 조정
    const mondayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    // 월요일부터 시작할 수 있도록 날짜 조정
    const gridStartDate = new Date(startOfYear);
    gridStartDate.setDate(startOfYear.getDate() - mondayOffset);
    
    const grassData = [];
    const totalDays = 371; // 53주 * 7일 = 371일 (여유 있게)
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(gridStartDate);
      date.setDate(gridStartDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // 올해를 벗어나면 중단
      if (date.getFullYear() > currentYear) break;
      
      const dayData = data[dateString];
      let level = 0;
      
      // 올해 데이터만 처리
      if (date.getFullYear() === currentYear && dayData) {
        const completedTodos = dayData.todos?.filter(todo => todo.completed).length || 0;
        const thoughtsCount = dayData.thoughts?.filter(thought => thought.type === 'morning').length || 0;
        const hasReport = !!(dayData.dailyReport?.summary || dayData.dailyReport?.gratitude || dayData.dailyReport?.tomorrow_goals);
        
        const totalScore = (completedTodos / 3) + (thoughtsCount / 3) + (hasReport ? 1 : 0);
        
        if (totalScore >= 2.5) level = 4; // 거의 완료
        else if (totalScore >= 2) level = 3; // 많이 완료
        else if (totalScore >= 1) level = 2; // 일부 완료
        else if (totalScore > 0) level = 1; // 조금 완료
        else level = 0; // 없음
      }
      
      grassData.push({
        date: dateString,
        level: date.getFullYear() === currentYear ? level : -1, // 올해 외는 -1로 표시
        dayData: date.getFullYear() === currentYear ? dayData : null,
        isCurrentYear: date.getFullYear() === currentYear
      });
    }
    
    return grassData;
  };

  const handleGrassClick = (day: any) => {
    setSelectedDayData(day.dayData);
    setSelectedDate(day.date);
    setIsDayDetailModalOpen(true);
  };

  const streakStats = calculateStreakDays();
  const todayStatus = getTodayStatus();
  const grassData = getGrassData();

  // 레벨별 색상 (단순함)
  const getLevelColor = (level: number) => {
    if (level === -1) {
      return 'bg-transparent'; // 올해 외
    } else if (level >= 3) {
      return 'bg-green-500'; // 완료
    } else {
      return 'bg-gray-200'; // 미완료
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 나의 성장 통계</h2>
        <p className="text-gray-600">매일 1% 성장하는 나의 여정</p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 연속 달성 일수 */}
        <div className="bg-white p-6 rounded-2xl border text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{streakStats.currentStreak}</div>
          <div className="text-gray-700 font-medium mb-1">연속 달성 일수</div>
          <div className="text-sm text-gray-500">
            최고 기록: {streakStats.maxStreak}일
          </div>
          <div className="mt-4">
            {streakStats.currentStreak > 0 ? (
              <div className="text-2xl">🔥</div>
            ) : (
              <div className="text-2xl">💪</div>
            )}
          </div>
        </div>

        {/* 총 활동 일수 */}
        <div className="bg-white p-6 rounded-2xl border text-center">
          <div className="text-4xl font-bold text-purple-600 mb-2">{Object.keys(data).length}</div>
          <div className="text-gray-700 font-medium mb-1">총 활동 일수</div>
          <div className="text-sm text-gray-500">
            꾸준함이 힘입니다
          </div>
          <div className="mt-4">
            <Calendar className="h-8 w-8 mx-auto text-purple-500" />
          </div>
        </div>

        {/* 오늘 현황 */}
        <div className="bg-white p-6 rounded-2xl border text-center">
          <div className="text-2xl mb-2">
            {todayStatus.completedTodos >= 3 && todayStatus.thoughtsCount >= 3 && todayStatus.hasReport ? '✅' : '⏳'}
          </div>
          <div className="text-gray-700 font-medium mb-1">오늘 현황</div>
          <div className="text-sm text-gray-500">
            DO: {todayStatus.completedTodos}/3 | THINK: {todayStatus.thoughtsCount}/3 | RECORD: {todayStatus.hasReport ? '✓' : '✗'}
          </div>
        </div>
      </div>

      {/* GitHub 잔디심기 스타일 */}
      <div className="bg-white p-6 rounded-2xl border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
            올해 활동 현황
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Eye className="h-3 w-3" />
            기록 보기
          </button>
        </div>
        
        {/* 월 표시 */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
          {['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map((month, idx) => (
            <div key={idx} className="text-center">
              {month}
            </div>
          ))}
        </div>
        
        {/* 잔디 그리드 */}
        <div className="grid grid-rows-7 grid-flow-col gap-0.5 mb-4 w-full overflow-x-auto">
          {grassData.map((day, index) => (
            <div
              key={index}
              className={`w-2.5 h-2.5 rounded-sm ${
                day.level === -1 
                  ? 'bg-transparent' 
                  : getLevelColor(day.level)
              } hover:scale-125 transition-transform ${
                day.isCurrentYear ? 'cursor-pointer' : ''
              }`}
              title={
                day.isCurrentYear 
                  ? `${new Date(day.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}: ${day.level >= 3 ? '3-3-3 완료' : '미완룼'}`
                  : ''
              }
              onClick={() => day.isCurrentYear && handleGrassClick(day)}
            />
          ))}
        </div>
        
        {/* 범례 */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-gray-200" />
            <span>미완료</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>3-3-3 완료</span>
          </div>
        </div>
      </div>

      {/* 기록 모아보기 모달 */}
      <RecordsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={data}
      />
      
      {/* 날짜별 상세 모달 */}
      <DayDetailModal 
        isOpen={isDayDetailModalOpen}
        onClose={() => setIsDayDetailModalOpen(false)}
        dayData={selectedDayData}
        date={selectedDate}
      />
    </div>
  );
};

export default StatsTab;