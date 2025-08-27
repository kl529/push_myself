import React, { useState } from 'react';
import { BarChart, Calendar, TrendingUp, Users, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeeklyStats, DayData } from '../../shared/types/types';

interface StatsTabProps {
  data: { [date: string]: DayData };
  weeklyStats: WeeklyStats[];
  onNavigateWeek: (direction: 'prev' | 'next') => void;
  currentWeek: string;
}

const StatsTab: React.FC<StatsTabProps> = ({ data, weeklyStats, onNavigateWeek, currentWeek }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly'>('overview');
  
  // 전체 통계 계산
  const calculateOverallStats = () => {
    const allDates = Object.keys(data);
    const totalDays = allDates.length;
    let totalCompletedTodos = 0;
    let totalMoodSum = 0;
    let moodCount = 0;
    let totalThoughts = 0;
    let totalDiaryEntries = 0;

    allDates.forEach(date => {
      const dayData = data[date];
      
      // 완료된 할일 계산
      totalCompletedTodos += dayData.todos?.filter(todo => todo.completed).length || 0;
      
      // 기분 평균 계산
      if (dayData.dailyReport?.mood) {
        const moodValue = getMoodValue(dayData.dailyReport.mood);
        totalMoodSum += moodValue;
        moodCount++;
      }
      
      // 생각 개수 계산
      totalThoughts += dayData.thoughts?.length || 0;
      
      // 일기 항목 계산
      totalDiaryEntries += dayData.diary?.length || 0;
    });

    const averageMood = moodCount > 0 ? (totalMoodSum / moodCount).toFixed(1) : '0';

    return {
      totalDays,
      totalCompletedTodos,
      averageMood,
      totalThoughts,
      totalDiaryEntries
    };
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

  const getMoodEmoji = (mood: string): string => {
    switch (mood) {
      case '매우좋음': return '😍';
      case '좋음': return '😊';
      case '보통': return '😐';
      case '나쁨': return '😔';
      case '매우나쁨': return '😭';
      default: return '😐';
    }
  };

  // 최근 7일 데이터 가져오기
  const getLast7DaysData = () => {
    const dates = Object.keys(data).sort().slice(-7);
    return dates.map(date => {
      const dayData = data[date];
      const completedTodos = dayData.todos?.filter(todo => todo.completed).length || 0;
      const totalTodos = dayData.todos?.length || 0;
      const moodValue = dayData.dailyReport?.mood ? getMoodValue(dayData.dailyReport.mood) : 0;
      const hasReport = !!(dayData.dailyReport?.summary);
      
      return {
        date: new Date(date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
        completedTodos,
        totalTodos,
        mood: moodValue,
        hasReport,
        thoughts: dayData.thoughts?.length || 0
      };
    });
  };

  // 주간 통계 차트용 데이터
  const getWeeklyChartData = () => {
    return weeklyStats.slice(-8).map(week => ({
      week: new Date(week.week_start_date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
      reports: week.daily_reports_written,
      tasks: week.completed_tasks,
      mood: week.mood_average.toFixed(1),
      thoughts: week.thoughts_count
    }));
  };

  // 최근 기록 모아보기 데이터
  const getRecentEntries = () => {
    const allDates = Object.keys(data).sort().reverse().slice(0, 10);
    
    const summaries = allDates
      .filter(date => data[date].dailyReport?.summary?.trim())
      .map(date => ({
        date: new Date(date).toLocaleDateString('ko-KR'),
        content: data[date].dailyReport.summary
      }));

    const gratitude = allDates
      .filter(date => data[date].dailyReport?.gratitude?.trim())
      .map(date => ({
        date: new Date(date).toLocaleDateString('ko-KR'),
        content: data[date].dailyReport.gratitude
      }));

    const tomorrowGoals = allDates
      .filter(date => data[date].dailyReport?.tomorrow_goals?.trim())
      .map(date => ({
        date: new Date(date).toLocaleDateString('ko-KR'),
        content: data[date].dailyReport.tomorrow_goals
      }));

    return { summaries, gratitude, tomorrowGoals };
  };

  const overallStats = calculateOverallStats();
  const last7Days = getLast7DaysData();
  const weeklyChartData = getWeeklyChartData();
  const recentEntries = getRecentEntries();

  const getWeekDateRange = (weekStart: string) => {
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* 탭 네비게이션 */}
      <div className="bg-white p-1 rounded-2xl border shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            종합 통계
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            주간 분석
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* 종합 통계 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-blue-50 p-4 lg:p-6 rounded-2xl text-center">
              <div className="text-2xl lg:text-3xl font-bold text-blue-600">{overallStats.totalDays}</div>
              <div className="text-sm lg:text-base text-blue-800">총 기록일</div>
            </div>
            <div className="bg-green-50 p-4 lg:p-6 rounded-2xl text-center">
              <div className="text-2xl lg:text-3xl font-bold text-green-600">{overallStats.totalCompletedTodos}</div>
              <div className="text-sm lg:text-base text-green-800">완료한 할일</div>
            </div>
            <div className="bg-purple-50 p-4 lg:p-6 rounded-2xl text-center">
              <div className="text-2xl lg:text-3xl font-bold text-purple-600">{overallStats.totalThoughts}</div>
              <div className="text-sm lg:text-base text-purple-800">기록한 생각</div>
            </div>
            <div className="bg-orange-50 p-4 lg:p-6 rounded-2xl text-center">
              <div className="text-2xl lg:text-3xl font-bold text-orange-600">{overallStats.averageMood}</div>
              <div className="text-sm lg:text-base text-orange-800">평균 기분</div>
            </div>
          </div>

          {/* 최근 7일 기분 변화 */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm">
            <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-blue-600" />
              최근 7일 기분 변화
            </h3>
            <div className="space-y-4">
              {last7Days.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm lg:text-base">{day.date}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 lg:h-6 relative">
                    <div 
                      className="bg-gradient-to-r from-red-400 to-green-400 h-4 lg:h-6 rounded-full transition-all"
                      style={{ width: `${(day.mood / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-16 text-sm lg:text-base text-right flex items-center">
                    {getMoodEmoji(['', '매우나쁨', '나쁨', '보통', '좋음', '매우좋음'][day.mood])} {day.mood}/5
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 7일 할일 완료율 */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm">
            <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
              <BarChart className="h-6 w-6 mr-3 text-green-600" />
              최근 7일 할일 완료율
            </h3>
            <div className="space-y-4">
              {last7Days.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm lg:text-base">{day.date}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 lg:h-6 relative">
                    <div 
                      className="bg-green-500 h-4 lg:h-6 rounded-full transition-all"
                      style={{ width: day.totalTodos > 0 ? `${(day.completedTodos / day.totalTodos) * 100}%` : '0%' }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm lg:text-base text-right">{day.completedTodos}/{day.totalTodos}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 최근 기록 모아보기 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 한줄요약 모아보기 */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                한줄요약 모아보기
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentEntries.summaries.length > 0 ? (
                  recentEntries.summaries.map((item, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">{item.date}</div>
                      <div className="text-sm font-medium text-gray-800">{item.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    아직 한줄요약이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 감사일기 모아보기 */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🙏</span>
                감사일기 모아보기
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentEntries.gratitude.length > 0 ? (
                  recentEntries.gratitude.map((item, index) => (
                    <div key={index} className="p-3 bg-pink-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">{item.date}</div>
                      <div className="text-sm font-medium text-gray-800">{item.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    아직 감사일기가 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 내일의 나에게 모아보기 */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">💌</span>
                내일의 나에게
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentEntries.tomorrowGoals.length > 0 ? (
                  recentEntries.tomorrowGoals.map((item, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">{item.date}</div>
                      <div className="text-sm font-medium text-gray-800">{item.content}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    아직 메시지가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* 주간 네비게이션 */}
          <div className="bg-white p-4 lg:p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => onNavigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  <h2 className="text-lg lg:text-xl font-semibold">주간 분석</h2>
                </div>
                <p className="text-sm lg:text-base text-gray-600">
                  {getWeekDateRange(currentWeek)}
                </p>
              </div>
              
              <button
                onClick={() => onNavigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* 주간 통계 차트 */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm">
            <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
              <BarChart className="h-6 w-6 mr-3 text-blue-600" />
              주간 데일리 리포트 작성 현황
            </h3>
            <div className="space-y-4">
              {weeklyChartData.map((week, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm lg:text-base">{week.week}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="bg-blue-500 h-6 rounded-full transition-all"
                      style={{ width: `${(week.reports / 7) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm lg:text-base text-right">{week.reports}/7일</div>
                </div>
              ))}
            </div>
          </div>

          {/* 주간 완료 작업 수 */}
          <div className="bg-white p-6 lg:p-8 rounded-2xl border shadow-sm">
            <h3 className="text-xl lg:text-2xl font-semibold mb-6 flex items-center">
              <Users className="h-6 w-6 mr-3 text-green-600" />
              주간 완료 작업 수
            </h3>
            <div className="space-y-4">
              {weeklyChartData.map((week, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-16 text-sm lg:text-base">{week.week}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div 
                      className="bg-green-500 h-6 rounded-full transition-all"
                      style={{ width: `${Math.min((week.tasks / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="w-20 text-sm lg:text-base text-right">{week.tasks}개</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsTab;